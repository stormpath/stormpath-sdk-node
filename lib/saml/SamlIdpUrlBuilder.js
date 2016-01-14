'use strict';

var njwt = require('njwt');
var uuid = require('node-uuid');

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

SamlIdpUrlBuilder.prototype._buildInitializationUrl = function _buildInitializationUrl(initEndpointUrl, accessToken) {
  return initEndpointUrl + '?accessToken=' + encodeURIComponent(accessToken);
};

SamlIdpUrlBuilder.prototype.build = function (callback) {
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

    var ssoInitiationEndpoint = serviceProvider.ssoInitiationEndpoint.href;
    var initializationUrl = self._buildInitializationUrl(ssoInitiationEndpoint, accessToken.compact());

    callback(null, initializationUrl);
  });
};

module.exports = SamlIdpUrlBuilder;
