'use strict';

var stormpath = require('./lib/stormpath');

var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

var client = null; //available after the ApiKey is loaded from disk (api key is needed to instantiate the client).

stormpath.loadApiKey(apiKeyFilePath, function (err, apiKey) {
  if (err) throw err;

  client = stormpath.createClient({apiKey: apiKey});
  client.getCurrentTenant(function (err, tenant) {
    if (err) throw err;

    onTenantReady(tenant);
  });
});

function onTenantReady(tenant) {
  listAppsAndDirs(tenant);
  doAppCrud(client);
}

function listAppsAndDirs(tenant) {

  tenant.get('applications', function onApps(err, apps) {
    if (err) throw err;

    apps.each(function eachApp(err, app, offset) {
      if (err) throw err;

      console.log(offset + ": ");
      console.log(app);
    });
  });

  tenant.get('directories', function onTenantDirectories(err, dirs) {
    if (err) throw err;

    dirs.each(function eachDir(err, dir) {
      if (err) throw err;

      console.log(dir);
    });
  });
}

function doAppCrud(client) {

  client.getCurrentTenant(function (err, tenant) {
    if (err) throw err;

    //Create:
    tenant.createApplication({name: 'Just Testing! Delete me.'}, function onCreateApp(err, app) {
      if (err) throw err;

      console.log(app);

      //Read:
      client.getResource(app.href, function onReadApp(err, app2) {
        if (err) throw err;

        console.log(app2);

        //Update:
        app2.name = 'Just Testing Again!.  Delete me (really).';
        app2.save(function onSaveApp(err, app3) {
          if (err) throw err;

          console.log(app3);

          //Delete:
          app3.delete(function onDeleteApp(err) {
            if (err) throw err;

            console.log("App deleted!");
          });

        });

      });

    });

  });
}


