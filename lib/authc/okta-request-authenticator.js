'use strict';

function OktaRequestAuthenticator(apiToken) {
  this.apiToken = apiToken;
}

OktaRequestAuthenticator.prototype.authenticate = function (request) {
  request.headers['Authorization'] = 'SSWS ' + this.apiToken;
};

module.exports = OktaRequestAuthenticator;
