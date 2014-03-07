function NoCache() {
}

NoCache.prototype.get =
  NoCache.prototype.put =
    NoCache.prototype.delete =
      NoCache.prototype.clear =
        NoCache.prototype.size = function () {
          Array.prototype.slice.call(arguments, -1)[0](null, null);
        };

module.exports = NoCache;