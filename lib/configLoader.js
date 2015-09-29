var path = require('path');

var stormpathConfig = require('stormpath-config');
var strategy = stormpathConfig.strategy;

// Set the paths the we want to load configuration files from
var currentPath = process.cwd();
var stormpathPath = '~/.stormpath';

// Create a default client config loader.

module.exports = function (client, extendWithConfig) {
  var strategies = [
    // Start by loading our default (hard-coded) configuration.
    new strategy.LoadFileConfigStrategy(path.join(__dirname, '/config.yml'), true),

    // Load our configuration from the environment
    new strategy.LoadEnvConfigStrategy('STORMPATH'),

    // Load configuration from stormpath JSON/YAML files
    new strategy.LoadFileConfigStrategy(stormpathPath + '/stormpath.json'),
    new strategy.LoadFileConfigStrategy(currentPath + '/stormpath.json'),
    new strategy.LoadFileConfigStrategy(stormpathPath + '/stormpath.yml'),
    new strategy.LoadFileConfigStrategy(currentPath + '/stormpath.yml'),

    // Load API keys from a Stormpath .properties files
    new strategy.LoadAPIKeyConfigStrategy(stormpathPath + '/apiKey.properties'),
    new strategy.LoadAPIKeyConfigStrategy(currentPath + '/apiKey.properties'),

    // Extend our configuration with the configuration we passed into the client.
    new strategy.ExtendConfigStrategy(extendWithConfig || {}),

    // Try and load our API key if it was specified in our config.
    new strategy.LoadAPIKeyFromConfigStrategy(),
    new strategy.EnrichClientConfigStrategy(),

    // Validate!
    new strategy.ValidateClientConfigStrategy()
  ];

  // Connect to Stormpath and enrich our config with
  //data from our application.
  if (client) {
    strategies.push(new strategy.EnrichClientFromRemoteConfigStrategy(client));
  }

  return new stormpathConfig.Loader(strategies);
};