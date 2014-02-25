var util = require('util');

function AuthError(message) {
  Error.call(this); //super constructor
  Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

  this.name = this.constructor.name; //set our function’s name as error name.
  this.message = message; //set the error message
}

// inherit from Error
util.inherits(AuthError, Error);