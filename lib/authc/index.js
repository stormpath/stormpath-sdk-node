'use strict';

var OktaRequestAuthenticator = require('./okta-request-authenticator');

/**
 * @private
 *
 * @description
 *
 * A factory function that inspects any options and returns an appropriate {@link OktaRequestAuthenticator} to use to
 * authenticate requests submitted to the API server.
 *
 * @param {object} options
 * @param {string} options.okta.apiToken - An API token for your Okta Org.
 * @returns {OktaRequestAuthenticator}
 */
function getAuthenticator(options) {

  if (options.requestAuthenticator) {
    return options.requestAuthenticator;
  }

  var apiToken = options.apiToken;

  if (!apiToken) {
    throw new Error('If you do not specify a \'requestAuthenticator\' field, you must specify an ApiKey.');
  }

  return new OktaRequestAuthenticator(apiToken);
}

module.exports = {
  ApiKey: require('./ApiKey'),
  loadApiKey: require('./ApiKeyLoader'),
  getAuthenticator: getAuthenticator
};
