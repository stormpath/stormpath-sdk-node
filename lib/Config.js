var deepExtend = require('deep-extend');
var flat = require('flat');
var fs = require('fs');
var path = require('path');
var propsParser = require('properties-parser');

var defaultConfig = require(path.join(__dirname,'config.json'));

var homePath = process.env[(process.platform === 'win32') ?
  'USERPROFILE' : 'HOME'];

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
  deepExtend(this,defaultConfig);
  deepExtend(this,userConfig||{});
  deepExtend(this,currentConfig||{});
  deepExtend(this,this.getEnvVars());
  deepExtend(this,options||{});

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
