'use strict';

var assert = require('assert');

var Config = require('../../lib/Config');

describe('Config', function() {
  describe('()', function() {
    it('should work with no options supplied', function(done) {
      var config = new Config();
      assert(config instanceof Config);
      done();
    });

    it('should not require the $HOME environment variable to be set', function(done) {
      var home = process.env.HOME;

      if (home) {
        delete process.env.HOME;
      }

      var config = new Config();
      assert(config instanceof Config);

      process.env.HOME = home;
      done();
    });
  });
});
