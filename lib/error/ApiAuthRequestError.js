'use strict';

var utils  = require('../utils');

function ApiAuthRequestError(errorData){
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name='ApiAuthRequestError';
  this.userMessage = this.message = errorData.userMessage;
  this.statusCode = errorData.statusCode || 400;
  this.error = errorData.error;
}
utils.inherits(ApiAuthRequestError, Error);

module.exports = ApiAuthRequestError;
