var _ = require('lodash');

/**
 * Create a new ObjectProxy.
 *
 * @class
 */
function ObjectProxy (source) {
  this.source = source;
  this.attached = {};
  this.pending = [];
}

/**
 * Restore all of the attached methods.
 *
 * @private
 */
ObjectProxy.prototype._restore = function () {
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
ObjectProxy.prototype._release = function (err) {
  var pending = this.pending;

  this.pending = [];

  pending.forEach(function (call) {
    var args = call.args,
        callback = call.callback,
        fn = call.fn;

    args[args.length - 1] = function () {
      var subArgs = err ? [err] : Array.prototype.slice.call(arguments);
      callback.apply(null, subArgs);
    };

    fn.apply(null, args);
  });
};

/**
 * Attach onto the source object and intercept all calling
 * methods with callbacks (where last argument is function).
 */
ObjectProxy.prototype.attach = function (predicateFn) {
  var outerScope = this;
  var source = outerScope.source;

  if (!predicateFn) {
    predicateFn = function () {
      return true;
    };
  }

  function _attach (name) {
    if (!(name in outerScope.attached)) {
      var originalFn = source[name].bind(source);

      outerScope.attached[name] = originalFn;

      source[name] = function () {
        var args = Array.prototype.slice.call(arguments);
        var lastArgumentOffset = args.length - 1;

        if (args.length && _.isFunction(args[lastArgumentOffset])) {
          outerScope.pending.push({
            args: args,
            callback: args[lastArgumentOffset],
            fn: originalFn
          });
        } else {
          return originalFn.apply(null, args);
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
ObjectProxy.prototype.detach = function (err) {
  this._restore();
  this._release(err);
};

module.exports = ObjectProxy;
