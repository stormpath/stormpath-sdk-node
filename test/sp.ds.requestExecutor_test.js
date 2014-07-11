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
    var apiKey = {id: 1, secret: 2};

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
        var reqExec = new RequestExecutor({apiKey: apiKey});
        it('should instantiate request authenticator', function () {
          reqExec.requestAuthenticator.should.be.ok;
        });
        it('should store options', function () {
          reqExec.options.apiKey.should.be.equal(apiKey);
        });
        it('should set headers user agent as stormpath-sdk', function () {
          reqExec.options.headers['User-Agent'].should
            .match(/stormpath-sdk-node/i);
        });
      });

    });
    describe('call to execute', function () {
      var reqExec = new RequestExecutor({apiKey: apiKey});

      function exec(req, cb) {
        return function () {
          reqExec.execute(req, cb);
        };
      }

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
        var uri = 'https://api.stormpath.com/v1/test';
        var res = {test: 'boom'};
        nock(uri).get('/v1/test').reply(400, res);
        function cb(err, body) {
          err.should.be.an.instanceof(ResourceError);
          expect(body).to.be.null;
          cbSpy.should.have.been.calledOnce;
          done();
        }
        cbSpy = sinon.spy(cb);

        reqExec.execute({uri: uri, method:'GET'}, cbSpy);
      });

      it('should include the original request error in case of request error', function (done) {
        var cbSpy;
        // This triggers one of the possible http request errors
        var uri = 'http://doesntexist/v1/test';

        function cb(err, body) {
          err.should.be.an.instanceof(Error);
          err.should.have.property('inner')
            .that.is.an.instanceof(Error)
            .and.property('code', 'ENOTFOUND');
          expect(body).to.be.null;
          cbSpy.should.have.been.calledOnce;
          done();
        }
        cbSpy = sinon.spy(cb);

        reqExec.execute({uri: uri, method:'GET'}, cbSpy);
      });
    });

  });
});
