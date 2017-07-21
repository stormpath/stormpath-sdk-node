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

/**
 * Save changes to this resource.
 *
 * @param {Function} callback
 * The function to call when the save operation is complete. Will be called
 * with the parameters (err, updatedResource).
 */
function saveResource(callback) {
  var self = this;
  self._applyCustomDataUpdatesIfNecessary(function () {
    var href = self._links && self._links.self && self._links.self.href;
    if (self.toOktaUser) {
      var user = self.toOktaUser();
      var data = {
        href: self.href,
        profile: user.profile
      };

      return self.dataStore._evict(href, function () {
        self.dataStore.saveResource(data, callback);
      });
    }

    self.dataStore._evict(href, function () {
      self.dataStore.saveResource(self, callback);
    });
  });
}

var SaveableMixin = {
  _applyCustomDataUpdatesIfNecessary: applyCustomDataUpdatesIfNecessary,
  save: saveResource
};

module.exports = SaveableMixin;
