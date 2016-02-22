'use strict';

var os = require('os');
var url = require('url');

var request = require('request');

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

  // Don't override the defaults: ensure that the options arg is request-specific.
  var options = utils.shallowCopy(this.options, {});

  req.method = req.method || 'GET';

  options.method = req.method;
  options.baseUrl = this.baseUrl;
  options.uri = url.parse(req.uri.replace(options.baseUrl,'')).path;
  options.headers['User-Agent'] = options.userAgent ? options.userAgent + ' ' + USER_AGENT_VALUE : USER_AGENT_VALUE;

  if (req.query) {
    options.qs = req.query;
  }

  if (req.body && req.body.form){
    options.form = req.body.form;
  } else if (req.body) {
    options.body = req.body;
    options.json = true; // All Stormpath resources are JSON
  }

  this.requestAuthenticator.authenticate(options);

  request(options, function onRequestResult(err, response, body) {
    if (err) {
      var wrapper = new Error('Unable to execute http request ' + req.method + ' ' + req.uri + ': ' + err.message);
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
