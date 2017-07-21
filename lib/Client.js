'use strict';

var async = require('async');
var events = require('events');

var utils = require('./utils');
var DataStore = require('./ds/DataStore');
var FactorInstantiator = require('./resource/FactorInstantiator');
var FactorInstanceCtor = FactorInstantiator.Constructor;
var InvalidHrefError = require('./error/invalid-href');
var ObjectCallProxy = require('./proxy/ObjectCallProxy');

/**
 * @typedef {Object} CacheOptions
 *
 * @type {Object}
 *
 * @description
 *
 * Instances of {@link Client} will cache Stormpath resources in your local
 * server, and this object allows you to configure the behavior of that cache.
 * Pass this object to the {@link Client} constructor as `clientOptions.cacheOptions`.
 * Examples are below the options table.
 *
 * @property {Object|String|Array} [connection]
 * If you are allowing this library to create a Redis or Memcached client for you
 * (you are specifying `store` but not providing a `client`), then use this option to
 * provide the database connection information to the relevant library.
 *
 * - For Memcached, this can be any format supported by
 *   [Memcached Sever Locations](https://github.com/3rd-Eden/memcached#server-locations).
 *
 * - For Redis, provide an object with the host and port options.
 *
 * @property {String} [connection.host=localhost]
 *
 * @property {Number} [connection.port=11211 | 6379]
 *
 * @property {Number} [tti=300]
 * (Seconds) The idle time of a cached resource. If it is not accessed within this time,
 * it will be purged.
 *
 * @property {Number} [ttl=300]
 * (Seconds) The max age of a cached resource. The resource will be purged after this time.
 *
 * @property {Object} [client]
 * An existing Redis or Memcached client instance. If not provided, one will
 * be created for you when you specify the `store` property.
 *
 * @property {Object} [options]
 * If you are allowing this library to create a Redis
 * or Memcached client for you (you are specifying `store` but not providing
 * a `client`), then use this option to pass options to the relevant client
 * constructor. For more information please see the documentation of those
 * libraries:
 *
 * - [Memcached options](https://github.com/3rd-Eden/memcached)
 * - [Node-Redis options](https://github.com/NodeRedis/node_redis)
 *
 * @property {String} [store]
 * The type of cache store to use, can be `redis` or `memcached`. If not specified,
 * an in-memory cache will be used for the duration of the Node process.
 *
 * @example <caption>Allow Stormpath to create a default Redis client for you:</caption>
 * var client = new stormpath.Client({
 *   cacheOptions: {
 *     store: 'redis'
 *   }
 * });
 *
 * @example <caption>Specify the connection information for the default client:</caption>
 * var client = new stormpath.Client({
 *   cacheOptions: {
 *     store: 'redis',
 *     connection: {
 *       host: 'localhost',
 *       port: 7777
 *     }
 *   }
 * });
 *
 * @example <caption>Provide your own Redis client:</caption>
 * var redisClient = redis.createClient();
 *
 * var client = new stormpath.Client({
 *   cacheOptions: {
 *     store: 'redis',
 *     client: redisClient
 *   }
 * });
 */

/**
 * @typedef {Object} ClientOptions
 *
 * @type {Object}
 *
 * @description
 * This object allows you to configure the behavior of the {@link Client} and is
 * provided when creating a new {@link Client}.
 *
 * @property {Object} [apiKey]
 * An API Key Pair for your Tenant, see
 * [Create an API Key Pair](https://docs.stormpath.com/rest/product-guide/latest/quickstart.html#create-an-api-key-pair).
 *
 * @property {String} apiKey.id
 * The ID of the Tenant API Key Pair
 *
 * @property {String} apiKey.secret
 * The Secret of the Tenant API Key Pair
 *
 * @property {String} [baseUrl]
 * The base URL for the Stormpath REST API. Enterprise Cloud customers should specify `https://enterprise.stormpath.io/v1`.
 * Private deployments should use their custom base URL.
 *
 * @property {CacheOptions} [cacheOptions]
 * Cache configuration, see {@link CacheOptions}.
 *
 * @property {Object} [nonceStore]
 * If you are using the [ID Site Feature](https://docs.stormpath.com/rest/product-guide/latest/idsite.html)
 * in your Stormpath implementation, the calls to {@link Application#createIdSiteUrl
 * Application.createIdSiteUrl()} and {@link Application#handleIdSiteCallback
 * Application.handleIdSiteCallback()}
 * will make use of a nonce value to prevent replay attacks. By default these
 * nonces will be stored in a cache region in the client's data store.
 *
 * You may use your own Nonce Store by providing an interface object that we can
 * use to communicate with it. The object should be passed as this `nonceStore`
 * value, and it should have these two methods:
 *
 * - `getNonce(nonceStringValue,callback)` - It will search your nonce store for
 *   the nonce value and then call the callback with with the (err,value) pattern,
 *   where err indicates a problem with the store and value is the found nonce or null.
 * - `putNonce(nonceStringValue,callback)` - It should place the nonce value in
 *   your nonce store and then call the callback with (err) where err is a store
 *   error or null.
 */

/**
 * @class
 *
 * @description
 *
 * A client is used to retrieve and update resources in the Stormpath REST API,
 * and is required before working with any functions of this library. To create
 * a client, you must provide an API Key Pair that has been provisioned for your
 * Tenant. To learn about provisioning these keys, please read
 * [Create an API Key Pair](https://docs.stormpath.com/rest/product-guide/latest/quickstart.html#create-an-api-key-pair).
 *
 * Once you have your API Key Pair, you need to supply the ID and Secret values
 * to the client constructor. This can be done one of three ways:
 *
 * - By passing them into the client constructor as the `clientOptions.apiKey`
 *   value.
 *
 * - By placing them in a `stormpath.yml` file, in the current working directory.
 *
 * - By providing these environment variables:
 *
 *  - `STORMPATH_CLIENT_API_KEY_ID`
 *  - `STORMPATH_CLIENT_API_KEY_SECRET`
 *
 * Each of these strategies is shown by example below. The API Key pair is just
 * one of several options in the {@link ClientOptions} object.
 *
 * @param {ClientOptions} [clientOptions]
 * An optional configuration object for configuring the client.
 *
 * @example <caption>If API Key Pair is available as environment variables, or stormpath.yml:</caption>
 *
 * // Assumes API keys are in environment variables, or stormpath.yaml
 *
 * var stormpath = require('stormpath');
 * var client = new stormpath.Client();
 *
 * @example <caption>If placing the API Key Pair in stormpath.yml, the file contents should look like this:</caption>
 * {@lang yaml}
 * client:
 *   apiKey:
 *     id: YOUR_API_KEY_ID
 *     secret: YOUR_API_KEY_SECRET
 *
 * @example <caption>If you want to pass the API Key Pair directly as configuration:</caption>
 *
 * var stormpath = require('stormpath');
 *
 * var client = new stormpath.Client({
 *   apiKey: {
 *     id: 'YOUR_API_KEY_ID',
 *     secret: 'YOUR_API_KEY_SECRET'
 *   }
 * });
 */

function Client(config) {
  var self = this;

  // Call the constructor of the EventEmitter class -- this, allows us to
  // initialize our Client object as an EventEmitter, and allows us to fire off
  // events later on.
  events.EventEmitter.call(self);

  // We'll maintain this class variable as an in-memory singleton for caching
  // purposes. We do this because Tenants never ever change once a Client has
  // been initialized, so it makes sense to cache the Tenant object so we don't
  // make unnecessary API requests if this object is looked up more than once.
  self._currentTenant = null;

  // Indicates whether or not this client is ready yet.
  self._isReady = false;

  // Setup how we load our configuration.
  var configLoader = null;

  // If the config is a config loader, then use that.
  if (utils.isConfigLoader(config)) {
    configLoader = config;
  // Just use our default client config loader.
  } else {
    configLoader = require('./configLoader')(config);
  }

  // Setup our call proxy.
  var awaitReadyProxy = new ObjectCallProxy(self);

  // Attach our proxy so that all calls to our client is
  // intercepted and queued until the client is ready.
  awaitReadyProxy.attach(function(name) {
    // Only proxy methods that start with either 'get' or 'create'.
    return name.indexOf('get') === 0 || name.indexOf('create') === 0;
  });

  // Load our configuration.
  process.nextTick(function() {
    configLoader.load(function(err, loadedConfig) {
      if (err) {
        self.emit('error', err);
        awaitReadyProxy.detach(new Error('Stormpath client initialization failed. See error log for more details.'));
      } else {
        self.config = loadedConfig;
        self._dataStore = new DataStore(loadedConfig);
        self._isReady = true;
        awaitReadyProxy.detach();

        /**
         * Back-compat.  We've changed the expected environment variable prefix to OKTA, but
         * we still want to pull in this secret value, to allow verification of tokens that
         * were already signed by the previous SDK version.
         */
        if (process.env.STORMPATH_CLIENT_APIKEY_SECRET && !self.config.client.apiKey.secret) {
          self.config.client.apiKey.secret = process.env.STORMPATH_CLIENT_APIKEY_SECRET;
        }

        self.emit('ready', self);
      }
    });
  });
}

// By inheriting from `events.EventEmitter`, we're making our Client object a
// true EventEmitter -- allowing us to fire off events.
utils.inherits(Client, Object);
utils.inherits(Client, events.EventEmitter);

/**
 * Adds an event listener to the given event. The only supported event is
 * `ready`, which is broadcast when the client has finished asynchronous
 * construction (fetching preliminary resources such as the current {@link Tenant}).
 *
 * No checks are made to see if the listener has already been added.
 * Multiple calls passing the same combination of event and listener will result in the listener being added multiple times.
 *
 * @param {String} event
 * Name of event to listen on.
 *
 * @param {Function} listener
 * Function to call when event is emitted.
 */
Client.prototype.on = function() {
  var args = Array.prototype.slice.call(arguments);

  // If we're running late to the party and the client has already
  // emitted the ready event, then run the callback directly.
  if (args.length === 2 && args[0] === 'ready' && typeof args[1] === 'function') {
    var callback = args[1];
    if (this._isReady) {
      callback(this);
      return this;
    }
  }

  return events.EventEmitter.prototype.on.apply(this, args);
};


/**
 * Retrieves a {@link AccessToken} resource.
 *
 * @param {String} href
 * The href of the {@link AccessToken}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link AccessToken} during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link AccessToken}).
 *
 * @example
 * var href = "https://api.stormpath.com/v1/accessTokens/3s7TiFXrobbQ0RU1Kb0IM5";
 *
 * client.getAccessToken(href, function (err, accessToken) {
 *   console.log(accessToken);
 * });
 */
Client.prototype.getAccessToken = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  if (!utils.isValidHref(args.href, '/accessTokens/')) {
    return args.callback(new InvalidHrefError(args.href, 'Access Token'));
  }

  return this.getResource(args.href, args.options, require('./resource/AccessToken'), args.callback);
};

Client.prototype.getApiKeyById = function() {
  var args = utils.resolveArgs(arguments, ['id', 'options', 'callback']);

  var href = this.config.client.baseUrl + '/apiKeys/' + args.id;

  return this.getResource(href, args.options, require('./resource/ApiKey'), args.callback);
};

/**
 * Retrieves a {@link RefreshToken} resource.
 *
 * @param {String} href
 * The href of the {@link RefreshToken}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link RefreshToken} during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link RefreshToken}).
 *
 * @example
 * var href = "https://api.stormpath.com/v1/refreshTokens/25hgO2ZiuJHze14GzDtzof";
 *
 * client.getAccessToken(href, function (err, refreshToken) {
 *   console.log(refreshToken);
 * });
 */
Client.prototype.getRefreshToken = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  if (!utils.isValidHref(args.href, '/refreshTokens/')) {
    return args.callback(new InvalidHrefError(args.href, 'Refresh Token'));
  }

  return this.getResource(args.href, args.options, require('./resource/RefreshToken'), args.callback);
};

/**
 * Get the {@link Tenant} resource of the currently authenticated tenant, as
 * identified by the API Key pair that was passed to the client constructor.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Tenant} resources during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Tenant}).
 */
Client.prototype.getCurrentTenant = function() {
  var self = this;

  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  var Tenant = require('./resource/Tenant');

  return args.callback(null, new Tenant({
    href: this.config.org,
    _links: {
      users: {
        href: '/users'
      },
      groups: {
        href: '/groups'
      }
    }
  }, self._dataStore));

};

/**
 * @private
 *
 * @callback getResourceCallback
 *
 * @param {Error} err
 * The error (if there is one).
 *
 * @param {Object} resource
 * The retrieved resource object.
 */

/**
 * Retrieves a resource object by href.
 *
 * @private
 *
 * @param {String} href
 * The URI of the resource.
 *
 * @param {Object} [query]
 * Key/value pairs to use as query parameters.
 *
 * @param {Function} [constructor]
 * The constructor function that will be invoked when the given resource
 * is retrieved. E.g. Account, Directory, Group, etc. Defaults to `InstanceResource`.
 * If a resource returned from the API is a collection (not a single resource object),
 * then each returned object in the `items` array will be passed into this constructor
 * function and initialized.
 *
 * @param {getResourceCallback} callback
 * The callback that handles the response.
 */
Client.prototype.getResource = function() {
  return this._dataStore.getResource.apply(this._dataStore, arguments);
};

/**
 * @private
 *
 * @callback createResourceCallback
 *
 * @param {Error} err
 * The error (if there is one).
 *
 * @param {Object} resource
 * The created resource object.
 */

/**
 * Creates a new resource object as a child of the specified parentHref
 * location. The parameter `parentHref` must be a collection resource endpoint.
 * This is a utility method we use internally to handle resource creation.
 *
 * @private
 *
 * @param {String} parentHref
 * The URI of the parent's collection resource.
 *
 * @param {Object} query
 * Key/value pairs to use as query parameters.
 *
 * @param {Function} constructor
 * The constructor function that will be invoked when the given resource is
 * retrieved. E.g. Account, Directory, Group, etc. Defaults to `InstanceResource`.
 * If a resource returned from the API is a collection (not a single resource object),
 * then each returned object in the `items` array will be passed into this
 * constructor function and initialized.
 *
 * @param {createResourceCallback} callback
 * The callback that handles the response.
 */
Client.prototype.createResource = function() {
  this._dataStore.createResource.apply(this._dataStore, arguments);
};

/**
 * Retrieves all the {@link Application} resources in the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Application} objects.
 *
 * @example
 * client.getApplications(function (err, applicationCollection) {
 *   applicationCollection.each(function (application, next) {
 *     console.log(application);
 *     next();
 *   });
 * });
 */
Client.prototype.getApplications = function() {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this._dataStore.getResource('/apps', args.options, require('./resource/Application'), args.callback);
};

/**
 * Creates a new User resource in the current Okta org.
 * For back-compat reasons, this will be coerced into an Account type.
 *
 * @param {Object} user
 * The {@link User} resource to create.
 *
 * @param {Object} [requestOptions]
 * Query parameters for this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link User}).
 *
 * @example <caption>Create a new application.</caption>
 * var user = {
 *   credentials: {},
 *   profile: {}
 * }
 *
 * client.createUser(user, function (err, account) {
 *   console.log(account);
 * });
 */
Client.prototype.createUser = function() {
  var args = utils.resolveArgs(arguments, ['user', 'options', 'callback']);

  this._dataStore.createResource('/users', args.options, args.user, require('./resource/Account'), function(err, account) {
    if (err) {
      return args.callback(err);
    }
    account.transformOktaUser();
    args.callback(null, account);
  });
};


/**
 * Creates a new Application resource in the current {@link Tenant}.
 *
 * @param {Object} application
 * The {@link Application} resource to create.
 *
 * @param {Object} [requestOptions]
 * Query parameters for this request. These can be any of the {@link ExpansionOptions},
 * e.g. to retrieve linked resources of the {@link Application} during this request, or one
 * of the other options listed below.
 *
 * @param {Boolean|String} [requestOptions.createDirectory]
 * Set this to `true` to have a a new {@link Directory} automatically created along with the Application.
 * The generated Directory’s name will reflect the new Application’s name as best as is possible,
 * guaranteeing that it is unique compared to any of your existing Directories. If you would like
 * a different name, simply put the value you would like instead of `true`.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Application}).
 *
 * @example <caption>Create a new application.</caption>
 * var newApplication = {
 *   name: 'Todo Application'
 * }
 *
 * client.createApplication(newApplication, function (err, application) {
 *   console.log(application);
 * });
 *
 * @example <caption>Create a new application and new directory at the same time.</caption>
 *
 * var newApplication = {
 *   name: 'Todo Application'
 * };
 *
 * var options = {
 *   createDirectory: 'Primary Accounts'
 * };
 *
 * client.createApplication(newApplication, options, function(err, application) {
 *   console.log(err, application);
 * });
 */
Client.prototype.createApplication = function() {
  var args = utils.resolveArgs(arguments, ['app', 'options', 'callback']);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.createApplication(args.app, args.options, args.callback);
  });
};

/**
 * Create multiple Application resources in the current {@link Tenant} with one SDK call.
 *
 * @param {Object[]} applications
 * An array of Application objects to create.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * Options to expand linked resources on the returned {@link Application} resources.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, applications), where `applications` is an array
 * of {@link Application} objects.
 *
 * @example
 * var newApplications = [
 *   {
 *     name: 'Todo Application'
 *   },
 *   {
 *     name: 'Notes Application'
 *   }
 * ]
 *
 * client.createApplications(newApplications, function (err, applications) {
 *   console.log(applications);
 * });
 */
Client.prototype.createApplications = function() {
  var args = utils.resolveArgs(arguments, ['apps', 'options', 'callback']);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    async.map(args.apps, function(app, cb) {
      return tenant.createApplication(app, args.options, cb);
    }, function(err, applications) {
      return args.callback(err, applications);
    });
  });
};

/**
 * Retrieves all the {@link Account} resources in the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Account} objects.
 *
 * @example
 * client.getAccounts(function (err, accountsCollection) {
 *   accountsCollection.each(function (account, next) {
 *     console.log(account);
 *     next();
 *   });
 * });
 */
Client.prototype.getAccounts = function() {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.getAccounts(args.options, args.callback);
  });
};

/**
 * Retrieves all the {@link Group} resources in the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Group} objects.
 *
 * @example
 * client.getGroups(function (err, groupsCollection) {
 *   groupsCollection.each(function (group, next) {
 *     console.log(group);
 *     next();
 *   });
 * });
 */
Client.prototype.getGroups = function() {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.getGroups(args.options, args.callback);
  });
};

/**
 * Retrieves all the {@link Directory} resources in the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Directory} objects.
 *
 * @example
 * client.getDirectories(function (err, directoryCollection) {
 *   directoryCollection.each(function (directory, next) {
 *     console.log(directory);
 *     next();
 *   });
 * });
 */
Client.prototype.getDirectories = function() {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.getDirectories(args.options, args.callback);
  });
};

/**
 * Creates a new {@link Directory} resource in the current {@link Tenant}. After
 * creating a directory, you will likely want to map it to an {@link Application} using
 * {@link Application#createAccountStoreMapping Application.createAccountStoreMapping()}.
 *
 * Directories can be linked to social providers - such as Facebook, Google, Twitter, or
 * even any other generic OAuth 2.0 provider - by specifing a valid provider containing
 * the valid `providerId` and client credentials when creating or modifying the directory.
 * See {@link Provider}.
 *
 * @param {Object} directory
 * The {@link Directory} resource to create.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * Options to expand linked resources on the returned {@link Directory}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Directory}).
 *
 * @example
 * // Creating a simple directory
 * var newDirectory = {
 *   name: 'Customers'
 * }
 *
 * client.createDirectory(newDirectory, function (err, directory) {
 *   console.log(directory);
 * });
 *
 * // Creating a social provider directory (e.g. Twitter)
 * var twitterDirectory = {
 *   name: 'Twitter Users',
 *   provider: {
 *     providerId: 'twitter',
 *     clientId: 'my-twitter-client-id',
 *     clientSecret: 'my-twitter-client-secret'
 *   }
 * };
 *
 * client.createDirectory(twitterDirectory, function (err, directory) {
 *   console.log(directory);
 * });
 */
Client.prototype.createDirectory = function() {
  var args = utils.resolveArgs(arguments, ['dir', 'options', 'callback']);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.createDirectory(args.dir, args.options, args.callback);
  });
};

/**
 * Create multiple {@link Directory} resources in the current {@link Tenant} with one SDK call.
 *
 * @param {Object[]} directories
 * An array of {@link Directory} objects to create.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * Options to expand linked resources on the returned {@link Directory} resources.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, directories), where `directories` is an array
 * of {@link Directory} objects.
 *
 * @example
 * var newDirectories = [
 *   {
 *     name: 'Administrators'
 *   },
 *   {
 *     name: 'Customers'
 *   }
 * ]
 *
 * client.createDirectories(newDirectories, function (err, directories) {
 *   console.log(directories);
 * });
 */
Client.prototype.createDirectories = function() {
  var args = utils.resolveArgs(arguments, ['dirs', 'options', 'callback']);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    async.map(args.dirs, function(dir, cb) {
      return tenant.createDirectory(dir, args.options, cb);
    }, function(err, directories) {
      return args.callback(err, directories);
    });
  });
};

/**
 * Creates a new {@link Organization} resource in the current {@link Tenant}.
 * After creating a organization, you will likely want to map it to an {@link Application} using
 * {@link Application#createAccountStoreMapping Application.createAccountStoreMapping()}.
 *
 * @param {Object} organization
 * The {@link Organization} resource to create.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * Options to expand linked resources on the returned {@link Organization}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Organization}).
 *
 * @example
 * var newOrganization = {
 *   name: 'Metal Works, Inc.'
 * }
 *
 * client.createOrganization(newOrganization, function (err, organization) {
 *   console.log(organization);
 * });
 */
Client.prototype.createOrganization = function createOrganization() {
  var args = utils.resolveArgs(arguments, ['data', 'options', 'callback']);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.createOrganization(args.data, args.options, args.callback);
  });
};

/**
 * Creates a new SMTP server resource in the current {@link Tenant}.
 *
 * @param {Object} server
 * The {@link SmtpServer} resource to create.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * Options to expand linked resources on the returned {@link SmtpServer}.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link SmtpServer}).
 *
 * @example
 * var newSmtpServer = {
 *   name: 'My SMTP Server',
 *   username: 'server username',
 *   password: 'server password',
 *   host: 'email.example.com',
 *   securityProtocol: 'TLS',
 *   port: 25
 * };
 *
 * client.createSmtpServer(newSmtpServer, function (err, smtpServer) {
 *   console.log(smtpServer);
 * });
 */
Client.prototype.createSmtpServer = function createSmtpServer() {
  var args = utils.resolveArgs(arguments, ['server', 'options', 'callback']);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.createSmtpServer(args.server, args.options, args.callback);
  });
};

/**
 * Retrieves a {@link Account} resource.
 *
 * @param {String} href
 * The href of the {@link Account}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Account} during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Account}).
 *
 * @example
 *
 * var href = "https://api.stormpath.com/v1/accounts/4WCCtc0oCRDzQdAHVQTqjz";
 *
 * client.getAccount(href, function (err, account) {
 *   console.log(account);
 * });
 */
Client.prototype.getAccount = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  return this.getResource(args.href, args.options, require('./resource/Account'), function(err, account) {
    if (err) {
      return args.callback(err);
    }
    account.transformOktaUser();
    args.callback(null, account);
  });
};

/**
 * Retrieves a {@link Application} resource.
 *
 * @param {String} href
 * The href of the {@link Application}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Application} during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Application}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/applications/FOahc5HvwvfuAS03Yk2h1';
 *
 * client.getApplication(href, function (err, application) {
 *   console.log(application);
 * });
 */
Client.prototype.getApplication = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  return this.getResource(args.href, args.options, require('./resource/Application'), args.callback);
};

/**
 * Retrieves a {@link Challenge} resource.
 *
 * @param {String} href
 * The href of the {@link Challenge}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Challenge} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Challenge}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/challenges/3nSC0LiyyPnewafzBzZOaL';
 *
 * client.getChallenge(href, function (err, challenge) {
 *   console.log(challenge);
 * });
 */
Client.prototype.getChallenge = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/Challenge'), args.callback);
};

/**
 * Retrieves a {@link Directory} resource.
 *
 * @param {String} href
 * The href of the {@link Directory}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Directory} during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Directory}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/directories/1h72PFWoGxHKhysKjYIkir';
 *
 * client.getDirectory(href, function (err, directory) {
 *   console.log(directory);
 * });
 */
Client.prototype.getDirectory = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  if (!utils.isValidHref(args.href, '/directories/')) {
    return args.callback(new InvalidHrefError(args.href, 'Directory'));
  }

  return this.getResource(args.href, args.options, require('./resource/Directory'), args.callback);
};

/**
 * Retrieves a {@link Factor} resource.
 *
 * @param {String} href
 * The href of the {@link Factor}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Factor} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Factor}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/groups/3OEoLpN7csNUJ5J4hajWgX';
 *
 * client.getFactor(href, function (err, factor) {
 *   console.log(factor);
 * });
 */
Client.prototype.getFactor = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, FactorInstanceCtor, args.callback);
};

/**
 * Retrieves a {@link Group} resource.
 *
 * @param {String} href
 * The href of the {@link Group}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Group} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Group}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/groups/3OEoLpN7csNUJ5J4hajWgX';
 *
 * client.getGroup(href, function (err, group) {
 *   console.log(group);
 * });
 */
Client.prototype.getGroup = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  if (!utils.isValidHref(args.href, '/groups/')) {
    return args.callback(new InvalidHrefError(args.href, 'Group'));
  }

  return this.getResource(args.href, args.options, require('./resource/Group'), args.callback);
};

/**
 * Retrieves a {@link GroupMembership} resource.
 *
 * @param {String} href
 * The href of the {@link GroupMembership}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link GroupMembership} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link GroupMembership}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/groupMemberships/5gtaYz1b8CJ0erODEUlm8l';
 *
 * client.getGroup(href, function (err, groupMembership) {
 *   console.log(groupMembership);
 * });
 */
Client.prototype.getGroupMembership = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  if (!utils.isValidHref(args.href, '/groupMemberships/')) {
    return args.callback(new InvalidHrefError(args.href, 'Group Membership'));
  }

  return this.getResource(args.href, args.options, require('./resource/GroupMembership'), args.callback);
};

/**
 * Retrieves a {@link Organization} resource.
 *
 * @param {String} href The href of the {@link Organization}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Organization} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Organization}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/organizations/3UOCEVEzR8uVRkhGdGP0A5';
 *
 * client.getOrganization(href, function (err, organization) {
 *   console.log(organization);
 * });
 */
Client.prototype.getOrganization = function getOrganization() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);

  if (!utils.isValidHref(args.href, '/organizations/')) {
    return args.callback(new InvalidHrefError(args.href, 'Organization'));
  }

  return this.getResource(args.href, args.options, require('./resource/Organization'), args.callback);
};

/**
 * Retrieves all the {@link Organization} resources in the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Organization} objects.
 *
 * @example
 * client.getOrganizations(function (err, organizationCollection) {
 *   organizationCollection.each(function (organization, next) {
 *     console.log(organization);
 *     next();
 *   });
 * });
 */
Client.prototype.getOrganizations = function getOrganizations(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getCurrentTenant(function onGetCurrentTenantForGroups(err, tenant) {
    if (err) {
      return args.callback(err, null);
    }
    return tenant.getOrganizations(args.options, args.callback);
  });
};

/**
 * Retrieves a {@link Phone} resource.
 *
 * @param {String} href
 * The href of the {@link Phone}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Phone} during this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Phone}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/phones/l0z3tFiTksNZrGlV9PjB2';
 *
 * client.getPhone(href, function (err, phone) {
 *   console.log(phone);
 * });
 */
Client.prototype.getPhone = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/Phone'), args.callback);
};

/**
 * Retrieves all the {@link IdSiteModel} resources for the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link IdSiteModel} objects.
 *
 * @example
 * client.getIdSites(function (err, idSiteModels) {
 *   idSiteModels.each(function (idSiteModel, next) {
 *     console.log(idSiteModel);
 *     next();
 *   })
 * });
 */
Client.prototype.getIdSites = function getIdSites(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getCurrentTenant(function onGetCurrentTenant(err, tenant) {
    if (err) {
      return args.callback(err, null);
    }

    return tenant.getIdSites(args.options, args.callback);
  });
};

/**
 * Retrieves a {@link SmtpServer} resource.
 *
 * @param {String} href
 * The href of the {@link SmtpServer}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link SmtpServer} during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link SmtpServer}).
 *
 * @example
 *
 * var href = "https://api.stormpath.com/v1/smtpServers/4WCCtc0oCRDzQdAHVQTqjz";
 *
 * client.getSmtpServer(href, function (err, smtpServer) {
 *   console.log(smtpServer);
 * });
 */
Client.prototype.getSmtpServer = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/SmtpServer'), args.callback);
};

/**
 * Retrieves all the {@link SmtpServer} resources for the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link IdSiteModel} objects.
 *
 * @example
 * client.getSmtpServers(function (err, smtpServers) {
 *   smtpServers.each(function (smtpServer, next) {
 *     console.log(smtpServer);
 *     next();
 *   })
 * });
 */
Client.prototype.getSmtpServers = function getSmtpServers(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getCurrentTenant(function onGetCurrentTenant(err, tenant) {
    if (err) {
      return args.callback(err, null);
    }

    return tenant.getSmtpServers(args.options, args.callback);
  });
};

module.exports = Client;
