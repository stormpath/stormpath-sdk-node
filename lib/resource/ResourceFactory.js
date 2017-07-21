'use strict';

/* jshint -W003 */
var CollectionResource = require('./CollectionResource');
var CustomData = require('./CustomData');
var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

var fs = require('fs');
var path = require('path');

/**
* @private
*
* @description
*
* Computes the path to a file by its resource name. Currently only does so by
* transforming the resource name.
*
* @param resourceName The string representing the name of the expanded resource
* @return Path to the resource file
*/
function getPathForResourceName(resourceName) {
  var normalizedFieldName = resourceName.charAt(0).toUpperCase() +
    resourceName.substr(1);

  return path.join(__dirname , normalizedFieldName + '.js');
}

/**
* @private
*
* @description
* Given an instantiated resource or resource collection, turns all objects
* that came from an `expand` query into resource object by instantiating them.
* These transformations are done in-place (the original resource is modified,
* not copied).
*
* @param expandedFields A list of resources that were demanded in an expand query
* @param resource An instantiated parent resource or collection of resources
* @param query any query that was provided to the server when acquiring the data
* @param dataStore the dataStore used by the resource to communicate with the server. required for all resources.
* @returns Resource with expanded fields transformed into instantied resources
*
*/
function expandResource(expandedFields, resource, query, dataStore) {
  if (resource instanceof CollectionResource) {
    resource.items.forEach(function (instance) {
      expandResource(expandedFields, instance, query, dataStore);
    });

    return resource;
  }

  expandedFields.forEach(function(fieldName) {
    var path = getPathForResourceName(fieldName);
    if (typeof resource[fieldName] !== 'undefined' && fs.existsSync(path) ) {
      resource[fieldName] = instantiate(require(path), resource[fieldName], query, dataStore);
    }
  });

  return resource;
}

/**
 * @private
 *
 * Replaces CustomData.save() with a function the expects a Stormpath account, and does a PUT to the Okta user with the updated profile properties.
 *
 * @param {*} account
 * @param {*} callback
 */
function saveCustomData(dataStore, account, callback) {
  var data = {
    href: account.href,
    profile: account.toOktaUser().profile
  };
  dataStore.saveResource(data, callback);
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
    throw new Error('InstanceConstructor argument cannot be a CollectionResource.');
  }

  if (!data) {
    return null;
  }

  var resource = null;
  var q = utils.valueOf(query);

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

  // Expand the custom data even if it is not explicitly required to maintain backwards compatibility
  if (resource.customData && !(resource.customData instanceof CustomData)) {
    resource.customData = instantiate(CustomData, resource.customData, q, dataStore);
  }

  return resource;
}
/* jshint +W003 */

module.exports = {
  instantiate: instantiate
};
