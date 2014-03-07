'use strict';

var util = require('util');

function ResourceError(responseBody) {
  this.name = 'ResourceError';
  this.status = responseBody.status;
  this.code = responseBody.code;
  this.userMessage = responseBody.message;
  this.developerMessage = responseBody.developerMessage;
  this.moreInfo = responseBody.moreInfo;

  this.message = 'HTTP ' + this.status +
    ', Stormpath ' + this.code + ' (' + this.moreInfo + '): ' +
    this.developerMessage;
}
util.inherits(ResourceError, Error);

module.exports = ResourceError;
