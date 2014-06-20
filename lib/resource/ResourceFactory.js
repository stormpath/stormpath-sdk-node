'use strict';

var utils = require('../utils');
var InstanceResource = require('./InstanceResource');
var CollectionResource = require('./CollectionResource');

var CustomData = require('./CustomData');


/**
 * A factory function that creates and returns a new Resource instance.  The server is not contacted in any way -
 * this function merely instantiates the object in memory and returns it.  Callers are responsible for persisting
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

    if(resource.customData){
      resource.customData = instantiate(CustomData, resource.customData, q, dataStore);
    }
  }
  return resource;
}

module.exports = {
  instantiate: instantiate
};