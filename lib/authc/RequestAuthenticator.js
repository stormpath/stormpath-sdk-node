'use strict';

function RequestAuthenticator(apiKey) {
  if (!apiKey) {
    throw new Error('apiKey is required.');
  }
  if (!apiKey.id) {
    throw new Error('apiKey.id is required.');
  }
  if (!apiKey.secret) {
    throw new Error('apiKey.secret is required.');
  }
  this.apiKey = apiKey;
}
//All subclass types must have an 'authenticate' prototype function

module.exports = RequestAuthenticator;