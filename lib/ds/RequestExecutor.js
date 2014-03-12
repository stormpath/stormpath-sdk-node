'use strict';

var request = require('request');

var _ = require('../underscore');
var utils = require('../utils');
var authc = require('../authc');
var packageJson = require('../../package.json');
var ResourceError = require('../error/ResourceError');

var BASE_URL = 'https://api.stormpath.com/v1';
var USER_AGENT_VALUE = 'Stormpath-NodeSDK/' + packageJson.version;

function qualify(uri) {
  if (!uri || _(uri).startsWith('http')) {
    return uri;
  }

  if (_(uri).startsWith('/')) {
    return BASE_URL + uri;
  }

  return BASE_URL + '/' + uri;
}

function RequestExecutor(options) {

  options = options || {};

  this.requestAuthenticator = authc.getAuthenticator(options);

  options.headers = options.headers || {};
  options.headers['User-Agent'] = USER_AGENT_VALUE;
  options.json = true;

  this.options = options;
}
utils.inherits(RequestExecutor, Object);

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
  options.uri = qualify(req.uri);
  if (req.query) {
    options.qs = req.query;
  }
  if (req.body) {
    options.body = req.body;
    options.json = true; //all Stormpath resources are JSON
  }

  this.requestAuthenticator.authenticate(options);

  request(options, function onRequestResult(err, response, body) {
    if (err) {
      var wrapper = new Error('Unable to execute http request ' + req + ': ' + err.message);
      callback(wrapper, null);
    } else {
      if (response.statusCode > 399) {
        callback(new ResourceError(body), null);
      } else {
        callback(null, body);
      }
    }
  });
};

module.exports = RequestExecutor;