'use strict';
/* jshint -W003 */
var CollectionResource = require('./CollectionResource');
var CustomData = require('./CustomData');
var InstanceResource = require('./InstanceResource');
var utils = require('../utils');


function expandResource(expandedFields, resource, query, dataStore) {
  if (resource instanceof CollectionResource) {
    resource.items.forEach(function(instance) {
      expandResource(expandedFields, instance, query, dataStore);
    });

    return resource;
  }

  expandedFields.forEach(function(fieldName) {
    var normalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.substr(1);
    var expandedPath = './' + normalizedFieldName;

    if (typeof resource[fieldName] !== 'undefined') {
      try {
        resource[fieldName] = instantiate(require(expandedPath), resource[fieldName], query, dataStore);
      } catch (e) {
        console.log('Invalid expand field:', fieldName);
      }
    }
  });

  return resource;
}

/**
 * @private
 *
 * @description
 *
 * A factory function that creates and returns a new Resource instance. The server is not contacted in any way -
 * this function merely instantiates the object in memory and returns it. Callers are responsible for persisting
 * the returned instance's state to the server if desired.
 *
 * @param InstanceConstructor the specific Resource constructor to call when creating the instance.
 * @param data the data acquired from the server
 * @param query any query that was provided to the server when acquiring the data
 * @param dataStore the dataStore used by the resource to communicate with the server. required for all resources.
 * @returns a new Resource memory instance
 */
function instantiate(InstanceConstructor, data, query, dataStore) {

  var Ctor = utils.valueOf(InstanceConstructor, InstanceResource);

  if (utils.isAssignableFrom(CollectionResource, Ctor)) {
    throw new Error("InstanceConstructor argument cannot be a CollectionResource.");
  }

  var q = utils.valueOf(query);

  var resource = null;

  if (data) {
    if (utils.isCollectionData(data)) {
      resource = new CollectionResource(data, q, Ctor, dataStore);
    } else {
      resource = new Ctor(data, dataStore);
    }

    // Wrap any explicitly expanded data into resources, if they can be required.
    // Assumes that the expanded field name is matched by the resource file name.
    if (q && q.expand) {
      var fieldNames = q.expand.split(/\s*,\s*/);
      resource = expandResource(fieldNames, resource, q, dataStore);
    }

    if (resource.customData && !(resource.customData instanceof CustomData)) {
      resource.customData = instantiate(CustomData, resource.customData, q, dataStore);
    }
  }
  return resource;
}
/* jshint +W003 */

module.exports = {
  instantiate: instantiate
};
