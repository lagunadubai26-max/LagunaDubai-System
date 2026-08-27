function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
window.onerror = function (msg, url, line, col, err) {
  console.error('[menu] UNCAUGHT:', msg, 'at line', line, url);
};
console.log('[menu] script loaded');
var total = 0;
var taxRate = 0;
var enableTax = false;
var serviceRate = 0;
var enableService = false;
var checkoutProcessing = false;
var syncingMilkState = false;
var COOLDOWN_MS = 5000;
var urlParams = new URLSearchParams(window.location.search);
var rawTable = urlParams.get('table');
var tableNum = /^\d+$/.test(rawTable) ? rawTable : '';
var hasService = urlParams.get('service') === '1';
var isCustomer = !!tableNum;
if (isCustomer) {
  document.querySelector('.menu-header h1').textContent = '🍽 القائمة - طاولة ' + tableNum + (hasService ? ' 🌟 ضيافة' : '');
  document.querySelectorAll('.sidebar, #sidebarToggle, .sidebar-overlay').forEach(function (el) {
    return el && (el.style.display = 'none');
  });
  var mainEl = document.querySelector('.main');
  if (mainEl) {
    mainEl.style.marginRight = '0';
    mainEl.style.width = '100%';
  }
  // Hide admin-only checkout fields
  var custSec = document.getElementById('checkoutCustomerSection');
  var paidSec = document.getElementById('checkoutPaidSection');
  var remSec = document.getElementById('checkoutRemainingSection');
  if (custSec) custSec.style.display = 'none';
  if (paidSec) paidSec.style.display = 'none';
  if (remSec) remSec.style.display = 'none';
  // Lock table input for customer QR
  var ti = document.getElementById('tableInput');
  if (ti) {
    ti.disabled = true;
    ti.value = tableNum;
  }
}
window._seedReady = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
  var settings, _t;
  return _regenerator().w(function (_context) {
    while (1) switch (_context.p = _context.n) {
      case 0:
        _context.p = 0;
        _context.n = 1;
        return DB.seed();
      case 1:
        _context.n = 3;
        break;
      case 2:
        _context.p = 2;
        _t = _context.v;
        console.error('[menu] seed error:', _t);
      case 3:
        if (!hasService) {
          _context.n = 5;
          break;
        }
        _context.n = 4;
        return DB.settings.get();
      case 4:
        settings = _context.v;
        enableService = settings.enableService !== false;
        serviceRate = settings.serviceTax || 10;
        enableTax = settings.enableTax !== false;
        taxRate = settings.taxRate || 14;
      case 5:
        return _context.a(2);
    }
  }, _callee, null, [[0, 2]]);
}))();
function calculateTotals(baseTotal) {
  var serviceAmount = 0,
    taxAmount = 0,
    grandTotal = baseTotal;
  if (enableService && serviceRate > 0) {
    serviceAmount = Math.round(baseTotal * serviceRate / 100);
    grandTotal = baseTotal + serviceAmount;
  }
  if (enableTax && taxRate > 0) {
    taxAmount = Math.round(grandTotal * taxRate / 100);
    grandTotal = grandTotal + taxAmount;
  }
  return {
    serviceAmount: serviceAmount,
    taxAmount: taxAmount,
    grandTotal: grandTotal
  };
}
function syncSheetNotesToOrderBox() {
  var sheetList = document.getElementById('sheetOrderList');
  if (!sheetList) return;
  sheetList.querySelectorAll('.order-item').forEach(function (el) {
    var ni = el.querySelector('.note-input');
    if (!ni || !ni.value) return;
    var nm = el.querySelector('.name');
    if (!nm) return;
    document.querySelectorAll('.order-box .order-list .order-item').forEach(function (oe) {
      var on = oe.querySelector('.name');
      if (on && on.innerText === nm.innerText) {
        var oi = oe.querySelector('.note-input');
        if (oi) oi.value = ni.value;
      }
    });
  });
}
function syncOrderSheet() {
  var orderList = document.querySelector('.order-box .order-list');
  var sheetList = document.getElementById('sheetOrderList');
  var sheetTotal = document.getElementById('sheetTotal');
  var sheetNoteSave = [];
  if (orderList && sheetList) {
    sheetList.querySelectorAll('.order-item').forEach(function (el) {
      var ni = el.querySelector('.note-input');
      if (ni && ni.value) {
        var nm = el.querySelector('.name');
        if (nm) sheetNoteSave.push({
          name: nm.innerText,
          note: ni.value
        });
      }
    });
    sheetList.innerHTML = orderList.innerHTML;
    syncingMilkState = true;
    sheetList.querySelectorAll('.order-item').forEach(function (el) {
      var ck = el.querySelector('.milk-check');
      if (ck) ck.checked = el.dataset.hasMilk === 'true';
    });
    syncingMilkState = false;
    sheetNoteSave.forEach(function (_ref2) {
      var name = _ref2.name,
        note = _ref2.note;
      sheetList.querySelectorAll('.order-item .name').forEach(function (n) {
        if (n.innerText === name) {
          n.closest('.order-item').querySelector('.note-input').value = note;
        }
      });
    });
  }
  if (sheetTotal) {
    var _calculateTotals = calculateTotals(total),
      serviceAmount = _calculateTotals.serviceAmount,
      taxAmount = _calculateTotals.taxAmount,
      grandTotal = _calculateTotals.grandTotal;
    var parts = [grandTotal + ' جنيه'];
    if (serviceAmount > 0) parts.push('خدمة ' + serviceAmount + ' ج.م');
    if (taxAmount > 0) parts.push('ضريبة ' + taxAmount + ' ج.م');
    sheetTotal.textContent = parts.join(' | ');
  }
  var count = 0;
  document.querySelectorAll('.order-box .order-item').forEach(function (i) {
    var name = i.querySelector('.name');
    if (name) count++;
  });
  var badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = count;
  if (count > 0) badge && (badge.style.display = 'flex');else badge && (badge.style.display = 'none');
}
function loadProducts() {
  return _loadProducts.apply(this, arguments);
}
function _loadProducts() {
  _loadProducts = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
    var rawCats, seen, categories, menuCategories, products, container, categoryOrder, _t12, _t13, _t14;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.p = _context0.n) {
        case 0:
          _context0.p = 0;
          console.log('[menu] loadProducts start');
          if (!window._seedReady) {
            _context0.n = 1;
            break;
          }
          _context0.n = 1;
          return window._seedReady;
        case 1:
          console.log('[menu] seed ready, fetching categories');
          _context0.n = 2;
          return DB.categories.all();
        case 2:
          _t12 = _context0.v;
          if (_t12) {
            _context0.n = 3;
            break;
          }
          _t12 = [];
        case 3:
          rawCats = _t12;
          console.log('[menu] categories:', rawCats.length);
          seen = {};
          categories = [];
          rawCats.forEach(function (c) {
            if (!seen[c.slug]) {
              seen[c.slug] = true;
              categories.push(c);
            }
          });
          categories.sort(function (a, b) {
            return (a.order || 0) - (b.order || 0);
          });
          menuCategories = document.getElementById('menuCategories');
          if (menuCategories) {
            menuCategories.innerHTML = '<button class="category-btn active" data-category="all">الكل</button>';
            categories.forEach(function (c) {
              var btn = document.createElement('button');
              btn.className = 'category-btn';
              btn.dataset.category = c.slug;
              btn.textContent = c.name;
              menuCategories.appendChild(btn);
            });
          }
          _context0.n = 4;
          return DB.products.all();
        case 4:
          _t13 = _context0.v;
          if (_t13) {
            _context0.n = 5;
            break;
          }
          _t13 = [];
        case 5:
          products = _t13;
          container = document.querySelector('.products');
          if (container) {
            _context0.n = 6;
            break;
          }
          return _context0.a(2);
        case 6:
          container.innerHTML = '';
          categoryOrder = categories.map(function (c) {
            return c.slug;
          });
          products.sort(function (a, b) {
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
          });
          products.forEach(function (p) {
            if (!p.available) return;
            var card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.category = p.category;
            var imgSrc = sanitizeUrl(p.image) || '';
            var safeName = escapeHtml(p.name);
            var safeNameEn = escapeHtml(p.nameEn || '');
            var safeDesc = escapeHtml(p.description || '');
            var safePrice = validateNumber(p.price, 0);
            var fallbackImg = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23f5f5f4%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2240%22>🍽</text></svg>';
            card.innerHTML = "\n      <div class=\"menu-icon\"><img loading=\"lazy\" src=\"".concat(imgSrc || fallbackImg, "\" alt=\"").concat(safeName, "\" onerror=\"this.src='").concat(fallbackImg, "'\"></div>\n      <h3>").concat(safeName, "</h3>\n      <p>").concat(safeNameEn, "</p>\n      ").concat(safeDesc ? "<p class=\"desc\">".concat(safeDesc, "</p>") : '', "\n      <h2>").concat(safePrice, " \u062C\u0646\u064A\u0647</h2>\n      <button data-price=\"").concat(safePrice, "\">\u0625\u0636\u0627\u0641\u0629</button>");
            container.appendChild(card);
          });
          attachAddToCart();
          attachCategoryFilter();
          attachSearch();
          console.log('[menu] loadProducts done');
          _context0.n = 8;
          break;
        case 7:
          _context0.p = 7;
          _t14 = _context0.v;
          console.error('[menu] loadProducts FAILED:', _t14.message, _t14.stack);
        case 8:
          return _context0.a(2);
      }
    }, _callee0, null, [[0, 7]]);
  }));
  return _loadProducts.apply(this, arguments);
}
function occupyTable() {
  return _occupyTable.apply(this, arguments);
}
function _occupyTable() {
  _occupyTable = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
    var tn, count, allTables, tbl, _t15, _t16;
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.p = _context1.n) {
        case 0:
          tn = tableNum || getTableInput();
          if (tn) {
            _context1.n = 1;
            break;
          }
          return _context1.a(2);
        case 1:
          count = document.querySelectorAll('.order-box .order-list .order-item .name').length;
          if (!(count > 0)) {
            _context1.n = 9;
            break;
          }
          _context1.p = 2;
          _context1.n = 3;
          return DB.tables.all();
        case 3:
          _t15 = _context1.v;
          if (_t15) {
            _context1.n = 4;
            break;
          }
          _t15 = [];
        case 4:
          allTables = _t15;
          tbl = allTables.find(function (t) {
            return t.name === 'طاولة ' + tn;
          });
          if (!tbl) {
            _context1.n = 6;
            break;
          }
          _context1.n = 5;
          return DB.tables.update(tbl.id, {
            status: 'occupied'
          });
        case 5:
          _context1.n = 7;
          break;
        case 6:
          _context1.n = 7;
          return DB.tables.add({
            id: 't' + tn,
            name: 'طاولة ' + tn,
            capacity: 4,
            status: 'occupied',
            currentOrder: null,
            hasService: false
          });
        case 7:
          _context1.n = 9;
          break;
        case 8:
          _context1.p = 8;
          _t16 = _context1.v;
          console.warn('[occupy]', _t16);
        case 9:
          return _context1.a(2);
      }
    }, _callee1, null, [[2, 8]]);
  }));
  return _occupyTable.apply(this, arguments);
}
function getTableInput() {
  var el = document.getElementById('tableInput');
  return el && !el.disabled ? el.value.trim() : '';
}
function attachAddToCart() {
  document.querySelectorAll(".product-card button").forEach(function (button) {
    button.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var card, name, price, emptyItem, found, item;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            card = this.parentElement;
            name = card.querySelector("h3").innerText;
            price = Number(this.dataset.price);
            emptyItem = document.querySelector(".order-box .order-list .order-item");
            if (emptyItem && !emptyItem.querySelector(".name")) emptyItem.remove();
            found = false;
            document.querySelectorAll(".order-box .order-list .order-item").forEach(function (item) {
              var product = item.querySelector(".name");
              if (!product) return;
              if (product.innerText === name) {
                var qtyEl = item.querySelector(".qty");
                var qty = parseInt(qtyEl.innerText);
                qty++;
                qtyEl.innerText = qty;
                var effective = price + (item.dataset.hasMilk === 'true' ? 15 : 0);
                item.querySelector(".price").innerText = qty * effective + " جنيه";
                total += effective;
                found = true;
              }
            });
            if (!found) {
              item = document.createElement("div");
              item.className = "order-item";
              item.dataset.price = price;
              item.dataset.hasMilk = 'false';
              item.innerHTML = "\n          <div class=\"order-top\"><span class=\"name\">".concat(escapeHtml(name), "</span><button class=\"note-btn\" title=\"\u0623\u0636\u0641 \u0645\u0644\u0627\u062D\u0638\u0629\"><i class=\"fa-solid fa-pen\"></i>\u0645\u0644\u0627\u062D\u0638\u0629</button><button class=\"delete\"><i class=\"fa-solid fa-trash\"></i></button></div>\n          <div class=\"price\">").concat(price, " \u062C\u0646\u064A\u0647</div>\n          <div class=\"item-note\" style=\"display:none\"><input class=\"note-input\" placeholder=\"\u0625\u0636\u0627\u0641\u0629 (\u0642\u0647\u0648\u0629 \u0645\u062D\u0648\u062C\u060C \u0628\u062F\u0648\u0646 \u0633\u0643\u0631...)\" style=\"width:100%;height:36px;border:1px solid var(--border);border-radius:8px;padding:0 10px;font-size:13px;font-family:inherit;outline:none;background:#fafaf9;margin-bottom:8px\"></div>\n          <div class=\"order-bottom\"><div class=\"controls\"><button class=\"minus\">-</button><span class=\"qty\">1</span><button class=\"plus\">+</button></div><label class=\"milk-toggle\"><input type=\"checkbox\" class=\"milk-check\"><span class=\"checkmark\"></span> +\u0644\u0628\u0646 15 \u062C.\u0645</label></div>");
              document.querySelector(".order-box .order-list").appendChild(item);
              total += price;
            }
            document.querySelector(".total strong").innerText = total + " جنيه";
            syncOrderSheet();
            _context2.n = 1;
            return occupyTable();
          case 1:
            return _context2.a(2);
        }
      }, _callee2, this);
    })));
  });
}
function getItemPrice(itemEl) {
  return Number(itemEl.dataset.price) + (itemEl.dataset.hasMilk === 'true' ? 15 : 0);
}
function formatItemPrice(itemEl) {
  var base = Number(itemEl.dataset.price);
  var milk = itemEl.dataset.hasMilk === 'true';
  var qty = parseInt(itemEl.querySelector('.qty').innerText);
  var effective = milk ? base + 15 : base;
  return qty * effective + ' جنيه' + (milk ? ' (مع لبن)' : '');
}
function handleOrderClick(e) {
  var btn = e.target.closest('.plus, .minus, .delete, .note-btn');
  if (!btn) return;
  if (btn.classList.contains('note-btn')) {
    var _item = btn.closest('.order-item');
    if (!_item) return;
    var noteDiv = _item.querySelector('.item-note');
    if (noteDiv) {
      var showing = noteDiv.style.display !== 'none';
      noteDiv.style.display = showing ? 'none' : 'block';
      btn.classList.toggle('active', !showing);
    }
    return;
  }
  var item = btn.closest('.order-item');
  if (!item) return;
  var nameEl = item.querySelector('.name');
  if (!nameEl) return;
  var name = nameEl.innerText;
  // Source of truth is always order-box list
  var targetItem = null;
  document.querySelectorAll('.order-box .order-list .order-item').forEach(function (el) {
    var n = el.querySelector('.name');
    if (n && n.innerText === name) targetItem = el;
  });
  if (!targetItem) return;
  if (btn.classList.contains('plus')) {
    var qty = targetItem.querySelector('.qty');
    var q = parseInt(qty.innerText);
    q++;
    qty.innerText = q;
    var effective = getItemPrice(targetItem);
    targetItem.querySelector('.price').innerText = q * effective + ' جنيه';
    total += effective;
  } else if (btn.classList.contains('minus')) {
    var qtyEl = targetItem.querySelector('.qty');
    var _q = parseInt(qtyEl.innerText);
    if (_q <= 1) return;
    _q--;
    qtyEl.innerText = _q;
    var _effective = getItemPrice(targetItem);
    targetItem.querySelector('.price').innerText = _q * _effective + ' جنيه';
    total -= _effective;
  } else if (btn.classList.contains('delete')) {
    var _qty = parseInt(targetItem.querySelector('.qty').innerText);
    var _effective2 = getItemPrice(targetItem);
    total -= _qty * _effective2;
    targetItem.remove();
    if (!document.querySelector('.order-box .order-list .order-item .name')) {
      document.querySelector('.order-box .order-list').innerHTML = '<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>';
    }
  }
  document.querySelector('.total strong').innerText = total + ' جنيه';
  syncOrderSheet();
}
document.querySelector('.order-box .order-list').addEventListener('click', handleOrderClick);
document.getElementById('sheetOrderList').addEventListener('click', handleOrderClick);
function handleMilkChange(e) {
  var _item$querySelector;
  if (syncingMilkState) return;
  var ck = e.target;
  if (!ck.classList.contains('milk-check')) return;
  var item = ck.closest('.order-item');
  if (!item) return;
  var isSheet = !!item.closest('#sheetOrderList');
  var name = (_item$querySelector = item.querySelector('.name')) === null || _item$querySelector === void 0 ? void 0 : _item$querySelector.innerText;
  if (!name) return;
  var targetItem = isSheet ? Array.from(document.querySelectorAll('.order-box .order-list .order-item')).find(function (el) {
    var _el$querySelector;
    return ((_el$querySelector = el.querySelector('.name')) === null || _el$querySelector === void 0 ? void 0 : _el$querySelector.innerText) === name;
  }) : item;
  if (!targetItem) return;
  targetItem.dataset.hasMilk = ck.checked ? 'true' : 'false';
  var base = parseInt(targetItem.dataset.price);
  var qty = parseInt(targetItem.querySelector('.qty').innerText);
  total += (ck.checked ? 1 : -1) * 15 * qty;
  targetItem.querySelector('.price').innerText = formatItemPrice(targetItem);
  document.querySelector('.total strong').innerText = total + ' جنيه';
  syncOrderSheet();
}
var orderList = document.querySelector('.order-box .order-list');
if (orderList) orderList.addEventListener('change', handleMilkChange);
var sheetList = document.getElementById('sheetOrderList');
if (sheetList) sheetList.addEventListener('change', handleMilkChange);
function attachCategoryFilter() {
  var catButtons = document.querySelectorAll(".category-btn");
  catButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      catButtons.forEach(function (btn) {
        return btn.classList.remove("active");
      });
      button.classList.add("active");
      var category = button.dataset.category;
      document.querySelectorAll(".product-card").forEach(function (product) {
        product.style.display = category === "all" || product.dataset.category === category ? "block" : "none";
      });
    });
  });
}
function attachSearch() {
  var searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  searchInput.addEventListener("keyup", function () {
    var value = this.value.toLowerCase();
    document.querySelectorAll(".product-card").forEach(function (card) {
      var name = card.querySelector("h3").innerText.toLowerCase();
      var english = card.querySelector("p") ? card.querySelector("p").innerText.toLowerCase() : "";
      card.style.display = name.includes(value) || english.includes(value) ? "" : "none";
    });
  });
}
var clearBtn = document.querySelector(".clear-order");
var clearModal = document.getElementById('confirmModal');
var clearYesBtn = clearModal.querySelector(".confirm-btn");
var clearNoBtn = clearModal.querySelector(".cancel-btn");
clearBtn.addEventListener("click", function () {
  return clearModal.classList.add("show");
});
clearNoBtn.addEventListener("click", function () {
  return clearModal.classList.remove("show");
});
function clearOrder() {
  document.querySelector(".order-box .order-list").innerHTML = "<div class=\"order-item\"><span>\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A</span><strong>0</strong></div>";
  var sol = document.getElementById('sheetOrderList');
  if (sol) sol.innerHTML = "<div class=\"order-item\"><span>\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A</span><strong>0</strong></div>";
  total = 0;
  document.querySelector(".total strong").innerText = "0 جنيه";
  var st = document.getElementById('sheetTotal');
  if (st) st.textContent = "0 جنيه";
  syncOrderSheet();
}
clearYesBtn.addEventListener("click", function () {
  clearOrder();
  clearModal.classList.remove("show");
});
var checkoutBtn = document.querySelector(".checkout");
checkoutBtn.addEventListener("click", function () {
  syncSheetNotesToOrderBox();
  var items = [];
  document.querySelectorAll(".order-box .order-list .order-item .name").forEach(function (el) {
    var itemEl = el.closest(".order-item");
    var qty = parseInt(itemEl.querySelector(".qty").innerText);
    var priceText = itemEl.dataset.price;
    var noteInput = itemEl.querySelector('.note-input');
    var note = noteInput ? noteInput.value.trim() : '';
    var hasMilk = itemEl.dataset.hasMilk === 'true';
    var effectivePrice = Number(priceText) + (hasMilk ? 15 : 0);
    if (priceText) items.push({
      name: el.innerText,
      qty: qty,
      price: effectivePrice,
      note: note,
      hasMilk: hasMilk
    });
  });
  if (items.length === 0) return alert("الطلب فارغ، أضف منتجات أولاً");
  var totalAmount = items.reduce(function (s, i) {
    return s + i.qty * i.price;
  }, 0);
  var _calculateTotals2 = calculateTotals(totalAmount),
    serviceAmount = _calculateTotals2.serviceAmount,
    taxAmount = _calculateTotals2.taxAmount,
    grandTotal = _calculateTotals2.grandTotal;
  // Reset checkout form
  document.getElementById('checkoutCustomerType').value = 'regular';
  document.getElementById('checkoutSpecialFields').style.display = 'none';
  document.getElementById('checkoutSpecialName').value = '';
  var _paidSecReset = document.getElementById('checkoutPaidSection');
  var _remSecReset = document.getElementById('checkoutRemainingSection');
  if (_paidSecReset) _paidSecReset.style.display = 'block';
  if (_remSecReset) _remSecReset.style.display = 'flex';
  _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var allCusts, dl;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return DB.customers.all();
        case 1:
          allCusts = _context3.v;
          dl = document.getElementById('custList');
          if (dl) dl.innerHTML = allCusts.map(function (c) {
            return '<option value="' + escapeHtml(c.name) + '">';
          }).join('');
        case 2:
          return _context3.a(2);
      }
    }, _callee3);
  }))();
  var checkoutLabel = grandTotal + ' جنيه';
  if (serviceAmount > 0) checkoutLabel += ' (خدمة ' + serviceAmount + ' ج.م)';
  if (taxAmount > 0) checkoutLabel += ' (ضريبة ' + taxAmount + ' ج.م)';
  document.getElementById('checkoutTotal').textContent = checkoutLabel;
  document.getElementById('checkoutPaid').value = '';
  window._itemsTotal = grandTotal;
  window._checkoutTotal = grandTotal;
  window._checkoutItems = items;
  window._checkoutService = serviceAmount;
  window._checkoutTax = taxAmount;
  window.calcRemaining();
  document.getElementById('checkoutModal').classList.add('show');
});

// Customer type toggle — show/hide special fields and update total
document.getElementById('checkoutCustomerType').onchange = function () {
  var type = this.value;
  var isSpecial = type === 'special';
  var isFree = type === 'free';
  var isWorkers = type === 'workers';
  document.getElementById('checkoutSpecialFields').style.display = isSpecial || isFree || isWorkers ? 'block' : 'none';
  var before = window._itemsTotal || 0;
  var beforeEl = document.getElementById('checkoutSpecialBefore');
  var noteEl = document.getElementById('checkoutSpecialNote');
  if (isWorkers) {
    var nameEl = document.getElementById('checkoutSpecialName');
    if (!nameEl.value) nameEl.value = 'عمالة';
    window._checkoutTotal = 0;
    if (beforeEl) beforeEl.textContent = before + ' جنيه';
    document.getElementById('checkoutTotal').textContent = '0 جنيه (طلبات عمالة مجانية)';
    if (noteEl) noteEl.innerHTML = '<i class="fa-solid fa-helmet-safety"></i> طلبات عمالة — الحساب <b>0 جنيه</b> ويتحسب كمصروف في التقارير';
    document.getElementById('checkoutPaid').value = '';
    var _paidSec = document.getElementById('checkoutPaidSection');
    var _remSec = document.getElementById('checkoutRemainingSection');
    if (_paidSec) _paidSec.style.display = 'none';
    if (_remSec) _remSec.style.display = 'none';
  } else if (isFree) {
    window._checkoutTotal = 0;
    var _nameEl = document.getElementById('checkoutSpecialName');
    if (_nameEl) _nameEl.value = 'الاستاذ محمد الجوهري';
    if (beforeEl) beforeEl.textContent = before + ' جنيه';
    document.getElementById('checkoutTotal').textContent = '0 جنيه (ضيافة مجانية)';
    if (noteEl) noteEl.innerHTML = '<i class="fa-solid fa-gift"></i> ضيافة مجانية — الحساب <b>0 جنيه</b> بالكامل';
    document.getElementById('checkoutPaid').value = '';
  } else if (isSpecial) {
    window._checkoutTotal = Math.round(before * 0.75);
    if (beforeEl) beforeEl.textContent = before + ' جنيه';
    document.getElementById('checkoutTotal').textContent = window._checkoutTotal + ' جنيه (خصم 25%)';
    if (noteEl) noteEl.innerHTML = '<i class="fa-solid fa-tags"></i> خصم <b>25%</b> تلقائي على إجمالي الفاتورة';
  } else {
    window._checkoutTotal = window._itemsTotal;
    document.getElementById('checkoutTotal').textContent = window._itemsTotal + ' جنيه';
  }
  if (!isWorkers) {
    var _paidSec2 = document.getElementById('checkoutPaidSection');
    var _remSec2 = document.getElementById('checkoutRemainingSection');
    if (_paidSec2) _paidSec2.style.display = 'block';
    if (_remSec2) _remSec2.style.display = 'flex';
  }
  window.calcRemaining();
};

// Calculate remaining/change in checkout modal
window.calcRemaining = function () {
  var total = window._checkoutTotal || 0;
  var paid = Number(document.getElementById('checkoutPaid').value) || 0;
  var diff = total - paid;
  var remLabel = document.getElementById('checkoutRemainingLabel');
  var remSpan = document.getElementById('checkoutRemaining');
  var remSection = document.getElementById('checkoutRemainingSection');
  if (!remSpan) return;
  if (paid > total) {
    remLabel.textContent = 'الباقي للعميل';
    remSpan.textContent = paid - total + ' جنيه';
    remSection.style.background = '#f0fdf4';
    remSpan.style.color = '#059669';
    remLabel.style.color = '#059669';
  } else {
    remLabel.textContent = 'المتبقي';
    remSpan.textContent = Math.abs(diff) + ' جنيه';
    remSection.style.background = '#fef2f2';
    remSpan.style.color = '#dc2626';
    remLabel.style.color = '#dc2626';
  }
};
document.getElementById('checkoutPaid').addEventListener('input', window.calcRemaining);
document.getElementById('confirmCheckout').onclick = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
  var openShift, lastKey, lastTime, remaining, resetCheckout, custType, customer, totalAmount, method, items, serviceAmount, taxAmount, table, paid, change, allProds, priceMap, _iterator, _step, item, catalogPrice, expected, invId, inv, matchedCust, custReadFailed, allCusts, isAdmin, printSettings, autoPrintReceipt, autoPrintKitchen, copies, hasPrinter, safeItems, btnContainer, cashierBtn, kitchenBtn, closeBtn, printCashier, printKitchen, hideSuccess, _t5, _t6, _t7, _t8, _t9, _t0, _t1, _t10, _t11;
  return _regenerator().w(function (_context9) {
    while (1) switch (_context9.p = _context9.n) {
      case 0:
        if (!checkoutProcessing) {
          _context9.n = 1;
          break;
        }
        return _context9.a(2);
      case 1:
        _context9.p = 1;
        _context9.n = 2;
        return DB.shifts.getOpen();
      case 2:
        openShift = _context9.v;
        if (openShift) {
          _context9.n = 3;
          break;
        }
        return _context9.a(2, alert('⚠️ لا يمكن إرسال الطلب قبل فتح الشيفت.\nمن فضلك افتح الشيفت أولًا من لوحة التحكم.'));
      case 3:
        _context9.n = 5;
        break;
      case 4:
        _context9.p = 4;
        _t5 = _context9.v;
        console.warn('[checkout] shift check failed:', _t5);
        return _context9.a(2, alert('⚠️ تعذر التحقق من الشيفت. تأكد من الاتصال وحاول مرة أخرى.'));
      case 5:
        if (!(isCustomer && tableNum)) {
          _context9.n = 7;
          break;
        }
        lastKey = 'laguna_last_order_t' + tableNum;
        lastTime = Number(localStorage.getItem(lastKey)) || 0;
        if (!(Date.now() - lastTime < COOLDOWN_MS)) {
          _context9.n = 6;
          break;
        }
        remaining = Math.ceil((COOLDOWN_MS - (Date.now() - lastTime)) / 1000);
        return _context9.a(2, alert('يرجى الانتظار ' + remaining + ' ثوانٍ قبل إرسال طلب جديد'));
      case 6:
        localStorage.setItem(lastKey, Date.now());
      case 7:
        checkoutProcessing = true;
        document.getElementById('confirmCheckout').disabled = true;
        document.getElementById('confirmCheckout').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
        resetCheckout = function resetCheckout() {
          checkoutProcessing = false;
          document.getElementById('confirmCheckout').disabled = false;
          document.getElementById('confirmCheckout').innerHTML = 'تأكيد الدفع';
        };
        _context9.p = 8;
        syncSheetNotesToOrderBox();
        custType = document.getElementById('checkoutCustomerType').value;
        if (!(custType === 'special')) {
          _context9.n = 10;
          break;
        }
        customer = document.getElementById('checkoutSpecialName').value.trim();
        if (customer) {
          _context9.n = 9;
          break;
        }
        resetCheckout();
        return _context9.a(2, alert('يرجى إدخال اسم العميل الخاص'));
      case 9:
        totalAmount = Math.round(window._itemsTotal * 0.75);
        _context9.n = 11;
        break;
      case 10:
        if (custType === 'workers') {
          customer = document.getElementById('checkoutSpecialName').value.trim() || 'عمالة';
          totalAmount = 0;
        } else if (custType === 'free') {
          customer = 'الاستاذ محمد الجوهري';
          totalAmount = 0;
        } else {
          customer = 'نقدي';
          totalAmount = window._checkoutTotal;
        }
      case 11:
        method = document.getElementById('checkoutMethod').value;
        items = window._checkoutItems || [];
        serviceAmount = window._checkoutService || 0;
        taxAmount = window._checkoutTax || 0;
        table = tableNum || getTableInput() ? 'طاولة ' + (tableNum || getTableInput()) : null;
        paid = Math.max(0, Number(document.getElementById('checkoutPaid').value) || 0);
        change = Math.max(0, paid - totalAmount);
        if (!(custType === 'regular')) {
          _context9.n = 20;
          break;
        }
        _context9.n = 12;
        return DB.products.all();
      case 12:
        _t6 = _context9.v;
        if (_t6) {
          _context9.n = 13;
          break;
        }
        _t6 = [];
      case 13:
        allProds = _t6;
        priceMap = {};
        allProds.forEach(function (p) {
          priceMap[p.name] = Number(p.price);
        });
        _iterator = _createForOfIteratorHelper(items);
        _context9.p = 14;
        _iterator.s();
      case 15:
        if ((_step = _iterator.n()).done) {
          _context9.n = 17;
          break;
        }
        item = _step.value;
        catalogPrice = priceMap[item.name];
        if (!(catalogPrice !== undefined)) {
          _context9.n = 16;
          break;
        }
        expected = catalogPrice + (item.hasMilk ? 15 : 0);
        if (!(item.price !== expected)) {
          _context9.n = 16;
          break;
        }
        resetCheckout();
        return _context9.a(2, alert('خطأ في السعر: "' + item.name + '" - السعر المتوقع ' + expected + ' ج.م ولكن وجد ' + item.price + ' ج.م'));
      case 16:
        _context9.n = 15;
        break;
      case 17:
        _context9.n = 19;
        break;
      case 18:
        _context9.p = 18;
        _t7 = _context9.v;
        _iterator.e(_t7);
      case 19:
        _context9.p = 19;
        _iterator.f();
        return _context9.f(19);
      case 20:
        invId = 'INV-' + safeId().slice(0, 8).toUpperCase();
        custReadFailed = false;
        if (!(custType === 'special')) {
          _context9.n = 26;
          break;
        }
        _context9.p = 21;
        _context9.n = 22;
        return DB.customers.all();
      case 22:
        _t8 = _context9.v;
        if (_t8) {
          _context9.n = 23;
          break;
        }
        _t8 = [];
      case 23:
        allCusts = _t8;
        matchedCust = allCusts.find(function (c) {
          return c.name === customer;
        });
        if (matchedCust) {
          _context9.n = 24;
          break;
        }
        resetCheckout();
        return _context9.a(2, alert('العميل "' + customer + '" غير موجود في قائمة العملاء المميزين'));
      case 24:
        _context9.n = 26;
        break;
      case 25:
        _context9.p = 25;
        _t9 = _context9.v;
        custReadFailed = true;
        console.warn('[checkout] could not read customers:', _t9);
      case 26:
        _context9.p = 26;
        _context9.n = 27;
        return FB.runTransaction(/*#__PURE__*/function () {
          var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(tx) {
            var rawDb, tn, allTables, tbl, tableRef, invData, uid, _t2;
            return _regenerator().w(function (_context4) {
              while (1) switch (_context4.n) {
                case 0:
                  rawDb = FB.getDb();
                  tn = tableNum || getTableInput();
                  if (!tn) {
                    _context4.n = 3;
                    break;
                  }
                  _context4.n = 1;
                  return DB.tables.all();
                case 1:
                  _t2 = _context4.v;
                  if (_t2) {
                    _context4.n = 2;
                    break;
                  }
                  _t2 = [];
                case 2:
                  allTables = _t2;
                  tbl = allTables.find(function (t) {
                    return t.name === 'طاولة ' + tn;
                  });
                  if (tbl) {
                    tableRef = rawDb.collection('tables_').doc(tbl.id);
                    tx.update(tableRef, {
                      status: 'occupied'
                    });
                  }
                case 3:
                  invData = {
                    id: invId,
                    customer: customer,
                    table: table,
                    date: FB.nowISO(),
                    items: items,
                    total: totalAmount,
                    paid: paid,
                    change: change,
                    remaining: Math.max(0, totalAmount - paid),
                    serviceAmount: serviceAmount,
                    taxAmount: taxAmount,
                    paymentMethod: method,
                    status: custType === 'free' || custType === 'workers' ? 'paid' : 'pending',
                    customerType: custType,
                    itemsValue: items.reduce(function (s, i) {
                      return s + i.qty * i.price;
                    }, 0)
                  };
                  uid = FB.getUid();
                  if (uid) invData._uid = uid;
                  tx.set(rawDb.collection('invoices').doc(invId), invData);
                case 4:
                  return _context4.a(2);
              }
            }, _callee4);
          }));
          return function (_x) {
            return _ref6.apply(this, arguments);
          };
        }());
      case 27:
        _context9.p = 27;
        if (!matchedCust) {
          _context9.n = 28;
          break;
        }
        _context9.n = 28;
        return DB.customers.update(matchedCust.id, {
          visits: (matchedCust.visits || 0) + 1,
          totalSpent: (matchedCust.totalSpent || 0) + totalAmount,
          lastVisit: FB.nowISO()
        });
      case 28:
        _context9.n = 30;
        break;
      case 29:
        _context9.p = 29;
        _t0 = _context9.v;
        console.warn('[checkout] customer stats update failed:', _t0);
      case 30:
        inv = {
          id: invId,
          customer: customer,
          table: table,
          date: FB.nowISO(),
          items: items,
          total: totalAmount,
          paid: paid,
          change: change,
          remaining: Math.max(0, totalAmount - paid),
          serviceAmount: serviceAmount,
          taxAmount: taxAmount,
          paymentMethod: method,
          status: custType === 'free' || custType === 'workers' ? 'paid' : 'pending',
          customerType: custType
        };
        _context9.n = 32;
        break;
      case 31:
        _context9.p = 31;
        _t1 = _context9.v;
        resetCheckout();
        console.error('[checkout] transaction error:', _t1);
        return _context9.a(2, alert('فشل إنشاء الفاتورة: ' + _t1.message));
      case 32:
        DB.audit.log('invoice_created', {
          id: invId,
          total: totalAmount,
          method: method,
          customer: customer,
          table: table,
          customerType: custType,
          itemsValue: items.reduce(function (s, i) {
            return s + i.qty * i.price;
          }, 0)
        });
        document.getElementById('checkoutModal').classList.remove('show');
        if (!(inv && inv.id)) {
          _context9.n = 35;
          break;
        }
        isAdmin = !!sessionStorage.getItem('laguna_user');
        _context9.n = 33;
        return DB.settings.get();
      case 33:
        _t10 = _context9.v;
        if (_t10) {
          _context9.n = 34;
          break;
        }
        _t10 = {};
      case 34:
        printSettings = _t10;
        autoPrintReceipt = printSettings.autoPrintReceipt !== false;
        autoPrintKitchen = printSettings.autoPrintKitchen !== false;
        copies = printSettings.printCopies || 1;
        hasPrinter = typeof PRINTER !== 'undefined' && PRINTER.isConnected();
        if (isCustomer || !isAdmin) {
          alert("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 ".concat(inv.id, "\n\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: ").concat(totalAmount, " \u062C.\u0645\n\u0627\u0644\u0645\u062F\u0641\u0648\u0639: ").concat(paid, " \u062C.\u0645"));
        } else {
          safeItems = inv.items && inv.items.length ? '<div style="margin:8px 0">' + inv.items.map(function (it) {
            var safeName = escapeHtml(it.name);
            var milkTxt = it.hasMilk ? ' +لبن' : '';
            var safeNote = escapeHtml(it.note || '');
            var noteTxt = safeNote ? ' (' + safeNote + ')' : '';
            return "<div style=\"display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #eee;font-size:13px\"><span>\u2022 ".concat(safeName).concat(milkTxt).concat(noteTxt, " x").concat(it.qty, "</span><span>").concat(it.qty * it.price, " \u062C.\u0645</span></div>");
          }).join('') + '</div><hr style="margin:8px 0;border:none;border-top:2px dashed #ddd">' : '';
          document.getElementById('successDetails').innerHTML = "\n          <img src=\"images/logo.png\" style=\"height:55px;margin-bottom:4px;background:#222;padding:6px;border-radius:8px\" alt=\"LagunaDubai\">\n          <div style=\"font-size:14px;font-weight:700;margin-bottom:4px\">LagunaDubai</div>\n          <div style=\"font-size:11px;font-weight:700;color:var(--accent);margin-bottom:8px\">** \u0641\u0627\u062A\u0648\u0631\u0629 \u0643\u0627\u0634\u064A\u0631 **</div>\n          <div style=\"font-size:11px;color:#888;margin-bottom:4px\">#".concat(escapeHtml(inv.id), "</div>\n          ").concat(safeItems, "\n          ").concat(inv.serviceAmount > 0 ? "<div style=\"display:flex;justify-content:space-between;margin:2px 0;color:#888;font-size:12px\"><span>\u062E\u062F\u0645\u0629 (".concat(Math.round(inv.serviceAmount / (totalAmount - inv.serviceAmount - (inv.taxAmount || 0)) * 100) || 0, "%)</span><span>").concat(inv.serviceAmount, " \u062C.\u0645</span></div>") : '', "\n          ").concat(inv.taxAmount > 0 ? "<div style=\"display:flex;justify-content:space-between;margin:2px 0;color:#888;font-size:12px\"><span>\u0636\u0631\u064A\u0628\u0629 (".concat(Math.round(inv.taxAmount / (totalAmount - inv.taxAmount) * 100) || 0, "%)</span><span>").concat(inv.taxAmount, " \u062C.\u0645</span></div>") : '', "\n          <div style=\"display:flex;justify-content:space-between;margin:2px 0;font-weight:700;font-size:15px;padding-top:4px\"><span>\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A</span><span>").concat(totalAmount, " \u062C.\u0645</span></div>\n          <div style=\"display:flex;justify-content:space-between;margin:2px 0\"><span>\u0627\u0644\u0645\u062F\u0641\u0648\u0639</span><span>").concat(paid, " \u062C.\u0645</span></div>\n          ").concat(inv.change > 0 ? "<div style=\"display:flex;justify-content:space-between;margin:2px 0;color:#059669\"><span>\u0627\u0644\u0628\u0627\u0642\u064A \u0644\u0644\u0639\u0645\u064A\u0644</span><span>".concat(inv.change, " \u062C.\u0645</span></div>") : '', "\n          ").concat(inv.remaining > 0 ? "<div style=\"display:flex;justify-content:space-between;margin:2px 0;color:#dc2626\"><span>\u0627\u0644\u0645\u062A\u0628\u0642\u064A</span><span>".concat(inv.remaining, " \u062C.\u0645</span></div>") : '', "\n        ").trim();
          btnContainer = document.getElementById('successButtons');
          btnContainer.innerHTML = '';
          cashierBtn = document.createElement('button');
          cashierBtn.style.cssText = 'flex:1;height:44px;border-radius:12px;font-size:13px;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent-light));color:#fff;border:none;cursor:pointer';
          cashierBtn.innerHTML = '<i class="fa-solid fa-receipt"></i> طباعة الكاشير';
          kitchenBtn = document.createElement('button');
          kitchenBtn.style.cssText = 'flex:1;height:44px;border-radius:12px;font-size:13px;font-weight:700;background:#dc2626;color:#fff;border:none;cursor:pointer';
          kitchenBtn.innerHTML = '<i class="fa-solid fa-utensils"></i> طباعة المطبخ';
          closeBtn = document.createElement('button');
          closeBtn.style.cssText = 'flex:1;height:44px;border-radius:12px;font-size:14px;font-weight:600;background:#f5f5f4;color:var(--primary);border:none;cursor:pointer';
          closeBtn.textContent = 'إغلاق';
          btnContainer.appendChild(cashierBtn);
          btnContainer.appendChild(kitchenBtn);
          btnContainer.appendChild(closeBtn);
          document.getElementById('successModal').classList.add('show');
          printCashier = /*#__PURE__*/function () {
            var _printCashier = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
              var printed, agentResult, result, tpl, w, _t3;
              return _regenerator().w(function (_context5) {
                while (1) switch (_context5.p = _context5.n) {
                  case 0:
                    printed = false;
                    _context5.p = 1;
                    if (!(localStorage.getItem('laguna_print_agent_enabled') === 'true')) {
                      _context5.n = 3;
                      break;
                    }
                    _context5.n = 2;
                    return PRINTER.printViaAgent(inv, 'invoice', {
                      noAutoKitchen: true,
                      openDrawer: paid >= totalAmount
                    });
                  case 2:
                    agentResult = _context5.v;
                    if (agentResult && agentResult.ok) printed = true;
                  case 3:
                    if (!(!printed && typeof PRINTER !== 'undefined' && PRINTER.isConnected())) {
                      _context5.n = 5;
                      break;
                    }
                    _context5.n = 4;
                    return PRINTER.printReceipt(inv);
                  case 4:
                    result = _context5.v;
                    if (result && result.ok) printed = true;
                    if (!(printed && paid >= totalAmount)) {
                      _context5.n = 5;
                      break;
                    }
                    _context5.n = 5;
                    return PRINTER.openDrawer();
                  case 5:
                    _context5.n = 7;
                    break;
                  case 6:
                    _context5.p = 6;
                    _t3 = _context5.v;
                    console.warn('[print]', _t3);
                  case 7:
                    if (printed) {
                      _context5.n = 9;
                      break;
                    }
                    _context5.n = 8;
                    return TEMPLATE.getTemplate('cashier');
                  case 8:
                    tpl = _context5.v;
                    w = window.open('', '_blank', 'width=400,height=600');
                    w.document.write(TEMPLATE.renderCashier(inv, tpl || TEMPLATE.defaultCashierTemplate));
                    w.document.close();
                  case 9:
                    return _context5.a(2);
                }
              }, _callee5, null, [[1, 6]]);
            }));
            function printCashier() {
              return _printCashier.apply(this, arguments);
            }
            return printCashier;
          }();
          printKitchen = /*#__PURE__*/function () {
            var _printKitchen = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
              var printed, agentResult, tpl, w, _t4;
              return _regenerator().w(function (_context6) {
                while (1) switch (_context6.p = _context6.n) {
                  case 0:
                    printed = false;
                    _context6.p = 1;
                    if (!(localStorage.getItem('laguna_print_agent_enabled') === 'true')) {
                      _context6.n = 3;
                      break;
                    }
                    _context6.n = 2;
                    return PRINTER.printViaAgent(inv, 'kitchen');
                  case 2:
                    agentResult = _context6.v;
                    if (agentResult && agentResult.ok) printed = true;
                  case 3:
                    if (!(!printed && typeof PRINTER !== 'undefined' && PRINTER.isConnected())) {
                      _context6.n = 5;
                      break;
                    }
                    _context6.n = 4;
                    return PRINTER.printKitchenOrder(inv);
                  case 4:
                    printed = true;
                  case 5:
                    _context6.n = 7;
                    break;
                  case 6:
                    _context6.p = 6;
                    _t4 = _context6.v;
                    console.warn('[print]', _t4);
                  case 7:
                    if (printed) {
                      _context6.n = 9;
                      break;
                    }
                    _context6.n = 8;
                    return TEMPLATE.getTemplate('kitchen');
                  case 8:
                    tpl = _context6.v;
                    w = window.open('', '_blank', 'width=400,height=600');
                    w.document.write(TEMPLATE.renderKitchen(inv, tpl || TEMPLATE.defaultKitchenTemplate));
                    w.document.close();
                  case 9:
                    return _context6.a(2);
                }
              }, _callee6, null, [[1, 6]]);
            }));
            function printKitchen() {
              return _printKitchen.apply(this, arguments);
            }
            return printKitchen;
          }();
          cashierBtn.onclick = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
            return _regenerator().w(function (_context7) {
              while (1) switch (_context7.n) {
                case 0:
                  document.getElementById('successModal').classList.remove('show');
                  _context7.n = 1;
                  return printCashier();
                case 1:
                  return _context7.a(2);
              }
            }, _callee7);
          }));
          kitchenBtn.onclick = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
            return _regenerator().w(function (_context8) {
              while (1) switch (_context8.n) {
                case 0:
                  document.getElementById('successModal').classList.remove('show');
                  _context8.n = 1;
                  return printKitchen();
                case 1:
                  return _context8.a(2);
              }
            }, _callee8);
          }));
          hideSuccess = function hideSuccess() {
            return document.getElementById('successModal').classList.remove('show');
          };
          closeBtn.onclick = hideSuccess;
        }
        _context9.n = 36;
        break;
      case 35:
        alert("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629\n\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: ".concat(totalAmount, " \u062C.\u0645\n\u0627\u0644\u0645\u062F\u0641\u0648\u0639: ").concat(paid, " \u062C.\u0645"));
      case 36:
        clearOrder();
        _context9.n = 38;
        break;
      case 37:
        _context9.p = 37;
        _t11 = _context9.v;
        console.error('[checkout] error:', _t11);
        alert('حدث خطأ أثناء إنشاء الفاتورة. حاول مرة أخرى.');
      case 38:
        resetCheckout();
      case 39:
        return _context9.a(2);
    }
  }, _callee9, null, [[27, 29], [26, 31], [21, 25], [14, 18, 19, 20], [8, 37], [1, 4]]);
}));
document.getElementById('cancelCheckout').onclick = function () {
  document.getElementById('checkoutModal').classList.remove('show');
};

// Mobile cart floating button
var cartFloat = document.getElementById('cartFloat');
var cartSheet = document.getElementById('cartSheet');
var sheetClose = document.getElementById('sheetClose');
var sheetOrderList = document.getElementById('sheetOrderList');
var sheetTotal = document.getElementById('sheetTotal');
var sheetCheckout = document.getElementById('sheetCheckout');
var sheetClear = document.getElementById('sheetClear');
if (cartFloat && cartSheet) {
  cartFloat.onclick = function () {
    cartSheet.style.display = 'flex';
    syncOrderSheet();
  };
  sheetClose.onclick = function () {
    return cartSheet.style.display = 'none';
  };
  cartSheet.onclick = function (e) {
    if (e.target === cartSheet) cartSheet.style.display = 'none';
  };
  sheetCheckout.onclick = function () {
    cartSheet.style.display = 'none';
    checkoutBtn.click();
  };
  sheetClear.onclick = function () {
    cartSheet.style.display = 'none';
    clearBtn.click();
  };
}
function autoConnectPrinter() {
  return _autoConnectPrinter.apply(this, arguments);
}
function _autoConnectPrinter() {
  _autoConnectPrinter = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11() {
    var btn, _t18;
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.p = _context11.n) {
        case 0:
          _context11.p = 0;
          _context11.n = 1;
          return PRINTER.restorePrinters();
        case 1:
          if (!PRINTER.isConnected()) {
            _context11.n = 2;
            break;
          }
          return _context11.a(2);
        case 2:
          btn = document.createElement('button');
          btn.id = 'connectPrinterBtn';
          btn.innerHTML = '🖨️ توصيل الطابعة';
          btn.style.cssText = 'position:fixed;bottom:80px;right:15px;z-index:999;background:#e94560;color:#fff;border:none;border-radius:50px;padding:12px 20px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 15px rgba(233,69,96,0.4);transition:0.2s';
          btn.onmouseover = function () {
            return btn.style.transform = 'scale(1.05)';
          };
          btn.onmouseout = function () {
            return btn.style.transform = 'scale(1)';
          };
          btn.onclick = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
            var _t17;
            return _regenerator().w(function (_context10) {
              while (1) switch (_context10.p = _context10.n) {
                case 0:
                  btn.innerHTML = '⏳ جاري...';
                  btn.disabled = true;
                  _context10.p = 1;
                  _context10.n = 2;
                  return PRINTER.addPrinter('usb', {
                    name: 'XP-80',
                    forKitchen: false
                  });
                case 2:
                  btn.innerHTML = '✅ متصلة';
                  btn.style.background = '#059669';
                  setTimeout(function () {
                    return btn.remove();
                  }, 2000);
                  _context10.n = 4;
                  break;
                case 3:
                  _context10.p = 3;
                  _t17 = _context10.v;
                  btn.innerHTML = '❌ فشل';
                  setTimeout(function () {
                    btn.innerHTML = '🖨️ توصيل الطابعة';
                    btn.disabled = false;
                  }, 2000);
                case 4:
                  return _context10.a(2);
              }
            }, _callee10, null, [[1, 3]]);
          }));
          document.body.appendChild(btn);
          _context11.n = 4;
          break;
        case 3:
          _context11.p = 3;
          _t18 = _context11.v;
          console.warn('[printer]', _t18);
        case 4:
          return _context11.a(2);
      }
    }, _callee11, null, [[0, 3]]);
  }));
  return _autoConnectPrinter.apply(this, arguments);
}
if (!isCustomer && window.innerWidth > 768) autoConnectPrinter();
loadProducts();

// ── Auto-print toggle ──
(function () {
  var btn = document.getElementById('autoPrintToggle');
  var status = document.getElementById('autoPrintStatus');
  if (!btn || !status) return;
  function update() {
    var disabled = localStorage.getItem('laguna_auto_print_disabled') === 'true';
    btn.style.borderColor = disabled ? '#dc2626' : '#059669';
    btn.style.background = disabled ? '#fef2f2' : '#f0fdf4';
    status.textContent = disabled ? 'متوقفة' : 'مفعلة';
    status.style.background = disabled ? '#dc2626' : '#059669';
    status.style.color = '#fff';
  }
  update();
  btn.onclick = function () {
    var cur = localStorage.getItem('laguna_auto_print_disabled') === 'true';
    localStorage.setItem('laguna_auto_print_disabled', cur ? 'false' : 'true');
    update();
  };
})();
function printReceipt(inv) {
  TEMPLATE.getTemplate('cashier').then(function (cashierTpl) {
    if (!cashierTpl) cashierTpl = TEMPLATE.defaultCashierTemplate;
    var w = window.open('', '_blank', 'width=400,height=600');
    var rendered = TEMPLATE.renderCashier(inv, cashierTpl);
    w.document.write(rendered);
    w.document.close();
  })["catch"](function () {
    var w = window.open('', '_blank', 'width=400,height=600');
    var rendered = TEMPLATE.renderCashier(inv);
    w.document.write(rendered);
    w.document.close();
  });
}

