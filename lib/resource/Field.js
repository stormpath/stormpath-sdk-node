'use strict';

var Resource = require('./Resource');
var SaveableMixin = require('./mixins/SaveableMixin');
var utils = require('../utils');

/**
 * @class Field
 *
 * @augments Resource
 * @mixes SaveableMixin
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
utils.applyMixin(Field, SaveableMixin);

module.exports = Field;
