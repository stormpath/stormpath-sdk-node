'use strict';

var cryptoLib = require('crypto');
/* jshint -W079 */
var Buffer = require('buffer').Buffer;
/* jshint +W079 */
var util = require('util');

var uuid = require('node-uuid');

function shallowCopy(src, dest) {

  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }

  return dest;
}

/**
 * Ensures 'undefined' is never encountered on value assignment.  Works as follows:
 * 1. Return obj if not null or undefined.
 * 2. Then return defaultVal if not null or undefined.
 * 3. Return null as last resort.
 * <p/>
 * Example usage:
 *
 * <pre>
 * function(someVal) {
 *   var possiblyNullButNeverUndefined = util.valueOf(someVal.foo);
 * }
 * </pre>
 * or:
 * <pre>
 * function(someVal) {
 *   var fooOrDefaultValueIfFooDoesNotExist = util.valueOf(someVal.foo, 'DefaultVavlue');
 * }
 * </pre>
 *
 * @param obj
 * @param [defaultVal]
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
 * Returns <code>true</code> if the first constructor function is equal to, or a super of, the second constructor
 * function.
 *
 * @param ctor the constructor function that might be equal to or a super of 'toTest'.
 * @param toTest the constructor function to test
 */
function isAssignableFrom(ctor, toTest) {

  if (!(ctor instanceof Function) || !(toTest instanceof Function)) {
    throw new Error("arguments must be Functions.");
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
  urlEncode: function urlEncode(string){
    return new Buffer(string).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  urlDecode: function urlDecode(base64){
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
  return data &&
    data.hasOwnProperty('items') &&
    data.hasOwnProperty('offset') &&
    data.hasOwnProperty('limit');
}

function nowEpochSeconds(){
  return Math.round(new Date().getTime()/1000);
}

var numberRegExp = new RegExp(/[0-9]+/);

function isNumber(val){
  return (typeof val === 'number') && numberRegExp.test(val,10);
}

module.exports = {
  nowEpochSeconds: nowEpochSeconds,
  inherits: util.inherits,
  isAssignableFrom: isAssignableFrom,
  isCollectionData: isCollectionData,
  shallowCopy: shallowCopy,
  valueOf: valueOf,
  isNumber: isNumber,
  base64: base64,
  crypto: crypto,
  uuid: uuid,
  noop: function () {
  }
};
