'use strict';

/*
* Deafult NonceStore - requires a data store instance which has a cache manager
*/
var NonceStore = function NonceStore(dataStore){
  this.cache = dataStore.cacheHandler.cacheManager.getCache('idSiteNonces');
};

NonceStore.prototype.getNonce = function getNonce(nonceValue,cb) {
  this.cache.get(nonceValue,cb);
};

NonceStore.prototype.putNonce = function putNonce(nonceValue,cb) {
  this.cache.put(nonceValue,nonceValue,cb);
};


module.exports = NonceStore;