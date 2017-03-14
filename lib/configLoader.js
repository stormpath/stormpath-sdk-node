var path = require('path');

var stormpathConfig = require('stormpath-config');
var strategy = stormpathConfig.strategy;

// Set the paths the we want to load configuration files from
var currentPath = process.cwd();
var stormpathPath = '~/.stormpath';

// Create a default client config loader.
module.exports = function (extendWithConfig) {
  return new stormpathConfig.Loader([
    // Load default configuration.
    new strategy.LoadFileConfigStrategy(path.join(__dirname, '/config.yml'), true),

    // Load configuration from home (.stormpath) folder
    new strategy.LoadFileConfigStrategy(stormpathPath + '/stormpath.json'),
    new strategy.LoadFileConfigStrategy(stormpathPath + '/stormpath.yml'),

    // Load configuration from app folder
    new strategy.LoadFileConfigStrategy(currentPath + '/stormpath.json'),
    new strategy.LoadFileConfigStrategy(currentPath + '/stormpath.yml'),

    // Load configuration from our environment.
    new strategy.LoadEnvConfigStrategy('OKTA'),

    // Extend our configuration with the configuration we passed into the client.
    // Also, try and load our API key if it was specified in our config.
    new strategy.ExtendConfigStrategy(extendWithConfig),

    // Validate config so that we know that we have an API key and can continue...
    new strategy.ValidateClientConfigStrategy()

  ]);
};
