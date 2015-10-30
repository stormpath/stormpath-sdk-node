'use strict';

var utils = require('./../utils');

function ResourceError(resourceUri, responseBody) {
  this.uri = resourceUri;

  this.name = 'ResourceError';
  this.status = responseBody.status;
  this.code = responseBody.code;
  this.userMessage = responseBody.message;
  this.developerMessage = responseBody.developerMessage;
  this.moreInfo = responseBody.moreInfo;

  this.message = 'HTTP ' + this.status +
    ' for resource \'' + this.uri + '\'' +
    ', Stormpath ' + this.code + ' (' + this.moreInfo + '): ' +
    this.developerMessage;
}
utils.inherits(ResourceError, Error);

module.exports = ResourceError;
