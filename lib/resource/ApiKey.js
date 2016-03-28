'use strict';

var crypto = require('crypto');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class ApiKey
 *
 * @param {Object} apiKeyData
 * The raw JSON data of this resource, as retrieved from the Stormpath REST API.
 *
 * @description
 *
 * Encapsulates an Api Key, that was issued to an {@link Accout}. Account API
 * Keys can be used to authenticate requets to your web framework. For more
 * information please see [Using Stormpath for API Authentication](https://docs.stormpath.com/guides/api-key-management).
 *
 * Typically you do not need to manually construct a ApiKey object. Rather, you
 * will obtain an ApiKey from
 * {@link Application#getApiKey Application.getApiKey()}.
 */
function ApiKey() {
  ApiKey.super_.apply(this, arguments);
}

utils.inherits(ApiKey, InstanceResource);

ApiKey.prototype._getDecryptedSecret = function _getDecryptedSecret(callback) {
  var salt = this.apiKeyMetaData.encryptionKeySalt;
  var iterations = this.apiKeyMetaData.encryptionKeyIterations;
  var keyLengthBits = this.apiKeyMetaData.encryptionKeySize;
  var password = new Buffer(this.dataStore.requestExecutor.options.client.apiKey.secret);
  var encryptedSecret = new Buffer(this.secret,'base64');
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
