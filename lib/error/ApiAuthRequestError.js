'use strict';

var utils  = require('../utils');

function ApiAuthRequestError(errorData){
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.userMessage = this.message = errorData.userMessage;
  this.statusCode = errorData.statusCode || 400;
  this.error = errorData.error;
}
utils.inherits(ApiAuthRequestError, Error);

module.exports = ApiAuthRequestError;
