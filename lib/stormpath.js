'use strict';

var Client = require('./Client');

function createClient(config) {
  return new Client(config);
}

module.exports = {
  createClient: createClient,
  ApiKey: require('./authc/ApiKey'),
  loadApiKey: require('./authc/ApiKeyLoader'),
  Client: Client,
  Tenant: require('./resource/Tenant')
};