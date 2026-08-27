function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
window.PRINTER = function () {
  var printers = [];
  var wsProxy = null;
  var nextId = 1;
  function escposText(text) {
    var encoder = new TextEncoder();
    return encoder.encode(text + '\n');
  }
  function escposCmd() {
    var bytes = Array.prototype.slice.call(arguments);
    return new Uint8Array(bytes);
  }
  function escposInit() {
    return concatenate([escposCmd(0x1B, 0x40), escposCmd(0x1B, 0x61, 0x01)]);
  }
  function escposBold(on) {
    return escposCmd(0x1B, 0x45, on ? 1 : 0);
  }
  function escposCut() {
    return escposCmd(0x1D, 0x56, 0x00);
  }
  function escposOpenDrawer() {
    return escposCmd(0x1B, 0x70, 0x00, 0x19, 0xFA);
  }
  function concatenate(arrays) {
    var totalLen = 0;
    arrays.forEach(function (a) {
      totalLen += a.length;
    });
    var result = new Uint8Array(totalLen);
    var offset = 0;
    arrays.forEach(function (a) {
      result.set(a, offset);
      offset += a.length;
    });
    return result;
  }
  function buildReceiptData(_x) {
    return _buildReceiptData.apply(this, arguments);
  }
  function _buildReceiptData() {
    _buildReceiptData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(inv) {
      var tpl, _t5;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.p = _context0.n) {
          case 0:
            _context0.p = 0;
            _context0.n = 1;
            return TEMPLATE.getEscposTemplate('cashier');
          case 1:
            tpl = _context0.v;
            return _context0.a(2, TEMPLATE.renderEscpos(inv, tpl, 'cashier'));
          case 2:
            _context0.p = 2;
            _t5 = _context0.v;
            return _context0.a(2, TEMPLATE.renderEscpos(inv, null, 'cashier'));
        }
      }, _callee0, null, [[0, 2]]);
    }));
    return _buildReceiptData.apply(this, arguments);
  }
  function buildKitchenOrderData(_x2) {
    return _buildKitchenOrderData.apply(this, arguments);
  }
  function _buildKitchenOrderData() {
    _buildKitchenOrderData = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(inv) {
      var tpl, _t6;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            _context1.p = 0;
            _context1.n = 1;
            return TEMPLATE.getEscposTemplate('kitchen');
          case 1:
            tpl = _context1.v;
            return _context1.a(2, TEMPLATE.renderEscpos(inv, tpl, 'kitchen'));
          case 2:
            _context1.p = 2;
            _t6 = _context1.v;
            return _context1.a(2, TEMPLATE.renderEscpos(inv, null, 'kitchen'));
        }
      }, _callee1, null, [[0, 2]]);
    }));
    return _buildKitchenOrderData.apply(this, arguments);
  }
  function connectUSB() {
    return {
      type: 'usb',
      device: null,
      endpoint: null,
      connect: function connect() {
        var _this = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
          var filters, dev, iface, _iterator, _step, ep, _t;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.p = _context.n) {
              case 0:
                filters = [{
                  vendorId: 0x04b8
                }, {
                  vendorId: 0x04b9
                }, {
                  vendorId: 0x0416
                }, {
                  vendorId: 0x067b
                }, {
                  vendorId: 0x0fe6
                }, {
                  vendorId: 0x0525
                }, {
                  vendorId: 0x1fc9
                }, {
                  vendorId: 0x0456
                }, {
                  vendorId: 0x1504
                }, {
                  vendorId: 0x0dd4
                }, {
                  vendorId: 0x0483
                }];
                _context.n = 1;
                return navigator.usb.requestDevice({
                  filters: filters
                });
              case 1:
                dev = _context.v;
                _this.device = dev;
                _context.n = 2;
                return dev.open();
              case 2:
                if (!(dev.configuration === null)) {
                  _context.n = 3;
                  break;
                }
                _context.n = 3;
                return dev.selectConfiguration(1);
              case 3:
                _context.n = 4;
                return dev.claimInterface(0);
              case 4:
                iface = dev.configuration.interfaces[0];
                _iterator = _createForOfIteratorHelper(iface.alternate.endpoints);
                _context.p = 5;
                _iterator.s();
              case 6:
                if ((_step = _iterator.n()).done) {
                  _context.n = 8;
                  break;
                }
                ep = _step.value;
                if (!(ep.direction === 'out')) {
                  _context.n = 7;
                  break;
                }
                _this.endpoint = ep.endpointNumber;
                return _context.a(3, 8);
              case 7:
                _context.n = 6;
                break;
              case 8:
                _context.n = 10;
                break;
              case 9:
                _context.p = 9;
                _t = _context.v;
                _iterator.e(_t);
              case 10:
                _context.p = 10;
                _iterator.f();
                return _context.f(10);
              case 11:
                if (_this.endpoint) {
                  _context.n = 12;
                  break;
                }
                throw new Error('لم يتم العثور على منفذ USB للطباعة');
              case 12:
                return _context.a(2);
            }
          }, _callee, null, [[5, 9, 10, 11]]);
        }))();
      },
      disconnect: function disconnect() {
        var _this2 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
          var _t2;
          return _regenerator().w(function (_context2) {
            while (1) switch (_context2.p = _context2.n) {
              case 0:
                if (!_this2.device) {
                  _context2.n = 4;
                  break;
                }
                _context2.p = 1;
                _context2.n = 2;
                return _this2.device.close();
              case 2:
                _context2.n = 4;
                break;
              case 3:
                _context2.p = 3;
                _t2 = _context2.v;
              case 4:
                return _context2.a(2);
            }
          }, _callee2, null, [[1, 3]]);
        }))();
      },
      send: function send(data) {
        var _this3 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
          return _regenerator().w(function (_context3) {
            while (1) switch (_context3.n) {
              case 0:
                if (!(!_this3.device || !_this3.endpoint)) {
                  _context3.n = 1;
                  break;
                }
                throw new Error('الطابعة غير متصلة');
              case 1:
                _context3.n = 2;
                return _this3.device.transferOut(_this3.endpoint, data);
              case 2:
                return _context3.a(2);
            }
          }, _callee3);
        }))();
      }
    };
  }
  function connectWiFi(host, port) {
    return {
      type: 'wifi',
      host: host,
      port: port,
      ws: null,
      connect: function connect() {
        var _this4 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
          var proxyUrl, self;
          return _regenerator().w(function (_context4) {
            while (1) switch (_context4.n) {
              case 0:
                proxyUrl = localStorage.getItem('laguna_printer_proxy') || 'ws://localhost:9090';
                self = _this4;
                _this4.ws = new WebSocket(proxyUrl);
                _context4.n = 1;
                return new Promise(function (resolve, reject) {
                  self.ws.onopen = function () {
                    self.ws.send(JSON.stringify({
                      action: 'connect',
                      host: self.host,
                      port: self.port
                    }));
                    resolve();
                  };
                  self.ws.onerror = function () {
                    reject(new Error('فشل الاتصال بالوكيل'));
                  };
                  self.ws.onclose = function () {
                    if (self.ws) self.ws = null;
                  };
                  setTimeout(function () {
                    reject(new Error('انتهت مهلة الاتصال'));
                  }, 5000);
                });
              case 1:
                return _context4.a(2);
            }
          }, _callee4);
        }))();
      },
      disconnect: function disconnect() {
        var _this5 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
          return _regenerator().w(function (_context5) {
            while (1) switch (_context5.n) {
              case 0:
                if (_this5.ws) {
                  try {
                    _this5.ws.close();
                  } catch (e) {}
                  _this5.ws = null;
                }
              case 1:
                return _context5.a(2);
            }
          }, _callee5);
        }))();
      },
      send: function send(data) {
        var _this6 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
          return _regenerator().w(function (_context6) {
            while (1) switch (_context6.n) {
              case 0:
                if (_this6.ws) {
                  _context6.n = 1;
                  break;
                }
                throw new Error('الطابعة غير متصلة');
              case 1:
                _this6.ws.send(data);
              case 2:
                return _context6.a(2);
            }
          }, _callee6);
        }))();
      }
    };
  }
  function connectBluetooth() {
    return {
      type: 'bluetooth',
      device: null,
      service: null,
      "char": null,
      connect: function connect() {
        var _this7 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
          var dev, server, svc, chars, _iterator2, _step2, c, _t3, _t4;
          return _regenerator().w(function (_context7) {
            while (1) switch (_context7.p = _context7.n) {
              case 0:
                _context7.n = 1;
                return navigator.bluetooth.requestDevice({
                  filters: [{
                    services: [0x1812]
                  }],
                  optionalServices: ['00001812-0000-1000-8000-00805f9b34fb', '000018f0-0000-1000-8000-00805f9b34fb']
                });
              case 1:
                dev = _context7.v;
                _this7.device = dev;
                _context7.n = 2;
                return dev.gatt.connect();
              case 2:
                server = _context7.v;
                _context7.p = 3;
                _context7.n = 4;
                return server.getPrimaryService(0x1812);
              case 4:
                svc = _context7.v;
                _context7.n = 7;
                break;
              case 5:
                _context7.p = 5;
                _t3 = _context7.v;
                _context7.n = 6;
                return server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
              case 6:
                svc = _context7.v;
              case 7:
                _this7.service = svc;
                _context7.n = 8;
                return svc.getCharacteristics();
              case 8:
                chars = _context7.v;
                _iterator2 = _createForOfIteratorHelper(chars);
                _context7.p = 9;
                _iterator2.s();
              case 10:
                if ((_step2 = _iterator2.n()).done) {
                  _context7.n = 12;
                  break;
                }
                c = _step2.value;
                if (!(c.properties.write || c.properties.writeWithoutResponse)) {
                  _context7.n = 11;
                  break;
                }
                _this7["char"] = c;
                return _context7.a(3, 12);
              case 11:
                _context7.n = 10;
                break;
              case 12:
                _context7.n = 14;
                break;
              case 13:
                _context7.p = 13;
                _t4 = _context7.v;
                _iterator2.e(_t4);
              case 14:
                _context7.p = 14;
                _iterator2.f();
                return _context7.f(14);
              case 15:
                if (_this7["char"]) {
                  _context7.n = 16;
                  break;
                }
                throw new Error('لم يتم العثور على خاصية الكتابة');
              case 16:
                return _context7.a(2);
            }
          }, _callee7, null, [[9, 13, 14, 15], [3, 5]]);
        }))();
      },
      disconnect: function disconnect() {
        var _this8 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
          return _regenerator().w(function (_context8) {
            while (1) switch (_context8.n) {
              case 0:
                if (_this8.device) {
                  try {
                    _this8.device.gatt.disconnect();
                  } catch (e) {}
                }
              case 1:
                return _context8.a(2);
            }
          }, _callee8);
        }))();
      },
      send: function send(data) {
        var _this9 = this;
        return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
          return _regenerator().w(function (_context9) {
            while (1) switch (_context9.n) {
              case 0:
                if (_this9["char"]) {
                  _context9.n = 1;
                  break;
                }
                throw new Error('الطابعة غير متصلة');
              case 1:
                _context9.n = 2;
                return _this9["char"].writeValue(data);
              case 2:
                return _context9.a(2);
            }
          }, _callee9);
        }))();
      }
    };
  }
  function addPrinter(_x3, _x4) {
    return _addPrinter.apply(this, arguments);
  }
  function _addPrinter() {
    _addPrinter = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(type, config) {
      var driver, printer;
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.n) {
          case 0:
            if (!config) config = {};
            if (!(type === 'usb')) {
              _context10.n = 1;
              break;
            }
            driver = connectUSB();
            _context10.n = 5;
            break;
          case 1:
            if (!(type === 'wifi')) {
              _context10.n = 3;
              break;
            }
            if (config.host) {
              _context10.n = 2;
              break;
            }
            throw new Error('يرجى إدخال عنوان IP الطابعة');
          case 2:
            driver = connectWiFi(config.host, config.port || 9100);
            _context10.n = 5;
            break;
          case 3:
            if (!(type === 'bluetooth')) {
              _context10.n = 4;
              break;
            }
            driver = connectBluetooth();
            _context10.n = 5;
            break;
          case 4:
            throw new Error('نوع طابعة غير معروف: ' + type);
          case 5:
            _context10.n = 6;
            return driver.connect();
          case 6:
            printer = {
              id: 'prn_' + nextId++,
              name: config.name || (type === 'usb' ? 'USB' : type === 'wifi' ? 'WiFi' : 'Bluetooth'),
              type: type,
              driver: driver,
              connected: true,
              active: true,
              forKitchen: config.forKitchen || false
            };
            printers.push(printer);
            savePrinters();
            return _context10.a(2, printer);
        }
      }, _callee10);
    }));
    return _addPrinter.apply(this, arguments);
  }
  function removePrinter(_x5) {
    return _removePrinter.apply(this, arguments);
  }
  function _removePrinter() {
    _removePrinter = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(id) {
      var idx, p, _t7;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.p = _context11.n) {
          case 0:
            idx = printers.findIndex(function (p) {
              return p.id === id;
            });
            if (!(idx === -1)) {
              _context11.n = 1;
              break;
            }
            return _context11.a(2);
          case 1:
            p = printers[idx];
            _context11.p = 2;
            _context11.n = 3;
            return p.driver.disconnect();
          case 3:
            _context11.n = 5;
            break;
          case 4:
            _context11.p = 4;
            _t7 = _context11.v;
          case 5:
            printers.splice(idx, 1);
            savePrinters();
          case 6:
            return _context11.a(2);
        }
      }, _callee11, null, [[2, 4]]);
    }));
    return _removePrinter.apply(this, arguments);
  }
  function disconnectAll() {
    return _disconnectAll.apply(this, arguments);
  }
  function _disconnectAll() {
    _disconnectAll = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
      var _iterator3, _step3, p, _t8, _t9;
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.p = _context12.n) {
          case 0:
            _iterator3 = _createForOfIteratorHelper(printers);
            _context12.p = 1;
            _iterator3.s();
          case 2:
            if ((_step3 = _iterator3.n()).done) {
              _context12.n = 8;
              break;
            }
            p = _step3.value;
            _context12.p = 3;
            _context12.n = 4;
            return p.driver.disconnect();
          case 4:
            _context12.n = 6;
            break;
          case 5:
            _context12.p = 5;
            _t8 = _context12.v;
          case 6:
            p.connected = false;
          case 7:
            _context12.n = 2;
            break;
          case 8:
            _context12.n = 10;
            break;
          case 9:
            _context12.p = 9;
            _t9 = _context12.v;
            _iterator3.e(_t9);
          case 10:
            _context12.p = 10;
            _iterator3.f();
            return _context12.f(10);
          case 11:
            printers = [];
            savePrinters();
          case 12:
            return _context12.a(2);
        }
      }, _callee12, null, [[3, 5], [1, 9, 10, 11]]);
    }));
    return _disconnectAll.apply(this, arguments);
  }
  function getPrinters() {
    return printers;
  }
  function isConnected() {
    return printers.some(function (p) {
      return p.connected;
    });
  }
  function getReceiptPrinters() {
    return printers.filter(function (p) {
      return p.active && !p.forKitchen;
    });
  }
  function getKitchenPrinters() {
    return printers.filter(function (p) {
      return p.active && p.forKitchen;
    });
  }
  function savePrinters() {
    var data = printers.map(function (p) {
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        forKitchen: p.forKitchen,
        active: true,
        host: p.driver.host,
        port: p.driver.port
      };
    });
    localStorage.setItem('laguna_printers', JSON.stringify(data));
  }
  function restorePrinters() {
    return _restorePrinters.apply(this, arguments);
  }
  function _restorePrinters() {
    _restorePrinters = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16() {
      var raw, data, _iterator4, _step4, cfg, devices, _iterator5, _step5, dev, already, iface, ep, _iterator6, _step6, e, driver, p, _t1, _t10, _t11, _t12, _t13;
      return _regenerator().w(function (_context16) {
        while (1) switch (_context16.p = _context16.n) {
          case 0:
            raw = localStorage.getItem('laguna_printers');
            if (raw) {
              try {
                data = JSON.parse(raw);
              } catch (e) {
                data = [];
              }
            } else {
              data = [];
            }
            _iterator4 = _createForOfIteratorHelper(data);
            _context16.p = 1;
            _iterator4.s();
          case 2:
            if ((_step4 = _iterator4.n()).done) {
              _context16.n = 8;
              break;
            }
            cfg = _step4.value;
            _context16.p = 3;
            if (!(cfg.type === 'usb')) {
              _context16.n = 4;
              break;
            }
            return _context16.a(3, 7);
          case 4:
            _context16.n = 5;
            return addPrinter(cfg.type, {
              name: cfg.name,
              host: cfg.host,
              port: cfg.port,
              forKitchen: cfg.forKitchen
            });
          case 5:
            _context16.n = 7;
            break;
          case 6:
            _context16.p = 6;
            _t1 = _context16.v;
          case 7:
            _context16.n = 2;
            break;
          case 8:
            _context16.n = 10;
            break;
          case 9:
            _context16.p = 9;
            _t10 = _context16.v;
            _iterator4.e(_t10);
          case 10:
            _context16.p = 10;
            _iterator4.f();
            return _context16.f(10);
          case 11:
            _context16.p = 11;
            if (navigator.usb) {
              _context16.n = 12;
              break;
            }
            return _context16.a(2);
          case 12:
            if (!(localStorage.getItem('laguna_print_agent_enabled') === 'true')) {
              _context16.n = 13;
              break;
            }
            return _context16.a(2);
          case 13:
            _context16.n = 14;
            return navigator.usb.getDevices();
          case 14:
            devices = _context16.v;
            _iterator5 = _createForOfIteratorHelper(devices);
            _context16.p = 15;
            _iterator5.s();
          case 16:
            if ((_step5 = _iterator5.n()).done) {
              _context16.n = 30;
              break;
            }
            dev = _step5.value;
            already = printers.some(function (p) {
              return p.driver.device === dev;
            });
            if (!already) {
              _context16.n = 17;
              break;
            }
            return _context16.a(3, 29);
          case 17:
            _context16.n = 18;
            return dev.open();
          case 18:
            if (!(dev.configuration === null)) {
              _context16.n = 19;
              break;
            }
            _context16.n = 19;
            return dev.selectConfiguration(1);
          case 19:
            _context16.n = 20;
            return dev.claimInterface(0);
          case 20:
            iface = dev.configuration.interfaces[0];
            ep = null;
            _iterator6 = _createForOfIteratorHelper(iface.alternate.endpoints);
            _context16.p = 21;
            _iterator6.s();
          case 22:
            if ((_step6 = _iterator6.n()).done) {
              _context16.n = 24;
              break;
            }
            e = _step6.value;
            if (!(e.direction === 'out')) {
              _context16.n = 23;
              break;
            }
            ep = e.endpointNumber;
            return _context16.a(3, 24);
          case 23:
            _context16.n = 22;
            break;
          case 24:
            _context16.n = 26;
            break;
          case 25:
            _context16.p = 25;
            _t11 = _context16.v;
            _iterator6.e(_t11);
          case 26:
            _context16.p = 26;
            _iterator6.f();
            return _context16.f(26);
          case 27:
            if (ep) {
              _context16.n = 28;
              break;
            }
            return _context16.a(3, 29);
          case 28:
            driver = {
              type: 'usb',
              device: dev,
              endpoint: ep,
              connected: true
            };
            driver.connect = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13() {
              return _regenerator().w(function (_context13) {
                while (1) switch (_context13.n) {
                  case 0:
                    return _context13.a(2);
                }
              }, _callee13);
            }));
            driver.disconnect = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14() {
              var _t0;
              return _regenerator().w(function (_context14) {
                while (1) switch (_context14.p = _context14.n) {
                  case 0:
                    _context14.p = 0;
                    _context14.n = 1;
                    return dev.close();
                  case 1:
                    _context14.n = 3;
                    break;
                  case 2:
                    _context14.p = 2;
                    _t0 = _context14.v;
                  case 3:
                    return _context14.a(2);
                }
              }, _callee14, null, [[0, 2]]);
            }));
            driver.send = /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(data) {
                return _regenerator().w(function (_context15) {
                  while (1) switch (_context15.n) {
                    case 0:
                      _context15.n = 1;
                      return dev.transferOut(ep, data);
                    case 1:
                      return _context15.a(2);
                  }
                }, _callee15);
              }));
              return function (_x14) {
                return _ref3.apply(this, arguments);
              };
            }();
            p = {
              id: 'prn_usb_' + nextId++,
              name: 'XP-80',
              type: 'usb',
              driver: driver,
              connected: true,
              active: true,
              forKitchen: false
            };
            printers.push(p);
          case 29:
            _context16.n = 16;
            break;
          case 30:
            _context16.n = 32;
            break;
          case 31:
            _context16.p = 31;
            _t12 = _context16.v;
            _iterator5.e(_t12);
          case 32:
            _context16.p = 32;
            _iterator5.f();
            return _context16.f(32);
          case 33:
            _context16.n = 35;
            break;
          case 34:
            _context16.p = 34;
            _t13 = _context16.v;
          case 35:
            return _context16.a(2);
        }
      }, _callee16, null, [[21, 25, 26, 27], [15, 31, 32, 33], [11, 34], [3, 6], [1, 9, 10, 11]]);
    }));
    return _restorePrinters.apply(this, arguments);
  }
  function printTo(_x6, _x7) {
    return _printTo.apply(this, arguments);
  } // Returns { ok: true } or { ok: false, errors: [...] }
  function _printTo() {
    _printTo = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(printerId, data) {
      var p;
      return _regenerator().w(function (_context17) {
        while (1) switch (_context17.n) {
          case 0:
            p = printers.find(function (x) {
              return x.id === printerId;
            });
            if (p) {
              _context17.n = 1;
              break;
            }
            throw new Error('الطابعة غير موجودة');
          case 1:
            if (p.connected) {
              _context17.n = 2;
              break;
            }
            throw new Error('الطابعة غير متصلة');
          case 2:
            _context17.n = 3;
            return p.driver.send(data);
          case 3:
            return _context17.a(2);
        }
      }, _callee17);
    }));
    return _printTo.apply(this, arguments);
  }
  function printReceipt(_x8, _x9) {
    return _printReceipt.apply(this, arguments);
  }
  function _printReceipt() {
    _printReceipt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(inv, printerId) {
      var data, targets, errors, ok, _iterator7, _step7, p, _t14, _t15, _t16;
      return _regenerator().w(function (_context18) {
        while (1) switch (_context18.p = _context18.n) {
          case 0:
            _context18.n = 1;
            return buildReceiptData(inv);
          case 1:
            data = _context18.v;
            if (!printerId) {
              _context18.n = 5;
              break;
            }
            _context18.p = 2;
            _context18.n = 3;
            return printTo(printerId, data);
          case 3:
            return _context18.a(2, {
              ok: true
            });
          case 4:
            _context18.p = 4;
            _t14 = _context18.v;
            console.warn('[printer] ' + printerId + ': ' + _t14.message);
            return _context18.a(2, {
              ok: false,
              errors: [_t14.message]
            });
          case 5:
            targets = getReceiptPrinters();
            if (!(targets.length === 0)) {
              _context18.n = 6;
              break;
            }
            return _context18.a(2, {
              ok: false,
              errors: ['لا توجد طابعات فو始终 متصلة']
            });
          case 6:
            errors = [];
            ok = false;
            _iterator7 = _createForOfIteratorHelper(targets);
            _context18.p = 7;
            _iterator7.s();
          case 8:
            if ((_step7 = _iterator7.n()).done) {
              _context18.n = 13;
              break;
            }
            p = _step7.value;
            _context18.p = 9;
            _context18.n = 10;
            return p.driver.send(data);
          case 10:
            ok = true;
            _context18.n = 12;
            break;
          case 11:
            _context18.p = 11;
            _t15 = _context18.v;
            console.warn('[printer] ' + p.name + ': ' + _t15.message);
            errors.push(p.name + ': ' + _t15.message);
          case 12:
            _context18.n = 8;
            break;
          case 13:
            _context18.n = 15;
            break;
          case 14:
            _context18.p = 14;
            _t16 = _context18.v;
            _iterator7.e(_t16);
          case 15:
            _context18.p = 15;
            _iterator7.f();
            return _context18.f(15);
          case 16:
            return _context18.a(2, {
              ok: ok,
              errors: errors.length > 0 ? errors : undefined
            });
        }
      }, _callee18, null, [[9, 11], [7, 14, 15, 16], [2, 4]]);
    }));
    return _printReceipt.apply(this, arguments);
  }
  function printKitchenOrder(_x0, _x1) {
    return _printKitchenOrder.apply(this, arguments);
  }
  function _printKitchenOrder() {
    _printKitchenOrder = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19(inv, printerId) {
      var data, _iterator8, _step8, p, _t17, _t18;
      return _regenerator().w(function (_context19) {
        while (1) switch (_context19.p = _context19.n) {
          case 0:
            _context19.n = 1;
            return buildKitchenOrderData(inv);
          case 1:
            data = _context19.v;
            if (!printerId) {
              _context19.n = 3;
              break;
            }
            _context19.n = 2;
            return printTo(printerId, data);
          case 2:
            _context19.n = 13;
            break;
          case 3:
            _iterator8 = _createForOfIteratorHelper(getKitchenPrinters());
            _context19.p = 4;
            _iterator8.s();
          case 5:
            if ((_step8 = _iterator8.n()).done) {
              _context19.n = 10;
              break;
            }
            p = _step8.value;
            _context19.p = 6;
            _context19.n = 7;
            return p.driver.send(data);
          case 7:
            _context19.n = 9;
            break;
          case 8:
            _context19.p = 8;
            _t17 = _context19.v;
            console.warn('[printer] ' + p.name + ': ' + _t17.message);
          case 9:
            _context19.n = 5;
            break;
          case 10:
            _context19.n = 12;
            break;
          case 11:
            _context19.p = 11;
            _t18 = _context19.v;
            _iterator8.e(_t18);
          case 12:
            _context19.p = 12;
            _iterator8.f();
            return _context19.f(12);
          case 13:
            return _context19.a(2);
        }
      }, _callee19, null, [[6, 8], [4, 11, 12, 13]]);
    }));
    return _printKitchenOrder.apply(this, arguments);
  }
  function openDrawer(_x10) {
    return _openDrawer.apply(this, arguments);
  }
  function _openDrawer() {
    _openDrawer = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(printerId) {
      var data, _iterator9, _step9, p, _t19, _t20;
      return _regenerator().w(function (_context20) {
        while (1) switch (_context20.p = _context20.n) {
          case 0:
            data = escposOpenDrawer();
            if (!printerId) {
              _context20.n = 2;
              break;
            }
            _context20.n = 1;
            return printTo(printerId, data);
          case 1:
            _context20.n = 12;
            break;
          case 2:
            _iterator9 = _createForOfIteratorHelper(printers);
            _context20.p = 3;
            _iterator9.s();
          case 4:
            if ((_step9 = _iterator9.n()).done) {
              _context20.n = 9;
              break;
            }
            p = _step9.value;
            if (!p.connected) {
              _context20.n = 8;
              break;
            }
            _context20.p = 5;
            _context20.n = 6;
            return p.driver.send(data);
          case 6:
            _context20.n = 8;
            break;
          case 7:
            _context20.p = 7;
            _t19 = _context20.v;
          case 8:
            _context20.n = 4;
            break;
          case 9:
            _context20.n = 11;
            break;
          case 10:
            _context20.p = 10;
            _t20 = _context20.v;
            _iterator9.e(_t20);
          case 11:
            _context20.p = 11;
            _iterator9.f();
            return _context20.f(11);
          case 12:
            return _context20.a(2);
        }
      }, _callee20, null, [[5, 7], [3, 10, 11, 12]]);
    }));
    return _openDrawer.apply(this, arguments);
  }
  function printViaAgent(_x11, _x12, _x13) {
    return _printViaAgent.apply(this, arguments);
  }
  function _printViaAgent() {
    _printViaAgent = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21(invoice, type, opts) {
      var url, headers, apiKey, payload, k, ok, resp, _t21;
      return _regenerator().w(function (_context21) {
        while (1) switch (_context21.p = _context21.n) {
          case 0:
            url = localStorage.getItem('laguna_print_agent_url');
            if (url) {
              _context21.n = 1;
              break;
            }
            return _context21.a(2, {
              ok: false,
              skipped: true
            });
          case 1:
            _context21.p = 1;
            headers = {
              'Content-Type': 'application/json'
            };
            apiKey = localStorage.getItem('laguna_print_agent_key');
            if (apiKey) headers['X-API-Key'] = apiKey;
            payload = {};
            for (k in invoice) payload[k] = invoice[k];
            if (type) payload.type = type;
            if (opts) {
              for (ok in opts) payload[ok] = opts[ok];
            }
            _context21.n = 2;
            return fetch(url.replace(/\/+$/, '') + '/print-invoice', {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(payload)
            });
          case 2:
            resp = _context21.v;
            _context21.n = 3;
            return resp.json();
          case 3:
            return _context21.a(2, _context21.v);
          case 4:
            _context21.p = 4;
            _t21 = _context21.v;
            console.warn('[print-agent] لا يمكن الوصول:', _t21.message);
            return _context21.a(2, {
              ok: false,
              error: _t21.message
            });
        }
      }, _callee21, null, [[1, 4]]);
    }));
    return _printViaAgent.apply(this, arguments);
  }
  return {
    addPrinter: addPrinter,
    removePrinter: removePrinter,
    disconnectAll: disconnectAll,
    getPrinters: getPrinters,
    isConnected: isConnected,
    getReceiptPrinters: getReceiptPrinters,
    getKitchenPrinters: getKitchenPrinters,
    restorePrinters: restorePrinters,
    printTo: printTo,
    printReceipt: printReceipt,
    printKitchenOrder: printKitchenOrder,
    openDrawer: openDrawer,
    printViaAgent: printViaAgent,
    escposInit: escposInit,
    escposBold: escposBold,
    escposText: escposText,
    escposCut: escposCut,
    buildReceiptData: buildReceiptData,
    buildKitchenOrderData: buildKitchenOrderData
  };
}();

