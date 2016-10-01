var async = require('async');

/**
 * Removes this resource, and all of it's linked resources, e.g. Custom Data, from the local cache.
 *
 * @param {Function} callback
 * The function to call when the cache invalidation operation is complete.
 */
function invalidateResource(callback) {
  var self = this;

  var tasks = [];
  var visited = {};

  function makeInvalidationTask(href) {
    return function (itemCallback) {
      // Swallow any errors. For cache invalidation those aren't that
      // important and will also break the async.parallel() flow.
      self.dataStore._evict(href, function () {
        itemCallback();
      });
    };
  }

  function walkBuildInvalidationTasks(source) {
    var rootHref = source.href;

    if (rootHref in visited) {
      return;
    }

    visited[rootHref] = null;
    tasks.push(makeInvalidationTask(source.href));

    for (var key in source) {
      var item = source[key];

      if (!item || !item.href) {
        continue;
      }

      // Only walk child resources.
      if (item.href.indexOf(rootHref) === 0) {
        walkBuildInvalidationTasks(item);
      }
    }
  }

  if (this.href) {
    walkBuildInvalidationTasks(this);
  }

  async.parallel(tasks, callback);
}

module.exports = {
  invalidate: invalidateResource
};
