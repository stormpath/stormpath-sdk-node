'use strict';

var async = require('async');
var events = require('events');

var utils = require('./utils');
var DataStore = require('./ds/DataStore');
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
 * @property {Object|String|Array} [connection] If you are allowing this library to create a
 * Redis or Memcached client for you (you are specifying `store` but not providing
 * a `client`), then use this option to provide the database connection
 * information to the relevant library.
 *
 * - For Memcached, this can be any format supported by
 *   [Memcached Sever Locations](https://github.com/3rd-Eden/memcached#server-locations).
 * - For Redis, provide an object with the host and port options.
 *
 * @property {String} [connection.host=localhost]
 *
 * @property {Number} [connection.port=11211 | 6379]
 *
 * @property {Number} [tti=300] (Seconds) The idle time of a cached resource. If
 * it is not accessed within this time, it will be purged.
 *
 * @property {Number} [ttl=300] (Seconds) The max age of a cached resource. The
 * resource will be purged after this time.
 *
 * @property {Object} [client]
 *
 * An existing Redis or Memcached client instance.  If not provided, one will
 * be created for you when you specify the `store` property.
 *
 * @property {Object} [options] If you are allowing this library to create a Redis
 * or Memcached client for you (you are specifying `store` but not providing
 * a `client`), then use this option to pass options to the relevant client
 * constructor.  For more information please see the documentation of those
 * libraries:
 *
 * - [Memcached options](https://github.com/3rd-Eden/memcached)
 * - [Node-Redis options](https://github.com/NodeRedis/node_redis)
 *
 * @property {String} [store] The type of cache store to use, can be `redis` or
 * `memcached`.  If not specified, an in-memory cache will be used for the
 * duration of the Node process.
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
 *
 */


/**
 * @typedef {Object} ClientOptions
 *
 * @type {Object}
 *
 * @description
 *
 * This object allows you to configure the behavior of the {@link Client} and is
 * provided when creating a new {@link Client}.
 *
 * @property {Object} [apiKey] An API Key Pair for your Tenant, see
 * [Create an API Key Pair](https://docs.stormpath.com/rest/product-guide/latest/quickstart.html#create-an-api-key-pair).
 *
 * @property {String} apiKey.id The ID of the Tenant API Key Pair
 *
 * @property {String} apiKey.secret The Secret of the Tenant API Key Pair
 *
 * @property {String} [baseUrl] The base URL for the Stormpath REST API.
 * Enterprise Cloud customers should specify `https://enterprise.stormpath.io/v1`.
 * Private deployments should use their custom base URL.
 *
 * @property {CacheOptions} [cacheOptions] Cache configuration, see {@link
 * CacheOptions}.
 *
 * @property {Object} [nonceStore]
 *
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
 * A client is used to retrieve and update resources in the Stormpath API and is
 * required before working with any other parts of this library.  To create a
 * client, you must provide an API Key Pair that has been provisioned for
 * your Tenant.  To learn about provisioning these keys, please read
 * [Create an API Key Pair](https://docs.stormpath.com/rest/product-guide/latest/quickstart.html#create-an-api-key-pair).
 *
 * Once you have your API Key Pair, you need to supply the ID and Secret values
 * to the client constructor.  This can be done one of three ways:
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
 * Each of these strategies is shown by example below.  The API Key pair is just
 * one of several options in the {@link ClientOptions} object.
 *
 * @param {ClientOptions} [clientOptions]
 *
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
  awaitReadyProxy.attach(function (name) {
    // Only proxy methods that start with either 'get' or 'create'.
    return name.indexOf('get') === 0 || name.indexOf('create') === 0;
  });

  // Load our configuration.
  process.nextTick(function () {
    configLoader.load(function (err, loadedConfig) {
      if (err) {
        self.emit('error', err);
        awaitReadyProxy.detach(new Error('Stormpath client initialization failed. See error log for more details.'));
      } else {
        self.config = loadedConfig;
        self._dataStore = new DataStore(loadedConfig);
        self._isReady = true;
        awaitReadyProxy.detach();
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
 * @callback onListenerCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The retrieved resource object.
 */

/**
 * Adds a listener to the end of the listeners array for the specified event.
 * No checks are made to see if the listener has already been added.
 * Multiple calls passing the same combination of event and listener will result in the listener being added multiple times.
 *
 * @param string event - Name of event to listen on.
 * @param {onListenerCallback} listener - Function to call when event is emitted.
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
 * Retrieves an {@link AccessToken} resource.
 *
 * @param {String} href The href of the resource.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link AccessToken}).
 */
Client.prototype.getAccessToken = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/AccessToken'), args.callback);
};

/**
 * Retrieves an refresh token resource.
 *
 * @param {Object} [options] - Options.
 * @param {getRefreshTokenCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getRefreshToken = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/RefreshToken'), args.callback);
};

/**
 * Get the {@link Tenant} resource of the currently authenticated tenant.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Tenant}).
 */
Client.prototype.getCurrentTenant = function() {
  var self = this;

  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  // First, we'll check to see if we've already cached the current tenant (since
  // a Tenant never changes once a Client has been initialized). This prevents
  // us from making unnecessary repeat API requests if this method is called
  // multiple times.
  if (self._currentTenant) {
    return args.callback(null, self._currentTenant);
  }

  self._dataStore.getResource('/tenants/current', args.options, require('./resource/Tenant'), function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    self._currentTenant = tenant;

    return args.callback(null, tenant);
  });
};

/**
 * @private
 * @callback getResourceCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The retrieved resource object.
 */

/**
 * Retrieves a resource object by href.
 *
 * @private
 * @param {String} href - The URI of the resource.
 * @param {Object} [query] - Key/value pairs to use as query parameters.
 * @param {Function} [constructor] - The constructor function that will be
 *  invoked when the given resource is retrieved. E.g. Account, Directory,
 *  Group, etc. Defaults to `InstanceResource`. If a resource returned from
 *  the API is a collection (not a single resource object), then each returned
 *  object in the `items` array will be passed into this constructor function
 *  and initialized.
 * @param {getResourceCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getResource = function() {
  return this._dataStore.getResource.apply(this._dataStore, arguments);
};

/**
 * @private
 * @callback createResourceCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} resource - The created resource object.
 */

/**
 * Creates a new resource object as a child of the specified parentHref
 * location. The parameter `parentHref` must be a collection resource endpoint.
 * This is a utility method we use internally to handle resource creation.
 *
 * @private
 * @param {String} parentHref - The URI of the parent's collection resource.
 * @param {Object} query - Key/value pairs to use as query parameters.
 * @param {Function} constructor - The constructor function that will be
 *  invoked when the given resource is retrieved. E.g. Account, Directory,
 *  Group, etc. Defaults to `InstanceResource`. If a resource returned from
 *  the API is a collection (not a single resource object), then each returned
 *  object in the `items` array will be passed into this constructor function
 *  and initialized.
 * @param {createResourceCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.createResource = function() {
  this._dataStore.createResource.apply(this._dataStore, arguments);
};

/**
 * @callback getApplicationsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} applications - The retrieved Application objects.
 */

/**
 * Retrieves all Application objects.
 *
 * @param {Object} [options] - Options.
 * @param {getApplicationsCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getApplications = function() {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  this.getCurrentTenant(function(err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.getApplications(args.options, args.callback);
  });
};

/**
 * @callback createApplicationCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} application - The created Application object.
 */

/**
 * Creates a new Application object.
 *
 * @param {Object} application - The Application object to create.
 * @param {Object} [options] - Options.
 * @param {createApplicationCallback} callback - The callback that handles the
 * response.
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
 * @callback createApplicationsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object[]} applications - An array of created Application objects.
 */

/**
 * Creates multiple new Application objects.
 *
 * @param {Object[]} applications - An array of Application objects to create.
 * @param {Object} [options] - Options.
 * @param {createApplicationsCallback} callback - The callback that handles the
 *  response.
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
 * @callback getAccountsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directories - The retrieved Account objects.
 */

/**
 * Retrieves all Account objects.
 *
 * @param {Object} [options] - Options.
 * @param {getAccountsCallback} callback - The callback that handles the
 *  response.
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
 * @callback getGroupsCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} groups - The retrieved Group objects.
 */

/**
 * Retrieves all Group objects.
 *
 * @param {Object} [options] - Options.
 * @param {getGroupsCallback} callback - The callback that handles the
 *  response.
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
 * @callback getDirectoriesCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directories - The retrieved Directory objects.
 */

/**
 * Retrieves all Directory objects.
 *
 * @param {Object} [options] - Options.
 * @param {getDirectoriesCallback} callback - The callback that handles the
 *  response.
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
 * @callback createDirectoryCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directory - The created Directory object.
 */

/**
 * Creates a new Directory object.
 *
 * @param {Object} directory - The Directory object to create.
 * @param {Object} [options] - Options.
 * @param {createDirectoryCallback} callback - The callback that handles the
 *  response.
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
 * @callback createDirectoriesCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object[]} directories - An array of created Directory objects.
 */

/**
 * Creates multiple new Directory objects.
 *
 * @param {Object[]} directories - An array of Directory objects to create.
 * @param {Object} [options] - Options.
 * @param {createDirectoriesCallback} callback - The callback that handles the
 *  response.
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
 * Creates a new Organization object.
 *
 * @param {Object} organization - The Organization object to create.
 * @param {Object} [options] - Options.
 * @param {createOrganizationCallback} callback - The callback that handles the
 *  response.
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
 * @callback getAccountCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} account - The retrieved Account object.
 */

/**
 * Retrieves an Account object.
 *
 * @param {String} href - The Account href.
 * @param {Object} [options] - Options.
 * @param {getAccountCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getAccount = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/Account'), args.callback);
};

/**
 * @callback getApplicationCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} application - The retrieved Application object.
 */

/**
 * Retrieves an {@link Application} resource.
 *
 * @param {String} href The href of the resource.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Application}).
 */
Client.prototype.getApplication = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/Application'), args.callback);
};

/**
 * @callback getDirectoryCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} directory - The retrieved Directory object.
 */

/**
 * Retrieves a Directory object.
 *
 * @param {String} href - The Directory href.
 * @param {Object} [options] - Options.
 * @param {getDirectoryCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getDirectory = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/Directory'), args.callback);
};

/**
 * @callback getGroupCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} group - The retrieved Group object.
 */

/**
 * Retrieves a Group object.
 *
 * @param {String} href - The Group href.
 * @param {Object} [options] - Options.
 * @param {getGroupCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getGroup = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/Group'), args.callback);
};

/**
 * @callback getGroupMembershipCallback
 * @param {Error} err - The error (if there is one).
 * @param {Object} groupMembership - The retrieved GroupMembership object.
 */

/**
 * Retrieves a GroupMembership object.
 *
 * @param {String} href - The GroupMembership href.
 * @param {Object} [options] - Options.
 * @param {getGroupMembershipCallback} callback - The callback that handles the
 *  response.
 */
Client.prototype.getGroupMembership = function() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/GroupMembership'), args.callback);
};


/**
 * Retrieves an {@link Organization} resource.
 *
 * @param {String} href The href of the resource.
 *
 * @param {GetResourceOptions} [getResourceOptions]
 * Query options for the request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Organization}).
 */
Client.prototype.getOrganization = function getOrganization() {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  return this.getResource(args.href, args.options, require('./resource/Organization'), args.callback);
};

Client.prototype.getOrganizations = function getOrganizations(/* [options,] callback */) {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  return this.getCurrentTenant(function onGetCurrentTenantForGroups(err, tenant) {
    if (err) {
      return args.callback(err, null);
    }
    return tenant.getOrganizations(args.options, args.callback);
  });
};

module.exports = Client;
