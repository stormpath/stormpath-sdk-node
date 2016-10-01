'use strict';

var Factor = require('./Factor');
var utils = require('../utils');

function GoogleAuthenticatorFactor() {
  GoogleAuthenticatorFactor.super_.apply(this, arguments);
}

utils.inherits(GoogleAuthenticatorFactor, Factor);

module.exports = GoogleAuthenticatorFactor;
