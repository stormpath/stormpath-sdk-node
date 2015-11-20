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
        return path.basename(callerfile).replace('.js', '');
      }
    }
  } catch (err) {
  }

  Error.prepareStackTrace = originalPrepareStackTrace;

  return 'unknown';
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

module.exports = {
  getDefaultAccountStore: getDefaultAccountStore,
  createApplication: createApplication,
  getClient: getClient,
  uniqId: uniqId,
  fakeAccount: fakeAccount,
  fakeDirectory: fakeDirectory
};
