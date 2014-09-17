var common = require('../common');
var uuid = common.uuid;
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

function uniqId(){
  return 'it-'+uuid();
}

function fakeAccount(){
  return {
    givenName: uniqId(),
    surname: uniqId(),
    username: uniqId(),
    email: uniqId() + '@mailinator.com',
    password: 'Changeme1!' + uuid()
  };
}

function fakeDirectory(){
  return {
    name: uniqId()
  };
}

module.exports = {
  loadApiKey: loadApiKey,
  getClient: getClient,
  uniqId: uniqId,
  fakeAccount: fakeAccount,
  fakeDirectory: fakeDirectory
};