var common = require('../common');
var stormpath = common.Stormpath;

function loadApiKey(cb){
  var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
  var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

  stormpath.loadApiKey(apiKeyFilePath, function apiKeyFileLoaded(err, apiKey) {
    if (err){ throw err; }
    cb(apiKey);
  });
}

function getClient(cb){
  loadApiKey(function(apiKey){
    cb(new stormpath.Client({apiKey:apiKey}));
  });
}

module.exports = {
  loadApiKey: loadApiKey,
  getClient: getClient
};