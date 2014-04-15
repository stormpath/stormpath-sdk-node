'use strict';

var async = require('async');
var stormpath = require('./lib');
var moment = require('moment');
var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';
var client = null;

var itemsPerPage = 100;

stormpath.loadApiKey(apiKeyFilePath, function (err, apiKey) {
  if (err) {
    throw err;
  }

  client = new stormpath.Client({apiKey: apiKey});
  client.getCurrentTenant(function (err, tenant) {
    if (err) {
      throw err;
    }
//    add 200 applications for testing
//    for(var i = 0; i < 200; i++){
//      tenant.createApplication({name: 'Just Testing! Delete me.' + Math.random() },
//        function(){})
//    }

    onTenantReady(tenant);
  });
});

function onTenantReady(tenant) {
  async.series([
    function(cb){ each(tenant, cb); },
    function(cb){ map(tenant, cb); },
    function(cb){ filter(tenant, cb); },
    function(cb){ reject(tenant, cb); },
    function(cb){ concat(tenant, cb); },
  ], function (){
    console.log('all done');
  } );
}

function each(clientOrTenant, cb) {

  clientOrTenant.getApplications({limit:itemsPerPage},function (err, apps) {
    if (err) {
      throw err;
    }

    var start = Date.now();
    var counter = 0;var hundred = Date.now();
    apps.each(function iterator(app, cb) {
      if (err) {
        throw err;
      }
      counter++;
      if (counter % 100 === 0){
        console.log(counter/100 + ' hundred ' + moment.duration(Date.now() - hundred).asSeconds());
        console.log('items total: ' + counter);
        hundred = Date.now();
      }
      cb();
    }, function onAllItems(err) {
      if (err){
        console.error(err);
      }
      var end = Date.now();
      console.log('items total: ' + counter);
      console.log('all: ' + moment.duration(end-start).asSeconds());
      cb();
    });
  });
}

function map(clientOrTenant, cb) {
  clientOrTenant.getApplications({limit:itemsPerPage},function (err, apps) {
    if (err) {
      throw err;
    }

    function iterator(app, cb) {
      if (err) {
        throw err;
      }
      counter++;
      if (counter % 100 === 0){
        console.log(counter/100 + ' hundred ' + moment.duration(Date.now() - hundred).asSeconds());
        console.log('items total: ' + counter);
        hundred = Date.now();
      }
      cb(null, app.name);
    }

    function onAllItems(err, res) {
      if (err){
        console.error(err);
      }
      var end = Date.now();
      console.log('items total: ' + counter);
      console.log('all: ' + moment.duration(end-start).asSeconds());
      console.log('Result length: ' + res.length);
    }

    var start, counter, hundred;

    function reset(){
      start = Date.now();
      counter = 0;
      hundred = Date.now();
    }

    reset();
    function wrap(func, cb){
      return function (err, res){
        func(err, res);
        reset();
        cb();
      };
    }

    async.series([
      function (cb){
        apps.map(iterator, wrap(onAllItems, cb));
      },
      function (cb){
        apps.mapSeries(iterator, wrap(onAllItems, cb));
      },
      function (cb){
        apps.mapLimit(2, iterator, wrap(onAllItems, cb));
      }],
     cb
    );
  });
}

function filter(clientOrTenant, cb) {
  clientOrTenant.getApplications({limit:itemsPerPage},function (err, apps) {
    if (err) {
      throw err;
    }

    function iterator(app, cb) {
      if (err) {
        throw err;
      }
      counter++;
      if (counter % 100 === 0){
        console.log(counter/100 + ' hundred ' + moment.duration(Date.now() - hundred).asSeconds());
        console.log('items total: ' + counter);
        hundred = Date.now();
      }
      cb(counter % 2 === 0);
    }

    function onAllItems(err, res) {
      var end = Date.now();
      console.log('items total: ' + counter);
      console.log('all: ' + moment.duration(end-start).asSeconds());
      console.log('Result length: ' + res.length);
      //console.log(res);
    }

    var start, counter, hundred;

    function reset(){
      start = Date.now();
      counter = 0;
      hundred = Date.now();
    }

    reset();

    function wrap(func, argLength, cb){
      return function (err, res){
        if (argLength === 1){
          res = err;
          err = null;
        }
        func(err, res);
        reset();
        cb();
      };
    }

    async.series([
      function (cb){
        apps.filter(iterator, wrap(onAllItems, 1, cb));
      },
      function (cb){
        apps.filterSeries(iterator, wrap(onAllItems, 1, cb));
      }
    ],cb);
  });
}

function reject(clientOrTenant, cb) {
  clientOrTenant.getApplications({limit:itemsPerPage},function (err, apps) {
    if (err) {
      throw err;
    }

    function iterator(app, cb) {
      if (err) {
        throw err;
      }
      counter++;
      if (counter % 100 === 0){
        console.log(counter/100 + ' hundred ' + moment.duration(Date.now() - hundred).asSeconds());
        console.log('items total: ' + counter);
        hundred = Date.now();
      }
      cb(counter % 2 === 0);
    }

    function onAllItems(err, res) {
      var end = Date.now();
      console.log('items total: ' + counter);
      console.log('all: ' + moment.duration(end-start).asSeconds());
      console.log('Result length: ' + res.length);
      //console.log(res);
    }

    var start, counter, hundred;

    function reset(){
      start = Date.now();
      counter = 0;
      hundred = Date.now();
    }

    reset();

    function wrap(func, argLength, cb){
      return function (err, res){
        if (argLength === 1){
          res = err;
          err = null;
        }
        func(err, res);
        reset();
        cb();
      };
    }

    async.series([
      function (cb){
        apps.reject(iterator, wrap(onAllItems, 1, cb));
      },
      function (cb){
        apps.rejectSeries(iterator, wrap(onAllItems, 1, cb));
      }
    ],cb);
  });
}

function concat(clientOrTenant, cb) {
  clientOrTenant.getApplications({limit:itemsPerPage},function (err, apps) {
    if (err) {
      throw err;
    }

    function iterator(app, cb) {
      if (err) {
        throw err;
      }
      counter++;
      if (counter % 100 === 0){
        console.log(counter/100 + ' hundred ' + moment.duration(Date.now() - hundred).asSeconds());
        console.log('items total: ' + counter);
        hundred = Date.now();
      }
      cb(null, {app: app.name});
    }

    function onAllItems(err, res) {
      var end = Date.now();
      console.log('items total: ' + counter);
      console.log('all: ' + moment.duration(end-start).asSeconds());
      console.log('Result length: ' + res.length);
      //console.log(res);
    }

    var start, counter, hundred;

    function reset(){
      start = Date.now();
      counter = 0;
      hundred = Date.now();
    }

    reset();

    function wrap(func, argLength, cb){
      return function (err, res){
        if (argLength === 1){
          res = err;
          err = null;
        }
        func(err, res);
        reset();
        cb();
      };
    }

    async.series([
      function (cb){
        apps.concat(iterator, wrap(onAllItems, 2, cb));
      },
      function (cb){
        apps.concatSeries(iterator, wrap(onAllItems, 2, cb));
      }
    ],cb);
  });
}