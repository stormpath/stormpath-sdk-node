'use strict';

var utils = require('../utils');
var Cache = require('./Cache');

function DisabledCache() {
}
utils.inherits(DisabledCache, Cache);

DisabledCache.prototype.get =
  DisabledCache.prototype.put =
    DisabledCache.prototype.delete =
      DisabledCache.prototype.clear =
        DisabledCache.prototype.size = function () {
          Array.prototype.slice.call(arguments, -1)[0](null, null);
        };

module.exports = DisabledCache;