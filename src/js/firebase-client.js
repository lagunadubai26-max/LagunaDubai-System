const FB = (() => {
  let db;
  let uid = null;

  async function init() {
    if (db) return;
    const app = firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore(app);
    db.settings({ merge: true });
    try {
      const cred = await firebase.auth(app).signInAnonymously();
      uid = cred.user.uid;
    } catch (e) {
      console.warn('[firebase] anonymous auth failed:', e.message);
    }
  }

  async function ensure() { if (!db) await init(); startClockSync(); }

  function docId() { 
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2);
}

  // ── Server clock sync: لا نعتمد على ساعة الجهاز ──
  let _clockOffset = null;
  let _clockStarted = false;

  async function syncClock() {
    try {
      await ensure();
      const probeRef = db.collection('audit_logs').doc('clock_probe_' + (uid || 'anon'));
      await probeRef.set({ t: firebase.firestore.FieldValue.serverTimestamp() });
      const snap = await probeRef.get();
      try { await probeRef.delete(); } catch(e) { /* البقايا تتستبدل في المزامنة التالية */ }
      const t = snap.get('t');
      if (t && t.toDate) _clockOffset = t.toDate().getTime() - Date.now();
    } catch(e) { console.warn('[clock] sync failed:', e); _clockOffset = 0; }
    return _clockOffset;
  }

  function startClockSync() {
    if (_clockStarted) return;
    _clockStarted = true;
    syncClock();
    setInterval(syncClock, 5 * 60 * 1000);
  }

  function clockNow() { return new Date(Date.now() + (_clockOffset || 0)); }
  function nowISO() { return clockNow().toISOString(); }

  // ── Read reduction: memo (per page) + static cache (localStorage + versions doc) ──
  const _memo = new Map();
  const MEMO_TTL = 5000;
  const META_TTL = 60000;
  const STATIC_COLLECTIONS = { products: 1, customers: 1, categories: 1, employees: 1, users: 1, settings: 1 };
  const VERSIONS_DOC = 'versions';
  function _cLocalGet(key, def) {
    try { const d = localStorage.getItem('laguna_' + key); return d ? JSON.parse(d) : def; } catch { return def; }
  }
  function _cLocalSet(key, val) { localStorage.setItem('laguna_' + key, JSON.stringify(val)); }

  async function metaVersions() {
    const m = _memo.get('__meta');
    if (m && Date.now() - m.t < META_TTL) return m.data;
    let v = {};
    try {
      const snap = await db.collection('meta').doc(VERSIONS_DOC).get();
      if (snap.exists) v = snap.data().versions || {};
    } catch(e) {}
    _memo.set('__meta', { t: Date.now(), data: v });
    return v;
  }

  function bumpVersion(name) {
    const ref = db.collection('meta').doc(VERSIONS_DOC);
    ref.set({ versions: { [name]: firebase.firestore.FieldValue.increment(1) } }, { merge: true }).catch(e => console.warn('[fb] version bump failed:', e));
  }

  function invalidate(name) {
    _memo.delete(name);
    if (STATIC_COLLECTIONS[name]) bumpVersion(name);
  }

  async function getCollection(name) {
    await ensure();
    const memo = _memo.get(name);
    if (memo && Date.now() - memo.t < MEMO_TTL) return memo.data;
    let data;
    if (STATIC_COLLECTIONS[name]) {
      const v = await metaVersions();
      const vKey = v[name] || null;
      const cached = _cLocalGet('cache_' + name, null);
      if (cached && cached.v === vKey) {
        data = cached.data;
      } else {
        data = await rawCollection(name);
        _cLocalSet('cache_' + name, { v: vKey, data });
      }
    } else {
      data = await rawCollection(name);
    }
    _memo.set(name, { t: Date.now(), data });
    return data;
  }

  async function rawCollection(name) {
    const snap = await db.collection(name).orderBy('__name__', 'asc').get();
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    return items;
  }

  async function queryCollection(name, field, op, value, limitCount) {
    await ensure();
    let ref = db.collection(name).where(field, op, value);
    if (limitCount) ref = ref.limit(limitCount);
    const snap = await ref.get();
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    return items;
  }

  async function addDoc(name, data) {
    await ensure();
    const id = data.id || docId();
    const obj = { ...data, id };
    if (uid) obj._uid = uid;
    await db.collection(name).doc(id).set(obj);
    invalidate(name);
    return obj;
  }

  async function updateDoc(name, id, data) {
    await ensure();
    await db.collection(name).doc(id).update(data);
    invalidate(name);
  }

  async function removeDoc(name, id) {
    await ensure();
    await db.collection(name).doc(id).delete();
    invalidate(name);
  }

  async function onCollection(name, callback) {
    await ensure();
    return db.collection(name).orderBy('__name__', 'asc').onSnapshot(snap => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      callback(items);
    });
  }

  async function runTransaction(updateFn) {
    await ensure();
    return db.runTransaction(updateFn);
  }

  function getUid() { return uid; }
  function getDb() { return db; }

  return { getCollection, queryCollection, ensure, addDoc, updateDoc, removeDoc, onCollection, runTransaction, getUid, getDb, syncClock, clockNow, nowISO };
})();
