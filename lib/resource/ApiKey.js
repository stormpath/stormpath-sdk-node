'use strict';

var crypto = require('crypto');

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class ApiKey
 *
 * @extends {InstanceResource}
 *
 * @description
 *
 * Encapsulates an Api Key resource of an {@link Account}. For full
 * documentation of this resource, please see
 * [REST API Reference: Account API Keys](https://docs.stormpath.com/rest/product-guide/latest/reference.html?#account-api-keys).
 *
 * These keys can be used to authenticate requests to your web framework.
 * For a high-level overview of this feature, please read [Using Stormpath for
 * API Authentication](https://docs.stormpath.com/guides/api-key-management). If
 * you are using [Express-Stormath](http://docs.stormpath.com/nodejs/express/latest),
 * please read the [Authentication Section](http://docs.stormpath.com/nodejs/express/latest/authentication.html).
 *
 * This class should not be manually constructed. It should be obtained from one
 * of these methods:
 *
 * - {@link Account#getApiKeys Account.getApiKeys()}
 * - {@link Application#getApiKey Application.getApiKey()}
 *
 * @param {Object} apiKeyResource
 *
 * The JSON representation of this resource, retrieved the Stormpath REST API.
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
