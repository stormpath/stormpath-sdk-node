'use strict';

var crypto = require('crypto');
var utils = require('../utils');
var InstanceResource = require('./InstanceResource');

function ApiKey() {
  ApiKey.super_.apply(this, arguments);
}
utils.inherits(ApiKey, InstanceResource);

ApiKey.prototype._getDecryptedSecret = function(callback) {
  var self = this;
  var salt = self.apiKeyMetaData.encryptionKeySalt;
  var iterations = self.apiKeyMetaData.encryptionKeyIterations;
  var keyLengthBits = self.apiKeyMetaData.encryptionKeySize;
  var password = new Buffer(self.dataStore.requestExecutor.options.apiKey.secret);
  var encryptedSecret = new Buffer(self.secret,'base64');
  var iv = encryptedSecret.slice(0,16);
  var rawEncryptedValue = encryptedSecret.slice(16);
  crypto.pbkdf2(password,new Buffer(salt,'base64'),iterations,(keyLengthBits/8),function(err,key){
    if(err){
      return callback(err);
    }
    var decrypted;
    try{
      var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      decrypted = decipher.update(rawEncryptedValue,'binary','utf8');
      decrypted += decipher.final('utf8');
    }catch(e){
      return callback(e);
    }
    callback(null,decrypted);
  });

};

ApiKey.prototype.setApiKeyMetaData = function setApiKeyMetaData(obj){
  this.apiKeyMetaData = {};
  this.apiKeyMetaData.encryptSecret = obj.encryptSecret;
  this.apiKeyMetaData.encryptionKeySalt = obj.encryptionKeySalt;
  this.apiKeyMetaData.encryptionKeySize = obj.encryptionKeySize;
  this.apiKeyMetaData.encryptionKeyIterations = obj.encryptionKeyIterations;
};

ApiKey.prototype._decrypt = function(callback) {
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