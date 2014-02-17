'use strict';

var _ = require('./underscore');
var util = require('./util');
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
  propsParser.read(path, function (err, props) {
    if (err) {
      callback(new Error("Unable to read properties file '" + path + "': " + err.message), null);
    } else {
      var apiKey = new ApiKey(props[DEFAULT_ID_PROP_NAME], props[DEFAULT_SECRET_PROP_NAME]);
      callback(null, apiKey);
    }
  });
}

function loadApiKey(path, callback) {
  if (_(path).startsWith(FILE_URL_PREFIX)) {
    path = path.substring(FILE_URL_PREFIX.length);
  }
  loadFile(path, callback);
}

module.exports = {ApiKey: ApiKey, loadApiKey: loadApiKey};

