var fs = require('fs');
var yaml = require('js-yaml');
var expandHomeDir = require('expand-home-dir');

var FakeFS = require('fake-fs');

var common = require('./common');
var assert = common.assert;

var configLoader = require('../lib/configLoader');

describe('Configuration loader', function () {
  var loader;
  var fakeFs;
  var restoreEnv;
  var dummyApiKey;

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

  beforeEach(function () {
    setupFakeFs();

    dummyApiKey = {
      id: '2d61b041-5c03-4c17-9e67-7e3c58f38f10',
      secret: 'ed1e3c35-f01e-4f23-9bc6-bafa1baa0346'
    };

    restoreEnv = removeStormpathEnv();
    loader = configLoader();
  });

  afterEach(function () {
    restoreEnv();

    if (fakeFs) {
      fakeFs.unpatch();
    }
  });

  it('should error when not providing api key', function (done) {
    loader.load(function (err, config) {
      assert.isUndefined(config);

      assert.isNotNull(err);
      assert.equal(err.message, 'API key ID and secret is required.');

      done();
    });
  });

  it('should load api key from apikey config in root', function (done) {
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
    loader = configLoader({
      apiKey: dummyApiKey
    });

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
    process.env.STORMPATH_CLIENT_APIKEY_ID = '0f6f34ce-6718-4e1b-afdd-ec5ea6d48373';
    process.env.STORMPATH_CLIENT_APIKEY_SECRET = 'c40948e7-f07b-4b19-95bc-b9c545f8b7ff';
    process.env.STORMPATH_APPLICATION_HREF = 'http://api.stormpath.com/v1/applications/12ae87cc-66bf-4d8c-bde9-f516a752e4b4';
    process.env.STORMPATH_APPLICATION_NAME = 'c13a6743-48ee-4bc5-b82e-d26d31a7130f';

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
    process.env.STORMPATH_API_KEY_ID = '85a1b6c7-1411-44a1-83c0-e66c638d683c';
    process.env.STORMPATH_API_KEY_SECRET = '2b35a567-bc7c-43e3-9007-3742e1fffef5';

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
    var customConfig = {
      apiKey: {
        id: 'ea585cca-fbb4-475f-9c3f-10e9ba4eea91',
        secret: 'a71fbecf-7b5f-4660-a32f-3352a263a8c0'
      }
    };

    loader = configLoader(customConfig);

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
        var homeConfig = {
          client: {
            apiKey: {
              id: 'ed143b1b-ad8a-412e-8d1b-ea81c61be9d2',
              secret: '4607cb74-5141-40ee-8b07-9d395af6260b'
            }
          }
        };

        setupFakeFs([{
          path: '~/.stormpath/stormpath.' + ext,
          content: serializeFn(homeConfig)
        }, {
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
        var homeConfig = {
          client: {
            apiKey: {
              id: '3dc18568-8b2d-4cff-bca3-786636321495',
              secret: '8b795484-81f8-44f6-9883-72a4b1f4ef05'
            }
          }
        };

        var appConfig = {
          client: {
            apiKey: {
              secret: '58ad0a31-0aad-4ad9-ba0d-559526d72667'
            }
          },
          application: {
            href: 'http://api.stormpath.com/v1/applications/9418738b-a6d5-4671-90a4-58d4898c1617'
          }
        };

        setupFakeFs([{
          path: '~/.stormpath/stormpath.' + ext,
          content: serializeFn(homeConfig)
        }, {
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
    process.env.STORMPATH_CLIENT_APIKEY_ID = '617937ab-60fe-45cf-a92c-dfcf3fc5e581';
    process.env.STORMPATH_CLIENT_APIKEY_SECRET = '91472ae6-35bf-4ad1-af9a-622538b94449';
    process.env.STORMPATH_APPLICATION_HREF = 'http://api.stormpath.com/v1/applications/079ed9bc-d88e-472e-94e2-ce3180764ceb';

    var homeConfig = {
      client: {
        apiKey: {
          id: 'bb115611-f9f7-489f-bb27-3cfd91b789ab',
          secret: 'f154875d-5be7-4bf4-904e-06062a96cc7a'
        }
      }
    };

    var appConfig = {
      client: {
        apiKey: {
          secret: 'c0eca1bc-b3bc-44da-bf0c-06a4285458f9'
        }
      },
      application: {
        href: 'http://api.stormpath.com/v1/applications/38ae8185-d77c-4959-94d3-276573040e8e'
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
    var customConfig = {
      client: {
        apiKey: {
          id: '94bc6b02-09b7-4fc2-9932-c1b04855c474',
          secret: '346eb157-2119-4978-b2af-4396cc5dfd20'
        }
      }
    };

    loader = configLoader(customConfig);

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
