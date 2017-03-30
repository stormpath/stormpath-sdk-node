'use strict';

var cryptoLib = require('crypto');
/* jshint -W079 */
var Buffer = require('buffer').Buffer;
/* jshint +W079 */
var util = require('util');

var stormpathConfig = require('stormpath-config');
var uuid = require('uuid');
var url = require('url');

function shallowCopy(src, dest) {

  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }

  return dest;
}

function isConfigLoader(value) {
  if (value instanceof stormpathConfig.Loader) {
    return true;
  }

  if (value && value.constructor && value.constructor.name === 'ConfigLoader') {
    return true;
  }

  return false;
}

function take(source, fromRight) {
  return fromRight ? source.pop() : source.shift();
}

/**
 * @private
 *
 * @description
 *
 * Takes a list of arguments and maps them to a list of names
 * in an alternating either a left-to-right, or right-to-left direction.
 */
function resolveArgs(argumentsObject, nameMap, rightToLeft) {
  var result = {};

  var takeFromRight = rightToLeft;
  var args = Array.prototype.slice.call(argumentsObject);

  while (nameMap.length) {
    var value = null;
    var name = take(nameMap, takeFromRight);

    if (args.length > 0) {
      value = take(args, takeFromRight);
      takeFromRight = !takeFromRight;
    }

    result[name] = value;
  }

  return result;
}

/**
 * @private
 *
 * @description
 *
 * Ensures 'undefined' is never encountered on value assignment. Works as follows:
 * 1. Return obj if not null or undefined.
 * 2. Then return defaultVal if not null or undefined.
 * 3. Return null as last resort.
 *
 * @example
 * function(someVal) {
 *   var possiblyNullButNeverUndefined = util.valueOf(someVal.foo);
 * }
 *
 * @example
 * function(someVal) {
 *   var fooOrDefaultValueIfFooDoesNotExist = util.valueOf(someVal.foo, 'DefaultVavlue');
 * }
 *
 * @param {*} obj
 * @param {*} [defaultVal]
 * @returns {*}
 */
function valueOf(obj, defaultVal) {
  if (obj) {
    return obj;
  }
  if (defaultVal) {
    return defaultVal;
  }
  return null;
}


/**
 * @private
 *
 * @description
 *
 * Returns `true` if the first constructor function is equal to, or a super of,
 * the second constructor function.
 *
 * @param {Function} ctor the constructor function that might be equal to or a super of 'toTest'.
 * @param {Object} toTest the constructor function to test
 */
function isAssignableFrom(ctor, toTest) {

  if (!(ctor instanceof Function) || !(toTest instanceof Function)) {
    throw new Error('arguments must be Functions.');
  }

  if (ctor === Object || ctor === toTest) {
    return true;
  }

  if (toTest.super_) {
    return isAssignableFrom(ctor, toTest.super_);
  }

  return false;
}

var base64 = {
  encode: function encode64(string) {
    return new Buffer(string).toString('base64');
  },
  decode: function decode64(string) {
    return new Buffer(string, 'base64').toString();
  },
  urlEncode: function urlEncode(string) {
    return new Buffer(string).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  urlDecode: function urlDecode(base64) {
    base64 += new Array(5 - base64.length % 4).join('=');
    base64 = base64.replace(/\-/g, '+').replace(/\_/g, '/');
    return new Buffer(base64, 'base64');
  }
};

var crypto = {
  hmac: function hmac(key, string, digest, fn) {
    if (!digest) {
      digest = 'binary';
    }
    if (digest === 'buffer') {
      digest = undefined;
    }
    if (!fn) {
      fn = 'sha256';
    }
    if (typeof string === 'string') {
      string = new Buffer(string);
    }
    return cryptoLib.createHmac(fn, key).update(string).digest(digest);
  },

  sha256: function sha256(string, digest) {
    if (!digest) {
      digest = 'binary';
    }
    if (digest === 'buffer') {
      digest = undefined;
    }
    if (typeof string === 'string') {
      string = new Buffer(string);
    }
    return cryptoLib.createHash('sha256').update(string).digest(digest);
  },

  toHex: function toHex(data) {
    var out = [];
    for (var i = 0; i < data.length; i++) {
      out.push(('0' + data.charCodeAt(i).toString(16)).substr(-2, 2));
    }
    return out.join('');
  }
};

function isCollectionData(data) {
  return Array.isArray(data);
}

function nowEpochSeconds() {
  return Math.round(new Date().getTime()/1000);
}

var numberRegExp = new RegExp(/[0-9]+/);

function isNumber(val) {
  return (typeof val === 'number') && numberRegExp.test(val, 10);
}

function applyMixin(Ctor, mixin) {
  Object.keys(mixin).forEach(function(key) {
    if (mixin.hasOwnProperty(key)) {
      Ctor.prototype[key] = mixin[key];
    }
  });
}

function isValidHref(href, subPath) {
  var path;

  if (typeof href !== 'string') {
    return false;
  }

  if (href.indexOf('/') === 0) {
    path = href;
  } else {
    var parsedUrl;

    try {
      parsedUrl = url.parse(href);
    } catch (err) {
      return false;
    }

    if (!parsedUrl.protocol || !parsedUrl.host || !parsedUrl.path) {
      return false;
    }

    if (parsedUrl.protocol.indexOf('http') !== 0) {
      return false;
    }

    path = parsedUrl.path;
  }

  if (subPath && path.indexOf(subPath) === -1) {
    return false;
  }

  return true;
}

function extend(/* target, src1, src2, ... */) {
  var target = arguments[0];
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function(source) {
    if (!source) {
      return;
    }

    Object.keys(source).forEach(function(key) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    });
  });

  return target;
}

module.exports = {
  isConfigLoader: isConfigLoader,
  resolveArgs: resolveArgs,
  nowEpochSeconds: nowEpochSeconds,
  inherits: util.inherits,
  isAssignableFrom: isAssignableFrom,
  isCollectionData: isCollectionData,
  isValidHref: isValidHref,
  shallowCopy: shallowCopy,
  valueOf: valueOf,
  isNumber: isNumber,
  base64: base64,
  crypto: crypto,
  uuid: uuid,
  applyMixin: applyMixin,
  extend: extend,
  noop: function () {}
};
