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
 * @class
 *
 * @private
 *
 * @description
 *
 * An HTTP request abstraction.  The DataStore uses this to make HTTP requests.
 *
 * @param {Object} options Construction options
 * @param {String} [options.baseUrl=https://api.stormpath.com/v1]
 * @param {BasicRequestAuthenticator|Sauthc1RequestAuthenticator} options.requestAuthenticator
 * @param {Object} [options.headers] A map of headers to apply to all requets.
 */
function RequestExecutor(options) {

  options = options || {};

  this.baseUrl = options.org.replace(/\/$/,'') + '/api/v1/';

  this.requestAuthenticator = authc.getAuthenticator(options);

  options.headers = options.headers || {};
  options.json = true;

  this.options = options;
}
utils.inherits(RequestExecutor, Object);

/**
 * Executes an HTTP request based on the request object passed in. Request object properties:
 * @param {Object} request
 * @param {String} request.uri a fully qualified URL, e.g. `https://api.stormpath.com/v1/tenants/current`.
 * @param {String} [request.method=GET] E.g. 'GET', 'PUT', 'POST', or 'DELETE'
 * @param {Object} [request.query] JSON object to convert to a query string.
 * @param {Object} [request.body] JSON object to use as the request body.
 * @param {Function} callback The callback to invoke when the request returns.
 * Called with (networkErr, resourceResponseBody).
 */
RequestExecutor.prototype.execute = function executeRequest(req, callback) {
  if (!callback) {
    throw new Error('Argument \'callback\' required. Unable to execute request.');
  }

  if (!req) {
    return callback(new Error('Request argument is required.'));
  }

  if (!req.uri) {
    return callback(new Error('request.uri field is required.'));
  }

  // Don't override the defaults: ensure that the options arg is request-specific.
  var options = utils.shallowCopy(this.options, {});

  var parsedUrl = url.parse(req.uri.replace(options.baseUrl,''));

  req.method = req.method || 'GET';

  options.method = req.method;
  options.baseUrl = parsedUrl.path === parsedUrl.href ? this.baseUrl : '';
  options.uri = parsedUrl.path === parsedUrl.href ? parsedUrl.path : parsedUrl.href;
  options.headers['User-Agent'] = options.userAgent ? options.userAgent + ' ' + USER_AGENT_VALUE : USER_AGENT_VALUE;

  if (req.query) {
    options.qs = req.query;
  }

  if (req.body && req.body.form){
    options.form = req.body.form;
  } else if (req.body) {
    options.body = req.body;
    delete options.body.href;
    options.json = true; // All Stormpath resources are JSON
  }

  this.requestAuthenticator.authenticate(options);

  request(options, function onRequestResult(err, response, body) {
    var responseContext = this;

    if (err) {
      var wrapper = new Error('Unable to execute http request ' + req.method + ' ' + req.uri + ': ' + err.message);
      wrapper.inner = err;
      return callback(wrapper, null);
    }

    if (response.statusCode > 399) {
      if (body) {
        body.status = response.statusCode;
      }
      return callback(new ResourceError(body || {status:response.statusCode}, {url: responseContext.href, method: req.method}), null);
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
