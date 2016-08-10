'use strict';

var njwt = require('njwt');
var uuid = require('node-uuid');
var querystring = require('querystring');

var utils = require('../utils');

/**
 * Creates a URL builder that can build SAML IDP redirect URLs.  This is done
 * when Stormpath is initiating a redirect to a SAML IDP.
 * For more information, please see
 * [Authenticating Against a SAML Directory](http://docs.stormpath.com/rest/product-guide/latest/auth_n.html#authenticating-against-a-saml-directory).
 *
 * This authenticator is bound to the application that you pass to the constructor.
 *
 * @class
 *
 * @param {Application} application
 *
 * The Stormpath Application that will issue the redirect. This application must
 * be mapped to the relevant SAML Directories.
 *
 * @example
 *
 * var builder = new stormpath.SamlIdpUrlBuilder(application);
 */
function SamlIdpUrlBuilder(application) {
  this.application = application;
  this.apiKey = application.dataStore.requestExecutor.options.client.apiKey;
}

SamlIdpUrlBuilder.prototype._getServiceProvider = function _getServiceProvider(callback) {
  this.application.getSamlPolicy(function (err, samlPolicy) {
    if (err) {
      return callback(err);
    }

    samlPolicy.getServiceProvider(callback);
  });
};

SamlIdpUrlBuilder.prototype._buildInitializationUrl = function _buildInitializationUrl(initEndpointUrl, parameters) {
  return initEndpointUrl + '?' + querystring.stringify(parameters);
};

/**
 * Builds a SAML IDP Redirect URL and provides it to the specified callback.
 *
 * @param {Object} options
 * Optional claims for the [SAML Authentication JWT](http://docs.stormpath.com/rest/product-guide/latest/auth_n.html#saml-authentication-jwt).
 * Use these claims to control the callback url (`cb_url`), token state (`state`),
 * and account store target (`ash` or `onk`). The other required claims will be
 * set automatically by the builder.
 *
 * @paarm {Function} callback
 * The callback to call with the URL string that was built.  Will be called with
 * (err, urlString).
 *
 * @example
 * builder.build(function(err, url) {
 *   if (err) {
 *     console.error(err);
 *     return;
 *   }
 *   console.log(url);
 * });
 */
SamlIdpUrlBuilder.prototype.build = function (/* [options,] callback */) {
  var self = this;

  var apiKey = this.apiKey;
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  this._getServiceProvider(function (err, serviceProvider) {
    if (err) {
      return args.callback(err);
    }

    var claims = {
      jti: uuid(),
      iss: self.application.href,
      iat: new Date().getTime() / 1000
    };

    var options = args.options || {};

    if (options.cb_uri) {
      claims.cb_uri = options.cb_uri;
    }

    if (options.ash) {
      claims.ash = options.ash;
    }

    if (options.onk) {
      claims.onk = options.onk;
    }

    if (options.state) {
      claims.state = options.state;
    }

    var accessToken = njwt.create(claims, apiKey.secret);

    accessToken.header.kid = apiKey.id;

    var parameters = {
      accessToken: accessToken.compact()
    };

    var ssoInitiationEndpoint = serviceProvider.ssoInitiationEndpoint.href;
    var initializationUrl = self._buildInitializationUrl(ssoInitiationEndpoint, parameters);

    args.callback(null, initializationUrl);
  });
};

module.exports = SamlIdpUrlBuilder;
