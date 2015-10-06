var _ = require('lodash');

/**
 * Create a new ObjectCallProxy.
 *
 * @class
 */
function ObjectCallProxy (source) {
  this.source = source;
  this.attached = {};
  this.pending = [];
}

/**
 * Restore all of the attached methods.
 *
 * @private
 */
ObjectCallProxy.prototype._restore = function () {
  for (var name in this.attached) {
    this.source[name] = this.attached[name];
    delete this.attached[name];
  }
};

/**
 * Release all of the pending callbacks.
 *
 * @private
 * @param {Error} [err] - Error to release all callbacks with (optional).
 */
ObjectCallProxy.prototype._release = function (err) {
  var source = this.source;
  var pending = this.pending;

  this.pending = [];

  pending.forEach(function (call) {
    var fn = call.fn;
    var args = call.args;
    var callback = call.callback;

    args[args.length - 1] = function () {
      var subArgs = err ? [err] : Array.prototype.slice.call(arguments);
      callback.apply(null, subArgs);
    };

    fn.apply(source, args);
  });
};

/**
 * Attach onto the source object and intercept all calling
 * methods with callbacks (where last argument is function).
 *
 * @param fn [predicateFn] - Predicate to filter methods by (optional).
 */
ObjectCallProxy.prototype.attach = function (predicateFn) {
  var source = this.source;
  var pending = this.pending;
  var attached = this.attached;

  if (!predicateFn) {
    predicateFn = function () {
      return true;
    };
  }

  function _attach (name) {
    if (!(name in attached)) {
      var originalFn = source[name];

      attached[name] = originalFn;

      source[name] = function () {
        var args = Array.prototype.slice.call(arguments);
        var lastArgumentOffset = args.length - 1;

        if (args.length && _.isFunction(args[lastArgumentOffset])) {
          pending.push({
            args: args,
            callback: args[lastArgumentOffset],
            fn: originalFn
          });
        } else {
          return originalFn.apply(source, args);
        }
      };
    }
  }

  // Proxy all methods on source object.
  for (var name in source) {
    var value = source[name];

    // If a predicate is provided, then filter accordingly.
    if (!predicateFn(name)) {
      continue;
    }

    if (_.isFunction(value)) {
      _attach(name);
    }
  }
};

/**
 * Detach all attached methods and release any pending calls.
 *
 * @param {Error} [err] - Error to release all callbacks with (optional).
 */
ObjectCallProxy.prototype.detach = function (err) {
  this._restore();
  this._release(err);
};

module.exports = ObjectCallProxy;
