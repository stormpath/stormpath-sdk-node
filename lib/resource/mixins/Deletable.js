/**
 * Deletes this resource from the API.
 *
 * @param {Function} callback
 * The function to call when the delete operation is complete. Will be called
 * with the parameter (err).
 */
function deleteResource(callback) {
  this.dataStore.deleteResource(this, callback);
}

module.exports = {
  delete: deleteResource
};
