'use strict';

module.exports = {
  ApiKey: require('./authc/ApiKey'),
  loadApiKey: require('./authc/ApiKeyLoader'),
  Client: require('./Client'),
  Tenant: require('./resource/Tenant')
};