var path = require('path');
var moment = require('moment');

var pkg = require('../../package.json');
var common = require('../common');

var uuid = common.uuid;
var stormpath = common.Stormpath;

var loadedClient = null;
var hasCleanupRun = false;
var testRunId = uuid.v4().split('-')[0];

function getClient(cb) {
  if (loadedClient) {
    return cb(loadedClient);
  }

  var client = new stormpath.Client();

  client.on('error', function (err) {
    throw err;
  });

  client.on('ready', function () {
    loadedClient = client;
    cb(client);
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

/**
 * Get the friendly (printable) name of the calling file.
 *
 * @function
 *
 * @returns string - The name of the calling file.
 */
function getFriendlyCallerName() {
  var friendlyName = 'unknown';
  var err = new Error();
  var originalPrepareStackTrace = Error.prepareStackTrace;

  Error.prepareStackTrace = function (err, stack) {
    return stack;
  };

  try {
    var currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      var callerfile = err.stack.shift().getFileName();

      if(currentfile !== callerfile) {
        friendlyName = path.basename(callerfile).replace('.js', '');
        break;
      }
    }
  } catch (err) {
  }

  Error.prepareStackTrace = originalPrepareStackTrace;

  return friendlyName;
}

/**
 * Deletes Stormpath applications that have are older than 5 minutes.
 *
 * @function
 *
 * @param {Function} callback - A callback to run when done.
 */
function cleanupOldApplications(callback) {
  var fiveMinutesAgo = moment().subtract(5, 'minutes');
  getClient(function (client) {
    client.getApplications(function (err, applications) {
      applications.each(function (application, next) {
        if (application.name.indexOf(pkg.name + ':') === 0 && moment(application.createdAt).isBefore(fiveMinutesAgo)) {
          application.delete(next);
        } else {
          next();
        }
      }, callback);
    });
  });
}

/**
 * Deletes an application and any account stores that are mapped to it
 * @param  {Application} application A stormpath application object
 * @param  {Function} callback
 */
function cleanupApplicationAndStores(application, callback) {
  application.getAccountStoreMappings(function (err, mappings) {
    if(err){
      return callback(err);
    }
    mappings.each(function(mapping, next){
      mapping.getAccountStore(function(err, store){
        if(err){
          return next(err);
        }
        store.delete(next);
      });
    },function(err){
      if(err){
        return callback(err);
      }
      application.delete(callback);
    });
  });
}

/**
 * Create a new Stormpath Application for usage in tests.
 *
 * @function
 *
 * @param {Function} callback - A callback to run when done.
 */
function createApplication(callback) {
  if (hasCleanupRun) {
    var appData = { name: pkg.name + ':' + getFriendlyCallerName() + ':' + testRunId + ':' + uuid.v4() };
    var opts = { createDirectory: true };

    getClient(function(client){
      client.createApplication(appData, opts, callback);
    });
  } else {
    cleanupOldApplications(function () {
      hasCleanupRun = true;
      createApplication(callback);
    });
  }
}

/**
 * Create a new Stormpath Directory for usage in tests.
 *
 * @function
 *
 * @param {Object} options - Options for the Stormpath directory to create.
 * @param {Function} callback - A callback to run when done.
 */
function createDirectory(options, callback) {
  if (!options) {
    options = {};
  }

  if (!options.name) {
    options.name = pkg.name + ':' + getFriendlyCallerName() + ':' + testRunId + ':' + uuid.v4();
  }

  getClient(function (client) {
    client.createDirectory(options, callback);
  });
}

function fakeDirectory(){
  return {
    name: uniqId()
  };
}

/**
 * Fetches the default account store for a given application
 *
 * @function
 *
 * @param {Object} application - Stormpath Application Object
 * @param {Function} callback - A callback to run when done.
 */
function getDefaultAccountStore(application,done){
  application.getDefaultAccountStore(function(err,accountStoreMapping){
    if(err){
      done(err);
    }else{
      accountStoreMapping.getAccountStore(done);
    }
  });
}

/**
 * Creates a Stormpath JWT from an application and account.
 *
 * @function
 *
 * @param {Application} application - Stormpath Application to authenticate with.
 * @param {Account} account - Stormpath account to authenticate with.
 *
 * @returns string - The serialized Stormpath JWT.
 */
function createStormpathToken(application, account, apiKey) {
  if (!apiKey) {
    apiKey = application.dataStore.requestExecutor.options.client.apiKey;
  }

  var payload = {
    sub: account.href,
    iat: new Date().getTime() / 1000,
    iss: application.href,
    status: 'AUTHENTICATED',
    aud: apiKey.id
  };

  var token = common.jwt.create(payload, apiKey.secret, 'HS256');

  return token.compact();
}

module.exports = {
  getDefaultAccountStore: getDefaultAccountStore,
  cleanupApplicationAndStores: cleanupApplicationAndStores,
  createApplication: createApplication,
  createDirectory: createDirectory,
  createStormpathToken: createStormpathToken,
  getClient: getClient,
  uniqId: uniqId,
  fakeAccount: fakeAccount,
  fakeDirectory: fakeDirectory
};
