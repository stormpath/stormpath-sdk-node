var fs = require('fs');
var uuid = require('uuid');
var yaml = require('js-yaml');
var expandHomeDir = require('expand-home-dir');

var FakeFS = require('fake-fs');

var common = require('./common');
var assert = common.assert;

var configLoader = require('../lib/configLoader');

describe('Configuration loader', function () {
  var loader, fakeFs, afterIt;

  // Removes any Stormpath environment variables
  // and provides a callback to restore them.
  function removeStormpathEnv() {
    var restore = common.snapshotEnv();

    for (var key in process.env) {
      if (key.indexOf('STORMPATH_') === 0) {
        delete process.env[key];
      }
    }

    return restore;
  }

  // Sets up our fake file system with mock files.
  function setupFakeFs(files) {
    // If we already have a fake fs, then unpatch
    // the previous one and create a new.
    if(fakeFs) {
      fakeFs.unpatch();
    }

    fakeFs = new FakeFS().bind();

    var defaultConfigPath = process.cwd() + '/lib/config.yml';

    fakeFs.file(defaultConfigPath, {
      content: fs.readFileSync(process.cwd() + '/lib/config.yml')
    });

    if (files) {
      files.forEach(function (file) {
        fakeFs.file(file.path, { content: file.content });
      });
    }

    fakeFs.patch();
  }

  before(function () {
    afterIt = [];
    loader = configLoader();
  });

  after(function () {
    if (fakeFs) {
      fakeFs.unpatch();
    }
  });

  // Cleanup functions that should run directly after all "it" tests.
  // This is because mocha does not offer this functionality at the moment.
  // I.e. mocha's after() is queued and executed after all tests have run.
  afterEach(function () {
    while (afterIt.length) {
      afterIt.shift()();
    }
  });

  it('should error when not providing api key', function (done) {
    setupFakeFs();

    var restoreEnv = common.snapshotEnv();

    // Remove any STORMPATH environment keys.
    for (var key in process.env) {
      if (key.indexOf('STORMPATH_') === 0) {
        delete process.env[key];
      }
    }

    afterIt.push(restoreEnv);

    loader.load(function (err, config) {
      assert.isUndefined(config);

      assert.isNotNull(err);
      assert.equal(err.message, 'API key ID and secret is required.');

      done();
    });
  });

  it('should load api key from apikey config in root', function (done) {
    setupFakeFs();

    var restoreEnv = common.snapshotEnv();

    // Remove any STORMPATH environment keys.
    for (var key in process.env) {
      if (key.indexOf('STORMPATH_') === 0) {
        delete process.env[key];
      }
    }

    afterIt.push(restoreEnv);

    var dummyApiKey = {
      id: uuid(),
      secret: uuid()
    };

    loader = configLoader({
      apiKey: dummyApiKey
    });

    loader.load(function (err, config) {
      assert.isNull(err);

      assert.isNotNull(config);
      assert.isNotNull(config.apiKey);
      assert.isNotNull(config.client.apiKey);
      assert.deepEqual(config.client.apiKey, {
        file: null,
        id: dummyApiKey.id,
        secret: dummyApiKey.secret
      });

      done();
    });
  });

  it('should load the default configuration', function (done) {
    setupFakeFs();

    loader.load(function (err, config) {
      if (err) {
        throw err;
      }

      assert.isTrue(!!config);

      assert.isTrue(!!config.client);
      assert.isTrue(!!config.client.cacheManager);

      assert.isTrue(!!config.apiKey);

      assert.isTrue(!!config.client.apiKey);
      assert.isTrue('file' in config.client.apiKey);
      assert.isTrue('id' in config.client.apiKey);
      assert.isTrue('secret' in config.client.apiKey);

      assert.isTrue(!!config.client.proxy);
      assert.isNull(config.client.proxy.port);
      assert.isNull(config.client.proxy.host);
      assert.isNull(config.client.proxy.username);
      assert.isNull(config.client.proxy.password);

      assert.equal(config.client.baseUrl, "https://api.stormpath.com/v1");
      assert.equal(config.client.authenticationScheme, "SAUTHC1");
      assert.equal(config.client.connectionTimeout, 30);

      assert.isTrue(!!config.application);
      assert.isTrue('name' in config.application);
      assert.isTrue('href' in config.application);

      done();
    });
  });

  it('should load configuration from the environment', function (done) {
    setupFakeFs();

    afterIt.push(removeStormpathEnv());

    process.env.STORMPATH_CLIENT_APIKEY_ID = uuid();
    process.env.STORMPATH_CLIENT_APIKEY_SECRET = uuid();
    process.env.STORMPATH_APPLICATION_HREF = 'http://api.stormpath.com/v1/applications/' + uuid();
    process.env.STORMPATH_APPLICATION_NAME = uuid();

    loader.load(function (err, config) {
      assert.isFalse(!!err);

      assert.isTrue(!!config);
      assert.isTrue(!!config.client);
      assert.isTrue(!!config.client.apiKey);
      assert.isTrue(!!config.application);

      assert.equal(config.client.apiKey.id, process.env.STORMPATH_CLIENT_APIKEY_ID);
      assert.equal(config.client.apiKey.secret, process.env.STORMPATH_CLIENT_APIKEY_SECRET);
      assert.equal(config.application.href, process.env.STORMPATH_APPLICATION_HREF);
      assert.equal(config.application.name, process.env.STORMPATH_APPLICATION_NAME);

      done();
    });
  });

  it('should load legacy api key from the environment', function (done) {
    setupFakeFs();

    afterIt.push(removeStormpathEnv());

    process.env.STORMPATH_API_KEY_ID = uuid();
    process.env.STORMPATH_API_KEY_SECRET = uuid();

    loader.load(function (err, config) {
      assert.isFalse(!!err);

      assert.isTrue(!!config);
      assert.isTrue(!!config.apiKey);
      assert.isTrue(!!config.client);
      assert.isTrue(!!config.client.apiKey);

      assert.equal(config.apiKey.id, process.env.STORMPATH_API_KEY_ID);
      assert.equal(config.apiKey.secret, process.env.STORMPATH_API_KEY_SECRET);
      assert.equal(config.client.apiKey.id, process.env.STORMPATH_API_KEY_ID);
      assert.equal(config.client.apiKey.secret, process.env.STORMPATH_API_KEY_SECRET);

      done();
    });
  });

  it('should load legacy api key from user provided config', function (done) {
    afterIt.push(removeStormpathEnv());

    setupFakeFs();

    var customConfig = {
      apiKey: {
        id: uuid(),
        secret: uuid()
      }
    };

    var loader = configLoader(customConfig);

    loader.load(function (err, config) {
      assert.isNull(err);

      assert.isTrue(!!config);
      assert.isTrue(!!config.apiKey);
      assert.isTrue(!!config.client);
      assert.isTrue(!!config.client.apiKey);

      assert.equal(config.apiKey.id, customConfig.apiKey.id);
      assert.equal(config.apiKey.secret, customConfig.apiKey.secret);
      assert.equal(config.client.apiKey.id, customConfig.apiKey.id);
      assert.equal(config.client.apiKey.secret, customConfig.apiKey.secret);

      done();
    });
  });

  function testLoadStormpathConfig(ext, serializeFn) {
    describe('should load stormpath.' + ext + ' config', function () {
      it('from stormpath home folder', function (done) {
        afterIt.push(removeStormpathEnv());

        var homeConfig = {
          client: {
            apiKey: {
              id: uuid(),
              secret: uuid()
            }
          }
        };

        setupFakeFs([{
          path: expandHomeDir('~/.stormpath/stormpath.' + ext),
          content: serializeFn(homeConfig)
        }]);

        loader.load(function (err, config) {
          assert.isNull(err);

          assert.isTrue(!!config);
          assert.isTrue(!!config.client);
          assert.isTrue(!!config.client.apiKey);

          assert.equal(config.client.apiKey.id, homeConfig.client.apiKey.id);
          assert.equal(config.client.apiKey.secret, homeConfig.client.apiKey.secret);

          done();
        });
      });

      it('from application directory while overriding home folder', function (done) {
        afterIt.push(removeStormpathEnv());

        var homeConfig = {
          client: {
            apiKey: {
              id: uuid(),
              secret: uuid()
            }
          }
        };

        var appConfig = {
          client: {
            apiKey: {
              secret: uuid()
            }
          },
          application: {
            href: 'http://api.stormpath.com/v1/applications/' + uuid()
          }
        };

        setupFakeFs([{
          path: expandHomeDir('~/.stormpath/stormpath.' + ext),
          content: serializeFn(homeConfig)
        }, {
          path: process.cwd() + '/stormpath.' + ext,
          content: serializeFn(appConfig)
        }]);

        loader.load(function (err, config) {
          assert.isNull(err);

          assert.isTrue(!!config);
          assert.isTrue(!!config.client);
          assert.isTrue(!!config.application);
          assert.isTrue(!!config.client.apiKey);

          assert.equal(config.client.apiKey.id, homeConfig.client.apiKey.id);
          assert.equal(config.client.apiKey.secret, appConfig.client.apiKey.secret);
          assert.equal(config.application.href, appConfig.application.href);

          done();
        });
      });
    });
  }

  testLoadStormpathConfig('yml', yaml.dump);
  testLoadStormpathConfig('json', JSON.stringify);

  it('should load config from file before environment', function (done) {
    afterIt.push(removeStormpathEnv());

    process.env.STORMPATH_CLIENT_APIKEY_ID = uuid();
    process.env.STORMPATH_CLIENT_APIKEY_SECRET = uuid();
    process.env.STORMPATH_APPLICATION_HREF = 'http://api.stormpath.com/v1/applications/' + uuid();

    var homeConfig = {
      client: {
        apiKey: {
          id: uuid(),
          secret: uuid()
        }
      }
    };

    var appConfig = {
      client: {
        apiKey: {
          secret: uuid()
        }
      },
      application: {
        href: 'http://api.stormpath.com/v1/applications/' + uuid()
      }
    };

    setupFakeFs([{
      path: expandHomeDir('~/.stormpath/stormpath.json'),
      content: JSON.stringify(homeConfig)
    }, {
      path: process.cwd() + '/stormpath.json',
      content: JSON.stringify(appConfig)
    }]);

    loader.load(function (err, config) {
      assert.isNull(err);

      assert.isTrue(!!config);
      assert.isTrue(!!config.client);
      assert.isTrue(!!config.application);
      assert.isTrue(!!config.client.apiKey);

      assert.equal(config.client.apiKey.id, process.env.STORMPATH_CLIENT_APIKEY_ID);
      assert.equal(config.client.apiKey.secret, process.env.STORMPATH_CLIENT_APIKEY_SECRET);
      assert.equal(config.application.href, process.env.STORMPATH_APPLICATION_HREF);

      done();
    });
  });

  it('should extend config with custom config object', function (done) {
    afterIt.push(removeStormpathEnv());

    setupFakeFs();

    var customConfig = {
      client: {
        apiKey: {
          id: uuid(),
          secret: uuid()
        }
      }
    };

    var loader = configLoader(customConfig);

    loader.load(function (err, config) {
      assert.isNull(err);

      assert.isTrue(!!config);
      assert.isTrue(!!config.client);
      assert.isTrue(!!config.client.apiKey);

      assert.equal(config.client.apiKey.id, customConfig.client.apiKey.id);
      assert.equal(config.client.apiKey.secret, customConfig.client.apiKey.secret);

      done();
    });
  });
});
