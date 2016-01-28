'use strict';

var njwt = require('njwt');
var uuid = require('node-uuid');
var querystring = require('querystring');

var utils = require('../utils');

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
