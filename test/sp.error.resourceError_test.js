var ResourceError = require('../lib/error/ResourceError');

describe('Error:', function () {
  describe('Resource Error', function () {
    var response = {
      status: 400,
      code: 100500,
      message: 'hi user',
      developerMessage: 'hi dev',
      moreInfo: 'boom!'
    };
    var re = new ResourceError(response);

    it('should inherit from error', function () {
      re.should.be.an.instanceof(Error);
    });

    it('should dispose response fields', function () {
      re.name.should.match(/ResourceError/i);
      re.status.should.be.equal(response.status);
      re.code.should.be.equal(response.code);
      re.userMessage.should.be.equal(response.message);
      re.developerMessage.should.be.equal(response.developerMessage);
      re.moreInfo.should.be.equal(response.moreInfo);
    });
  });
});
