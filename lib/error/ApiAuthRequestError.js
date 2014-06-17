var utils  = require('../utils');

function ApiAuthRequestError(message){
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name='ApiAuthRequestError';
  this.message = message;
  this.statusCode = 400;
}
utils.inherits(ApiAuthRequestError, Error);

module.exports = ApiAuthRequestError;