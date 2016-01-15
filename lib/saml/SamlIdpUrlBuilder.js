'use strict';

var njwt = require('njwt');
var uuid = require('node-uuid');
var querystring = require('querystring');

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
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var options = args.length > 0 ? args.shift() : {};

  var self = this;
  var apiKey = this.apiKey;

  this._getServiceProvider(function (err, serviceProvider) {
    if (err) {
      return callback(err);
    }

    var accessToken = njwt.create({
      jti: uuid(),
      iss: self.application.href,
      iat: new Date().getTime() / 1000
    }, apiKey.secret);

    accessToken.header.kid = apiKey.id;

    var parameters = options || {};
    parameters.accessToken = accessToken.compact();

    var ssoInitiationEndpoint = serviceProvider.ssoInitiationEndpoint.href;
    var initializationUrl = self._buildInitializationUrl(ssoInitiationEndpoint, parameters);

    callback(null, initializationUrl);
  });
};

module.exports = SamlIdpUrlBuilder;
