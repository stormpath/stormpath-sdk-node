function NoCache() {
}

NoCache.prototype.get =
  NoCache.prototype.put =
    NoCache.prototype.delete = function () {
      Array.prototype.slice.call(arguments, -1)[0](null, null);
    };

module.exports = NoCache;