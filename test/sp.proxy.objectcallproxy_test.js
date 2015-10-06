var common = require('./common');
var assert = common.assert;

var ObjectCallProxy = require('../lib/proxy/ObjectCallProxy');

function FooService() {
}

FooService.prototype.returnsImmediately = function () {
  return 'something';
};

FooService.prototype.returnsThroughCallback = function (callback) {
  process.nextTick(function () {
    callback(null, 'something');
  });
};

FooService.prototype.returnsSlowlyThroughCallback = function (callback) {
  setTimeout(function () {
    callback(null, 'something_slow');
  }, 1 * 1000);
};

describe('Object call proxy', function () {
  var proxy, fooService;

  before(function () {
    fooService = new FooService();
    proxy = new ObjectCallProxy(fooService);
  });

  it('should return method without callback immediately', function () {
    proxy.attach();
    assert.equal(fooService.returnsImmediately(), 'something');
    proxy.detach();
  });

  it('should when detached call proxy method with callback immediately', function (done) {
    var callbackResult = null;

    proxy.attach();

    fooService.returnsThroughCallback(function (err, result) {
      callbackResult = [err, result];
    });

    setTimeout(function () {
      assert.isNull(callbackResult);
      proxy.detach();
      setImmediate(function () {
        assert.isNotNull(callbackResult);
        assert.isNull(callbackResult[0]);
        assert.equal(callbackResult[1], 'something');
        done();
      });
    });
  });

  it('should when detached wait for slow callback to finish', function (done) {
    var callbackResult = null;

    proxy.attach();

    fooService.returnsSlowlyThroughCallback(function (err, result) {
      callbackResult = [err, result];
    });

    setTimeout(function () {
      assert.isNull(callbackResult);
      proxy.detach();
      setTimeout(function () {
        assert.isNotNull(callbackResult);
        assert.isNull(callbackResult[0]);
        assert.equal(callbackResult[1], 'something_slow');
        done();
      }, 1000);
    }, 25);
  });

  it('should be able to attach and detach all methods', function () {
    var original = {
      returnsImmediately: fooService.returnsImmediately,
      returnsThroughCallback: fooService.returnsThroughCallback,
      returnsSlowlyThroughCallback: fooService.returnsSlowlyThroughCallback,
    };

    proxy.attach();

    assert.notEqual(original.returnsImmediately, fooService.returnsImmediately);
    assert.notEqual(original.returnsThroughCallback, fooService.returnsThroughCallback);
    assert.notEqual(original.returnsSlowlyThroughCallback, fooService.returnsSlowlyThroughCallback);

    proxy.detach();

    assert.equal(original.returnsImmediately, fooService.returnsImmediately);
    assert.equal(original.returnsThroughCallback, fooService.returnsThroughCallback);
    assert.equal(original.returnsSlowlyThroughCallback, fooService.returnsSlowlyThroughCallback);
  });

  it('should be able to attach and detach single method', function () {
    var originalReturnsImmediately = fooService.returnsImmediately;
    var originalReturnsThroughCallback = fooService.returnsThroughCallback;

    proxy.attach(function (name) {
      return name === 'returnsImmediately';
    });

    assert.notEqual(originalReturnsImmediately, fooService.returnsImmediately);
    assert.equal(originalReturnsThroughCallback, fooService.returnsThroughCallback);

    proxy.detach();

    assert.equal(originalReturnsImmediately, fooService.returnsImmediately);
    assert.equal(originalReturnsThroughCallback, fooService.returnsThroughCallback);
  });
});
