'use strict';

var async = require('async');
var _ = require('underscore');
var njwt = require('njwt');
var url = require('url');
var uuid = require('uuid');

var Account = require('./Account');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var ApplicationAccountStoreMapping = require('./ApplicationAccountStoreMapping');
var AuthenticationResult = require('./AuthenticationResult');
var AuthRequestParser = require('../authc/AuthRequestParser');
var BasicApiAuthenticator = require('../authc/BasicApiAuthenticator');
var InstanceResource = require('./InstanceResource');
var OauthAccessTokenAuthenticator = require('../authc/OauthAccessTokenAuthenticator');
var OAuthBasicExchangeAuthenticator = require('../authc/OAuthBasicExchangeAuthenticator');
var PasswordResetToken = require('./PasswordResetToken');
var errorMessages = require('../error/messages');
var utils = require('../utils');

/**
 * @class Application
 *
 * @augments {InstanceResource}
 *
 * @description
 *
 * Encapsulates an Application resource. For full documentation of this resource,
 * please see
 * [REST API Reference: Application](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#application).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Client#getApplication Client.getApplication()}.
 *
 * @param {Object} applicationResource
 *
 * The JSON representation of this resource.
 */
function Application() {
  this.href = '/apps/' + arguments[0].id;
  Application.super_.apply(this, arguments);
}
utils.inherits(Application, InstanceResource);

/**
 * Creates a URL which will redirect a user to your ID Site. The URL will look
 * like `https://api.stormpath.com/v1/sso?jwtRequest=<token>`. Once the URL
 * is created, you should issue a 302 redirect to this URL. The `/sso`
 * endpoint will consume the request, and then redirect the user to your ID
 * Site application. This entire process happens over HTTPS and all the JWTs
 * are signed with secret keys for security.
 *
 * After the user authenticates on your ID Site, they will be redirected back to
 * the specified `callbackUri`.  You will need to parse that response with
 * {@link Application#handleIdSiteCallback Application.handleIdSiteCallback()}
 * to retrieve the account of the user that has authenticated.
 *
 * For more information on our ID Site feature, please see
 * [Using ID Site](https://docs.stormpath.com/rest/product-guide/latest/idsite.html).
 *
 * @param {Object} options ID Site redirect options.
 *
 * @param {String} options.callbackUri
 * **REQUIRED**. The full URL where the user should be sent after they authenticate
 * on your ID Site, e.g. `https://www.example.com/dashboard`. For security reasons,
 * this URL must be registered as an authorized callback URI in your ID Site configuration. This
 * can be managed via the REST API or the Stormpath Admin Console.  This response
 * should be parsed with {@link Application#handleIdSiteCallback Application.handleIdSiteCallback()}.
 *
 * @param {Boolean} options.logout=false
 * If `true`, the user will be logged out of their session and immediately
 * redirected to the specified `callbackUri`.
 *
 * @return {String} The URL to redirect the user to.
 *
 * @param {String} options.organizationNameKey=null
 * *Multi-tenancy option.*
 *
 * The organization name key to auto-fill in the Organization field on ID Site.
 * This value will be fixed and the user cannot change it. Use this if you already
 * know which Organization the user will be logging into.  If you don't know
 * which Organization the user should log in to, and you want the user to specify
 * it, you should set `showOrganizationField` to `true`, and they will be shown
 * a field where they can specify the Organization.
 *
 * If there is no organization with that name key, or the organization is not
 * mapped to the current Stormpath Application, an error will be returned to the
 * callback URI.
 *
 * @param {Boolean} options.showOrganizationField=null
 * *Multi-tenancy option.*
 *
 * If `true`, show the organization field on ID Site, so that the user must
 * provide the name key of the organization that they wish to log into.  If the
 * Application does not have any Organizations mapped to it, this option has no
 * effect.
 *
 * If `true`, and `organizationNameKey` is defined, then the `organizationNameKey`
 * will be placed in the field, but the field will not be editable.
 *
 * If `false`, and `organizationNameKey` is defined, then the Organization field
 * will be hidden but the authentication attempt will still be targeted at the
 * specified organization.
 *
 * @param {String} options.state=null
 * Custom string that can be used to carry state through the request. This
 * state property will be available in the JWT payload on ID Site, and in the
 * JWT that is provided to your callback URI.
 *
 * @param {Boolean} options.useSubDomain
 * *Multi-tenancy option.*
 *
 * Use the provided `organizationNameKey` as the domain prefix for the ID Site
 * URL. For example, if `organizationNameKey` is `org-a` and your ID Site URL
 * is `https://id.example.com` then the user will be redirected to
 * `https://org-a.id.example.com`.
 *
 * @example <caption>Manually redirect the user to ID Site, if using Express, but not using {@link http://docs.stormpath.com/nodejs/express/latest/ Express-Stormpath}</caption>
 *
 * var application; // An existing reference to an Application resource
 *
 * app.get('/login', function (req, res) {
 *   var url = application.createIdSiteUrl({
 *     callbackUri: 'http://localhost:3000/idSiteCallback'
 *   });
 *   res.redirect(url);
 * });
 *
 * app.get('/idSiteCallback', function (req, res) {
 *   application.handleIdSiteCallback(req.url, function (err, idSiteAuthenticationResult) {
 *     if (err) {
 *       console.error(err);
 *       res.end(500);
 *     } else {
 *       res.json(idSiteAuthenticationResult.account);
 *     }
 *   });
 * });
 *
 * @example <caption> Configuring automatic redirection to ID Site, if using {@link http://docs.stormpath.com/nodejs/express/latest/ Express-Stormpath}</caption>
 *
 * app.use(stormpath.init(app, {
 *   web: {
 *     idSite: {
 *       enabled: true
 *     }
 *   }
 * }));
 */
Application.prototype.createIdSiteUrl = function createIdSiteUrl(_options) {
  var options = typeof _options === "object" ? _options : {};
  var p = url.parse(this.href);
  var base = p.protocol + '//' + p.host;
  var apiKey = this.dataStore.requestExecutor.options.client.apiKey;
  var nonce = uuid();
  var state = options.state || '';

  if(!options.callbackUri){
    throw new Error(errorMessages.ID_SITE_INVALID_CB_URI);
  }

  var payload = {
    jti: nonce,
    iat: new Date().getTime()/1000,
    iss: apiKey.id,
    sub: this.href,
    state: encodeURIComponent(state),
    path: options.path || '/',
    cb_uri: options.callbackUri
  };

  if(typeof options.showOrganizationField === 'boolean'){
    payload.sof = options.showOrganizationField;
  }

  if(options.organizationNameKey){
    payload.onk = options.organizationNameKey;
  }

  if(typeof options.useSubDomain === 'boolean'){
    payload.usd = options.useSubDomain;
  }

  if(Array.isArray(options.require_mfa)){
    payload.require_mfa = options.require_mfa;
  }

  if(Array.isArray(options.challenge)){
    payload.challenge = options.challenge;
  }

  var token = njwt.create(payload,apiKey.secret,'HS256');

  var redirectUrl = base + '/sso'+(options.logout?'/logout':'')+'?jwtRequest=' + token;

  return redirectUrl;
};

Application.prototype._decodeJwt = function _decodeJwt(str,secret){
  var jwtObject;
  try{
    jwtObject = njwt.verify(str, secret);
    return jwtObject;
  }
  catch(e){
    return e;
  }
};

/**
 * This method will parse the JWT result from an ID Site Callback, and give you
 * an {@link IdSiteAuthenticationResult}, which contains the  {@link Account}
 * object of the account that was authenticated.
 *
 * @param {String} responseUri
 * The URL that the user has arrived on your site with.
 * For example, `http://example.com/idSiteCallback?jwtResponse=<token>`.
 *
 * @param {Function} callback
 * Will be called with (err, {@link IdSiteAuthenticationResult idSiteAuthenticationResult}).
 *
 * @example <caption>Manually handling an ID Site Callback, if using Express.</caption>
 *
 * app.get('/idSiteCallback', function (req, res) {
 *   application.handleIdSiteCallback(req.url, function (err, idSiteAuthenticationResult) {
 *     if (err) {
 *       console.error(err);
 *       res.end(500);
 *     } else {
 *       res.json(idSiteAuthenticationResult.account);
 *     }
 *   });
 * });
 */
Application.prototype.handleIdSiteCallback = function handleIdSiteCallback(responseUri,callback) {
  if(typeof responseUri !== 'string'){
    throw new Error('handleIdSiteCallback must be called with an uri string');
  }

  var cb = typeof callback === 'function' ? callback : utils.noop;

  var params = (url.parse(responseUri,true).query) || {};
  var token = params.jwtResponse || '';

  var dataStore = this.dataStore;
  var secret = dataStore.requestExecutor.options.client.apiKey.secret;
  var apiKeyId = dataStore.requestExecutor.options.client.apiKey.id;

  var responseJwt = this._decodeJwt(token,secret);

  if(responseJwt instanceof Error){
    return cb(responseJwt);
  }

  if(responseJwt.body && responseJwt.body.err){
    return cb(responseJwt.body.err);
  }

  if(responseJwt.body.aud !== apiKeyId){
    return cb(new Error(errorMessages.ID_SITE_JWT_INVALID_AUD));
  }

  if(!utils.isNumber(responseJwt.body.exp) || (utils.nowEpochSeconds() > responseJwt.body.exp)){
    return cb(new Error(errorMessages.ID_SITE_JWT_HAS_EXPIRED));
  }

  var nonce = responseJwt.body.irt;
  var accountHref = responseJwt.body.sub;

  dataStore.nonceStore.getNonce(nonce,function(err,value){
    if(err){
      cb(err);
    }else if(value){
      cb(new Error(errorMessages.ID_SITE_JWT_ALREADY_USED));
    }else{
      dataStore.nonceStore.putNonce(nonce,utils.noop);

      dataStore.getResource(accountHref,Account,function(err,account){
        if(err){
          cb(err);
        }else{
          /**
           * @typedef {Object} IdSiteAuthenticationResult
           *
           * @property {Object} account
           * The {@link Account account} that was authenticated on ID Site.
           *
           * @property {String} state
           * Custom state that was passed to ID Site, via the original request
           * from
           * {@link Application#createIdSiteUrl Application.createIdSiteUrl()}.
           *
           * @property {String} isNew
           * Indicates that this account is a new account, and the registration
           * was completed on ID Site.
           *
           * @property {String} status
           * Indicates the action that the user completed on ID Site, which will
           * be one of the following:
           *
           * - `AUTHENTICATED` - The user already had an account and they
           *   successfully authenticated ("logged in").
           * - `REGISTERED` - The user created a new account on ID Site.
           * - `LOGOUT` - The user has logged out.
           */
          cb(null,{
            account: account,
            state: decodeURIComponent(responseJwt.body.state),
            isNew: responseJwt.body.isNewSub,
            status: responseJwt.body.status
          });
        }
      });
    }
  });
};
/**
 * Attempt to authenticate an account, using username/email and password. Use
 * this method to assert that the supplied password is the correct password for
 * an account.
 *
 * @param {Object} authenticationRequest
 * Authentication request object, can only be used for username and password authentication.
 *
 * @param {Object} authenticationRequest.username
 * The username or email address of an {@link Account} that exists in a {@link Directory}.
 *
 * @param {Object} authenticationRequest.password
 * The password for the Account.
 *
 * @param {Object} [authenticationRequest.accountStore]
 * An optional parameter that can specify the name key of an Organization to
 * authenticate the Account against.
 *
 * @param {String} authenticationRequest.accountStore.nameKey
 * An Organization's name key.
 *
 * @param {Function} callback
 * Callback function called with (err, {@link AuthenticationResult authenticationResult}).
 *
 * @example
 *
 * var authenticationRequest = {
 *   username: 'user@example.com', // Can be username or email address of account.
 *   password: 'RawPassw0rd!',
 *   // Optional parameter accountStore can specify the name key of the Organization to authenticate against
 *   accountStore: {
 *     nameKey: 'app1'
 *   }
 * };
 *
 * application.authenticateAccount(authenticationRequest, function(err, result) {
 *   // If no error, the user's credentials were valid.  Now fetch the account:
 *   result.getAccount(function(err, account) {
 *     console.log(account);
 *   });
 * };
 */
Application.prototype.authenticateAccount = function authenticateApplicationAccount(authenticationRequest, callback) {
  var _this = this,
    username = authenticationRequest.username,
    password = authenticationRequest.password,
    type = authenticationRequest.type || 'basic';
  var accountStore = ('string' === typeof authenticationRequest.accountStore) ?
    {href: authenticationRequest.accountStore} :
    authenticationRequest.accountStore;

  var loginAttempt = {
    type: type,
    value: utils.base64.encode(username + ':' + password)
  };

  if (authenticationRequest.accountStore){
    loginAttempt.accountStore = accountStore;
  }

  _this.dataStore.createResource(
    _this.loginAttempts.href,
    {expand: 'account'},
    loginAttempt,
    AuthenticationResult,
    function(err,authenticationResult){
      if(err){
        callback(err);
      }
      else{
        authenticationResult.application = _this;
        callback(null,authenticationResult);
      }
  });
};

/**
 * Sends a password reset email to the account holder. This email will contain
 * a link with a password reset token. The format of the link is controlled by
 * the Password Policy of the {@link Directory} that the account is in. For
 * more information on the email, please see
 * {@link https://docs.stormpath.com/rest/product-guide/latest/004_accnt_mgmt.html#manage-password-reset-emails Manage Password Reset Emails}.
 *
 * If you want the raw token (e.g. to manually send your own email with
 * the token) you can do so by working with the {@link PasswordResetToken}
 * instance that is provided to the callback.
 *
 * @param {Object} passwordResetRequest
 * The password reset request object.
 *
 * @param {String} passwordResetRequest.email
 * The email address of the account that you wish to send a password reset email
 * to.
 *
 * @param {Object} [passwordResetRequest.accountStore]
 * An object that allows you to define an account store for this request.
 *
 * @param {Object} passwordResetRequest.accountStore.href
 * The HREF of the account store that you wish to target, for locating the
 * the account object.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link PasswordResetToken passwordResetToken}).
 *
 * @example
 *
 * var passwordResetRequest = {
 *   email: 'foo@example.com'
 * };
 *
 * application.sendPasswordResetEmail(passwordResetRequest, function(err, passwordResetToken) {
 *   // The token is the last part of the HREF.
 *   console.log(passwordResetToken.href.split('/').pop());
 *
 *   // The account can be retrieved by using the account href on the result.
 *   client.getAccount(passwordResetToken.account.href, function(err, account) {
 *     console.log(account);
 *   });
 * });
 */
Application.prototype.sendPasswordResetEmail = function sendApplicationPasswordResetEmail(passwordResetRequest, callback) {

  var data = {
    username: '',
    factorType: 'EMAIL'
  };

  if (typeof passwordResetRequest === 'string') {
    data.username = passwordResetRequest;
  }

  if (passwordResetRequest && passwordResetRequest.email) {
    data.username = passwordResetRequest.email;
  }

  return this.dataStore.createResource('/authn/recovery/password', null, data, PasswordResetToken, callback);
};

/**
 * Re-sends the account verification email to the specified account.  The email
 * will contain a token that can be verified with {@link Tenant#verifyAccountEmail Tenant.verifyAccountEmail()}.
 *
 * @param {Object} resendVerificationEmailRequest
 *
 * @param {String} resendVerificationEmailRequest.login
 * The username or email address of the account that you wish to re-send the
 * verification email to.
 *
 * @param {Object} [resendVerificationEmailRequest.accountStore]
 * An object that allows you to define an account store for this request.
 *
 * @param {Object} resendVerificationEmailRequest.accountStore.href
 * The HREF of the account store that you wish to target, for locating the
 * the account object.
 *
 * @param {Function} callback
 * Callback function, will be called with (err).
 *
 * @example
 *
 * var resendVerificationEmailRequest = {
 *   login: 'foo@example.com'
 * };
 *
 * application.resendVerificationEmail(resendVerificationEmailRequest, function(err) {
 *   if (!err) {
 *     console.log('Email re-sent to ' + resendVerificationEmailRequest.login);
 *   }
 * });
 */
Application.prototype.resendVerificationEmail = function resendVerificationEmail(resendVerificationEmailRequest, callback) {
  var self = this;

  if (!resendVerificationEmailRequest.login) {
    var err = new Error('login property is required; it cannot be null, empty, or blank.');
    err.code = 400;
    err.status = 400;
    process.nextTick(callback.bind(null, err));
  }

  return self.dataStore.getResource('/users', { q: resendVerificationEmailRequest.login }, function (err, users) {
    if (err) {
      return callback(err);
    }

    var user = users.items.length === 1 ? users.items[0] : null;

    if (!user) {
      var error = new Error('The login property value \'' + resendVerificationEmailRequest.login + '\' does not match a known resource.');
      error.status = 404;
      error.code = 2016;
      return callback(err);
    }

    user.profile.emailVerificationToken = uuid.v4();
    user.profile.emailVerificationStatus = 'UNVERIFIED';

    return self.dataStore.saveResource(user, callback);

  });
};

/**
 * Verifies that the given password reset token is valid and can be used for a
 * password change request (via {@link Application#resetPassword Application.resetPassword()}).
 * The token is invalid if it has expired, has already been used, or was not
 * issued by a Stormpath Application.
 *
 * @param {String} passwordResetToken
 * The password reset token that was created by {@link Application#sendPasswordResetEmail Application.sendPasswordResetEmail()}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err).
 *
 * @example
 *
 * var passwordResetToken = 'eyJraWQiOiI0Qk9aM1kyMTg0T0Q5VFJMS..'; // The token that was created by Application.sendPasswordResetEmail().
 *
 * application.verifyPasswordResetToken(passwordResetToken, function(err) {
 *   if (err) {
 *     console.log(err); // Token is invalid, expired, or already used.
 *   } else {
 *     console.log('Token is valid.');
 *   }
 * });
 */
Application.prototype.verifyPasswordResetToken = function verifyApplicationPasswordResetToken(passwordResetToken, callback) {
  var href = '/authn/recovery/token';
  var body = {
    recoveryToken: passwordResetToken
  };
  return this.dataStore.createResource(href, body, callback);
};

/**
 * Sets a new password for the user, using the supplied password reset token.
 * The password reset token will be verified and the
 * {@link https://docs.stormpath.com/rest/product-guide/latest/reference.html#ref-password-policy password strength policy}
 * of the account's directory will be enforced.
 *
 * If this operation is successful, the password reset token will be consumed
 * and cannot be used again.
 *
 * @param {String} passwordResetToken
 * The password reset token that was created by {@link Application#sendPasswordResetEmail Application.sendPasswordResetEmail()}.
 *
 * @param {String} newPassword
 * The new password that the user desires.
 *
 * @param {Function} callback
 * Callback function, will be called with (err).
 *
 * @example
 *
 * var passwordResetToken = 'eyJraWQiOiI0Qk9aM1kyMTg0T0Q5VFJMS..'; // The token that was created by Application.sendPasswordResetEmail().
 *
 * var newPassword = 'Pa@ssw0Rd!1;'; // The new password that the user desires.
 *
 * application.resetPassword(passwordResetToken, newPassword, function(err) {
 *   if (err) {
 *     console.log(err); // Token is invalid, or password is not strong enough.
 *   } else {
 *     console.log('Password was reset.');
 *   }
 * });
 */
Application.prototype.resetPassword = function resetApplicationPassword(token, password, callback) {
  var href = this.passwordResetTokens.href + '/' + token;
  return this.dataStore.createResource(href, {expand: 'account'}, { password: password }, callback);
};

/**
 * Get the {@link SamlPolicy} of the application.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link SamlPolicy} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link SamlPolicy samlPolicy}).
 */
Application.prototype.getSamlPolicy = function getSamlPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.samlPolicy.href, args.options, require('./SamlPolicy'), args.callback);
};

/**
 * Get the account's collection for this Application, which is a list of all
 * accounts in all account stores that are mapped to this application.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `createdAt`, `email`, `givenName`, `middleName`, `modifiedAt`, `surname`,
 * `status`, `username`.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Account} objects.
 *
 * @example
 *
 * var query = {
 *   givenName: 'foo'
 * };
 *
 * application.getAccounts(query, function(err, collection) {
 *   collection.each(function(account, next) {
 *     console.log('Found account for ' + account.givenName + ' (' + account.email + ')');
 *     next();
 *   });
 * });
 */
Application.prototype.getAccounts = function getApplicationAccounts(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this._links.users.href, args.options, require('./Account'), function (err, collection) {
    if (err) {
      return args.callback(err);
    }
    collection.items.forEach(function (account) {
      account.transformOktaUser();
    });
    args.callback(err, collection);
  });
};

/**
 * @description
 *
 * Use this method to get an account from a provider directory (Google,
 * Facebook, etc). To use this method, you need to do the following:
 *
 * - Configure an application with the provider, and connect it with a Stormpath
 *   Directory. For instructions, please see
 *   {@link https://docs.stormpath.com/rest/product-guide/latest/auth_n.html#how-social-authentication-works How Social Authentication Works}.
 *
 * - Prompt the user to authenticate with the provider, via your provider
 *   application (e.g. Facebook application consent screen, Google+ login).
 *
 * - Collect the access token or code that is returned after the user provides
 *   consent to your application.
 *
 * - Pass that access token to this function, and declare the provider type.
 *
 * A new {@link Account} is created in the provider directory, if this user is
 * authenticating for the first time. Otherwise, the existing {@link Account}
 * resource will be retrieved.
 *
 * @param {Object} providerAccountRequest
 * An object which enumerates the provider store and the access token or code
 * that was obtained by the provider. Some providers use access tokens, while
 * others use codes. Only specify one or the other.
 *
 * @param {Object} providerAccountRequest.providerData
 *
 * @param {String} providerAccountRequest.providerData.providerId
 * The providerId of the directory, e.g. `github`, `google`, `facebook`,
 * `linkedin`.
 *
 * @param {String} [providerAccountRequest.providerData.accessToken]
 * The access token that was obtained from the provider.
 *
 * @param {String} [providerAccountRequest.providerData.code]
 * The access code that was obtained from the provider.
 *
 * @param {Function} callback
 * Callback function to call with parameters (`err`, {@link ProviderAccountResult}).
 *
 * @example
 *
 * var providerAccountRequest = {
 *   providerData: {
 *     providerId: 'facebook',
 *     accessToken: 'abc1235'
 *   }
 * };
 *
 * application.getAccount(providerAccountRequest, function(err, providerAccountResult) {
 *   if (providerAccountResult.created) {
 *     console.log('This user was newly created in the directory.');
 *   }
 *
 *   console.log(providerAccountResult.account);
 * });
 */
Application.prototype.getAccount = function getAccount(/* providerData, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['providerData', 'options', 'callback']);

  if (!args.callback || !args.providerData || !args.providerData.providerData) {
    throw new Error('Incorrect usage. Usage: Application.getAccount(providerData, [options], callback);');
  }

  var providerData = args.providerData.providerData;

  if (typeof providerData !== 'object' || typeof providerData.providerId !== 'string' || (typeof providerData.code !== 'string' && typeof providerData.accessToken !== 'string')) {
    throw new Error('This method is used to create or access social accounts only. Did you mean to call Client.getAccount(href)?');
  }

  function wrapCallback(cb) {
    return function(err, account) {

      /**
       * @typedef {Object} ProviderAccountResult
       *
       * @property {Account} account
       * The account from the Stormpath Directory.
       *
       * @property {Boolean} created
       * True if this account was created for the first time.
       */
      if (err) {
        return cb(err);
      }

      var isNew = account._isNew;
      delete account._isNew;

      cb(err, { account: account, created: isNew });
    };
  }

  return this.dataStore.createResource(this.accounts.href, args.options, args.providerData, require('./Account'), wrapCallback(args.callback));
};

/**
 * Creates an {@link Account} in the application's default account store.
 *
 * @param {AccountData} accountData
 * The data for the new account object.
 *
 * @param {Object} [requestOptions]
 * Query parameters for this request.  These  can be any of the {@link ExpansionOptions},
 * e.g. to retrieve linked resources of the {@link Account} during this request, or one
 * of the other options listed below.
 *
 * @param {Boolean} [requestOptions.passwordFormat=null]
 * Set this to `MCF` if you already have a password hash, and can provide the
 * hash as the stormpath2 MCF has format.  For more information see
 * [Importing Accounts with MCF Hash Passwords](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#importing-mcf)
 *
 * @param {Function} callback - Callback function, will be called with (err,
 * {@link Account}).
 *
 * @example
 *
 * var account = {
 *   givenName: 'Foo',
 *   surname: 'Bar',
 *   username: 'foolmeonce',
 *   email: 'foo@example.com',
 *   password: 'Changeme1!'
 * };
 *
 * application.createAccount(account, function(err, createdAccount) {
 *   console.log(createdAccount);
 * });
 */
Application.prototype.createAccount = function createApplicationAccount(/* account, [options,] callback */) {
  var Account = require('./Account');
  var args = utils.resolveArgs(arguments, ['account', 'options', 'callback']);
  var self = this;

  var customDataStrategy = args.options && args.options.customDataStrategy;

  if (customDataStrategy) {
    delete args.options.customDataStrategy;
  }

  var oktaUser = Account.prototype.toOktaUser.call(args.account, {
    customDataStrategy: customDataStrategy
  });

  self.dataStore.createResource('/users', args.options, oktaUser, Account, function(err, account) {
    if (err) {
      return args.callback(err);
    }
    account.transformOktaUser();
    self.dataStore.createResource(self.href + '/users', {
      id: account.id,
      scope: 'USER',
      credentials: {
        userName: account.email
      }
    }, function (err) {
      args.callback(err, account);
    });
  });
};

/**
 * Get the groups collection for this Application, which is a list of all
 * groups that are directly mapped to the application, and all groups that
 * exist in a directory that is mapped to the application.
 *
 * @param {CollectionQueryOptions} collectionQueryOptions
 * Options for querying, paginating, and expanding the collection. This collection
 * supports filter searches and the following attribute searches:
 * `name`, `description`, `status`.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Group} objects.
 *
 * @example
 *
 * var query = {
 *   name: 'admins'
 * };
 *
 * application.getGroups(query, function(err, collection) {
 *   if (collection && collection.items.length === 1) {
 *     console.log('Found the admins group, href is: ' + group.href);
 *   }
 * });
 */
Application.prototype.getGroups = function getApplicationGroups(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.groups.href, args.options, require('./Group'), args.callback);
};

/**
 * Creates a group within the default group store of the Application. If the
 * application does not have a default group store, this will error.
 *
 * @param {Group} group
 * New group definition.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link Group}).
 *
 * @example
 *
 * var group = {
 *   name: 'New Users'
 * };
 *
 * application.createGroup(group, function (err, group) {
 *   if (!err) {
 *     console.log('Group Created!');
 *   }
 * });
 */
Application.prototype.createGroup = function createApplicationGroup(/* group, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['group', 'options', 'callback']);
  return this.dataStore.createResource(this.groups.href, args.options, args.group, require('./Group'), args.callback);
};

/**
 * Gets the OAuth policy of this application. The OAuth policy defines the TTL
 * settings for the Access Tokens and Refresh Tokens that are issued by this
 * application's OAuth Token endpoint.
 *
 * The values must be an [ISO8060 Duration Formatted String](https://en.wikipedia.org/wiki/ISO_8601#Durations).
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, {@link OAuthPolicy}).
 *
 * @example
 *
 * application.getOAuthPolicy(function (err, oAuthPolicy) {
 *   // Set the Access Token TTL to 1 hour, and disable Refresh Tokens.
 *   oAuthPolicy.accessTokenTtl = 'PT1H';
 *   oAuthPolicy.refreshTokenTtl = 'PT0D';
 *   oAuthPolicy.save();
 * });
 */
Application.prototype.getOAuthPolicy = function getOAuthPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.oAuthPolicy.href, args.options, require('./OAuthPolicy'), args.callback);
};

/**
 * Gets the Stormpath tenant resource that owns this resource.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Tenant} during this request.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link Tenant}).
 */
Application.prototype.getTenant = function getApplicationTenant(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.tenant.href, args.options, require('./Tenant'), args.callback);
};

/**
 * @description
 *
 * Retrieves the specified {@link ApiKey} for an Account that may login to the Application
 * (as determined by the application's mapped account stores). If the API Key does
 * not correspond to an Account that may login to the application, then a 404
 * error is provided to the callback.
 *
 * By default, the {@link ApiKey} resource is heavily encrypted. It is encrypted while
 * in transit from our REST API, and while at rest in the local cache that is
 * maintained by the SDK. The encryption input is the Tenant Api Key Secret
 * that was used when the {@link Client Client Instance} was constructed.
 * The default encryption strength is password-based AES 256 encryption and the
 * PBKDF2 implementation will use 1024 iterations to derive the AES 256 key.
 *
 * At the risk of potentially decreased security, you can use the options
 * argument to specify a lower level of encryption key size, e.g. 192 or 128.
 * You can also request a lower number of key iterations. This can reduce the
 * CPU time required to decrypt the key after transit or when retrieving from
 * cache. It is not recommended to go much lower than 1024 (if at all) in
 * security sensitive environments.
 *
 * @param {String} apiKeyId
 * The ID of the {@link ApiKey} to search for.
 *
 * @param {Object} options
 * Options for API Key encryption.
 *
 * @param {String} [options.encryptionKeySize=256]
 * Set to 128 or 192 to change the AES key encryption size.
 *
 * @param {String} [options.encryptionKeyIterations=1024]
 * The number of iterations to use in the PBKDF operation.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link ApiKey}).
 *
 * @example
 *
 * application.getApiKey('xxxxAAAyyBb', function(err, apiKey) {
 *   if (err) {
 *     console.log('Api Key could not be found.');
 *   } else {
 *     console.log(apiKey);
 *   }
 * });
 */
Application.prototype.getApiKey = function getApiKey(apiKeyId, options, callback) {
  var argCount = Array.prototype.slice.call(arguments).length;
  var cb = argCount === 3 ? callback : options;

  var dataStore = this.dataStore;

  var i = 0;

  var foundAccount;

  async.whilst(
    function test() {
      if (foundAccount) {
        return false;
      }
      i++;
      return i <= 10; // We only import up to 10 keys
    },
    function iterate(next) {
      var userQuery = '/users?search=profile.stormpathApiKey_' + i + '%20sw%20%22' + apiKeyId + '%22';
      dataStore.getResource(userQuery, require('./Account'), function (err, accounts) {
        if (err) {
          return next(err);
        }
        foundAccount = accounts.items[0];
        next();
      });
    },
    function done(err) {
      if (err && err.code !== 'E0000031') {
        // E0000031 means "that profile attribute doesnt exist" - in that case we want to return the 404 error below
        return cb(err);
      }
      if (!foundAccount) {
        var error = new Error('ApiKey not found');
        error.status = 404;
        return cb(error);
      }
      foundAccount.transformOktaUser();
      var foundKey;
      Object.keys(foundAccount.profile).forEach(function (key) {
        var value = foundAccount.profile[key];
        if (new RegExp('^' + apiKeyId).test(value)) {
          foundKey = value;
        }
      });
      var keyParts = foundKey.split(':');

      return cb(null, {
        id: keyParts[0],
        secret: keyParts[1],
        status: 'ENABLED', // only ENABLED api keys will be imported into Okta
        account: foundAccount
      });
    }
  );
};

/**
 * @description
 *
 * This method allows you to issue API-Key based Access Tokens and perform API
 * Key authentication for your users, as described in
 * [Using Stormpath for API Authentication](http://docs.stormpath.com/guides/api-key-management/).
 *
 * **NOTE**: The OAuth flow that this method supports is the Client
 * Credentials workflow, which requires the {@link Account} to have an
 * {@link ApiKey}. The issued access tokens are stateless and cannot be
 * revoked. If you want to issue revoke-able Access Tokens and Refresh Tokens,
 * please use the {@link OAuthPasswordGrantRequestAuthenticator} to create
 * password-based tokens.
 *
 * **Issuing Access tokens**
 *
 * To issue Access tokens, the user must supply their {@link ApiKey} in the
 * Authorization header, as HTTP Basic format, and the POST body must define
 * the `client_credentials` grant type. The user may also provide the scope that
 * they desire. For example, the request may look like this:
 *
 * ```
 * Authorization: Basic <Base64 Encoded api_key_id:api_key_secret>
 *
 * grant_type=client_credentials
 * scope=scope-I-want
 * ```
 *
 * This method will process the request and create an access token, if the API
 * key and secret is valid, and if the account is reachable by this application
 * and the account is not disabled. You may optionally define a `scopeFactory`
 * to determine if the scope should be issued. An example of how to issue
 * access tokens is provided below.
 *
 * **Authenticating Access tokens**
 *
 * If the user has been issued an access token, they can use it to authenticate
 * requests by providing it in the `Authorization` header of the request, with
 * this format:
 *
 * ```
 * Authorization: Bearer <access_token>
 * ```
 *
 * If the token is not expired and the account is still enabled, this method
 * will produce an {@link OAuthClientCredentialsAuthenticationResult}.
 * Otherwise you will receive an authentication error, and you should not allow
 * the user to access the protected resource.
 *
 * This method will not make authorization decisions, based on the scope of the
 * token, this must be done by your application. Please see the example below.
 *
 * @param {Object} options
 * The data for this request, the `request` property must be supplied.
 *
 * @param {Object} options.request
 * An [Express-like request object](http://expressjs.com/en/api.html#req), that
 * must have the following properties:
 *
 * @param {String} options.request.url
 * The url of the request, including query parameters.
 *
 * @param {String} options.request.method
 * The method of the request, GET or POST depending on the type of request.
 *
 * @param {Object} options.request.headers
 * An object that contains the headers of the request, so that we can read the
 * `Authorization` header.
 *
 * @param {Object} options.request.body
 * An object that has the posted form body, this is required when requesting
 * an access token.
 *
 * @param {String} options.request.body.grant_type
 * Must be `client_credentials`.
 *
 * @param {String} options.request.body.username
 * The username or email address of the {@link Account} that is requesting an
 * access token.
 *
 * @param {String} options.request.body.password
 * The password of the {@link Account} that is requesting an access token.
 *
 * @param {Function} [options.scopeFactory]
 * A function that can define custom scope for the access token. When a user
 * is requesting an access token, we will call this function and you can tell us
 * what scope to add to the token. The function will be called with the
 * parameters `(account, requestedScope, callback)`. The `requestedScope` is
 * the value of the `scope` field from the user's POST, and the `callback`
 * should be called with the parameters `(err, grantedScope)`.
 *
 * @param {Number} [options.ttl]
 * The lifetime of the Access Tokens that are created by this method, in
 * seconds. Default is 3600 (one hour) if not specified.
 *
 * @param {Function} callback
 * The callback to call with the the authentication result, will be called with
 * the parameters (err, {@link OAuthClientCredentialsAuthenticationResult}).
 *
 * @example
 *
 * // This is how you would require HTTP Basic or Access Token authentication, for a route:
 * app.get('/protected/resource', function(req, res) {
 *   application.authenticateApiRequest({ request: req }, function(err, authResult) {
 *     authResult.getAccount(function(err, account) {
 *       if (err) {
 *         return res.status(err.status).json(err);
 *       }
 *
 *       var message = 'Hello, ' + account.username + '! Thanks for authenticating.';
 *
 *       if (authResult.grantedScopes) {
 *         message += ' You have been granted: ' + authResult.grantedScopes.join(' ');
 *       }
 *
 *       res.json({ message: message });
 *     });
 *   });
 * });
 *
 * @example
 *
 * // This is how you would implement the token endpoint in your application:
 * app.post('/oauth/token', function(req, res) {
 *   application.authenticateApiRequest({
 *     request: req,
 *     scopeFactory: function(account, requestedScopes, callback) {
 *       // Determine what scope to give, then provide the granted scope to the callback.
 *       callback(null, 'granted-scope');
 *     }
 *   }, function(err, authResult) {
 *     if (err) {
 *       res.status(err.status).json(err);
 *     } else {
 *       res.json(authResult.tokenResponse);
 *     }
 *   });
 * });
 */
Application.prototype.authenticateApiRequest = function authenticateApiRequest(options,callback) {
  if(typeof options!=='object'){
    throw new ApiAuthRequestError({userMessage: 'options must be an object' });
  }

  if(typeof options.request!=='object'){
    throw new ApiAuthRequestError({userMessage: 'options.request must be an object' });
  }

  if(options.ttl && (typeof options.ttl!=='number')){
    throw new ApiAuthRequestError({userMessage: 'ttl must be a number'});
  }
  var validAccessTokenRequestLocations = ['header','body','url'];
  var defaultAccessTokenRequestLocations = ['header','body'];
  var locationsToSearch;

  if(Array.isArray(options.locations)){
    locationsToSearch = options.locations.filter(function(location){
      return validAccessTokenRequestLocations.indexOf(location) > -1;
    });
  }else{
    locationsToSearch = defaultAccessTokenRequestLocations;
  }

  var ttl = options.ttl;

  var req = options.request;

  var scopeFactory = typeof options.scopeFactory === 'function' ? options.scopeFactory : null;

  var parser = new AuthRequestParser(req,locationsToSearch);

  var authHeaderValue = parser.authorizationValue;

  var accessToken = parser.accessToken;

  var grantType = parser.grantType;

  if(grantType && grantType!=='client_credentials'){
    return callback(new ApiAuthRequestError({userMessage: 'Unsupported grant_type'}));
  }

  var authenticator;

  if(authHeaderValue){
    if(authHeaderValue.match(/Basic/i)){
      if(grantType){
        authenticator = new OAuthBasicExchangeAuthenticator(
          this,
          req,
          ttl,
          scopeFactory,
          parser.requestedScope
        );
      }else{
        authenticator = new BasicApiAuthenticator(
          this,
          authHeaderValue,
          ttl
        );
      }
    }else if(authHeaderValue.match(/Bearer/i)){
      authenticator = new OauthAccessTokenAuthenticator(
        this,
        authHeaderValue.replace(/Bearer /i,''),
        ttl
      );
    }else{
      return callback(new ApiAuthRequestError({userMessage: 'Invalid Authorization value', statusCode: 400}));
    }
  }else if(accessToken){
    authenticator = new OauthAccessTokenAuthenticator(this, accessToken, ttl);
  }

  if(!authenticator){
    return callback(new ApiAuthRequestError({userMessage: 'Must provide access_token.', statusCode: 401}));
  }

  if(authenticator instanceof Error){
    return callback(authenticator);
  }

  authenticator.authenticate(callback);
};

/**
 * Retrieves the list of {@link ApplicationAccountStoreMapping Application
 * Account Store Mappings} for this application.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection. This collection
 * does not support attribute or filter searches.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link ApplicationAccountStoreMapping} objects.
 *
 * @example
 *
 * application.getAccountStoreMappings({ expand: 'accountStore' }, function(err, accountStoreMappings) {
 *   if (!err) {
 *     console.log(accountStoreMappings.items);
 *   }
 * });
 */
Application.prototype.getAccountStoreMappings = function getAccountStoreMappings(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.accountStoreMappings.href, args.options, ApplicationAccountStoreMapping, args.callback);
};

Application.prototype.getAuthToken = function getAccountStoreMappings(/* jwtAccessTokenString, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['jwtAccessTokenString', 'options', 'callback'], true);
  return this.dataStore.getResource(this.href + '/authTokens/' + args. jwtAccessTokenString, args.options, InstanceResource, args.callback);
};

/**
 * Retrieves the {@link ApplicationAccountStoreMapping} that represents the link
 * to the Application's default Account Store, which is the {@link Directory}
 * that new accounts will be created in when using {@link
 * Application#createAccount Application.createAccount()}.
 *
 *  **Note**: This method is named incorrectly, it should be returning the {@link
 * Directory} resource (not the {@link ApplicationAccountStoreMapping}). This
 * will be fixed in version 1.0.0.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the account store during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link ApplicationAccountStoreMapping}).
 *
 * @example
 *
 * application.getDefaultAccountStore({ expand: 'accountStore' }, function(err, applicationAccountStoreMapping) {
 *   if (!err) {
 *     console.log(applicationAccountStoreMapping.accountStore.name);
 *   }
 * });
 */
Application.prototype.getDefaultAccountStore = function getDefaultAccountStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultAccountStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultAccountStoreMapping.href, args.options, ApplicationAccountStoreMapping, args.callback);
};

/**
 * Sets the default Account Store for this Application by setting the
 * `isDefaultAccountStore` property of the {@link AccountStoreMapping} that
 * represents the link between this application and the account store.  If this
 * mapping does not already exist it will be automatically created.
 *
 * @param {Directory|Group|Object} accountStore
 * The Account Store to set as the default Account Store for this application.
 * This can be a materialized {@link Directory}, {@link Group}, or object
 * literal with an `href` property that identifies the Account Store.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link ApplicationAccountStoreMapping}).
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * client.getDirectory(directoryHref, function(err, directory){
 *   application.setDefaultAcccountStore(directory, function (err) {
 *     if (!err) {
 *       console.log('Directory was set as default account store');
 *     }
 *   });
 * })
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * application.setDefaultAcccountStore({href: directoryHref}, function (err) {
 *   if (!err) {
 *     console.log('Directory was set as default account store');
 *   }
 * });
 *
 */
Application.prototype.setDefaultAccountStore = function setDefaultAccountStore(store, callback) {
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  this.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }

    res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href);}, onAsmFound);
  });

  function onAsmFound(asm) {
    if (asm) {
      asm.isDefaultAccountStore = true;
      return asm.save(clearCache);
    }

    var mapping = new ApplicationAccountStoreMapping({ isDefaultAccountStore: true })
      .setApplication(self)
      .setAccountStore(store);

    return self.dataStore.createResource('/accountStoreMappings', null, mapping, ApplicationAccountStoreMapping, clearCache);
  }

  function clearCache(err, map) {
    if (err) {
      return callback(err);
    }

    self.dataStore._evict(self.href, function(err){
      if (err) {
        return callback(err);
      }

      callback(null, map);
    });
  }
};

/**
 * Retrieves the {@link ApplicationAccountStoreMapping} that represents the link
 * to the Application's default group store, which is the {@link Directory}
 * that new groups will be created in when using {@link Application#createGroup
 * Application.createGroup()}.
 *
 *  **Note**: This method is named incorrectly, it should be returning the {@link
 * Directory} resource (not the {@link ApplicationAccountStoreMapping}). This
 * will be fixed in version 1.0.0.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the account store during this request.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link ApplicationAccountStoreMapping}).
 *
 * @example
 *
 * application.getDefaultGroupStore({ expand: 'accountStore' }, function(err, applicationAccountStoreMapping) {
 *   if (!err) {
 *     console.log(applicationAccountStoreMapping.accountStore.name);
 *   }
 * });
 */
Application.prototype.getDefaultGroupStore = function getDefaultGroupStore(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  if (!this.defaultGroupStoreMapping) {
    return args.callback();
  }

  return this.dataStore.getResource(this.defaultGroupStoreMapping.href, args.options, ApplicationAccountStoreMapping, args.callback);
};

/**
 * Sets the default Group Store for this Application by setting the
 * `isDefaultGroupStore` property of the {@link AccountStoreMapping} that
 * represents the link between this application and the account store.  If this
 * mapping does not already exist it will be automatically created.
 *
 * @param {Directory|Object} directory
 * The {@link Directory} to set as the default group store for this application.
 * This can be a materialized {@link Directory}, or object literal with an
 * `href` property that identifies the {@link Directory}.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link ApplicationAccountStoreMapping}).
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * client.getDirectory(directoryHref, function(err, directory}{
 *   application.setDefaultGroupStore(directory, function (err, applicationAccountStoreMapping) {
 *     if (!err) {
 *       console.log('Directory was set as default group store');
 *     }
 *   });
 * })
 *
 * @example
 *
 * var directoryHref; // The HREF of an existing directory.
 *
 * application.setDefaultGroupStore({href: directoryHref}, function (err) {
 *   if (!err) {
 *     console.log('Directory was set as default group store');
 *   }
 * });
 *
 */
Application.prototype.setDefaultGroupStore = function setDefaultGroupStore(store, callback) {
  var self = this;
  store = 'string' === typeof store ? {href: store} : store;

  this.getAccountStoreMappings(function (err, res) {
    if (err) {
      return callback(err);
    }
    res.detectSeries(function(asm, cb){cb(asm.accountStore.href === store.href);}, onAsmFound);
  });

  function onAsmFound(asm) {
    if (asm) {
      asm.isDefaultGroupStore = true;
      return asm.save(updateApp);
    }

    var mapping = new ApplicationAccountStoreMapping({ isDefaultGroupStore: true })
      .setApplication(self)
      .setAccountStore(store);

    return self.dataStore.createResource('/accountStoreMappings', null, mapping, ApplicationAccountStoreMapping, updateApp);
  }

  function updateApp(err, map) {
    if (err) {
      return callback(err);
    }

    self.dataStore._evict(self.href, function(err){
      if (err) {
        return callback(err);
      }

      callback(null, map);
    });
  }
};

/**
 * Creates a mapping between an Application and an Account Store, the Account
 * Store can be a {@link Directory}, {@link Group}, or {@link Organization}.
 *
 * @param {Object} accountStoreMapping
 *
 * @param {Directory|Group|Organization|Object} accountStoreMapping.accountStore
 * The Account Store to set as the default Account Store for this application.
 * This can be a materialized {@link Directory}, {@link Group}, {@link
 * Organization}, or object literal with an `href` property that identifies the
 * Account Store.
 *
 * @param {Boolean} [accountStoreMapping.isDefaultAccountStore=false] Set to
 * `true` if you want this account store to be the default store where new accounts
 * are placed when calling {@link Application#createAccount Application.createAccount()}.
 * If you need to change the default account store in the future, use
 * {@link Application#setDefaultAccountStore Application.setDefaultAccountStore()}
 *
 * @param {Boolean} [accountStoreMapping.isDefaultGroupStore=false] Set to
 * `true` if you want this account store to be the default location of groups when
 * calling {@link Application#createGroup Application.createGroup()}.
 * In this situation, the account store must be a {@link Directory}.  If you
 * need to change the default group store in the future, use
 * {@link Application#setDefaultGroupStore Application.setDefaultGroupStore()}
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link ApplicationAccountStoreMapping}).
 *
 * @example
 *
 * client.getDirectory(directoryHref, function(err, directory}{
 *   application.createAccountStoreMapping({ accountStore: directory }, function (err, applicationAccountStoreMapping) {
 *     if (!err) {
 *       console.log('Directory was mapped to the application.');
 *     }
 *   });
 * })
 *
 * @example
 *
 * var mapping = {
 *   accountStore: {
 *     href: 'https://api.stormpath.com/v1/directories/xxx'
 *   }
 * };
 *
 * application.createAccountStoreMapping(mapping, function (err, applicationAccountStoreMapping) {
 *   if (!err) {
 *     console.log('Directory was mapped to the application.');
 *   }
 * });
 *
 */
Application.prototype.createAccountStoreMapping = function createAccountStoreMapping(/* mapping, [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['mapping', 'options', 'callback']);

  args.mapping = new ApplicationAccountStoreMapping(args.mapping).setApplication(this);

  return this.dataStore.createResource('/accountStoreMappings', args.options, args.mapping, ApplicationAccountStoreMapping, args.callback);
};

/**
 * Used to create multiple account store mappings at once.
 *
 * @param  {Object[]} mappings
 * An array of mapping definitions, the same that you would pass to {@link
 * Application#createAccountStoreMapping Application.createAccountStoreMapping()}.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called with the
 * parameters (err, [{@link ApplicationAccountStoreMapping
 * ApplicationAccountStoreMappings}]).
 */
Application.prototype.createAccountStoreMappings = function createAccountStoreMappings(mappings,callback){
  var self = this;
  async.mapSeries(mappings,function(mapping,next){
    self.createAccountStoreMapping(mapping,next);
  },callback);
};

/*
  @TODO - remove this in version 1.0, use createAccountStoreMapping() instead
 */

Application.prototype.addAccountStore = function addAccountStore(store, callback) {
  var mapping = new ApplicationAccountStoreMapping().setAccountStore(store).setApplication(this);
  return this.dataStore.createResource('/accountStoreMappings', null, mapping, ApplicationAccountStoreMapping, callback);
};

/**
 * Gets the {@link CustomData} object for this resource.
 *
 * @param {Function} callback
 * The callback that will be called with the parameters (err, {@link CustomData}).
 */
Application.prototype.getCustomData = function getCustomData(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.customData.href, args.options, require('./CustomData'), args.callback);
};

/**
* Retrieves the application's {@link AccountLinkingPolicy}, which determines if
* and how accounts in its default account store are linked, so that {@link AccountLink}
* instances are automatically created between two accounts that would match this policy.
*
* @param {ExpansionOptions} options
* Options for expanding the account linking policy. Can be expanded on `tenant`.
*
* @param {Function} callback
* The function that will be called when the query is finished, with the parameters
* (err, {@link AccountLinkingPolicy}).
*/
Application.prototype.getAccountLinkingPolicy = function getApplicationAccountLinkingPolicy(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.dataStore.getResource(this.accountLinkingPolicy.href, args.options, require('./AccountLinkingPolicy'), args.callback);
};

module.exports = Application;
