'use strict';

var stormpath = require('../lib/stormpath.js');
require('chai').should();

describe('stormpath', function() {
  it('should return awesome', function() {
    stormpath.awesome().should.equal('awesome');
  });
});

