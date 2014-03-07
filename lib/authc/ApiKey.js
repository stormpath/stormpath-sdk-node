'use strict';

var utils = require('../utils');

function ApiKey(id, secret) {
  this.id = id;
  this.secret = secret;
}
utils.inherits(ApiKey, Object);

ApiKey.prototype.toString = function apiKeyToString() {
  return 'id: ' + this.id + ', secret: <hidden>';
};

module.exports = ApiKey;

