'use strict';

var propsParser = require('properties-parser');

var _ = require('../underscore');
var ApiKey = require('./ApiKey');

var FILE_URL_PREFIX = 'file://';
var DEFAULT_ID_PROP_NAME = 'apiKey.id';
var DEFAULT_SECRET_PROP_NAME = 'apiKey.secret';

function loadFile(path, callback) {
  return propsParser.read(path, function(err, props) {
    if (err) {
      return callback(new Error("Unable to read properties file '" + path + "': " + err.message), null);
    }

    var apiKey = new ApiKey(props[DEFAULT_ID_PROP_NAME], props[DEFAULT_SECRET_PROP_NAME]);
    return callback(null, apiKey);
  });
}

function loadApiKey(path, callback) {
  if (_(path).startsWith(FILE_URL_PREFIX)) {
    path = path.substring(FILE_URL_PREFIX.length);
  }
  loadFile(path, callback);
}

module.exports = loadApiKey;
