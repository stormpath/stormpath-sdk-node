'use strict';

var Resource = require('./Resource');
var utils = require('../utils');

/**
 * @class Schema
 *
 * @description
 * Encapsulates the Schema resource of a {@link Directory}. This schema allows you
 * to control which Account attributes (referred to as fields) are required when
 * creating new accounts in the directory. For full documentation of this resource, please see
 * [How to Manage an Account’s Required Attributes](https://docs.stormpath.com/rest/product-guide/latest/accnt_mgmt.html#how-to-manage-an-account-s-required-attributes).
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Directory#getAccountSchema Directory.getAccountSchema()}.
 *
 * @example <caption>Disabling a field requirement.</caption>
 * var _ = require('lodash');
 *
 * schema.getFields(function (err, fieldsCollection) {
 *   var givenNameField = _.find(fieldsCollection.items, {
 *     name: 'givenName'
 *   });
 *
 *   givenNameField.required = false;
 *
 *   givenNameField.save();
 * });
 */
function Schema() {
  Schema.super_.apply(this, arguments);
}

utils.inherits(Schema, Resource);

/**
 * Get the collection of {@link Field Fields} for this schema.
 *
 * @param {CollectionQueryOptions} [options]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Field} objects.
 */
Schema.prototype.getFields = function () {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.fields.href, args.options, require('./Field'), args.callback);
};

module.exports = Schema;