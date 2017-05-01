'use strict';

var utils = require('./../utils');

function ResourceError(responseBody, requestData) {
  Error.captureStackTrace(this, this.constructor);

  requestData = requestData || {};

  this.name = this.constructor.name;
  this.status = responseBody.status;
  this.code = responseBody.errorCode;
  this.userMessage = responseBody.message;
  this.developerMessage = responseBody.errorSummary;
  this.errorCauses = responseBody.errorCauses;
  this.moreInfo = responseBody.errorLink;
  this.requestId = responseBody.errorId;
  this.url = requestData.url;
  this.method = requestData.method;
  this.stack = '';

  if (responseBody.errorCauses) {
    this.developerMessage += '. ' + responseBody.errorCauses.map(function (cause) {
      return cause.errorSummary;
    }).join('. ');
  }

  this.message = 'HTTP ' + this.status +
    ', Okta ' + this.code + ' (' + this.moreInfo + '): ' +
    this.developerMessage;

  if (responseBody.error) {
    this.error = responseBody.error;
  }
}
utils.inherits(ResourceError, Error);

module.exports = ResourceError;
