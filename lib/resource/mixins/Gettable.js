/**
 * @private
 *
 * @description
 *
 * Retrieves a linked resource by href or property reference.
 *
 * @param {Object|String} Resource reference. This should be a object literal
 * with a `href` property that identifies the resource to retrieve.
 *
 * @param {Object} query [optional=undefined]
 * Key/value pairs to use as query parameters to the resource.
 *
 * @param {Function} instanceCtor [optional=InstanceResource]
 * The constructor function to invoke for the resource returned by the server.
 *
 * @param {Function} callback
 * The callback function to invoke with the constructed Resource. `callback`'s
 * first argument is an `Error` object if an error occured, the second is the
 * constructed resource.
 */
function getResource() {
  var args = Array.prototype.slice.call(arguments);

  var propName = args[0];
  var callback = args[args.length - 1];

  var val = this[propName];

  if (!val) {
    var e1 = new Error('There is no field named \'' + propName + '\'.');
    callback(e1, null);
    return;
  }
  if (!val.href) {
    var e2 = new Error('Field \'' + propName + '\' is not a reference property - it is not an object with an \'href\'' +
      'property.  Do not call \'get\' for ' +
      'non reference properties - access them normally, for example: resource.fieldName or resource[\'fieldName\']');
    callback(e2, null);
    return;
  }

  var query = null;
  var ctor = null;

  // Check if query params are supplied.
  if (args[1] instanceof Object && !(args[1] instanceof Function)) {
    query = args[1];
  }

  // Check if a constructor function was supplied to instantiate a returned resource.
  var secondToLastArg = args[args.length - 2];
  if (secondToLastArg instanceof Function && utils.isAssignableFrom(Resource, secondToLastArg)) {
    ctor = secondToLastArg;
  }

  this.dataStore.getResource(val.href, query, ctor, callback);
}

module.exports = {
  get: getResource
};
