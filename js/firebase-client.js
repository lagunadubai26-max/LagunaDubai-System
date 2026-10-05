const FB = (() => {
  let db;
  let uid = null;
  let authReady = null;
  let initialAuth = null;
  function initializeAuth() {
    if (!db) {
      const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore(app);
    }
    if (!initialAuth) initialAuth = new Promise(resolve => {
      const unsubscribe = firebase.auth().onAuthStateChanged(user => { unsubscribe(); resolve(user); });
    });
    return initialAuth;
  }
  function clearCache(preserveMenu = false) {
    _memo.clear();
    _inFlight.clear();
    _readEpoch++;
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('laguna_cache_') && !(preserveMenu && ['laguna_cache_products', 'laguna_cache_categories'].includes(k))) localStorage.removeItem(k);
    });
  }

  async function init() {
    await initializeAuth();
    if (uid && firebase.auth().currentUser && uid === firebase.auth().currentUser.uid) return;
    if (!authReady) {
      authReady = (async () => {
        const auth = firebase.auth();
        const page = location.pathname.split('/').pop();
        if (!auth.currentUser && page !== 'ipad.html') throw Object.assign(new Error('تسجيل الدخول مطلوب'), { code: 'auth/required' });
        const user = auth.currentUser || (await auth.signInAnonymously()).user;
        if (uid !== user.uid) clearCache(uid === null);
        uid = user.uid;
      })().finally(() => { authReady = null; });
    }
    await authReady;
  }

  async function ensure() { await init(); startClockSync(); }
  async function requireStaff() {
    await ensure();
    const authUser = firebase.auth().currentUser;
    if (!authUser || authUser.isAnonymous) throw new Error('حساب موظف مطلوب');
    const snap = await db.collection('user_mappings').doc(authUser.uid).get({ source: 'server' });
    if (!snap.exists || snap.data().enabled !== true || !['Administrator', 'Owner', 'Cashier'].includes(snap.data().role)) throw new Error('الحساب غير مفعل');
    return { ...snap.data(), id: authUser.uid, uid: authUser.uid };
  }

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
      const probeRef = db.collection('clock_probes').doc(uid);
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
  function nowISO() { var d = clockNow(); var y = d.getFullYear(); var m = String(d.getMonth()+1).padStart(2,'0'); var day = String(d.getDate()).padStart(2,'0'); var h = String(d.getHours()).padStart(2,'0'); var mi = String(d.getMinutes()).padStart(2,'0'); var s = String(d.getSeconds()).padStart(2,'0'); return y+'-'+m+'-'+day+'T'+h+':'+mi+':'+s+'.'+String(d.getMilliseconds()).padStart(3,'0'); }

  // ── Read reduction: memo (per page) + static cache (localStorage + versions doc) ──
  const _memo = new Map();
  const _inFlight = new Map();
  let _readEpoch = 0;
  function readOnce(key, load) {
    if (_inFlight.has(key)) return _inFlight.get(key);
    const job = Promise.resolve().then(load);
    _inFlight.set(key, job);
    return job.finally(() => { if (_inFlight.get(key) === job) _inFlight.delete(key); });
  }
  const MEMO_TTL = 5000;
  const META_TTL = 10000;
  const STATIC_COLLECTIONS = { products: 1, customers: 1, categories: 1, employees: 1, users: 1, settings: 1 };
  const VERSIONS_DOC = 'versions';
  function _cLocalGet(key, def) {
    try { const d = localStorage.getItem('laguna_' + key); return d ? JSON.parse(d) : def; } catch { return def; }
  }
  function _cLocalSet(key, val) { localStorage.setItem('laguna_' + key, JSON.stringify(val)); }

  async function metaVersions() {
    return readOnce('__meta', async () => {
      const epoch = _readEpoch;
      const m = _memo.get('__meta');
      if (m && Date.now() - m.t < META_TTL) return m.data;
      let v = {};
      try {
        const snap = await db.collection('meta').doc(VERSIONS_DOC).get();
        if (snap.exists) v = snap.data().versions || {};
      } catch(e) {}
      if (epoch === _readEpoch) _memo.set('__meta', { t: Date.now(), data: v });
      return v;
    });
  }

  async function bumpVersion(name) {
    try {
      const ref = db.collection('meta').doc(VERSIONS_DOC);
      await ref.set({ versions: { [name]: firebase.firestore.FieldValue.increment(1) } }, { merge: true });
    } catch(e) {
      console.warn('[fb] version bump failed:', e);
      try { _cLocalSet('cache_' + name, null); } catch(e2) {}
    }
  }

  async function invalidate(name) {
    try { sessionStorage.removeItem('laguna_report_snapshot_v1'); } catch (_) {}
    _memo.delete(name);
    _memo.delete('__meta');
    _readEpoch++;
    _inFlight.delete(name);
    _inFlight.delete('__meta');
    if (STATIC_COLLECTIONS[name]) await bumpVersion(name);
  }

  async function getCollection(name) {
    await ensure();
    return readOnce(name, async () => {
      const epoch = _readEpoch;
      const memo = _memo.get(name);
      if (memo && Date.now() - memo.t < MEMO_TTL) return memo.data;
      let data;
      if (STATIC_COLLECTIONS[name]) {
        const v = await metaVersions();
        const vKey = v[name] || null;
        const cached = _cLocalGet('cache_' + name, null);
        if (cached && cached.project === FIREBASE_CONFIG.projectId && cached.v === vKey) {
          data = cached.data;
        } else {
          data = await rawCollection(name);
          if (epoch === _readEpoch) {
            try { _cLocalSet('cache_' + name, { project: FIREBASE_CONFIG.projectId, v: vKey, data }); } catch (_) {}
          }
        }
      } else {
        data = await rawCollection(name);
      }
      if (epoch === _readEpoch) _memo.set(name, { t: Date.now(), data });
      return data;
    });
  }

  async function getCollectionFresh(name) {
    await ensure();
    const data = await rawCollection(name, { source: 'server' });
    _memo.set(name, { t: Date.now(), data });
    return data;
  }

  async function rawCollection(name, options) {
    const snap = await db.collection(name).orderBy('__name__', 'asc').get(options);
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
    await invalidate(name);
    return obj;
  }

  async function updateDoc(name, id, data) {
    await ensure();
    await db.collection(name).doc(id).update(data);
    await invalidate(name);
  }

  async function removeDoc(name, id) {
    await ensure();
    await db.collection(name).doc(id).delete();
    await invalidate(name);
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

  return { getCollection, getCollectionFresh, queryCollection, initializeAuth, requireStaff, clearCache, ensure, addDoc, updateDoc, removeDoc, onCollection, runTransaction, invalidate, getUid, getDb, syncClock, clockNow, nowISO };
})();
