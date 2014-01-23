'use strict';

var stormpath = require('./lib/stormpath');

var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

stormpath.loadApiKey(apiKeyFilePath, function (err, apiKey) {
  if (err) {
    console.log(err);
    return;
  }

  var client = stormpath.createClient({apiKey: apiKey});
  onClientReady(client);
});

function onClientReady(client) {
  client.getCurrentTenant(function(err, tenant) {
    if (err) {
      console.log(err);
      return;
    }

    console.log(tenant);
  });
}

