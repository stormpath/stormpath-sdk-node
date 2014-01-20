'use strict';

require('./lang');
var util = require('util');
var propsParser = require('properties-parser');

var FILE_URL_PREFIX = 'file://';
var DEFAULT_ID_PROP_NAME = 'apiKey.id';
var DEFAULT_SECRET_PROP_NAME = 'apiKey.secret';

function ApiKey(id, secret) {
  this.id = id;
  this.secret = secret;
}
util.inherits(ApiKey, Object);
ApiKey.prototype.toString = function apiKeyToString() {
  return 'id: ' + this.id + ', secret: <hidden>';
};

function loadFile(path, callback) {
  return propsParser.read(path, function (err, props) {
    if (err) {
      return callback(err, null);
    }

    var apiKey = new ApiKey(props[DEFAULT_ID_PROP_NAME], props[DEFAULT_SECRET_PROP_NAME]);

    return callback(null, apiKey);
  });
}

function loadApiKey(path, callback) {
  if (path.startsWith(FILE_URL_PREFIX)) {
    path = path.substring(FILE_URL_PREFIX.length);
  }
  return loadFile(path, callback);
}


module.exports = {ApiKey: ApiKey, loadApiKey: loadApiKey};

