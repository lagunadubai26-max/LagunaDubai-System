/* Shared by POS, reports and Safari 9 tablets. Keep this file ES5-compatible. */
(function (root) {
  'use strict';
  var sizes = ['small', 'medium', 'large'];
  var labels = { small: 'Small', medium: 'Medium', large: 'Large' };
  function esc(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function type(product) { return product.menuType === 'restaurant' ? 'restaurant' : 'cafe'; }
  function variants(product) {
    if (type(product) === 'restaurant' || (product.variants && product.variants.length)) {
      return (product.variants || []).filter(function (v) {
        return sizes.indexOf(v.key) !== -1 && v.available === true && v.price !== null && v.price !== '' && isFinite(Number(v.price)) && Number(v.price) >= 0;
      });
    }
    return [{ key: '', label: '', price: Number(product.price || 0), available: true }];
  }
  function variant(product, key) {
    var list = variants(product);
    for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
    return null;
  }
  function line(product, key) {
    var v = variant(product, key);
    if (!v || product.available === false || product.available === 0) throw new Error('المنتج أو المقاس غير متاح');
    var label = labels[v.key] || '';
    return { productId: product.id, baseName: product.name, name: product.name + (label ? ' — ' + label : ''),
      menuType: type(product), category: product.category || '', variantKey: v.key, variantLabel: label,
      price: Number(v.price), qty: 1, note: '', hasMilk: false };
  }
  function key(item) {
    return JSON.stringify([item.productId || item.name, item.variantKey || '', item.menuType || '', Number(item.price), !!item.hasMilk, item.note || '']);
  }
  function selector(product) {
    if (type(product) !== 'restaurant') return '';
    var list = variants(product);
    return '<label class="size-label">المقاس<select class="size-select" aria-label="مقاس ' + esc(product.name) + '">' +
      '<option value="">' + (list.length ? 'اختر المقاس' : 'لا توجد مقاسات متاحة') + '</option>' + list.map(function (v) {
        return '<option value="' + esc(v.key) + '">' + labels[v.key] + ' — ' + Number(v.price) + ' ج.م</option>';
      }).join('') + '</select></label>';
  }
  function tabs(container, change, initial) {
    var current = initial || 'cafe';
    function render() {
      container.className = 'menu-type-tabs';
      container.setAttribute('role', 'group');
      container.setAttribute('aria-label', 'نوع المنيو');
      container.innerHTML = ['cafe', 'restaurant'].map(function (t) {
        return '<button type="button" data-menu-type="' + t + '" aria-pressed="' + (current === t) + '" class="menu-type-btn' + (current === t ? ' active' : '') + '">' + (t === 'cafe' ? 'منيو الكافيه' : 'منيو المطعم') + '</button>';
      }).join('');
      var buttons = container.querySelectorAll('button');
      for (var i = 0; i < buttons.length; i++) buttons[i].onclick = function () {
        current = this.getAttribute('data-menu-type'); render(); change(current);
      };
    }
    render();
  }
  function classify(item, products) {
    if (item.menuType === 'restaurant' || item.menuType === 'cafe') return item.menuType;
    var matches = (products || []).filter(function (p) { return item.productId ? p.id === item.productId : p.name === (item.baseName || item.name || item.product); });
    return matches.length === 1 ? type(matches[0]) : 'unknown';
  }
  // Allocate integer piastres, distributing rounding remainders deterministically.
  function allocate(invoice) {
    var items = invoice.items || [];
    var weights = items.map(function (it) { return Math.max(0, Number(it.qty || 0) * Number(it.price || 0)); });
    var base = weights.reduce(function (a, b) { return a + b; }, 0);
    var cents = Math.round(Number(invoice.total || 0) * 100);
    if (!base) return weights.map(function () { return 0; });
    var raw = weights.map(function (w) { return cents * w / base; });
    var amounts = raw.map(function (n) { return Math.floor(n); });
    var remaining = cents - amounts.reduce(function (a, b) { return a + b; }, 0);
    var order = raw.map(function (n, i) { return { i: i, fraction: n - amounts[i] }; }).sort(function (a, b) { return b.fraction - a.fraction || a.i - b.i; });
    for (var i = 0; i < remaining; i++) amounts[order[i % order.length].i]++;
    return amounts;
  }
  function summary(invoices, products, returns) {
    var result = {};
    ['cafe', 'restaurant', 'unknown'].forEach(function (t) { result[t] = { cents: 0, qty: 0, invoices: 0, returnCents: 0, rows: {} }; });
    (invoices || []).forEach(function (inv) {
      var amounts = allocate(inv), seen = {}, allocated = 0;
      (inv.items || []).forEach(function (it, i) {
        var t = classify(it, products), group = result[t];
        var k = JSON.stringify([it.productId || it.name, it.variantKey || '', !!it.hasMilk]);
        if (!group.rows[k]) group.rows[k] = { name: it.name + (it.hasMilk ? ' (+لبن)' : ''), qty: 0, cents: 0 };
        group.rows[k].qty += Number(it.qty || 0);
        group.rows[k].cents += amounts[i];
        group.qty += Number(it.qty || 0); group.cents += amounts[i]; allocated += amounts[i]; seen[t] = true;
      });
      var residual = Math.round(Number(inv.total || 0) * 100) - allocated;
      if (residual) { result.unknown.cents += residual; seen.unknown = true; }
      Object.keys(seen).forEach(function (t) { result[t].invoices++; });
    });
    (returns || []).forEach(function (r) {
      if (r.status === 'success') result[classify(r, products)].returnCents += Math.round(Number(r.amount || 0) * 100);
    });
    return result;
  }
  function reportHTML(invoices, products, returns) {
    var data = summary(invoices, products, returns);
    var names = { cafe: 'الكافيه', restaurant: 'المطعم', unknown: 'غير مصنف' };
    var money = function (cents) { return (cents / 100).toLocaleString('ar-EG', { maximumFractionDigits: 2 }) + ' ج.م'; };
    var html = '<section class="department-report"><h3>تقارير الكافيه والمطعم</h3><p>المبيعات تشمل نصيب القسم من الخصم والخدمة والضريبة. الفاتورة المختلطة تظهر في عدد فواتير القسمين. المرتجعات المعتمدة معروضة بصورة مستقلة.</p>';
    ['cafe', 'restaurant', 'unknown'].forEach(function (t) {
      var g = data[t];
      if (t === 'unknown' && !g.cents && !g.qty && !g.returnCents) return;
      html += '<h4>' + names[t] + '</h4><p><b>المبيعات: ' + money(g.cents) + '</b> · ' + g.qty + ' قطعة · ' + g.invoices + ' فاتورة · مرتجعات معتمدة: ' + money(g.returnCents) + '</p>';
      var rows = Object.keys(g.rows).map(function (k) { return g.rows[k]; }).sort(function (a, b) { return b.cents - a.cents; });
      html += '<table class="dr-table"><thead><tr><th>الصنف / المقاس</th><th>الكمية</th><th>المبيعات بعد التسويات</th></tr></thead><tbody>';
      html += rows.length ? rows.map(function (r) { return '<tr><td>' + esc(r.name) + '</td><td>' + r.qty + '</td><td>' + money(r.cents) + '</td></tr>'; }).join('') : '<tr><td colspan="3">لا توجد مبيعات</td></tr>';
      html += '</tbody></table>';
    });
    return html + '</section>';
  }
  var api = { sizes: sizes, labels: labels, type: type, variants: variants, variant: variant, line: line, key: key, selector: selector, tabs: tabs, classify: classify, allocate: allocate, summary: summary, reportHTML: reportHTML };
  root.Catalog = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : this));
