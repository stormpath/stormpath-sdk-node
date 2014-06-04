'use strict';

var utils = require('../utils');
var uuid = require('node-uuid');

function ApiKeyEncryptedOptions(apiKeyId) {
  this.encryptSecret =true;
  this.encryptionKeySalt = utils.base64.urlEncode(new Buffer(uuid().substr(0,16),'base64').toString('base64'));
  this.encryptionKeySize=128;
  this.encryptionKeyIterations=1024;
  this.expand = "account";
  if(apiKeyId){
    this.id = apiKeyId;
  }
  return this;
}
utils.inherits(ApiKeyEncryptedOptions, Object);

module.exports = ApiKeyEncryptedOptions;