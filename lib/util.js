'use strict';

var util = require('util');

function shallowCopy(src, dest) {

  for( var key in src) {
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
 * @param defaultVal
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


module.exports = {
  inherits: util.inherits,
  isAssignableFrom: isAssignableFrom,
  shallowCopy: shallowCopy,
  valueOf: valueOf
};