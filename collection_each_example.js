'use strict';

var _ = require('underscore');
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
    //add 200 applications for testing
//    for(var i = 0; i < 200; i++){
//      tenant.createApplication({name: 'Just Testing! Delete me.' + Math.random() },
//        function(){})
//    }

    tenant.getApplications({limit: itemsPerPage}, function (err, apps) {
      if (err) {
        throw err;
      }

      onAppsReady(apps);
    });
  });
});

function onAppsReady(apps) {
  function s(f) {
    return function (cb) {
      console.log('Testing ' + f.name);
      f(apps, cb);
    };
  }

  async.series([
    s(each),
    s(map),
    s(filter),
    s(reject),
    s(reduce),
    s(detect),
    s(some),
    s(every),
    s(sortBy),
    s(concat)
  ], function (err) {
    if(err){
      console.error(err);
    }

    console.log('all done');
  });
}

function Logger() {
  var self = this;
  var start = Date.now();
  var counter = 0;
  var hundred = Date.now();

  this.reset = function reset() {
    start = Date.now();
    counter = 0;
    hundred = Date.now();
  };

  this.i = function wrapIterator(iterator) {
    return function () {
      counter++;
      if (counter % 100 === 0) {
        console.log(counter / 100 + ' hundred ' + moment.duration(Date.now() - hundred).asSeconds());
        console.log('items total: ' + counter);
        hundred = Date.now();
      }
      iterator.apply(this, arguments);
    };
  };

  this.c = function wrapCallback(cb, argsLength) {
    return function (err, res) {
      if (argsLength === 1) {
        res = err; err = null;
      }

      var end = Date.now();
      console.log('items total: ' + counter);
      console.log('all: ' + moment.duration(end - start).asSeconds());
      self.reset();

      if (res) {
        console.log('Result ' + (res.length ? 'length: ' + res.length : res));
      }

      cb(err, res);
    };
  };
}

var l = new Logger();

function each(apps, cb) {
  l.reset();
  apps.each(
    l.i(function iterator(app, cb) {
      cb();
    }),
    l.c(function onAllItems() {
      cb();
    }));
}

function map(apps, cb) {
  l.reset();

  function iterator(app, cb) {
    cb(null, app.name);
  }

  async.series([
      function (cb) {
        apps.map(l.i(iterator), l.c(cb));
      },
      function (cb) {
        apps.mapSeries(l.i(iterator), l.c(cb));
      },
      function (cb) {
        apps.mapLimit(2, l.i(iterator), l.c(cb));
      }],
    cb
  );
}

function filter(apps, cb) {
  l.reset();
  var i = 0;
  function iterator(app, cb) {
    cb(i++ % 2 === 0);
  }

  async.series([
    function (cb) {
      apps.filter(l.i(iterator), l.c(cb, 1));
    },
    function (cb) {
      apps.filterSeries(l.i(iterator), l.c(cb, 1));
    }
  ], cb);
}

function reject(apps, cb) {
  l.reset();
  var i = 0;
  function iterator(app, cb) {
    cb(i++ % 2 === 0);
  }

  async.series([
    function (cb) {
      apps.reject(l.i(iterator), l.c(cb, 1));
    },
    function (cb) {
      apps.rejectSeries(l.i(iterator), l.c(cb, 1));
    }
  ], cb);
}

function reduce(apps, cb) {
  l.reset();
  var i = 0;
  function iterator(counter, app, cb) {
    cb(null, i++);
  }

  async.series([
    function (cb) {
      apps.reduce(0, l.i(iterator), l.c(cb));
    },
    function (cb) {
      apps.reduceRight(0, l.i(iterator), l.c(cb));
    }
  ], cb);
}

function detect(apps, cb) {
  l.reset();
  var i = 0;
  function iterator(app, cb) {
    cb(0 === i++ % 2);
  }

  async.series([
    function (cb) {
      apps.detect(l.i(iterator), l.c(cb, 1));
    },
    function (cb) {
      apps.detectSeries(l.i(iterator), l.c(cb, 1));
    }
  ], cb);
}

function some(apps, cb) {
  l.reset();
  var i = 0;
  function iterator(app, cb) {
    cb(0 === i++ % 2);
  }

  apps.some(l.i(iterator), l.c(cb, 1));
}

function every(apps, cb) {
  l.reset();
  var i = 0;
  function iterator(app, cb) {
    cb(0 === i++ % 2);
  }

  apps.every(l.i(iterator), l.c(cb, 1));
}

function sortBy(apps, cb) {
  function iterator(app, cb) {
    cb(null, app.name);
  }

  apps.sortBy(l.i(iterator), l.c(cb));
}

function concat(apps, cb) {
  function iterator(app, cb) {
    cb(null, {app: app.name});
  }

  async.series([
    function (cb) {
      apps.concat(l.i(iterator), l.c(cb));
    },
    function (cb) {
      apps.concatSeries(l.i(iterator), l.c(cb));
    }
  ], cb);
}