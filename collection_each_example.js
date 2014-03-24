'use strict';

var stormpath = require('./lib');
var moment = require('moment');
var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';
var client = null;

var itemsPerPage = 25;

stormpath.loadApiKey(apiKeyFilePath, function (err, apiKey) {
  if (err) {
    throw err;
  }

  client = new stormpath.Client({apiKey: apiKey});
  client.getCurrentTenant(function (err, tenant) {
    if (err) {
      throw err;
    }
    onTenantReady(tenant);
  });
});

function onTenantReady(tenant) {
  listAppsAndDirs(tenant);
}

function listAppsAndDirs(clientOrTenant) {

  clientOrTenant.getApplications({limit:itemsPerPage},function (err, apps) {
    if (err) {
      throw err;
    }

    var start = Date.now();
    var counter = 0;var hundred = Date.now();
    apps.each(function iterator(app, offset) {
      if (err) {
        throw err;
      }
      counter++;
      if (counter % 100 === 0){
        console.log(counter/100 + ' hundred ' + moment.duration(Date.now() - hundred).asSeconds());
        console.log('items total: ' + counter);
        hundred = Date.now();
      }
    }, function onAllItems(err) {
      if (err){
        console.error(err);
      }
      var end = Date.now();
      console.log('items total: ' + counter);
      console.log('all: ' + moment.duration(end-start).asSeconds());
    });
  });
}