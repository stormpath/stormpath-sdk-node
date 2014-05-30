'use strict';

var utils = require('../utils');
var uuid = require('node-uuid');

function ApiKeyEncryptedOptions(apiKeyId) {
  this.encryptSecret =true;
  this.encryptionKeySalt = new Buffer(uuid().substr(0,16)).toString('base64');
  this.expand = "account";
  if(apiKeyId){
    this.id = apiKeyId;
  }
  return this;
}
utils.inherits(ApiKeyEncryptedOptions, Object);

module.exports = ApiKeyEncryptedOptions;