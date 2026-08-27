function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var FB = function () {
  var db;
  var uid = null;
  function init() {
    return _init.apply(this, arguments);
  }
  function _init() {
    _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var app, cred, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!db) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            app = firebase.initializeApp(FIREBASE_CONFIG);
            db = firebase.firestore(app);
            db.settings({
              merge: true
            });
            _context.p = 2;
            _context.n = 3;
            return firebase.auth(app).signInAnonymously();
          case 3:
            cred = _context.v;
            uid = cred.user.uid;
            _context.n = 5;
            break;
          case 4:
            _context.p = 4;
            _t = _context.v;
            console.warn('[firebase] anonymous auth failed:', _t.message);
          case 5:
            return _context.a(2);
        }
      }, _callee, null, [[2, 4]]);
    }));
    return _init.apply(this, arguments);
  }
  function ensure() {
    return _ensure.apply(this, arguments);
  }
  function _ensure() {
    _ensure = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            if (db) {
              _context2.n = 1;
              break;
            }
            _context2.n = 1;
            return init();
          case 1:
            startClockSync();
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return _ensure.apply(this, arguments);
  }
  function docId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2);
  }

  // ── Server clock sync: لا نعتمد على ساعة الجهاز ──
  var _clockOffset = null;
  var _clockStarted = false;
  function syncClock() {
    return _syncClock.apply(this, arguments);
  }
  function _syncClock() {
    _syncClock = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
      var probeRef, snap, t, _t2, _t3;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            _context3.p = 0;
            _context3.n = 1;
            return ensure();
          case 1:
            probeRef = db.collection('audit_logs').doc('clock_probe_' + (uid || 'anon'));
            _context3.n = 2;
            return probeRef.set({
              t: firebase.firestore.FieldValue.serverTimestamp()
            });
          case 2:
            _context3.n = 3;
            return probeRef.get();
          case 3:
            snap = _context3.v;
            _context3.p = 4;
            _context3.n = 5;
            return probeRef["delete"]();
          case 5:
            _context3.n = 7;
            break;
          case 6:
            _context3.p = 6;
            _t2 = _context3.v;
          case 7:
            t = snap.get('t');
            if (t && t.toDate) _clockOffset = t.toDate().getTime() - Date.now();
            _context3.n = 9;
            break;
          case 8:
            _context3.p = 8;
            _t3 = _context3.v;
            console.warn('[clock] sync failed:', _t3);
            _clockOffset = 0;
          case 9:
            return _context3.a(2, _clockOffset);
        }
      }, _callee3, null, [[4, 6], [0, 8]]);
    }));
    return _syncClock.apply(this, arguments);
  }
  function startClockSync() {
    if (_clockStarted) return;
    _clockStarted = true;
    syncClock();
    setInterval(syncClock, 5 * 60 * 1000);
  }
  function clockNow() {
    return new Date(Date.now() + (_clockOffset || 0));
  }
  function nowISO() {
    return clockNow().toISOString();
  }

  // ── Read reduction: memo (per page) + static cache (localStorage + versions doc) ──
  var _memo = new Map();
  var MEMO_TTL = 5000;
  var META_TTL = 10000;
  var STATIC_COLLECTIONS = {
    products: 1,
    customers: 1,
    categories: 1,
    employees: 1,
    users: 1,
    settings: 1
  };
  var VERSIONS_DOC = 'versions';
  function _cLocalGet(key, def) {
    try {
      var d = localStorage.getItem('laguna_' + key);
      return d ? JSON.parse(d) : def;
    } catch (_unused) {
      return def;
    }
  }
  function _cLocalSet(key, val) {
    localStorage.setItem('laguna_' + key, JSON.stringify(val));
  }
  function metaVersions() {
    return _metaVersions.apply(this, arguments);
  }
  function _metaVersions() {
    _metaVersions = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
      var m, v, snap, _t4;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            m = _memo.get('__meta');
            if (!(m && Date.now() - m.t < META_TTL)) {
              _context4.n = 1;
              break;
            }
            return _context4.a(2, m.data);
          case 1:
            v = {};
            _context4.p = 2;
            _context4.n = 3;
            return db.collection('meta').doc(VERSIONS_DOC).get();
          case 3:
            snap = _context4.v;
            if (snap.exists) v = snap.data().versions || {};
            _context4.n = 5;
            break;
          case 4:
            _context4.p = 4;
            _t4 = _context4.v;
          case 5:
            _memo.set('__meta', {
              t: Date.now(),
              data: v
            });
            return _context4.a(2, v);
        }
      }, _callee4, null, [[2, 4]]);
    }));
    return _metaVersions.apply(this, arguments);
  }
  function bumpVersion(_x) {
    return _bumpVersion.apply(this, arguments);
  }
  function _bumpVersion() {
    _bumpVersion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(name) {
      var ref, _t5;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            _context5.p = 0;
            ref = db.collection('meta').doc(VERSIONS_DOC);
            _context5.n = 1;
            return ref.set({
              versions: _defineProperty({}, name, firebase.firestore.FieldValue.increment(1))
            }, {
              merge: true
            });
          case 1:
            _context5.n = 3;
            break;
          case 2:
            _context5.p = 2;
            _t5 = _context5.v;
            console.warn('[fb] version bump failed:', _t5);
            try {
              _cLocalSet('cache_' + name, null);
            } catch (e2) {}
          case 3:
            return _context5.a(2);
        }
      }, _callee5, null, [[0, 2]]);
    }));
    return _bumpVersion.apply(this, arguments);
  }
  function invalidate(_x2) {
    return _invalidate.apply(this, arguments);
  }
  function _invalidate() {
    _invalidate = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(name) {
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            _memo["delete"](name);
            _memo["delete"]('__meta');
            if (!STATIC_COLLECTIONS[name]) {
              _context6.n = 1;
              break;
            }
            _context6.n = 1;
            return bumpVersion(name);
          case 1:
            return _context6.a(2);
        }
      }, _callee6);
    }));
    return _invalidate.apply(this, arguments);
  }
  function getCollection(_x3) {
    return _getCollection.apply(this, arguments);
  }
  function _getCollection() {
    _getCollection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(name) {
      var memo, data, v, vKey, cached;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.n) {
          case 0:
            _context7.n = 1;
            return ensure();
          case 1:
            memo = _memo.get(name);
            if (!(memo && Date.now() - memo.t < MEMO_TTL)) {
              _context7.n = 2;
              break;
            }
            return _context7.a(2, memo.data);
          case 2:
            if (!STATIC_COLLECTIONS[name]) {
              _context7.n = 7;
              break;
            }
            _context7.n = 3;
            return metaVersions();
          case 3:
            v = _context7.v;
            vKey = v[name] || null;
            cached = _cLocalGet('cache_' + name, null);
            if (!(cached && cached.v === vKey)) {
              _context7.n = 4;
              break;
            }
            data = cached.data;
            _context7.n = 6;
            break;
          case 4:
            _context7.n = 5;
            return rawCollection(name);
          case 5:
            data = _context7.v;
            _cLocalSet('cache_' + name, {
              v: vKey,
              data: data
            });
          case 6:
            _context7.n = 9;
            break;
          case 7:
            _context7.n = 8;
            return rawCollection(name);
          case 8:
            data = _context7.v;
          case 9:
            _memo.set(name, {
              t: Date.now(),
              data: data
            });
            return _context7.a(2, data);
        }
      }, _callee7);
    }));
    return _getCollection.apply(this, arguments);
  }
  function rawCollection(_x4) {
    return _rawCollection.apply(this, arguments);
  }
  function _rawCollection() {
    _rawCollection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(name) {
      var snap, items;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.n) {
          case 0:
            _context8.n = 1;
            return db.collection(name).orderBy('__name__', 'asc').get();
          case 1:
            snap = _context8.v;
            items = [];
            snap.forEach(function (d) {
              return items.push(_objectSpread({
                id: d.id
              }, d.data()));
            });
            return _context8.a(2, items);
        }
      }, _callee8);
    }));
    return _rawCollection.apply(this, arguments);
  }
  function queryCollection(_x5, _x6, _x7, _x8, _x9) {
    return _queryCollection.apply(this, arguments);
  }
  function _queryCollection() {
    _queryCollection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(name, field, op, value, limitCount) {
      var ref, snap, items;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            _context9.n = 1;
            return ensure();
          case 1:
            ref = db.collection(name).where(field, op, value);
            if (limitCount) ref = ref.limit(limitCount);
            _context9.n = 2;
            return ref.get();
          case 2:
            snap = _context9.v;
            items = [];
            snap.forEach(function (d) {
              return items.push(_objectSpread({
                id: d.id
              }, d.data()));
            });
            return _context9.a(2, items);
        }
      }, _callee9);
    }));
    return _queryCollection.apply(this, arguments);
  }
  function addDoc(_x0, _x1) {
    return _addDoc.apply(this, arguments);
  }
  function _addDoc() {
    _addDoc = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(name, data) {
      var id, obj;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.n) {
          case 0:
            _context0.n = 1;
            return ensure();
          case 1:
            id = data.id || docId();
            obj = _objectSpread(_objectSpread({}, data), {}, {
              id: id
            });
            if (uid) obj._uid = uid;
            _context0.n = 2;
            return db.collection(name).doc(id).set(obj);
          case 2:
            _context0.n = 3;
            return invalidate(name);
          case 3:
            return _context0.a(2, obj);
        }
      }, _callee0);
    }));
    return _addDoc.apply(this, arguments);
  }
  function updateDoc(_x10, _x11, _x12) {
    return _updateDoc.apply(this, arguments);
  }
  function _updateDoc() {
    _updateDoc = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(name, id, data) {
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.n) {
          case 0:
            _context1.n = 1;
            return ensure();
          case 1:
            _context1.n = 2;
            return db.collection(name).doc(id).update(data);
          case 2:
            _context1.n = 3;
            return invalidate(name);
          case 3:
            return _context1.a(2);
        }
      }, _callee1);
    }));
    return _updateDoc.apply(this, arguments);
  }
  function removeDoc(_x13, _x14) {
    return _removeDoc.apply(this, arguments);
  }
  function _removeDoc() {
    _removeDoc = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(name, id) {
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.n) {
          case 0:
            _context10.n = 1;
            return ensure();
          case 1:
            _context10.n = 2;
            return db.collection(name).doc(id)["delete"]();
          case 2:
            _context10.n = 3;
            return invalidate(name);
          case 3:
            return _context10.a(2);
        }
      }, _callee10);
    }));
    return _removeDoc.apply(this, arguments);
  }
  function onCollection(_x15, _x16) {
    return _onCollection.apply(this, arguments);
  }
  function _onCollection() {
    _onCollection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(name, callback) {
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.n) {
          case 0:
            _context11.n = 1;
            return ensure();
          case 1:
            return _context11.a(2, db.collection(name).orderBy('__name__', 'asc').onSnapshot(function (snap) {
              var items = [];
              snap.forEach(function (d) {
                return items.push(_objectSpread({
                  id: d.id
                }, d.data()));
              });
              callback(items);
            }));
        }
      }, _callee11);
    }));
    return _onCollection.apply(this, arguments);
  }
  function runTransaction(_x17) {
    return _runTransaction.apply(this, arguments);
  }
  function _runTransaction() {
    _runTransaction = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(updateFn) {
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.n) {
          case 0:
            _context12.n = 1;
            return ensure();
          case 1:
            return _context12.a(2, db.runTransaction(updateFn));
        }
      }, _callee12);
    }));
    return _runTransaction.apply(this, arguments);
  }
  function getUid() {
    return uid;
  }
  function getDb() {
    return db;
  }
  return {
    getCollection: getCollection,
    queryCollection: queryCollection,
    ensure: ensure,
    addDoc: addDoc,
    updateDoc: updateDoc,
    removeDoc: removeDoc,
    onCollection: onCollection,
    runTransaction: runTransaction,
    getUid: getUid,
    getDb: getDb,
    syncClock: syncClock,
    clockNow: clockNow,
    nowISO: nowISO
  };
}();

