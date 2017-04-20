'use strict';

var njwt = require('njwt');
var util = require('util');

var OauthAccessTokenAuthenticator = require('../authc/OauthAccessTokenAuthenticator');
var ApiAuthRequestError = require('../error/ApiAuthRequestError');
var JwtAuthenticationResult = require('./jwt-authentication-result');

/**
 * @class
 *
 * @constructor
 *
 * @deprecated Please use {@link StormpathAccessTokenAuthenticator} instead.
 *
 * @description
 *
 * Creates an authenticator that can be used to validate JWTs that have been
 * issued to users.  JWTs can be issued with one of the following methods:
 *
 * - {@link OAuthPasswordGrantRequestAuthenticator#authenticate OAuthPasswordGrantRequestAuthenticator.authenticate()}
 * - {@link OAuthStormpathTokenAuthenticator#authenticate OAuthStormpathTokenAuthenticator.authenticate()}
 *
 * @param {Application} application The Stormpath Application to authenticate against.
 *
 * @example
 * var appHref = 'https://api.stormpath.com/v1/applications/3WIeKpaEjPHfLmy6GIvbwv';
 *
 * client.getApplication(appHref, function (err, application) {
 *   var authenticator = new stormpath.JwtAuthenticator(application);
 * });
 */
function JwtAuthenticator(application) {
  if (!(this instanceof JwtAuthenticator)) {
    return new JwtAuthenticator(application);
  }

  this.application = application;
}

JwtAuthenticator.prototype.defaultCookieName = 'access_token';

JwtAuthenticator.prototype.localValidation = false;

/**
 * Calling this method will convert this authenticator to "local validation" mode.
 * In this mode, the authenticator will skip the REST API call which determines
 * if the {@link AccessToken} resource has been revoked. Tokens will be considered
 * valid if they are signed by the original signing key (one of your Tenant API Keys)
 * and are not expired.  **Please be aware of this security tradeoff.** When using
 * local validation, we suggest shorter expiration times, as configured by the
 * application's {@link OAuthPolicy}.
 *
 * @example
 *
 * var authenticator = new stormpath.JwtAuthenticator(application);
 *
 * authenticator.withLocalValidation();
 */
JwtAuthenticator.prototype.withLocalValidation = function withLocalValidation() {
  this.localValidation = true;
  return this;
};

JwtAuthenticator.prototype.withCookie = function withCookie(cookieName) {
  this.configuredCookieName = cookieName;
  return this;
};

JwtAuthenticator.prototype.unauthenticated = function unauthenticated() {
  return new ApiAuthRequestError({
    userMessage: 'Unauthorized',
    statusCode: 401
  });
};

/**
 * Authenticates a JWT, in the form of an access token string.
 *
 * @param {String} accessToken The compact JWT string
 * @param {Function} callback Will be called with (err, {@link JwtAuthenticationResult JwtAuthenticationResult}).
 *
 * @example
 * var accessToken = 'eyJraWQiOiI2NldURFJVM1paSkNZVFJVVlZTUUw3WEJOIiwic3R0IjoiYWNjZXNzIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiIzV0llS3N1SmR6YWR5YzN4U1ltc1l6IiwiaWF0IjoxNDY5ODMzNzQ3LCJpc3MiOiJodHRwczovL2FwaS5zdG9ybXBhdGguY29tL3YxL2FwcGxpY2F0aW9ucy8yNGs3SG5ET3o0dFE5QVJzQnRQVU42Iiwic3ViIjoiaHR0cHM6Ly9hcGkuc3Rvcm1wYXRoLmNvbS92MS9hY2NvdW50cy8yRWRHb3htbGpuODBlRHZjM0JzS05EIiwiZXhwIjoxNDY5ODM0MzQ3LCJydGkiOiIzV0llS3BhRWpQSGZMbXk2R0l2Ynd2In0.9J7HvhgJZxvxuE-0PiarTDTFPCVVLR_nvRByULNA01Q';
 *
 * authenticator.authenticate(accessToken, function(err, authenticationResult) {
 *   if (err) {
 *     console.log(err);
 *   } else {
 *     authenticationResult.getAccount(function(err, account){
 *       console.log(account);
 *     });
 *   }
 * });
 *
 */
JwtAuthenticator.prototype.authenticate = util.deprecate(function authenticate(token, cb) {
  var self = this;
  var options = self.application.dataStore.requestExecutor.options;

  var secret = options.client.apiKey.secret || options.apiToken;

  try {
    njwt.verify(token, secret, function(err, jwt) {
      if (err) {
        err.statusCode = 401;
        return cb(err);
      }

      // If there is no KID, this means it was issued by the SDK (not the
      // API) from a client credentials grant so we have to do remote
      // validation in a different way.
      if (!jwt.header.kid) {
        var authenticator = new OauthAccessTokenAuthenticator(self.application, token);
        return authenticator.authenticate(cb);
      }

      // If the KID exists, this was issued by our API from a password grant
      if (self.localValidation) {
        // Transfers all body fields to `claims` to maintain consistency
        // with remote results. Does not remove the body as to preserve
        // backwards compatibility.
        jwt.claims = {};

        Object.keys(jwt.body).forEach(function(key) {
          if (jwt.body.hasOwnProperty(key)) {
            jwt.claims[key] = jwt.body[key];
          }
        });

        return cb(null, new JwtAuthenticationResult(self.application, {
          jwt: token,
          expandedJwt: jwt,
          localValidation: true,
          account: {
            href: jwt.body.sub
          }
        }));
      }

      var href = self.application.href + '/authTokens/' + token;

      self.application.dataStore.getResource(href, function(err, response) {
        if (err) {
          return cb(err);
        }

        // Preserve scope
        if (jwt.body.scope) {
          return njwt.verify(response.jwt, secret, function(err, newJwt) {
            if (err) {
              cb(err);
            }

            // Copy the scope on the authorized token
            newJwt.body.scope = jwt.body.scope;
            newJwt.setSigningKey(secret);
            response.jwt = newJwt.compact();
            response.expandedJwt.claims.scope = jwt.body.scope;

            cb(null, new JwtAuthenticationResult(self.application, response));
          });
        }

        cb(null, new JwtAuthenticationResult(self.application, response));
      });
    });
  } catch (err) {
    cb(err);
  }

  return this;
}, 'JwtAuthenticator is deprecated, please use StormpathAccessTokenAuthenticator instead.');

module.exports = JwtAuthenticator;
