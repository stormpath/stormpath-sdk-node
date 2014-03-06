'use strict';

var utils = require('./../utils');

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
utils.inherits(ResourceError, Error);

module.exports = ResourceError;