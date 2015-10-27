'use strict';

var crypto = require('crypto');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

function ApiKey() {
  ApiKey.super_.apply(this, arguments);
}
utils.inherits(ApiKey, InstanceResource);

ApiKey.prototype._getDecryptedSecret = function _getDecryptedSecret(callback) {
  var self = this;
  var salt = self.apiKeyMetaData.encryptionKeySalt;
  var iterations = self.apiKeyMetaData.encryptionKeyIterations;
  var keyLengthBits = self.apiKeyMetaData.encryptionKeySize;
  var password = new Buffer(self.dataStore.requestExecutor.options.client.apiKey.secret);
  var encryptedSecret = new Buffer(self.secret,'base64');
  var iv = encryptedSecret.slice(0,16);
  var rawEncryptedValue = encryptedSecret.slice(16);
  crypto.pbkdf2(password,new Buffer(salt,'base64'),iterations,(keyLengthBits/8),function(err,key){
    if(err){
      return callback(err);
    }
    var decrypted;
    try{
      var algo = keyLengthBits === 128 ? 'aes-128-cbc':'aes-256-cbc';
      var decipher = crypto.createDecipheriv(algo, key, iv);
      decrypted = decipher.update(rawEncryptedValue,'binary','utf8');
      decrypted += decipher.final('utf8');
    }catch(e){
      return callback(e);
    }
    callback(null,decrypted);
  });
};

ApiKey.prototype._setApiKeyMetaData = function _setApiKeyMetaData(obj){
  this.apiKeyMetaData = obj && obj.encryptSecret ? obj : null;
};

ApiKey.prototype._decrypt = function _decrypt(callback) {
  var self = this;
  if(self.apiKeyMetaData){
    self._getDecryptedSecret(function(err,secret){
      if(err){
        return callback(err);
      }
      self.secret = secret;
      delete self.apiKeyMetaData;
      callback(null,self);
    });
  }else{
    process.nextTick(callback.bind(null,null,self));
  }
};

module.exports = ApiKey;
