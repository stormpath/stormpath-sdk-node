function deleteResource(callback) {
  this.dataStore.deleteResource(this, callback);
}

/**
* Provides methods used for deleting resources. It is not meant to be used
* directly, and should instead be applied to resource classes.
*
* @mixin
*/
var DeletableMixin = {
  /**
   * Deletes a resource from the API.
   *
   * @param {Function} callback
   * The function to call when the delete operation is complete. Will be called
   * with the parameter (err).
   */
  delete: deleteResource
};

module.exports = DeletableMixin;
