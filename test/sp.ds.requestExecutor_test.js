/* jshint -W030 */
'use strict';

var common = require('./common');
var expect = common.expect;
var sinon = common.sinon;
var nock = require('nock');

var RequestExecutor = require('../lib/ds/RequestExecutor');
var ResourceError = require('../lib/error/ResourceError');

describe('ds:', function () {
  describe('RequestExecutor:', function () {
    var apiKey;

    this.timeout(10 * 1000);

    before(function () {
      apiKey = {id: 1, secret: 2};
    });

    describe('constructor', function () {
      describe('create without options', function () {
        function create() {
          return new RequestExecutor();
        }

        it('should throw error', function () {
          create.should
            .throw(/If you do not specify a 'requestAuthenticator' field, you must specify an ApiKey/i);
        });
      });
      describe('create with required options', function () {
        var reqExec;

        before(function () {
          reqExec = new RequestExecutor({client: {apiKey: apiKey}});
        });

        it('should instantiate request authenticator', function () {
          reqExec.requestAuthenticator.should.be.ok;
        });
        it('should store options', function () {
          reqExec.options.client.apiKey.should.be.equal(apiKey);
        });
        it('should set headers user agent as stormpath-sdk', function () {
          reqExec.options.headers['User-Agent'].should
            .match(/stormpath-sdk-node/i);
        });
      });

    });
    describe('call to execute', function () {
      var reqExec;

      function exec(req, cb) {
        return function () {
          reqExec.execute(req, cb);
        };
      }

      before(function () {
        reqExec = new RequestExecutor({client: {apiKey: apiKey} });
      });

      it('should throw if called without req', function () {
        exec().should.throw(/Request argument is required/i);
      });

      it('should throw if called without req.uri', function () {
        exec({}).should.throw(/request.uri field is required/i);
      });

      it('should return response', function (done) {
        var cbSpy;
        var uri = 'http://example.com';
        var res = {test: 'boom'};
        nock(uri).get('/').reply(200, res);
        function cb(err, body) {
          expect(err).to.be.null;
          body.should.be.deep.equal(res);
          cbSpy.should.have.been.calledOnce;
          done();
        }
        cbSpy = sinon.spy(cb);

        reqExec.execute({uri: uri}, cbSpy);
      });

      it('should return resource error in case of incorrect request', function (done) {
        var cbSpy;
        var host = 'https://api.stormpath.com';
        var uri = host + '/v1/test';
        var res = {test: 'boom'};
        nock(host).get('/v1/test').reply(400, res);
        function cb(err, body) {
          err.should.be.an.instanceof(ResourceError);
          expect(body).to.be.null;
          cbSpy.should.have.been.calledOnce;
          done();
        }
        cbSpy = sinon.spy(cb);

        reqExec.execute({uri: uri, method:'GET'}, cbSpy);
      });

      describe('in case of request error', function () {
        var uri;
        var method;
        var error;
        var body;

        function executeRequest(done) {
          var cbSpy = sinon.spy(function () {
            error = arguments[0];
            body = arguments[1];
            done();
          });

          reqExec.execute({uri: uri, method: method}, cbSpy);
        }

        beforeEach(function () {
          // This triggers one of the possible http request errors
          uri = 'http://doesntexist/v1/test';
        });

        describe('when request method is GET', function () {
          beforeEach(function (done) {
            method = 'GET';
            executeRequest(done);
          });

          describe('body', function () {
            it('should be null', function () {
              expect(body).to.be.null;
            });
          });

          describe('error', function () {
            it('should be an instance of Error', function () {
              error.should.be.an.instanceof(Error);
            });

            describe('stack property', function () {
              it('should not be empty/null/undefined', function () {
                error.should.have.property('stack')
                  .that.is.not.empty.and
                  .that.is.not.null.and
                  .that.is.not.undefined;
              });
            });

            describe('inner property', function () {
              it('should be an instance of Error', function () {
                error.should.have.property('inner')
                  .that.is.an.instanceof(Error);
              });

              it('should have the "code" property set to "ENOTFOUND"', function () {
                error.inner.should.have.property('code', 'ENOTFOUND');
              });
            });

            describe('message property', function () {
              it('should include request method', function () {
                error.should.have.property('message');
                error.message.should.include(method);
              });

              it('should include request uri', function () {
                error.message.should.include(uri);
              });

              it('should include error.inner.code', function () {
                error.message.should.include(error.inner.code);
              });
            });
          });
        });

        describe('when request method is undefined', function () {
          beforeEach(function (done) {
            method = undefined;
            executeRequest(done);
          });

          describe('error', function () {
            describe('message property', function () {
              it('should include request method as "GET"', function () {
                error.should.have.property('message');
                error.message.should.include('GET');
              });
            });
          });
        });
      });
    });
  });
});
