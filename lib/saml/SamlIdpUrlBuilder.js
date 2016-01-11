'use strict';

var njwt = require('njwt');
var uuid = require('node-uuid');

function SamlIdpUrlBuilder(application) {
  this.application = application;
  this.secret = application.dataStore.requestExecutor.options.client.apiKey.secret;
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

  this._getServiceProvider(function (err, serviceProvider) {
    if (err) {
      return callback(err);
    }

    var accessToken = njwt.create({
      jti: uuid(),
      iss: self.application.href,
      iat: new Date().getTime() / 1000
    }, self.secret);

    var ssoInitiationEndpoint = serviceProvider.ssoInitiationEndpoint.href;
    var initializationUrl = self._buildInitializationUrl(ssoInitiationEndpoint, accessToken.compact());

    callback(null, initializationUrl);
  });
};

module.exports = SamlIdpUrlBuilder;
