'use strict';

var BasicRequestAuthenticator = require('./BasicRequestAuthenticator');
var Sauthc1RequestAuthenticator = require('./Sauthc1RequestAuthenticator');

/**
 * @private
 *
 * @description
 *
 * A factory function that inspects any options and returns an appropriate {@link RequestAuthenticator} to use to
 * authenticate requests submitted to the API server.
 *
 * @param {object} options
 * @param {Sauthc1RequestAuthenticator|BasicRequestAuthenticator=} options.requestAuthenticator
 * @param {string} options.authenticationScheme - name of auth method that will instantiated
 * @returns {BasicRequestAuthenticator|Sauthc1RequestAuthenticator}
 */
function getAuthenticator(options) {

  if (options.requestAuthenticator) {
    return options.requestAuthenticator;
  }

  var apiKey = options.client ? options.client.apiKey : options.apiKey;

  if (!apiKey) {
    throw new Error('If you do not specify a \'requestAuthenticator\' field, you must specify an ApiKey.');
  }

  var authc = new BasicRequestAuthenticator(apiKey); //default until Sauthc1 is working.

  if (options.authenticationScheme) {
    var scheme = options.authenticationScheme.toUpperCase();

    if (scheme === 'SAUTHC1') {
      authc = new Sauthc1RequestAuthenticator(apiKey);
    } else if (scheme === 'BASIC') {
      authc = new BasicRequestAuthenticator(apiKey);
    } else {
      throw new Error("Unrecognized authentication scheme: " + options.authenticationScheme);
    }
  }

  return authc;
}

module.exports = {
  ApiKey: require('./ApiKey'),
  loadApiKey: require('./ApiKeyLoader'),
  getAuthenticator: getAuthenticator
};
