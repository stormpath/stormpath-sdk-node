'use strict';

var RequestAuthenticator = require('./RequestAuthenticator');
var utils = require('../utils');

function BasicRequestAuthenticator() {
  BasicRequestAuthenticator.super_.apply(this, arguments);
}
utils.inherits(BasicRequestAuthenticator, RequestAuthenticator);

BasicRequestAuthenticator.prototype.authenticate = function basicAuthenticate(request) {
  var concat = this.apiKey.id + ':' + this.apiKey.secret;
  var base64 = utils.base64.encode(concat);
  request.headers['Authorization'] = 'Basic ' + base64;
};

module.exports = BasicRequestAuthenticator;
