'use strict';

function DisabledCache() {
}

DisabledCache.prototype.get =
  DisabledCache.prototype.set =
    DisabledCache.prototype.delete =
      DisabledCache.prototype.clear =
        DisabledCache.prototype.size = function () {
          return Array.prototype.slice.call(arguments, -1)[0](null, null);
        };

module.exports = DisabledCache;