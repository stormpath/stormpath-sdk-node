'use strict';

var Client = require('./Client');

function createClient(config) {
  return new Client(config);
}

module.exports = {
  createClient: createClient,
  ApiKey: require('./apikey').ApiKey,
  loadApiKey: require('./apikey').loadApiKey,
  Client: Client,
  Tenant: require('./tenant')
};