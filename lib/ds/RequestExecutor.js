'use strict';

var os = require('os');

var request = require('request');

var _ = require('../underscore');
var ResourceError = require('../error/ResourceError');
var authc = require('../authc');
var packageJson = require('../../package.json');
var utils = require('../utils');

var USER_AGENT_VALUE = 'stormpath-sdk-node/' + packageJson.version + ' node/' + process.versions.node + ' ' + os.platform() + '/' + os.release();

/**
 *
 * @param {object} options
 * @constructor
 */
function RequestExecutor(options) {

  options = options || {};

  this.baseUrl = options.baseUrl || 'https://api.stormpath.com/v1';

  this.requestAuthenticator = authc.getAuthenticator(options);

  options.headers = options.headers || {};

  // Set the user agent appropriately.
  options.headers['User-Agent'] = options.userAgent ? options.userAgent + ' ' + USER_AGENT_VALUE : USER_AGENT_VALUE;
  options.json = true;

  this.options = options;
}
utils.inherits(RequestExecutor, Object);

RequestExecutor.prototype.qualify = function qualify(uri){
  if (!uri || _(uri).startsWith('http')) {
    return uri;
  }

  if (_(uri).startsWith('/')) {
    return this.baseUrl + uri;
  }

  return this.baseUrl + '/' + uri;
};

/**
 * Executes an HTTP request based on the request object passed in.  Request object properties:
 * <ul>
 *   <li>uri: a fully qualified URL.  For example, <code>https://api.stormpath.com/v1/tenants/current</code>. REQUIRED.</li>
 *   <li>method: a String, one of 'GET', 'PUT', 'POST', or 'DELETE' (case-insensitive). OPTIONAL (defaults to GET).</li>
 *   <li>query: a JSON object to convert to a query string. OPTIONAL.</li>
 *   <li>body: a JSON object to use as the request body. OPTIONAL.</li>
 * </ul>
 *
 *
 * @param req the request to execute
 * @param callback the callback to invoke when the request returns
 */
RequestExecutor.prototype.execute = function executeRequest(req, callback) {
  var self = this;
  if (!req) {
    throw new Error('Request argument is required.');
  }
  if (!req.uri) {
    throw new Error('request.uri field is required.');
  }

  //don't override the defaults: ensure that the options arg is request-specific:
  var options = utils.shallowCopy(this.options, {});

  if (req.method) { //defaults to GET
    options.method = req.method;
  }
  options.uri = self.qualify(req.uri);
  if (req.query) {
    options.qs = req.query;
  }
  if (req.body && req.body.form){
    options.form = req.body.form;
  }
  else if (req.body) {
    options.body = req.body;
    options.json = true; //all Stormpath resources are JSON
  }

  this.requestAuthenticator.authenticate(options);

  request(options, function onRequestResult(err, response, body) {
    if (err) {
      var wrapper = new Error('Unable to execute http request ' + req + ': ' + err.message);
      wrapper.inner = err;
      return callback(wrapper, null);
    }

    if (response.statusCode > 399) {
      return callback(new ResourceError(body || {status:response.statusCode}), null);
    }

    if (response.statusCode === 201){
      Object.defineProperty(body, '_isNew', { value: true });
    }

    if (response.statusCode === 202 && !body){
      callback(null, { accepted:true });
    }else{
      callback(null, body);
    }


  });
};

module.exports = RequestExecutor;
