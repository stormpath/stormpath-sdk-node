function applyCustomDataUpdatesIfNecessary(cb){
  if (!this.customData){
    return cb();
  }

  if (this.customData._hasReservedFields()){
    this.customData = this.customData._deleteReservedFields();
  }

  if (this.customData._hasRemovedProperties()){
    return this.customData._deleteRemovedProperties(cb);
  }

  return cb();
}


function saveResource(callback) {
  var self = this;
  self._applyCustomDataUpdatesIfNecessary(function () {
    self.dataStore.saveResource(self, callback);
  });
}

/**
* Provides methods used for saving resources. It is not meant to be used
* directly, and should instead be applied to resource classes.
*
* @mixin
*/
var SaveableMixin = {
  _applyCustomDataUpdatesIfNecessary: applyCustomDataUpdatesIfNecessary,
  /**
   * Save changes to this resource.
   *
   * @param {Function} callback
   * The function to call when the save operation is complete. Will be called
   * with the parameters (err, updatedResource).
   */
  save: saveResource
};

module.exports = SaveableMixin;
