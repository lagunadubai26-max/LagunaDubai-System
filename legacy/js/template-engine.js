function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
window.TEMPLATE = function () {
  var PLACEHOLDERS = {
    cashier: ['logo', 'title', 'id', 'date', 'customer', 'table', 'items', 'serviceAmount', 'taxAmount', 'total', 'paid', 'change', 'remaining', 'paymentMethod', 'status', 'footer'],
    kitchen: ['logo', 'title', 'id', 'date', 'table', 'items', 'footer']
  };
  function escape(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function buildItemsHtml(inv, type) {
    if (!inv.items || !inv.items.length) return '';
    if (type === 'kitchen') {
      return inv.items.map(function (item) {
        var safeName = escape(item.name);
        var milkTxt = item.hasMilk ? ' +لبن' : '';
        var safeNote = escape(item.note || '');
        var noteTxt = safeNote ? '<br><small>' + safeNote + '</small>' : '';
        return '<div class="kitchen-item">' + '<span class="item-name">' + safeName + milkTxt + noteTxt + '</span>' + '<span class="item-qty">×' + item.qty + '</span>' + '</div>';
      }).join('');
    }
    return inv.items.map(function (item) {
      var safeName = escape(item.name);
      var milkTxt = item.hasMilk ? ' +لبن' : '';
      var safeNote = escape(item.note || '');
      var noteTxt = safeNote ? '<br><small>' + safeNote + '</small>' : '';
      return '<tr>' + '<td class="item-name">' + safeName + milkTxt + noteTxt + '</td>' + '<td style="text-align:center;">' + item.qty + '</td>' + '<td style="text-align:center;">' + item.price + ' ج.م</td>' + '</tr>';
    }).join('');
  }
  function buildItemsPlain(inv) {
    if (!inv.items || !inv.items.length) return '';
    return inv.items.map(function (item) {
      var safeName = escapeEscPos(item.name);
      var safeNote = escapeEscPos(item.note || '');
      var milkTxt = item.hasMilk ? ' +لبن' : '';
      var noteTxt = safeNote ? ' (' + safeNote + ')' : '';
      return "\n\u2022 " + safeName + milkTxt + noteTxt + ' x' + item.qty + ' = ' + item.qty * item.price + ' ج.م';
    }).join('');
  }
  function defaultCashierTemplate() {
    return '<div style="width:100%;max-width:320px;margin:0 auto;font-family:\'Cairo\',sans-serif;direction:rtl;background:#fff;padding:12px 10px;color:#222;">\n' + '  <div style="text-align:center;margin-bottom:6px;">\n' + '    {logo}\n' + '    <div style="font-size:24px;font-weight:900;color:#1a1a2e;margin-top:4px;">لاجونا دبي</div>\n' + '    <div style="font-size:10px;color:#888;margin-top:2px;">كافيه - مطعم | Laguna Dubai</div>\n' + '  </div>\n' + '  <div style="text-align:center;font-size:12px;color:#b8860b;margin:4px 0 2px;">❋ ❋ ❋ ❋ ❋</div>\n' + '  <div style="text-align:center;font-size:15px;font-weight:700;color:#1a1a2e;margin:2px 0;">فاتورة ضريبية</div>\n' + '  <div style="border-top:2px solid #1a1a2e;margin:6px 0;"></div>\n' + '  <table style="width:100%;font-size:11px;line-height:1.9;margin:4px 0;">\n' + '    <tr><td style="color:#888;">رقم الفاتورة</td><td style="text-align:left;font-weight:700;direction:ltr">#{id}</td></tr>\n' + '    <tr><td style="color:#888;">التاريخ</td><td style="text-align:left;">{date}</td></tr>\n' + '    <tr><td style="color:#888;">العميل</td><td style="text-align:left;">{customer}</td></tr>\n' + '    <tr><td style="color:#888;">طاولة</td><td style="text-align:left;">{table}</td></tr>\n' + '  </table>\n' + '  <div style="border-top:1px dashed #bbb;margin:4px 0;"></div>\n' + '  <table style="width:100%;font-size:11px;border-collapse:collapse;margin:4px 0;">\n' + '    <tr style="border-bottom:2px solid #1a1a2e;font-weight:700;font-size:11px;">\n' + '      <td style="padding:4px 2px;">الصنف</td>\n' + '      <td style="width:30px;text-align:center;">الكمية</td>\n' + '      <td style="width:50px;text-align:center;">السعر</td>\n' + '    </tr>\n' + '    {items}\n' + '  </table>\n' + '  <div style="border-top:1px dashed #bbb;margin:4px 0;"></div>\n' + '  <table style="width:100%;font-size:11px;line-height:1.8;">\n' + '    {taxAmount}\n' + '    {serviceAmount}\n' + '  </table>\n' + '  <div style="background:#1a1a2e;color:#fff;border-radius:8px;padding:10px 14px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;">\n' + '    <span style="font-size:14px;font-weight:700;">الإجمالي</span>\n' + '    <span style="font-size:22px;font-weight:900;">{total}</span>\n' + '  </div>\n' + '  <table style="width:100%;font-size:11px;line-height:1.8;">\n' + '    <tr><td style="color:#888;">طريقة الدفع</td><td style="text-align:left;font-weight:700;">{paymentMethod}</td></tr>\n' + '    <tr><td style="color:#888;">المدفوع</td><td style="text-align:left;">{paid}</td></tr>\n' + '    <tr><td style="color:#888;">المتبقي</td><td style="text-align:left;color:#c0392b;font-weight:600;">{remaining}</td></tr>\n' + '  </table>\n' + '  <div style="border-top:2px solid #1a1a2e;margin:6px 0 4px;"></div>\n' + '  <div style="text-align:center;font-size:12px;font-weight:700;color:#1a1a2e;">شكرًا لزيارتكم</div>\n' + '  <div style="text-align:center;font-size:10px;color:#999;margin-top:2px;">{footer}</div>\n' + '  <script>window.print();window.close();<\/script>\n' + '</div>';
  }
  function defaultKitchenTemplate() {
    return '<div style="width:300px;margin:0 auto;font-family:\'Cairo\',sans-serif;direction:rtl;background:#fff;padding:12px 8px;color:#222;">\n' + '  <div style="text-align:center;margin-bottom:6px;">\n' + '    {logo}\n' + '    <div style="font-size:20px;font-weight:900;color:#1a1a2e;">لاجونا دبي</div>\n' + '    <div style="font-size:10px;color:#888;">كافيه - مطعم</div>\n' + '  </div>\n' + '  <div style="border-top:3px solid #c0392b;margin:6px 0;"></div>\n' + '  <div style="text-align:center;font-size:18px;font-weight:900;color:#c0392b;margin:4px 0;">أمر مطبخ</div>\n' + '  <div style="border-top:2px dashed #c0392b;margin:6px 0;"></div>\n' + '  <table style="width:100%;font-size:13px;line-height:2;font-weight:700;">\n' + '    <tr><td style="color:#888;width:50px;">طاولة</td><td style="text-align:left;font-size:18px;color:#c0392b;">{table}</td></tr>\n' + '    <tr><td style="color:#888;">رقم الطلب</td><td style="text-align:left;direction:ltr">#{id}</td></tr>\n' + '    <tr><td style="color:#888;">الوقت</td><td style="text-align:left;font-weight:400;font-size:12px;">{date}</td></tr>\n' + '  </table>\n' + '  <div style="border-top:2px dashed #c0392b;margin:8px 0;"></div>\n' + '  {items}\n' + '  <div style="display:flex;align-items:center;padding:8px 4px;margin-bottom:4px;background:#f9f9f9;border-radius:6px;border-right:4px solid #c0392b;">\n' + '    <span style="font-size:20px;font-weight:900;min-width:40px;text-align:center;color:#c0392b;">{qty}</span>\n' + '    <span style="font-size:16px;font-weight:700;margin-right:8px;">{name}</span>\n' + '  </div>\n' + '  {/items}\n' + '  <div style="border-top:3px solid #c0392b;margin:12px 0 4px;"></div>\n' + '  <div style="text-align:center;font-size:10px;color:#888;">{footer}</div>\n' + '  <script>window.print();window.close();<\/script>\n' + '</div>';
  }
  function replaceVars(text, vars) {
    var r = text;
    for (var _i = 0, _Object$entries = Object.entries(vars); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        val = _Object$entries$_i[1];
      r = r.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), val);
      r = r.replace(new RegExp('\\{' + key + '\\}', 'g'), val);
    }
    return r;
  }
  function renderItemsBlock(tpl, inv) {
    var start = tpl.indexOf('{items}');
    var end = tpl.indexOf('{/items}');
    if (start === -1 || end === -1) return tpl;
    var before = tpl.slice(0, start);
    var itemTpl = tpl.slice(start + 7, end);
    var after = tpl.slice(end + 8);
    var itemsHtml = '';
    if (inv.items) {
      inv.items.forEach(function (item) {
        var milkTxt = item.hasMilk ? ' +لبن' : '';
        var hasMilkHtml = item.hasMilk ? ' +لبن' : '';
        var safeNote = escape(item.note || '');
        var line = itemTpl;
        var itemVars = {
          name: escape(item.name) + milkTxt,
          qty: item.qty,
          price: item.price + ' ج.م',
          total: item.qty * item.price + ' ج.م',
          note: safeNote,
          hasMilk: item.hasMilk ? 'true' : 'false'
        };
        line = replaceVars(line, itemVars);
        itemsHtml += line;
      });
    }
    return before + itemsHtml + renderItemsBlock(after, inv);
  }
  function renderTemplate(tpl, inv, type) {
    var paid = inv.paid != null ? Number(inv.paid) : Number(inv.total || 0);
    var total = Number(inv.total || 0);
    var remaining = inv.remaining != null ? Number(inv.remaining) : Math.max(0, total - paid);
    var change = inv.change || 0;
    var subtotal = total - (inv.serviceAmount || 0) - (inv.taxAmount || 0);
    var dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-EG') : FB.clockNow().toLocaleString('ar-EG');
    var status = remaining > 0 ? 'معلق' : 'مدفوع';
    var baseUrl = window.location.origin + '/LagunaDubai-System/';
    var logoHtml = '<img src="' + baseUrl + 'images/logo.png" id="logoImg" style="height:65px;margin-bottom:4px;background:#222;padding:6px;border-radius:8px" alt="LagunaDubai">';
    var commonVars = {
      logo: logoHtml,
      id: escape(inv.id || ''),
      date: dateStr,
      customer: escape(inv.customer || ''),
      table: escape(inv.table || ''),
      items: '',
      serviceAmount: inv.serviceAmount > 0 ? '<tr><td style="color:#888;">خدمة الضيافة</td><td style="text-align:left;">' + Number(inv.serviceAmount).toLocaleString() + ' ج.م</td></tr>' : '',
      taxAmount: inv.taxAmount > 0 ? '<tr><td style="color:#888;">ضريبة القيمة المضافة</td><td style="text-align:left;">' + Number(inv.taxAmount).toLocaleString() + ' ج.م</td></tr>' : '',
      subtotal: Number(subtotal).toLocaleString() + ' ج.م',
      total: Number(total).toLocaleString() + ' ج.م',
      paid: Number(paid).toLocaleString() + ' ج.م',
      change: change > 0 ? Number(change).toLocaleString() + ' ج.م' : '0 ج.م',
      remaining: remaining > 0 ? Number(remaining).toLocaleString() + ' ج.م' : '0 ج.م',
      paymentMethod: inv.paymentMethod || 'كاش',
      status: status,
      footer: 'شكراً لزيارتكم ☕'
    };
    if (type === 'cashier') {
      commonVars.title = '** فاتورة كاشير **';
    } else {
      commonVars.title = '** طلب مطبخ **';
      commonVars.table = escape(inv.table || '');
    }

    // First render the items block
    var result = renderItemsBlock(tpl, inv);
    // Then replace all remaining variables
    result = replaceVars(result, commonVars);
    // Clean up any unreplaced placeholders
    result = result.replace(/\{[^}]+\}/g, '');
    result = result.replace(/\{\{[^}]+\}\}/g, '');
    // Wrap in full HTML if not already (for proper @page CSS in thermal printing)
    if (!result.match(/<html/i)) {
      result = '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">' + '<style>@media print{@page{margin:0;size:80mm 400mm}}body{margin:0;padding:0;font-family:\'Cairo\',sans-serif}</style>' + '</head><body>' + result + '</body></html>';
    }
    return result;
  }
  function renderCashier(inv, templateStr) {
    var tpl = templateStr || defaultCashierTemplate();
    return renderTemplate(tpl, inv, 'cashier');
  }
  function renderKitchen(inv, templateStr) {
    var tpl = templateStr || defaultKitchenTemplate();
    return renderTemplate(tpl, inv, 'kitchen');
  }

  // ===== ESCPOS Template =====
  var ESCPOS_CMD = {
    init: [0x1B, 0x40],
    center: [0x1B, 0x61, 0x01],
    left: [0x1B, 0x61, 0x00],
    boldOn: [0x1B, 0x45, 0x01],
    boldOff: [0x1B, 0x45, 0x00],
    sizeNormal: [0x1B, 0x21, 0x00],
    sizeDoubleH: [0x1B, 0x21, 0x10],
    sizeDoubleW: [0x1B, 0x21, 0x20],
    sizeDouble: [0x1B, 0x21, 0x30],
    cut: [0x1D, 0x56, 0x00],
    drawer: [0x1B, 0x70, 0x00, 0x19, 0xFA],
    newline: [0x0A]
  };
  function escposBytes() {
    for (var _len = arguments.length, bytes = new Array(_len), _key = 0; _key < _len; _key++) {
      bytes[_key] = arguments[_key];
    }
    return new Uint8Array(bytes.flat());
  }
  function concatUint8(arrays) {
    var len = 0;
    arrays.forEach(function (a) {
      return len += a.length;
    });
    var r = new Uint8Array(len);
    var off = 0;
    arrays.forEach(function (a) {
      r.set(a, off);
      off += a.length;
    });
    return r;
  }
  function textEncoder(s) {
    return new TextEncoder().encode(s + '\n');
  }
  function defaultEscposCashier() {
    return '{init}{center}{size=double}لاجونا دبي\n{size=normal}كافيه - مطعم\n{bold}فاتورة ضريبية\n{bold=off}\n❋ ❋ ❋ ❋ ❋\n{left}\n#{id}\n{date}\n{customer}{table}\n---\n{items:name:qty:price}\n---\n{taxAmount}\n{serviceAmount}\n{bold}{total}\n{bold=off}{paid}\n{change}\n{remaining}\n{paymentMethod}\n---\nشكراً لزيارتكم\n{footer}\n{cut}';
  }
  function defaultEscposKitchen() {
    return '{init}{center}{size=double}لاجونا دبي\n{size=normal}كافيه - مطعم\n\n{bold}*** أمر مطبخ ***\n{bold=off}{left}\n{date}\n#{id}\n{table}\n---\n{items:name:qty}\n---\n{footer}\n{cut}';
  }
  function renderEscpos(inv, templateStr, type) {
    var tpl = templateStr || (type === 'cashier' ? defaultEscposCashier() : defaultEscposKitchen());
    var paid = inv.paid != null ? Number(inv.paid) : Number(inv.total || 0);
    var total = Number(inv.total || 0);
    var remaining = inv.remaining != null ? Number(inv.remaining) : Math.max(0, total - paid);
    var change = inv.change || 0;
    var dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-SA') : FB.clockNow().toLocaleString('ar-SA');
    var status = remaining > 0 ? 'معلق' : 'مدفوع';
    var maxLen = 32;
    var vars = {
      date: dateStr,
      id: inv.id || '',
      customer: inv.customer || '',
      table: inv.table || '',
      total: 'الإجمالي:  ' + total.toLocaleString() + ' ج.م',
      paid: 'المدفوع:   ' + paid.toLocaleString() + ' ج.م',
      change: change > 0 ? 'الباقي للعميل: ' + change.toLocaleString() + ' ج.م' : '',
      remaining: remaining > 0 ? 'المتبقي:  ' + remaining.toLocaleString() + ' ج.م' : '',
      serviceAmount: inv.serviceAmount > 0 ? 'خدمة:      ' + Number(inv.serviceAmount).toLocaleString() + ' ج.م' : '',
      taxAmount: inv.taxAmount > 0 ? 'ضريبة:     ' + Number(inv.taxAmount).toLocaleString() + ' ج.م' : '',
      subtotal: 'المجموع:   ' + (total - (inv.serviceAmount || 0) - (inv.taxAmount || 0)).toLocaleString() + ' ج.م',
      paymentMethod: (inv.paymentMethod || 'كاش') + '    ' + status,
      footer: 'شكراً لزيارتكم\nLagunaDubai',
      status: status
    };
    var lines = tpl.split('\n');
    var parts = [];
    var _iterator = _createForOfIteratorHelper(lines),
      _step;
    try {
      var _loop = function _loop() {
          var line = _step.value;
          // Handle commands
          if (line.startsWith('{init}')) {
            parts.push(escposBytes(ESCPOS_CMD.init));
            return 0; // continue
          }
          if (line.startsWith('{center}')) {
            parts.push(escposBytes(ESCPOS_CMD.center));
            return 0; // continue
          }
          if (line.startsWith('{left}')) {
            parts.push(escposBytes(ESCPOS_CMD.left));
            return 0; // continue
          }
          if (line.startsWith('{bold=off}') || line.startsWith('{boldoff}')) {
            parts.push(escposBytes(ESCPOS_CMD.boldOff));
            return 0; // continue
          }
          if (line.startsWith('{bold}') || line.startsWith('{bold=on}')) {
            parts.push(escposBytes(ESCPOS_CMD.boldOn));
            return 0; // continue
          }
          if (line.startsWith('{size=double}') || line.startsWith('{size=2}')) {
            parts.push(escposBytes(ESCPOS_CMD.sizeDouble));
            return 0; // continue
          }
          if (line.startsWith('{size=normal}') || line.startsWith('{size=1}')) {
            parts.push(escposBytes(ESCPOS_CMD.sizeNormal));
            return 0; // continue
          }
          if (line.startsWith('{cut}')) {
            parts.push(escposBytes(ESCPOS_CMD.cut));
            return 0; // continue
          }
          if (line.startsWith('{drawer}') || line.startsWith('{cashdrawer}')) {
            parts.push(escposBytes(ESCPOS_CMD.drawer));
            return 0; // continue
          }
          if (line.startsWith('---')) {
            parts.push(textEncoder('------------------------------'));
            return 0; // continue
          }
          if (line.startsWith('{items:')) {
            var match = line.match(/\{items:([^}]+)\}/);
            if (!match || !inv.items) return 0; // continue
            var cols = match[1].split(':');
            inv.items.forEach(function (item) {
              var safeName = escapeEscPos(item.name);
              var safeNote = escapeEscPos(item.note || '');
              var milkTxt = item.hasMilk ? ' +لبن' : '';
              var noteTxt = safeNote ? ' (' + safeNote + ')' : '';
              var buf = '';
              if (cols.length === 3) {
                var name = ("\u2022 " + safeName + milkTxt).substring(0, maxLen - 8);
                var qty = '' + item.qty + 'x';
                var lastCol = cols[2] === 'price' ? item.price : item.qty * item.price;
                var lastColStr = '' + lastCol;
                var padded = name.padEnd(maxLen - qty.length - lastColStr.length) + qty + lastColStr;
                buf = padded;
              } else {
                buf = "\u2022 " + safeName + milkTxt + noteTxt;
              }
              parts.push(textEncoder(buf));
              if (safeNote) parts.push(textEncoder('  ' + safeNote));
            });
            return 0; // continue
          }

          // Replace variables
          var text = line;
          for (var _i2 = 0, _Object$entries2 = Object.entries(vars); _i2 < _Object$entries2.length; _i2++) {
            var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
              key = _Object$entries2$_i[0],
              val = _Object$entries2$_i[1];
            if (val) {
              var re = new RegExp('\\{' + key + '\\}', 'g');
              text = text.replace(re, val);
            }
          }
          text = text.replace(/\{empty\}/g, '').replace(/\{spacer\}/g, ' ');
          if (text.trim() || text === '') {
            parts.push(textEncoder(text));
          }
        },
        _ret;
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        _ret = _loop();
        if (_ret === 0) continue;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return concatUint8(parts);
  }
  function getTemplate(_x) {
    return _getTemplate.apply(this, arguments);
  }
  function _getTemplate() {
    _getTemplate = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(type) {
      var settings, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            _context.p = 0;
            _context.n = 1;
            return DB.settings.get();
          case 1:
            settings = _context.v;
            if (!(type === 'cashier')) {
              _context.n = 2;
              break;
            }
            return _context.a(2, settings.invoiceTemplateCashier || null);
          case 2:
            if (!(type === 'kitchen')) {
              _context.n = 3;
              break;
            }
            return _context.a(2, settings.invoiceTemplateKitchen || null);
          case 3:
            _context.n = 5;
            break;
          case 4:
            _context.p = 4;
            _t = _context.v;
          case 5:
            return _context.a(2, null);
        }
      }, _callee, null, [[0, 4]]);
    }));
    return _getTemplate.apply(this, arguments);
  }
  function getEscposTemplate(_x2) {
    return _getEscposTemplate.apply(this, arguments);
  }
  function _getEscposTemplate() {
    _getEscposTemplate = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(type) {
      var settings, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            _context2.p = 0;
            _context2.n = 1;
            return DB.settings.get();
          case 1:
            settings = _context2.v;
            if (!(type === 'cashier')) {
              _context2.n = 2;
              break;
            }
            return _context2.a(2, settings.escposTemplateCashier || null);
          case 2:
            if (!(type === 'kitchen')) {
              _context2.n = 3;
              break;
            }
            return _context2.a(2, settings.escposTemplateKitchen || null);
          case 3:
            _context2.n = 5;
            break;
          case 4:
            _context2.p = 4;
            _t2 = _context2.v;
          case 5:
            return _context2.a(2, null);
        }
      }, _callee2, null, [[0, 4]]);
    }));
    return _getEscposTemplate.apply(this, arguments);
  }
  return {
    renderCashier: renderCashier,
    renderKitchen: renderKitchen,
    renderEscpos: renderEscpos,
    getTemplate: getTemplate,
    getEscposTemplate: getEscposTemplate,
    defaultCashierTemplate: defaultCashierTemplate(),
    defaultKitchenTemplate: defaultKitchenTemplate(),
    defaultEscposCashier: defaultEscposCashier(),
    defaultEscposKitchen: defaultEscposKitchen(),
    PLACEHOLDERS: PLACEHOLDERS
  };
}();

