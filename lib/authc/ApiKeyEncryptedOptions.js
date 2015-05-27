'use strict';

var utils = require('../utils');
var uuid = require('node-uuid');

function ApiKeyEncryptedOptions(options) {
  options = typeof options === 'object' ? options : {};
  this.expand = "account";
  if(options.id){
    this.id = options.id;
  }
  if(options.encryptSecret !== false){
    this.encryptSecret = true;
    this.encryptionKeySize = options.encryptionKeySize || 256;
    this.encryptionKeyIterations = options.encryptionKeyIterations || 1024;
    var salt = new Buffer(uuid().substr(0,16),'base64').toString('base64');
    this.encryptionKeySalt = utils.base64.urlEncode(salt);
  }
  return this;
}
utils.inherits(ApiKeyEncryptedOptions, Object);

module.exports = ApiKeyEncryptedOptions;