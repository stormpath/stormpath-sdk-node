/*
  0. use default internals
  1. stormpath.json in ~/.stormpath/stormpath.json
  2. stormpath.json in current directory
  3. read from environment variables
  4. passed in to constructor
 */


var deepExtend = require('deep-extend');
var path = require('path');
var fs = require('fs');


var defaultConfig = require(path.join(__dirname,'config.json'));

var homePath = process.env[(process.platform === 'win32') ?
  'USERPROFILE' : 'HOME'];

var currentConfigPath = path.join(process.cwd(),'stormpath.json');

var userConfigPath = path.join(homePath,'stormpath.json');

var currentConfig = fs.existsSync(currentConfigPath) ?
 fs.readSync(currentConfigPath) : {};

var userConfig = fs.existsSync(userConfigPath) ?
 fs.readSync(userConfigPath) : {};


function Config(options){
  deepExtend(this,defaultConfig);
  deepExtend(this,userConfig||{});
  deepExtend(this,currentConfig||{});
  this.getEnvVars();
  deepExtend(this,options||{});
}

Config.prototype.getEnvVars = function(){
  var flattendDefaultConfig = this.flattenObject(this);
  Object.keys(flattendDefaultConfig).forEach(function(key){
    var k = key.toUpperCase().replace(/\./g,'_');
    var value = process.env[k];
    if(value!==undefined){
      flattendDefaultConfig[key] =
        typeof flattendDefaultConfig[key] === 'number' ? parseInt(value,10) : value;
    }
  });
};

Config.prototype.flattenObject = function(ob) {
  var self = this;
  var toReturn = {};
  var flatObject;
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) {
      continue;
    }
    if ((typeof ob[i]) === 'object') {
      flatObject = self.flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }
        toReturn[i + (!!isNaN(x) ? '.' + x : '')] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

module.exports = Config;