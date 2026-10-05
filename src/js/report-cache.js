/* Bounded report snapshots, scoped to a verified staff identity. */
(function (root) {
  function create(options) {
    var key = 'laguna_report_snapshot_v1', ttl = 5 * 60 * 1000;
    var memory = null, pending = null;
    function valid(snapshot, user) {
      var age = options.now() - (snapshot && snapshot.time);
      return snapshot && snapshot.uid === user.uid && snapshot.role === user.role && age >= 0 && age < ttl
        && Array.isArray(snapshot.data) && snapshot.data.length === 8 && snapshot.data.every(Array.isArray);
    }
    async function get(force) {
      if (pending) return pending;
      pending = (async function () {
        var user = await options.authorize();
        if (!user || ['Owner', 'Administrator'].indexOf(user.role) === -1) throw new Error('التقارير متاحة للمدير والـOwner فقط');
        if (!force) {
          try {
            var saved = JSON.parse(options.storage.getItem(key));
            if (valid(saved, user)) { memory = saved; return saved; }
          } catch (_) { if (valid(memory, user)) return memory; }
        }
        // Discard the previous snapshot before a refresh: failures must remain visible.
        memory = null;
        try { options.storage.removeItem(key); } catch (_) {}
        var data = await options.load();
        var snapshot = { uid: user.uid, role: user.role, time: options.now(), data: data };
        memory = snapshot;
        try { options.storage.setItem(key, JSON.stringify(snapshot)); } catch (_) {}
        return snapshot;
      })();
      try { return await pending; } finally { pending = null; }
    }
    return { get: get };
  }
  root.ReportCache = { create: create };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ReportCache;
})(typeof window !== 'undefined' ? window : this);
