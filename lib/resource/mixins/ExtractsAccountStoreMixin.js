function getLinkedAccountStore(href, opts, Ctor, callback) {
  var linkOpts = {expand: 'accountStore'};

  return this.dataStore.getResource(href, linkOpts, Ctor, function(err, storeLink) {
    if (err) {
      return callback(err);
    }

    if (!storeLink || !storeLink.accountStore) {
      return callback();
    }

    return storeLink.getAccountStore(opts, callback);
  });
}

var ExtractsAccountStoreMixin = {
  getLinkedAccountStore: getLinkedAccountStore
};

module.exports = ExtractsAccountStoreMixin;
