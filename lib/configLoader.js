var path = require('path');

var Client = require('./Client');
var stormpathConfig = require('stormpath-config');
var strategy = stormpathConfig.strategy;

// Set the paths the we want to load configuration files from
var currentPath = process.cwd();
var stormpathPath = '~/.stormpath';

// Factory method to create a client using a configuration only.
// The configuration provided to this factory is the final configuration.
function ClientFactory (config) {
  return new Client(
    new stormpathConfig.Loader([
      new strategy.ExtendConfigStrategy(config)
    ])
  );
}

// Create a default client config loader.
module.exports = function (extendWithConfig) {
  return new stormpathConfig.Loader([
    // Load default configuration.
    new strategy.LoadFileConfigStrategy(path.join(__dirname, '/config.yml'), true),

    // Load API keys and configuration from home (.stormpath) folder
    new strategy.LoadAPIKeyConfigStrategy(stormpathPath + '/apiKey.properties'),
    new strategy.LoadFileConfigStrategy(stormpathPath + '/stormpath.json'),
    new strategy.LoadFileConfigStrategy(stormpathPath + '/stormpath.yml'),

    // Load API keys and configuration from app folder
    new strategy.LoadAPIKeyConfigStrategy(currentPath + '/apiKey.properties'),
    new strategy.LoadFileConfigStrategy(currentPath + '/stormpath.json'),
    new strategy.LoadFileConfigStrategy(currentPath + '/stormpath.yml'),

    // Load configuration from our environment.
    new strategy.LoadEnvConfigStrategy('STORMPATH', {
      // Aliases used to support legacy API key.
      STORMPATH_APIKEY_ID: 'STORMPATH_API_KEY_ID',
      STORMPATH_APIKEY_SECRET: 'STORMPATH_API_KEY_SECRET',
      STORMPATH_APIKEY_FILE: 'STORMPATH_API_KEY_FILE'
    }),

    // Extend our configuration with the configuration we passed into the client.
    // Also, try and load our API key if it was specified in our config.
    new strategy.ExtendConfigStrategy(extendWithConfig),
    new strategy.LoadAPIKeyFromConfigStrategy(),

    // Enrich our client config.
    new strategy.EnrichClientConfigStrategy(),

    // Validate config so that we know that we have an API key and can continue...
    new strategy.ValidateClientConfigStrategy(),

    // Enrich our config with application data from the Stormpath API.
    new strategy.EnrichClientFromRemoteConfigStrategy(ClientFactory)
  ]);
};
