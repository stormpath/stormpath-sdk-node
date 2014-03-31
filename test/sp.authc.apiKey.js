/* jshint -W030 */
'use strict';

var ApiKey = require('../lib/authc/ApiKey');

describe('authc', function () {
  describe('ApiKey class', function(){
    var id = 'id';
    var secret = 'boom!';

    var apiKey = new ApiKey(id, secret);

    it('should expose id and secret as fields', function(){
      apiKey.id.should.be.equal(id);
      apiKey.secret.should.be.equal(secret);
    });
    it('should hide secret', function(){
      apiKey.toString().should.contain(id);
      apiKey.toString().should.not.contain(secret);
    });
  });
});