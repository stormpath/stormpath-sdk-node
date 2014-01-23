'use strict';

var util = require('util');
var RequestExecutor = require('./reqexec');

function DataStore(config) {
  if (!config) {
    throw new Error('config argument is required.');
  }
  this.requestExecutor = config.requestExecutor || new RequestExecutor(config);
  //TODO: support config.cacheManager, config.cacheRegionResolver, etc.
}
util.inherits(DataStore, Object);

DataStore.prototype.getResource = function (ResourceConstructor, href, callback) {
  var _this = this;

  this.requestExecutor.execute({uri: href}, function onRequestResult(err, body) {
    if (err) {
      callback(err);
      return;
    }

    var resource = new ResourceConstructor(body, _this);

    callback(null, resource);
  });
};

module.exports = DataStore;





