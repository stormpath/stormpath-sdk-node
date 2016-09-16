'use strict';

var Resource = require('./Resource');
var utils = require('../utils');

/**
 * @class Field
 *
 * @description
 * Encapsulates an account field, as part of a {@link Schema}.
 *
 * This class should not be manually constructed. It should be obtained from one of these methods:
 *
 * - {@link Schema#getFields Schema.getFields()}.
 */
function Field(){
  Field.super_.apply(this, arguments);
}

utils.inherits(Field, Resource);

/**
 * Save changes to this resource.
 *
 * @param {Function} callback
 * The function to call when the save operation is complete. Will be called
 * with the parameters (err, updatedResource).
 */
Field.prototype.save = function save(callback) {
  this.dataStore.saveResource(this, callback);
};

module.exports = Field;