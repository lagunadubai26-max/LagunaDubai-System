function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function safeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return safeId();
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
var DB_MODE = 'firebase';
function localGet(key, def) {
  try {
    var d = localStorage.getItem('laguna_' + key);
    return d ? JSON.parse(d) : def;
  } catch (_unused) {
    return def;
  }
}
function localSet(key, val) {
  localStorage.setItem('laguna_' + key, JSON.stringify(val));
}
function localDateKey(d) {
  if (!d) return '';
  if (typeof d === 'string') d = new Date(d);
  return d.toISOString().slice(0, 10);
}
var DB = {
  mode: DB_MODE,
  invoices: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _context.n = 1;
              return FB.getCollection('invoices');
            case 1:
              return _context.a(2, _context.v);
          }
        }, _callee);
      }))();
    },
    add: function add(inv) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              if (!inv.id) inv.id = 'INV-' + safeId().slice(0, 8).toUpperCase();
              _context2.n = 1;
              return FB.addDoc('invoices', inv);
            case 1:
              return _context2.a(2, _context2.v);
          }
        }, _callee2);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              _context3.n = 1;
              return FB.updateDoc('invoices', id, data);
            case 1:
              return _context3.a(2);
          }
        }, _callee3);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              _context4.n = 1;
              return FB.removeDoc('invoices', id);
            case 1:
              return _context4.a(2);
          }
        }, _callee4);
      }))();
    }
  },
  employees: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              _context5.n = 1;
              return FB.getCollection('employees');
            case 1:
              return _context5.a(2, _context5.v);
          }
        }, _callee5);
      }))();
    },
    add: function add(emp) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              if (!emp.id) emp.id = safeId().slice(0, 8);
              _context6.n = 1;
              return FB.addDoc('employees', emp);
            case 1:
              return _context6.a(2, _context6.v);
          }
        }, _callee6);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              _context7.n = 1;
              return FB.updateDoc('employees', id, data);
            case 1:
              return _context7.a(2);
          }
        }, _callee7);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              _context8.n = 1;
              return FB.removeDoc('employees', id);
            case 1:
              return _context8.a(2);
          }
        }, _callee8);
      }))();
    }
  },
  attendance: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              _context9.n = 1;
              return FB.getCollection('attendance');
            case 1:
              return _context9.a(2, _context9.v);
          }
        }, _callee9);
      }))();
    },
    attDayRange: function attDayRange(now) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
        var shift, _start, h, start, end, _t;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.p = _context0.n) {
            case 0:
              now = now || FB.clockNow();
              shift = null;
              _context0.p = 1;
              _context0.n = 2;
              return DB.shifts.getOpen();
            case 2:
              shift = _context0.v;
              _context0.n = 4;
              break;
            case 3:
              _context0.p = 3;
              _t = _context0.v;
            case 4:
              if (!(shift && shift.openDate)) {
                _context0.n = 5;
                break;
              }
              _start = new Date(shift.openDate + 'T00:00:00Z');
              return _context0.a(2, {
                start: _start,
                end: now
              });
            case 5:
              h = now.getHours();
              if (h >= 17) {
                start = new Date(now);
                start.setHours(17, 0, 0, 0);
                end = new Date(now);
                end.setDate(end.getDate() + 1);
                end.setHours(16, 59, 59, 999);
              } else {
                start = new Date(now);
                start.setDate(start.getDate() - 1);
                start.setHours(17, 0, 0, 0);
                end = new Date(now);
                end.setHours(16, 59, 59, 999);
              }
              return _context0.a(2, {
                start: start,
                end: end
              });
          }
        }, _callee0, null, [[1, 3]]);
      }))();
    },
    today: function today() {
      var _this = this;
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
        var all, range;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.n) {
            case 0:
              _context1.n = 1;
              return FB.getCollection('attendance');
            case 1:
              all = _context1.v;
              _context1.n = 2;
              return _this.attDayRange();
            case 2:
              range = _context1.v;
              return _context1.a(2, all.filter(function (a) {
                if (!a.date) return false;
                var d = new Date(a.date);
                return d >= range.start && d <= range.end;
              }));
          }
        }, _callee1);
      }))();
    },
    add: function add(rec) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
        return _regenerator().w(function (_context10) {
          while (1) switch (_context10.n) {
            case 0:
              if (!rec.id) rec.id = safeId().slice(0, 8);
              _context10.n = 1;
              return FB.addDoc('attendance', rec);
            case 1:
              return _context10.a(2, _context10.v);
          }
        }, _callee10);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11() {
        return _regenerator().w(function (_context11) {
          while (1) switch (_context11.n) {
            case 0:
              _context11.n = 1;
              return FB.updateDoc('attendance', id, data);
            case 1:
              return _context11.a(2);
          }
        }, _callee11);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
        return _regenerator().w(function (_context12) {
          while (1) switch (_context12.n) {
            case 0:
              _context12.n = 1;
              return FB.removeDoc('attendance', id);
            case 1:
              return _context12.a(2);
          }
        }, _callee12);
      }))();
    },
    checkIn: function checkIn(employeeId, name, job, customTime, shiftTime) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13() {
        var time, status, parts, sh, sm, tMs, todayStart, prevStart, diff;
        return _regenerator().w(function (_context13) {
          while (1) switch (_context13.n) {
            case 0:
              time = customTime ? new Date(customTime) : FB.clockNow();
              status = 'present';
              parts = shiftTime ? String(shiftTime).split(':') : [];
              sh = parts.length >= 2 && !isNaN(parseInt(parts[0], 10)) ? parseInt(parts[0], 10) : 17;
              sm = parts.length >= 2 && !isNaN(parseInt(parts[1], 10)) ? parseInt(parts[1], 10) : 0;
              tMs = time.getTime();
              todayStart = new Date(time);
              todayStart.setHours(sh, sm, 0, 0);
              prevStart = new Date(todayStart);
              prevStart.setDate(prevStart.getDate() - 1);
              diff = Math.min(tMs >= todayStart.getTime() ? tMs - todayStart.getTime() : Infinity, tMs >= prevStart.getTime() ? tMs - prevStart.getTime() : Infinity);
              status = diff > 30 * 60 * 1000 ? 'late' : 'present';
              _context13.n = 1;
              return FB.addDoc('attendance', {
                id: 'att-' + safeId().slice(0, 8),
                employeeId: employeeId,
                name: name,
                job: job,
                date: time.toISOString(),
                checkIn: time.toISOString(),
                status: status
              });
            case 1:
              return _context13.a(2, _context13.v);
          }
        }, _callee13);
      }))();
    },
    checkOut: function checkOut(id, customTime) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14() {
        var time;
        return _regenerator().w(function (_context14) {
          while (1) switch (_context14.n) {
            case 0:
              time = customTime ? new Date(customTime) : FB.clockNow();
              _context14.n = 1;
              return FB.updateDoc('attendance', id, {
                checkOut: time.toISOString()
              });
            case 1:
              return _context14.a(2);
          }
        }, _callee14);
      }))();
    }
  },
  returns: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15() {
        return _regenerator().w(function (_context15) {
          while (1) switch (_context15.n) {
            case 0:
              _context15.n = 1;
              return FB.getCollection('returns');
            case 1:
              return _context15.a(2, _context15.v);
          }
        }, _callee15);
      }))();
    },
    add: function add(r) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16() {
        return _regenerator().w(function (_context16) {
          while (1) switch (_context16.n) {
            case 0:
              if (!r.id) r.id = safeId().slice(0, 8);
              _context16.n = 1;
              return FB.addDoc('returns', r);
            case 1:
              return _context16.a(2, _context16.v);
          }
        }, _callee16);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17() {
        return _regenerator().w(function (_context17) {
          while (1) switch (_context17.n) {
            case 0:
              _context17.n = 1;
              return FB.updateDoc('returns', id, data);
            case 1:
              return _context17.a(2);
          }
        }, _callee17);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18() {
        return _regenerator().w(function (_context18) {
          while (1) switch (_context18.n) {
            case 0:
              _context18.n = 1;
              return FB.removeDoc('returns', id);
            case 1:
              return _context18.a(2);
          }
        }, _callee18);
      }))();
    }
  },
  tables: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19() {
        return _regenerator().w(function (_context19) {
          while (1) switch (_context19.n) {
            case 0:
              _context19.n = 1;
              return FB.getCollection('tables_');
            case 1:
              return _context19.a(2, _context19.v);
          }
        }, _callee19);
      }))();
    },
    add: function add(t) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20() {
        return _regenerator().w(function (_context20) {
          while (1) switch (_context20.n) {
            case 0:
              if (!t.id) t.id = safeId().slice(0, 8);
              _context20.n = 1;
              return FB.addDoc('tables_', t);
            case 1:
              return _context20.a(2, _context20.v);
          }
        }, _callee20);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21() {
        return _regenerator().w(function (_context21) {
          while (1) switch (_context21.n) {
            case 0:
              _context21.n = 1;
              return FB.updateDoc('tables_', id, data);
            case 1:
              return _context21.a(2);
          }
        }, _callee21);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22() {
        return _regenerator().w(function (_context22) {
          while (1) switch (_context22.n) {
            case 0:
              _context22.n = 1;
              return FB.removeDoc('tables_', id);
            case 1:
              return _context22.a(2);
          }
        }, _callee22);
      }))();
    }
  },
  expenses: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee23() {
        return _regenerator().w(function (_context23) {
          while (1) switch (_context23.n) {
            case 0:
              _context23.n = 1;
              return FB.getCollection('expenses');
            case 1:
              return _context23.a(2, _context23.v);
          }
        }, _callee23);
      }))();
    },
    add: function add(e) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee24() {
        return _regenerator().w(function (_context24) {
          while (1) switch (_context24.n) {
            case 0:
              if (!e.id) e.id = safeId().slice(0, 8);
              _context24.n = 1;
              return FB.addDoc('expenses', e);
            case 1:
              return _context24.a(2, _context24.v);
          }
        }, _callee24);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee25() {
        return _regenerator().w(function (_context25) {
          while (1) switch (_context25.n) {
            case 0:
              _context25.n = 1;
              return FB.removeDoc('expenses', id);
            case 1:
              return _context25.a(2);
          }
        }, _callee25);
      }))();
    }
  },
  incomes: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee26() {
        return _regenerator().w(function (_context26) {
          while (1) switch (_context26.n) {
            case 0:
              _context26.n = 1;
              return FB.getCollection('incomes');
            case 1:
              return _context26.a(2, _context26.v);
          }
        }, _callee26);
      }))();
    },
    add: function add(e) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee27() {
        return _regenerator().w(function (_context27) {
          while (1) switch (_context27.n) {
            case 0:
              if (!e.id) e.id = safeId().slice(0, 8);
              _context27.n = 1;
              return FB.addDoc('incomes', e);
            case 1:
              return _context27.a(2, _context27.v);
          }
        }, _callee27);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee28() {
        return _regenerator().w(function (_context28) {
          while (1) switch (_context28.n) {
            case 0:
              _context28.n = 1;
              return FB.removeDoc('incomes', id);
            case 1:
              return _context28.a(2);
          }
        }, _callee28);
      }))();
    }
  },
  advances: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee29() {
        return _regenerator().w(function (_context29) {
          while (1) switch (_context29.n) {
            case 0:
              _context29.n = 1;
              return FB.getCollection('advances');
            case 1:
              return _context29.a(2, _context29.v);
          }
        }, _callee29);
      }))();
    },
    add: function add(a) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee30() {
        return _regenerator().w(function (_context30) {
          while (1) switch (_context30.n) {
            case 0:
              if (!a.id) a.id = safeId().slice(0, 8);
              _context30.n = 1;
              return FB.addDoc('advances', a);
            case 1:
              return _context30.a(2, _context30.v);
          }
        }, _callee30);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee31() {
        return _regenerator().w(function (_context31) {
          while (1) switch (_context31.n) {
            case 0:
              _context31.n = 1;
              return FB.updateDoc('advances', id, data);
            case 1:
              return _context31.a(2);
          }
        }, _callee31);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee32() {
        return _regenerator().w(function (_context32) {
          while (1) switch (_context32.n) {
            case 0:
              _context32.n = 1;
              return FB.removeDoc('advances', id);
            case 1:
              return _context32.a(2);
          }
        }, _callee32);
      }))();
    }
  },
  salaryPayments: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee33() {
        return _regenerator().w(function (_context33) {
          while (1) switch (_context33.n) {
            case 0:
              _context33.n = 1;
              return FB.getCollection('salary_payments');
            case 1:
              return _context33.a(2, _context33.v);
          }
        }, _callee33);
      }))();
    },
    add: function add(p) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee34() {
        return _regenerator().w(function (_context34) {
          while (1) switch (_context34.n) {
            case 0:
              if (!p.id) p.id = safeId().slice(0, 8);
              _context34.n = 1;
              return FB.addDoc('salary_payments', p);
            case 1:
              return _context34.a(2, _context34.v);
          }
        }, _callee34);
      }))();
    }
  },
  customers: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee35() {
        return _regenerator().w(function (_context35) {
          while (1) switch (_context35.n) {
            case 0:
              _context35.n = 1;
              return FB.getCollection('customers');
            case 1:
              return _context35.a(2, _context35.v);
          }
        }, _callee35);
      }))();
    },
    add: function add(c) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee36() {
        return _regenerator().w(function (_context36) {
          while (1) switch (_context36.n) {
            case 0:
              if (!c.id) c.id = safeId().slice(0, 8);
              _context36.n = 1;
              return FB.addDoc('customers', c);
            case 1:
              return _context36.a(2, _context36.v);
          }
        }, _callee36);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee37() {
        return _regenerator().w(function (_context37) {
          while (1) switch (_context37.n) {
            case 0:
              _context37.n = 1;
              return FB.updateDoc('customers', id, data);
            case 1:
              return _context37.a(2);
          }
        }, _callee37);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee38() {
        return _regenerator().w(function (_context38) {
          while (1) switch (_context38.n) {
            case 0:
              _context38.n = 1;
              return FB.removeDoc('customers', id);
            case 1:
              return _context38.a(2);
          }
        }, _callee38);
      }))();
    }
  },
  inventory: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee39() {
        return _regenerator().w(function (_context39) {
          while (1) switch (_context39.n) {
            case 0:
              _context39.n = 1;
              return FB.getCollection('inventory');
            case 1:
              return _context39.a(2, _context39.v);
          }
        }, _callee39);
      }))();
    },
    add: function add(item) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee40() {
        return _regenerator().w(function (_context40) {
          while (1) switch (_context40.n) {
            case 0:
              if (!item.id) item.id = safeId().slice(0, 8);
              _context40.n = 1;
              return FB.addDoc('inventory', item);
            case 1:
              return _context40.a(2, _context40.v);
          }
        }, _callee40);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee41() {
        return _regenerator().w(function (_context41) {
          while (1) switch (_context41.n) {
            case 0:
              _context41.n = 1;
              return FB.updateDoc('inventory', id, data);
            case 1:
              return _context41.a(2);
          }
        }, _callee41);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee42() {
        return _regenerator().w(function (_context42) {
          while (1) switch (_context42.n) {
            case 0:
              _context42.n = 1;
              return FB.removeDoc('inventory', id);
            case 1:
              return _context42.a(2);
          }
        }, _callee42);
      }))();
    }
  },
  inventory_counts: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee43() {
        return _regenerator().w(function (_context43) {
          while (1) switch (_context43.n) {
            case 0:
              _context43.n = 1;
              return FB.getCollection('inventory_counts');
            case 1:
              return _context43.a(2, _context43.v);
          }
        }, _callee43);
      }))();
    },
    add: function add(c) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee44() {
        return _regenerator().w(function (_context44) {
          while (1) switch (_context44.n) {
            case 0:
              if (!c.id) c.id = safeId().slice(0, 8);
              _context44.n = 1;
              return FB.addDoc('inventory_counts', c);
            case 1:
              return _context44.a(2, _context44.v);
          }
        }, _callee44);
      }))();
    }
  },
  settings: {
    get: function get() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee45() {
        var all, o;
        return _regenerator().w(function (_context45) {
          while (1) switch (_context45.n) {
            case 0:
              _context45.n = 1;
              return FB.getCollection('settings');
            case 1:
              all = _context45.v;
              o = {};
              all.forEach(function (s) {
                return o[s.key] = s.value;
              });
              return _context45.a(2, o);
          }
        }, _callee45);
      }))();
    },
    save: function save(data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee46() {
        var existing, _loop, _i, _Object$entries;
        return _regenerator().w(function (_context47) {
          while (1) switch (_context47.n) {
            case 0:
              _context47.n = 1;
              return FB.getCollection('settings');
            case 1:
              existing = _context47.v;
              _loop = /*#__PURE__*/_regenerator().m(function _loop() {
                var _Object$entries$_i, key, value, found;
                return _regenerator().w(function (_context46) {
                  while (1) switch (_context46.n) {
                    case 0:
                      _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), key = _Object$entries$_i[0], value = _Object$entries$_i[1];
                      found = existing.find(function (s) {
                        return s.key === key;
                      });
                      if (!found) {
                        _context46.n = 2;
                        break;
                      }
                      _context46.n = 1;
                      return FB.updateDoc('settings', found.id, {
                        value: value
                      });
                    case 1:
                      _context46.n = 3;
                      break;
                    case 2:
                      _context46.n = 3;
                      return FB.addDoc('settings', {
                        key: key,
                        value: value
                      });
                    case 3:
                      return _context46.a(2);
                  }
                }, _loop);
              });
              _i = 0, _Object$entries = Object.entries(data);
            case 2:
              if (!(_i < _Object$entries.length)) {
                _context47.n = 4;
                break;
              }
              return _context47.d(_regeneratorValues(_loop()), 3);
            case 3:
              _i++;
              _context47.n = 2;
              break;
            case 4:
              return _context47.a(2);
          }
        }, _callee46);
      }))();
    }
  },
  categories: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee47() {
        return _regenerator().w(function (_context48) {
          while (1) switch (_context48.n) {
            case 0:
              _context48.n = 1;
              return FB.getCollection('categories');
            case 1:
              return _context48.a(2, _context48.v);
          }
        }, _callee47);
      }))();
    },
    add: function add(c) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee48() {
        return _regenerator().w(function (_context49) {
          while (1) switch (_context49.n) {
            case 0:
              if (!c.id) c.id = safeId().slice(0, 8);
              _context49.n = 1;
              return FB.addDoc('categories', c);
            case 1:
              return _context49.a(2, _context49.v);
          }
        }, _callee48);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee49() {
        return _regenerator().w(function (_context50) {
          while (1) switch (_context50.n) {
            case 0:
              _context50.n = 1;
              return FB.updateDoc('categories', id, data);
            case 1:
              return _context50.a(2);
          }
        }, _callee49);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee50() {
        return _regenerator().w(function (_context51) {
          while (1) switch (_context51.n) {
            case 0:
              _context51.n = 1;
              return FB.removeDoc('categories', id);
            case 1:
              return _context51.a(2);
          }
        }, _callee50);
      }))();
    }
  },
  users: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee51() {
        return _regenerator().w(function (_context52) {
          while (1) switch (_context52.n) {
            case 0:
              _context52.n = 1;
              return FB.getCollection('users');
            case 1:
              return _context52.a(2, _context52.v);
          }
        }, _callee51);
      }))();
    },
    add: function add(u) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee52() {
        return _regenerator().w(function (_context53) {
          while (1) switch (_context53.n) {
            case 0:
              _context53.n = 1;
              return FB.addDoc('users', u);
            case 1:
              return _context53.a(2, _context53.v);
          }
        }, _callee52);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee53() {
        return _regenerator().w(function (_context54) {
          while (1) switch (_context54.n) {
            case 0:
              _context54.n = 1;
              return FB.updateDoc('users', id, data);
            case 1:
              return _context54.a(2);
          }
        }, _callee53);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee54() {
        return _regenerator().w(function (_context55) {
          while (1) switch (_context55.n) {
            case 0:
              _context55.n = 1;
              return FB.removeDoc('users', id);
            case 1:
              return _context55.a(2);
          }
        }, _callee54);
      }))();
    }
  },
  daycloses: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee55() {
        return _regenerator().w(function (_context56) {
          while (1) switch (_context56.n) {
            case 0:
              _context56.n = 1;
              return FB.getCollection('daycloses');
            case 1:
              return _context56.a(2, _context56.v);
          }
        }, _callee55);
      }))();
    },
    today: function today() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee56() {
        var all, today;
        return _regenerator().w(function (_context57) {
          while (1) switch (_context57.n) {
            case 0:
              _context57.n = 1;
              return FB.getCollection('daycloses');
            case 1:
              all = _context57.v;
              today = localDateKey(FB.clockNow());
              return _context57.a(2, all.find(function (d) {
                return d.date && d.date.slice(0, 10) === today;
              }));
          }
        }, _callee56);
      }))();
    },
    byMonth: function byMonth(year, month) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee57() {
        var all, prefix;
        return _regenerator().w(function (_context58) {
          while (1) switch (_context58.n) {
            case 0:
              _context58.n = 1;
              return FB.getCollection('daycloses');
            case 1:
              all = _context58.v;
              prefix = "".concat(year, "-").concat(String(month).padStart(2, '0'));
              return _context58.a(2, all.filter(function (d) {
                return d.date && d.date.startsWith(prefix);
              }));
          }
        }, _callee57);
      }))();
    },
    close: function close(data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee58() {
        return _regenerator().w(function (_context59) {
          while (1) switch (_context59.n) {
            case 0:
              if (!data.id) data.id = 'dc-' + safeId().slice(0, 8);
              _context59.n = 1;
              return FB.addDoc('daycloses', data);
            case 1:
              return _context59.a(2, _context59.v);
          }
        }, _callee58);
      }))();
    }
  },
  shifts: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee59() {
        return _regenerator().w(function (_context60) {
          while (1) switch (_context60.n) {
            case 0:
              _context60.n = 1;
              return FB.getCollection('shifts');
            case 1:
              return _context60.a(2, _context60.v);
          }
        }, _callee59);
      }))();
    },
    getOpen: function getOpen() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee60() {
        var open;
        return _regenerator().w(function (_context61) {
          while (1) switch (_context61.n) {
            case 0:
              _context61.n = 1;
              return FB.queryCollection('shifts', 'closedAt', '==', null, 1);
            case 1:
              open = _context61.v;
              return _context61.a(2, open[0] || null);
          }
        }, _callee60);
      }))();
    },
    open: function open(name) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee61() {
        var now, shift;
        return _regenerator().w(function (_context62) {
          while (1) switch (_context62.n) {
            case 0:
              now = FB.clockNow();
              shift = {
                id: 'sh-' + safeId().slice(0, 8),
                openDate: localDateKey(now),
                openedAt: now.toISOString(),
                openedBy: name || 'الكاشير',
                closedAt: null
              };
              _context62.n = 1;
              return FB.addDoc('shifts', shift);
            case 1:
              return _context62.a(2, shift);
          }
        }, _callee61);
      }))();
    },
    close: function close(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee62() {
        return _regenerator().w(function (_context63) {
          while (1) switch (_context63.n) {
            case 0:
              _context63.n = 1;
              return FB.updateDoc('shifts', id, data);
            case 1:
              return _context63.a(2);
          }
        }, _callee62);
      }))();
    }
  },
  audit: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee63() {
        return _regenerator().w(function (_context64) {
          while (1) switch (_context64.n) {
            case 0:
              _context64.n = 1;
              return FB.getCollection('audit_logs');
            case 1:
              return _context64.a(2, _context64.v);
          }
        }, _callee63);
      }))();
    },
    log: function log(type, detail) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee64() {
        var user, _t2;
        return _regenerator().w(function (_context65) {
          while (1) switch (_context65.p = _context65.n) {
            case 0:
              _context65.p = 0;
              try {
                user = JSON.parse(sessionStorage.getItem('laguna_user'));
              } catch (e) {
                user = null;
              }
              _context65.n = 1;
              return FB.addDoc('audit_logs', {
                type: type,
                detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
                username: user ? user.username : 'unknown',
                role: user ? user.role : 'none',
                timestamp: FB.nowISO()
              });
            case 1:
              _context65.n = 3;
              break;
            case 2:
              _context65.p = 2;
              _t2 = _context65.v;
              console.warn('[audit]', _t2);
            case 3:
              return _context65.a(2);
          }
        }, _callee64, null, [[0, 2]]);
      }))();
    }
  },
  products: {
    all: function all() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee65() {
        return _regenerator().w(function (_context66) {
          while (1) switch (_context66.n) {
            case 0:
              _context66.n = 1;
              return FB.getCollection('products');
            case 1:
              return _context66.a(2, _context66.v);
          }
        }, _callee65);
      }))();
    },
    add: function add(p) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee66() {
        return _regenerator().w(function (_context67) {
          while (1) switch (_context67.n) {
            case 0:
              if (!p.id) p.id = safeId().slice(0, 8);
              _context67.n = 1;
              return FB.addDoc('products', p);
            case 1:
              return _context67.a(2, _context67.v);
          }
        }, _callee66);
      }))();
    },
    update: function update(id, data) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee67() {
        return _regenerator().w(function (_context68) {
          while (1) switch (_context68.n) {
            case 0:
              _context68.n = 1;
              return FB.updateDoc('products', id, data);
            case 1:
              return _context68.a(2);
          }
        }, _callee67);
      }))();
    },
    remove: function remove(id) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee68() {
        return _regenerator().w(function (_context69) {
          while (1) switch (_context69.n) {
            case 0:
              _context69.n = 1;
              return FB.removeDoc('products', id);
            case 1:
              return _context69.a(2);
          }
        }, _callee68);
      }))();
    }
  },
  migrateProductDescriptions: function migrateProductDescriptions() {
    var _this2 = this;
    return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee69() {
      var descMap, products, _iterator, _step, p, desc, _t3, _t4;
      return _regenerator().w(function (_context70) {
        while (1) switch (_context70.p = _context70.n) {
          case 0:
            descMap = {
              p88: 'برتقال - جوافة - ليمون - عسل',
              p89: 'كيوي - مانجا',
              p90: 'مانجو - جوافة - فراولة',
              p91: 'فراولة - كيوي - موز - برتقال',
              p92: 'موز - ايس كريم - مكسرات - كريمة',
              p93: 'اناناس - برتقال - خوخ',
              p94: 'مانجو - جوافة - فراولة',
              p95: 'صودا - برتقال',
              p96: 'صودا - برتقال - رمان سيرم',
              p97: 'باشون - بلوشيرم',
              p98: 'صودا - بلوبيري',
              p99: 'صودا - تفاح اخضر - كولا سيرم',
              p100: 'بريل - ليمون - نعناع',
              p101: 'اسبيرسو - رد بول'
            };
            _context70.n = 1;
            return _this2.products.all();
          case 1:
            _t3 = _context70.v;
            if (_t3) {
              _context70.n = 2;
              break;
            }
            _t3 = [];
          case 2:
            products = _t3;
            _iterator = _createForOfIteratorHelper(products);
            _context70.p = 3;
            _iterator.s();
          case 4:
            if ((_step = _iterator.n()).done) {
              _context70.n = 6;
              break;
            }
            p = _step.value;
            desc = descMap[p.id];
            if (!(desc && !p.description)) {
              _context70.n = 5;
              break;
            }
            _context70.n = 5;
            return _this2.products.update(p.id, {
              description: desc
            });
          case 5:
            _context70.n = 4;
            break;
          case 6:
            _context70.n = 8;
            break;
          case 7:
            _context70.p = 7;
            _t4 = _context70.v;
            _iterator.e(_t4);
          case 8:
            _context70.p = 8;
            _iterator.f();
            return _context70.f(8);
          case 9:
            return _context70.a(2);
        }
      }, _callee69, null, [[3, 7, 8, 9]]);
    }))();
  },
  seed: function seed() {
    var _this3 = this;
    return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee70() {
      var users, adminUser, adminHashed, _adminHashed, uid, snap, settings, cats, defaults, _i2, _defaults, c, employees, tables, i, customers, inventory, products, raw, descMap, prods, _iterator2, _step2, p, _t5, _t6;
      return _regenerator().w(function (_context71) {
        while (1) switch (_context71.p = _context71.n) {
          case 0:
            _context71.n = 1;
            return _this3.users.all();
          case 1:
            users = _context71.v;
            adminUser = users.find(function (u) {
              return u.username === 'admin';
            });
            if (!adminUser) {
              _context71.n = 4;
              break;
            }
            if (PASSWORD_UTILS.isHashed(adminUser.password)) {
              _context71.n = 3;
              break;
            }
            _context71.n = 2;
            return PASSWORD_UTILS.hash('admin123');
          case 2:
            adminHashed = _context71.v;
            _context71.n = 3;
            return _this3.users.update(adminUser.id, {
              password: adminHashed
            })["catch"](function () {});
          case 3:
            _context71.n = 11;
            break;
          case 4:
            _context71.n = 5;
            return PASSWORD_UTILS.hash('admin123');
          case 5:
            _adminHashed = _context71.v;
            uid = FB.getUid();
            if (!uid) {
              _context71.n = 10;
              break;
            }
            _context71.p = 6;
            _context71.n = 7;
            return FB.getDb().collection('user_mappings').doc(uid).get();
          case 7:
            snap = _context71.v;
            if (snap.exists) {
              _context71.n = 8;
              break;
            }
            _context71.n = 8;
            return FB.getDb().collection('user_mappings').doc(uid).set({
              userId: 'u1',
              role: 'Administrator',
              username: 'admin',
              name: 'الكاشير',
              updatedAt: FB.nowISO()
            });
          case 8:
            _context71.n = 10;
            break;
          case 9:
            _context71.p = 9;
            _t5 = _context71.v;
            console.warn('[seed] mapping error:', _t5);
          case 10:
            _context71.n = 11;
            return _this3.users.add({
              id: 'u1',
              username: 'admin',
              password: _adminHashed,
              name: 'الكاشير',
              role: 'Administrator'
            });
          case 11:
            console.warn('%c[seed] 👤 كاشير: admin / admin123', 'font-size:14px;font-weight:bold');
            _context71.n = 12;
            return _this3.settings.get();
          case 12:
            settings = _context71.v;
            if (!settings._seeded) {
              _context71.n = 13;
              break;
            }
            return _context71.a(2);
          case 13:
            _context71.n = 14;
            return _this3.categories.all();
          case 14:
            cats = _context71.v;
            if (!(cats.length === 0)) {
              _context71.n = 17;
              break;
            }
            defaults = [{
              slug: 'coffee',
              name: 'قهوة',
              order: 1
            }, {
              slug: 'hot',
              name: 'مشروبات ساخنة',
              order: 2
            }, {
              slug: 'ice',
              name: 'آيس كوفي',
              order: 3
            }, {
              slug: 'matcha',
              name: 'ماتشا',
              order: 4
            }, {
              slug: 'frappe',
              name: 'فرابيه',
              order: 5
            }, {
              slug: 'smoothie',
              name: 'سموزي',
              order: 6
            }, {
              slug: 'milkshake',
              name: 'ميلك شيك',
              order: 7
            }, {
              slug: 'yogurt',
              name: 'زبادي',
              order: 8
            }, {
              slug: 'juice',
              name: 'عصائر فريش',
              order: 9
            }, {
              slug: 'cocktail',
              name: 'كوكتيلات',
              order: 10
            }, {
              slug: 'mojito',
              name: 'موهيتو',
              order: 11
            }, {
              slug: 'cans',
              name: 'كانز',
              order: 12
            }, {
              slug: 'desserts',
              name: 'حلويات',
              order: 13
            }];
            _i2 = 0, _defaults = defaults;
          case 15:
            if (!(_i2 < _defaults.length)) {
              _context71.n = 17;
              break;
            }
            c = _defaults[_i2];
            _context71.n = 16;
            return _this3.categories.add(c);
          case 16:
            _i2++;
            _context71.n = 15;
            break;
          case 17:
            _context71.n = 18;
            return _this3.employees.all();
          case 18:
            employees = _context71.v;
            if (!(employees.length === 0)) {
              _context71.n = 20;
              break;
            }
            _context71.n = 19;
            return _this3.employees.add({
              id: 'e1',
              name: 'أحمد موظف',
              job: 'ويتر',
              phone: '01012345678',
              salary: '3000',
              hireDate: '2025-01-15',
              status: 'active',
              pin: '1234'
            });
          case 19:
            _context71.n = 20;
            return _this3.employees.add({
              id: 'e2',
              name: 'محمد موظف',
              job: 'شيف',
              phone: '01198765432',
              salary: '5000',
              hireDate: '2025-02-01',
              status: 'active',
              pin: '5678'
            });
          case 20:
            _context71.n = 21;
            return _this3.tables.all();
          case 21:
            tables = _context71.v;
            if (!(tables.length === 0)) {
              _context71.n = 24;
              break;
            }
            i = 1;
          case 22:
            if (!(i <= 12)) {
              _context71.n = 24;
              break;
            }
            _context71.n = 23;
            return _this3.tables.add({
              id: 't' + i,
              name: 'طاولة ' + i,
              capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
              status: 'available',
              currentOrder: null,
              hasService: i > 6
            });
          case 23:
            i++;
            _context71.n = 22;
            break;
          case 24:
            _context71.n = 25;
            return _this3.customers.all();
          case 25:
            customers = _context71.v;
            if (!(customers.length === 0)) {
              _context71.n = 27;
              break;
            }
            _context71.n = 26;
            return _this3.customers.add({
              id: 'c1',
              name: 'أحمد محمد',
              phone: '01012345678',
              totalSpent: 1200,
              visits: 15,
              lastVisit: FB.nowISO()
            });
          case 26:
            _context71.n = 27;
            return _this3.customers.add({
              id: 'c2',
              name: 'محمد علي',
              phone: '01198765432',
              totalSpent: 850,
              visits: 8,
              lastVisit: FB.nowISO()
            });
          case 27:
            _context71.n = 28;
            return _this3.inventory.all();
          case 28:
            inventory = _context71.v;
            if (!(inventory.length === 0)) {
              _context71.n = 31;
              break;
            }
            _context71.n = 29;
            return _this3.inventory.add({
              id: 'i1',
              name: 'قهوة تركية',
              category: 'قهوة',
              quantity: 50,
              unit: 'كجم',
              minQuantity: 10
            });
          case 29:
            _context71.n = 30;
            return _this3.inventory.add({
              id: 'i2',
              name: 'حليب',
              category: 'ألبان',
              quantity: 30,
              unit: 'لتر',
              minQuantity: 5
            });
          case 30:
            _context71.n = 31;
            return _this3.inventory.add({
              id: 'i3',
              name: 'سكر',
              category: 'مواد جافة',
              quantity: 100,
              unit: 'كجم',
              minQuantity: 20
            });
          case 31:
            _context71.n = 32;
            return _this3.products.all();
          case 32:
            products = _context71.v;
            if (!(products.length === 0)) {
              _context71.n = 39;
              break;
            }
            raw = 'p1^سنجل تركي^Single Turkish Coffee^coffee^30^images/menu/سنجل تركي.webp|p2^دبل تركي^Double Turkish Coffee^coffee^35^images/menu/دبل تركي.webp|p3^فرنساوي^French Press^coffee^45^images/menu/فرنساوي.webp|p4^قهوة نكهات^Flavored Coffee^coffee^45^images/menu/قهوة نكهات.webp|p5^نسكافية حليب^Nescafe with Milk^coffee^50^images/menu/نسكافية حليب.png|p6^سنجل اسبرسو^Single Espresso^coffee^40^images/menu/سنجل اسبرسو.webp|p7^دبل اسبرسو^Double Espresso^coffee^55^images/menu/دبل اسبرسو.webp|p8^ميكاتو^Mecato^coffee^50^images/menu/ميكاتو.png|p9^دبل ميكاتو^Double Mecato^coffee^60^images/menu/دبل ميكاتو.png|p10^امريكان كوفي^American Coffee^coffee^50^images/menu/امريكان كوفي.png|p11^لاتيه^Latte^coffee^60^images/menu/لاتيه.webp|p12^كابتشينو^Cappuccino^coffee^60^images/menu/كابتشينو.webp|p13^كابتشينو فليفر^Flavored Cappuccino^coffee^65^images/menu/كابتشينو فليفر.png|p14^دارك موكا^Dark Mocha^coffee^50^images/menu/دارك موكا.webp|p15^وايت موكا^White Mocha^coffee^59^images/menu/وايت موكا.webp|p16^كورتادو^Cortado^coffee^65^images/menu/كورتادو.webp|p17^لاتيه فليفر^Flavored Latte^coffee^65^images/menu/لاتيه فليفر.png|p18^شاي احمر^Red Tea^hot^20^images/menu/شاي احمر.webp|p19^شاي اخضر^Green Tea^hot^25^images/menu/شاي اخضر.webp|p20^شاي فواكة^Fruit Tea^hot^25^images/menu/شاي فواكة.png|p21^شاي بلبن^Tea with Milk^hot^50^images/menu/شاي بلبن.webp|p22^شاي كومبليت^Complete Tea^hot^25^images/menu/شاي كومبليت.png|p23^براد شاي^Tea Pot^hot^60^images/menu/براد شاي.webp|p24^اعشاب^Herbal Tea^hot^25^images/menu/اعشاب.webp|p25^قرفة^Cinnamon^hot^30^images/menu/قرفة.webp|p26^سحلب^Sahlab^hot^50^images/menu/سحلب.webp|p27^جنزبيل^Ginger^hot^30^images/menu/جنزبيل.png|p28^هوت سيدر^Hot Cider^hot^45^images/menu/هوت سيدر.png|p29^هوت شوكلت^Hot Chocolate^hot^50^images/menu/هوت شوكلت.webp|p30^هوت كاراميل^Hot Caramel^hot^55^images/menu/هوت كاراميل.png|p31^هوت نوتيلا^Hot Nutella^hot^55^images/menu/هوت نوتيلا.png|p32^هوت مارشملو^Hot Marshmallow^hot^55^images/menu/هوت مارشملو.png|p33^هوت اوريو^Hot Oreo^hot^55^images/menu/هوت اوريو.png|p34^آيس كوفي^Iced Coffee^ice^65^images/menu/آيس كوفي.webp|p35^آيس موكا^Iced Mocha^ice^75^images/menu/آيس موكا.webp|p36^آيس لاتيه^Iced Latte^ice^65^images/menu/آيس لاتيه.webp|p37^آيس موكا وايت^Iced White Mocha^ice^70^images/menu/آيس موكا وايت.png|p39^آيس لاتيه فليفر^Iced Flavored Latte^ice^70^images/menu/آيس لاتيه فليفر.png|p40^آيس ماتشا^Iced Matcha^matcha^70^images/menu/آيس ماتشا.webp|p41^ماتشا فرابيه^Matcha Frappe^matcha^80^images/menu/ماتشا فرابيه.webp|p42^شوكلت^Chocolate Frappe^frappe^60^images/menu/فرابيه شوكلت.webp|p43^كارميل^Caramel Frappe^frappe^65^images/menu/فرابيه كارميل.webp|p44^فانيليا^Vanilla Frappe^frappe^65^images/menu/فرابيه فانيليا.webp|p45^بندق^Hazelnut Frappe^frappe^65^images/menu/فرابيه بندق.webp|p46^بيستاشيو^Pistachio Frappe^frappe^70^images/menu/فرابيه بيستاشيو.webp|p47^نوتيلا^Nutella Frappe^frappe^65^images/menu/فرابيه نوتيلا.webp|p48^تفاح اخضر^Green Apple Smoothie^smoothie^50^images/menu/اسموزي تفاح اخضر.png|p49^خوخ^Peach Smoothie^smoothie^50^images/menu/اسموزي خوخ.png|p50^اناناس^Pineapple Smoothie^smoothie^50^images/menu/اسموزي اناناس.png|p51^باشن فروت^Passion Fruit Smoothie^smoothie^50^images/menu/اسموزي باشن فروت.webp|p52^مانجو^Mango Smoothie^smoothie^55^images/menu/اسموزي مانجو.webp|p53^بطيخ^Watermelon Smoothie^smoothie^55^images/menu/بطيخ.webp|p54^فراولة^Strawberry Smoothie^smoothie^55^images/menu/فراولة.webp|p55^ميكس بيري^Mixed Berry Smoothie^smoothie^55^images/menu/اسموزي ميكس بيري.webp|p56^كيوي^Kiwi Smoothie^smoothie^60^images/menu/كيوي.webp|p57^شوكلت^Chocolate Milkshake^milkshake^60^images/menu/ميلك شيك شوكلت.webp|p58^كراميل^Caramel Milkshake^milkshake^60^images/menu/ميلك شيك كراميل.webp|p59^فانيليا^Vanilla Milkshake^milkshake^60^images/menu/ميلك شيك فانيليا.webp|p60^فراولة^Strawberry Milkshake^milkshake^65^images/menu/فراولة.webp|p61^خوخ^Peach Milkshake^milkshake^60^images/menu/ميلك شيك خوخ.webp|p62^مانجا^Mango Milkshake^milkshake^65^images/menu/مانجا.webp|p63^بندق^Hazelnut Milkshake^milkshake^65^images/menu/ميلك شيك بندق.png|p64^بلو بيري^Blueberry Milkshake^milkshake^60^images/menu/ميلك شيك بلو بيري.png|p65^مكس بيري^Mixed Berry Milkshake^milkshake^60^images/menu/ميلك شيك مكس بيري.webp|p66^نوتيلا^Nutella Milkshake^milkshake^65^images/menu/ميلك شيك نوتيلا.webp|p67^وايت نوتيلا براوني^White Nutella Brownie Milkshake^milkshake^70^images/menu/ميلك شيك وايت نوتيلا براوني.png|p68^باشون فروت^Passion Fruit Milkshake^milkshake^65^images/menu/ميلك شيك باشون فروت.png|p69^كلاسيك^Classic Yogurt^yogurt^60^images/menu/زبادي كلاسيك.png|p70^مانجو^Mango Yogurt^yogurt^70^images/menu/زبادي مانجو.webp|p71^فراوله^Strawberry Yogurt^yogurt^70^images/menu/زبادي فراوله.png|p72^خوخ^Peach Yogurt^yogurt^70^images/menu/زبادي خوخ.webp|p73^موز^Banana Yogurt^yogurt^70^images/menu/موز.webp|p74^بلو بيري^Blueberry Yogurt^yogurt^70^images/menu/زبادي بلو بيري.webp|p75^باشن فروت^Passion Fruit Yogurt^yogurt^70^images/menu/زبادي باشن فروت.webp|p76^عسل^Honey Yogurt^yogurt^65^images/menu/زبادي عسل.png|p77^مكس فواكه^Mixed Fruit Yogurt^yogurt^80^images/menu/زبادي مكس فواكه.png|p78^ليمون^Lemon Juice^juice^50^images/menu/ليمون.webp|p79^ليمون نعناع^Mint Lemon Juice^juice^55^images/menu/ليمون نعناع.webp|p80^برتقال^Orange Juice^juice^60^images/menu/برتقال.webp|p81^فراولة^Strawberry Juice^juice^60^images/menu/فراولة.webp|p82^مانجا^Mango Juice^juice^70^images/menu/مانجا.webp|p83^جوافه^Guava Juice^juice^70^images/menu/جوافه.webp|p84^موز^Banana Juice^juice^70^images/menu/موز.webp|p85^بطيخ^Watermelon Juice^juice^60^images/menu/بطيخ.webp|p86^بلح^Dates Juice^juice^75^images/menu/بلح.png|p87^افوكادو^Avocado Juice^juice^80^images/menu/افوكادو.webp|p88^ديلايت بانش^Delight Punch^cocktail^65^images/menu/ديلايت بانش.png|p89^تيمارا^Timara^cocktail^65^images/menu/تيمارا.png|p90^فلوريدا^Florida^cocktail^65^images/menu/فلوريدا.webp|p91^دابومبا^Dabumba^cocktail^70^images/menu/دابومبا.png|p92^وايت اوشن^White Ocean^cocktail^70^images/menu/وايت اوشن.webp|p93^شهر زاد^Shahrzad^cocktail^70^images/menu/شهر زاد.png|p94^لاروز^La Rose^cocktail^75^images/menu/لاروز.png|p95^صن رايز^Sunrise Mojito^mojito^50^images/menu/موهيتو صن رايز.webp|p96^صن شاين^Sunshine Mojito^mojito^50^images/menu/موهيتو صن شاين.webp|p97^باشون فروت^Passion Fruit Mojito^mojito^50^images/menu/موهيتو باشون فروت.png|p98^توت^Berry Mojito^mojito^50^images/menu/موهيتو توت.png|p99^شيري كولا^Cherry Cola Mojito^mojito^50^images/menu/موهيتو شيري كولا.png|p100^موهيتو شعير^Barley Mojito^mojito^55^images/menu/موهيتو شعير.png|p101^باور صودا^Power Soda Mojito^mojito^75^images/menu/باور صودا.png|p102^بيبسي^Pepsi^cans^30^images/menu/بيبسي.webp|p103^بيبسي دايت^Diet Pepsi^cans^30^images/menu/بيبسي دايت.webp|p104^اسبرايت^Sprite^cans^30^images/menu/اسبرايت.webp|p105^ميرندا^Miranda^cans^30^images/menu/ميرندا.webp|p106^فانتا^Fanta^cans^30^images/menu/فانتا.webp|p107^سفن اب^7UP^cans^30^images/menu/سفن اب.webp|p108^ماونتن ديو^Mountain Dew^cans^30^images/menu/ماونتن ديو.webp|p109^تويست^Twist^cans^30^images/menu/تويست.webp|p110^شويبس^Schweppes^cans^30^images/menu/شويبس.webp|p111^فيروز^Fayrouz^cans^35^images/menu/فيروز.webp|p112^في كولا^V Cola^cans^35^images/menu/في كولا.webp|p113^فيوري^Fuego^cans^30^images/menu/فيوري.webp|p114^بيريل^Birell^cans^35^images/menu/بيريل.webp|p115^ريد بول^Red Bull^cans^75^images/menu/ريد بول.webp|p116^مونستر^Monster^cans^75^images/menu/مونستر.webp|p117^وافل دارك^Dark Waffle^desserts^65^images/menu/وافل دارك.png|p118^وافل نوتيلا^Nutella Waffle^desserts^70^images/menu/وافل نوتيلا.png|p119^وافل وايت^White Waffle^desserts^70^images/menu/وافل وايت.png|p120^وافل لوتس^Lotus Waffle^desserts^70^images/menu/وافل لوتس.png|p121^وافل اوريو^Oreo Waffle^desserts^75^images/menu/وافل اوريو.png|p122^وافل ايس كريم & موز^Ice Cream & Banana Waffle^desserts^80^images/menu/وافل ايس كريم & موز.png|p123^مولتن كيك^Molten Cake^desserts^65^images/menu/مولتن كيك.png|p124^مولتن ايس كريم^Molten Ice Cream^desserts^70^images/menu/مولتن ايس كريم.png|p125^سينابون^Cinnabon^desserts^55^images/menu/سينابون.png|p126^سينابون نوتيلا^Nutella Cinnabon^desserts^60^images/menu/سينابون نوتيلا.png|p127^براونيز^Brownies^desserts^50^images/menu/براونيز.png|p128^فروت سالط^Fruit Salad^desserts^60^images/menu/فروت سالط.png|p129^ايس كريم^Ice Cream^desserts^70^images/menu/فروت سالط ايس كريم.png|p130^ايس كريم مكسرات^Ice Cream with Nuts^desserts^75^images/menu/فروت سالط ايس كريم مكسرات.png';
            descMap = {
              p88: 'برتقال - جوافة - ليمون - عسل',
              p89: 'كيوي - مانجا',
              p90: 'مانجو - جوافة - فراولة',
              p91: 'فراولة - كيوي - موز - برتقال',
              p92: 'موز - ايس كريم - مكسرات - كريمة',
              p93: 'اناناس - برتقال - خوخ',
              p94: 'مانجو - جوافة - فراولة',
              p95: 'صودا - برتقال',
              p96: 'صودا - برتقال - رمان سيرم',
              p97: 'باشون - بلوشيرم',
              p98: 'صودا - بلوبيري',
              p99: 'صودا - تفاح اخضر - كولا سيرم',
              p100: 'بريل - ليمون - نعناع',
              p101: 'اسبيرسو - رد بول'
            };
            prods = raw.split('|').map(function (s) {
              var _s$split = s.split('^'),
                _s$split2 = _slicedToArray(_s$split, 6),
                id = _s$split2[0],
                name = _s$split2[1],
                nameEn = _s$split2[2],
                category = _s$split2[3],
                price = _s$split2[4],
                image = _s$split2[5];
              return {
                id: id,
                name: name,
                nameEn: nameEn,
                category: category,
                price: Number(price),
                image: image || '',
                description: descMap[id] || '',
                available: 1
              };
            });
            _iterator2 = _createForOfIteratorHelper(prods);
            _context71.p = 33;
            _iterator2.s();
          case 34:
            if ((_step2 = _iterator2.n()).done) {
              _context71.n = 36;
              break;
            }
            p = _step2.value;
            _context71.n = 35;
            return _this3.products.add(p);
          case 35:
            _context71.n = 34;
            break;
          case 36:
            _context71.n = 38;
            break;
          case 37:
            _context71.p = 37;
            _t6 = _context71.v;
            _iterator2.e(_t6);
          case 38:
            _context71.p = 38;
            _iterator2.f();
            return _context71.f(38);
          case 39:
            _context71.n = 40;
            return _this3.migrateProductDescriptions();
          case 40:
            _context71.n = 41;
            return _this3.settings.save({
              _seeded: true
            });
          case 41:
            return _context71.a(2);
        }
      }, _callee70, null, [[33, 37, 38, 39], [6, 9]]);
    }))();
  }
};

