'use strict';

var fs = require('fs');
var path = require('path');

var deepExtend = require('deep-extend');
var flat = require('flat');
var propsParser = require('properties-parser');

var defaultConfig = require(path.join(__dirname,'config.json'));

var homePath = process.env[(process.platform === 'win32') ?  'USERPROFILE' : 'HOME'] || '';

var currentConfigPath = path.join(process.cwd(),'stormpath.json');

var userConfigPath = path.join(homePath,'stormpath.json');

var currentConfig = fs.existsSync(currentConfigPath) ?
  fs.readSync(currentConfigPath) : {};

var userConfig = fs.existsSync(userConfigPath) ?
  fs.readSync(userConfigPath) : {};

/**
 * @class Config
 * @param {Object} config Config overrides
 *
 * Constructs a Stormpath Config object, by looking in the following locations:
 *
 * 0. use default internal config
 * 1. stormpath.json in ~/.stormpath/stormpath.json
 * 2. stormpath.json in current directory
 * 3. read from environment variables
 * 4. passed in to constructor
 *
 */

function Config(options){
  deepExtend(this, defaultConfig);
  deepExtend(this, userConfig||{});
  deepExtend(this, currentConfig||{});
  deepExtend(this, this.getEnvVars());
  deepExtend(this, options||{});

  var apiKeyFileName = this.client.apiKey.file;
  if (
    apiKeyFileName &&
    !this.client.apiKey.id &&
    !this.client.apiKey.secret
  ){
    if (!fs.existsSync(apiKeyFileName)) {
      throw new Error('Client API key file not found: '+ apiKeyFileName);
    }

    var props = propsParser.read(apiKeyFileName);
    if (!props || !props.id || !props.secret) {
      throw new Error('Unable to read properties file: ' + apiKeyFileName);
    }

    this.client.apiKey.id = props.id;
    this.client.apiKey.secret = props.secret;
  }

  // If a user enables a boolean configuration option named `website`, this
  // means the user is building a website and we should automatically enable
  // certain features in the library meant for users developing websites.  This
  // is a simpler way of handling configuration than forcing users to specify
  // all nested JSON configuration options themselves.
  if (this.website) {
    this.web.register.enabled = true;
    this.web.login.enabled = true;
    this.web.logout.enabled = true;
    this.web.me.enabled = true;
  }

  // If a user enables a boolean configuration option named `api`, this means
  // the user is building an API service, and we should automatically enable
  // certain features in the library meant for users developing API services --
  // namely, our OAuth2 token endpoint (/oauth/token).  This allows users
  // building APIs to easily provision OAuth2 tokens without specifying any
  // nested JSON configuration options.
  if (this.api) {
    this.web.oauth2.enabled = true;
  }
}

Config.prototype.getEnvVars = function(){
  var flattendDefaultConfig = flat.flatten(this,{
    delimiter: '_'
  });
  var flatEnvValues = Object.keys(flattendDefaultConfig)
    .reduce(function(envVarMap,key){
      var envKey = 'STORMPATH_' + key.toUpperCase();
      var value = process.env[envKey];
      if(value!==undefined){
        envVarMap[key] = typeof flattendDefaultConfig[key] === 'number' ?
          parseInt(value,10) : value;
      }
      return envVarMap;
    },{});
  return flat.unflatten(flatEnvValues,{delimiter:'_'});
};

module.exports = Config;
