'use strict';

var Resource = require('./Resource');
var utils = require('../utils');
var SaveableMixin = require('./mixins/Saveable');
var DeletableMixin = require('./mixins/Deletable');
var GettableMixin = require('./mixins/Gettable');
var InvalidatableMixin = require('./mixins/Invalidatable');

/**
 * @class InstanceResource
 *
 * Low-level resource wrapper for Stormpath resource objects.
 */
function InstanceResource() {
  InstanceResource.super_.apply(this, arguments);
}

utils.inherits(InstanceResource, Resource);
utils.applyMixin(InstanceResource, GettableMixin);
utils.applyMixin(InstanceResource, SaveableMixin);
utils.applyMixin(InstanceResource, DeletableMixin);
utils.applyMixin(InstanceResource, InvalidatableMixin);

module.exports = InstanceResource;
