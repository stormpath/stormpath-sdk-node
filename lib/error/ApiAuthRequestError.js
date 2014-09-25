var utils  = require('../utils');

function ApiAuthRequestError(message, statusCode){
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name='ApiAuthRequestError';
  this.userMessage = this.message = message;
  this.statusCode = statusCode || 400;
}
utils.inherits(ApiAuthRequestError, Error);

module.exports = ApiAuthRequestError;