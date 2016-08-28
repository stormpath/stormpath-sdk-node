'use strict';

var InstanceResource = require('./InstanceResource');
var utils = require('../utils');

/**
 * @class Schema
 *
 * @description
 * Encapsulates a Schema resource of a {@link Directory}.
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 * - {@link Directory#getAccountSchema Directory.getAccountSchema()}.
 *
 * @augments {InstanceResource}
 */
function Schema() {
  Schema.super_.apply(this, arguments);
}

utils.inherits(Schema, InstanceResource);

/**
 * Get the collection of {@link InstanceResource fields} for this schema.
 *
 * @param {CollectionQueryOptions} [options]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link InstanceResource field} objects.
 */
Schema.prototype.getFields = function () {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);
  return this.dataStore.getResource(this.fields.href, args.options, require('./InstanceResource'), args.callback);
};

module.exports = Schema;