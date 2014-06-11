var utils  = require('../utils');

function ApiAuthRequestError(message){
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name='ApiAuthRequestError';
  this.message = message;
}
utils.inherits(ApiAuthRequestError, Error);

module.exports = ApiAuthRequestError;