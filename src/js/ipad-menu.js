/* ============================================================
   iPad Menu — ES5 compatible (Safari 9 / iOS 9.3.5)
   Firebase v7.24.0 · No async/await · No arrow functions
   ============================================================ */
(function () {
  'use strict';

  // ── Helpers ──
  function safeId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function esc(str) {
    if (str === null || str === undefined) return '';
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, function (ch) { return map[ch]; });
  }

  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    var allowed = ['http:', 'https:', 'data:'];
    try {
      var u = new URL(url, window.location.origin);
      if (allowed.indexOf(u.protocol) !== -1) return url;
    } catch (_) {}
    return '';
  }

  function num(val, def) {
    var n = Number(val);
    return !isNaN(n) && isFinite(n) ? n : (def !== undefined ? def : 0);
  }

  // ── Parse URL params ──
  function getParam(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1]) : null;
  }
  var tableNum = /^\d+$/.test(getParam('table')) ? getParam('table') : '';
  var hasService = getParam('service') === '1';
  var isCustomer = !!tableNum;

  // ── State ──
  var products = [];
  var categories = [];
  var orderItems = [];
  var total = 0;
  var taxRate = 0;
  var enableTax = false;
  var serviceRate = 0;
  var enableService = false;
  var settings = {};

  // ── Firebase init ──
  var db = null;
  var uid = null;

  function initFirebase(callback) {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore();
      firebase.auth().signInAnonymously().then(function (cred) {
        uid = cred.user.uid;
        callback(null);
      }).catch(function (e) {
        console.warn('[firebase] auth failed:', e);
        callback(null);
      });
    } catch (e) {
      console.error('[firebase] init error:', e);
      callback(e);
    }
  }

  // ── Firestore helpers (Promise-based) ──
  function fbGetAll(name) {
    return db.collection(name).orderBy('__name__', 'asc').get().then(function (snap) {
      var items = [];
      snap.forEach(function (d) {
        var data = d.data();
        data.id = d.id;
        items.push(data);
      });
      return items;
    });
  }

  function fbSet(name, id, data) {
    var obj = {};
    for (var k in data) { if (data.hasOwnProperty(k)) obj[k] = data[k]; }
    obj.id = id;
    if (uid) obj._uid = uid;
    return db.collection(name).doc(id).set(obj);
  }

  function fbUpdate(name, id, data) {
    return db.collection(name).doc(id).update(data);
  }

  function fbRunTransaction(fn) {
    return db.runTransaction(fn);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  // ── DOM refs ──
  var productsEl = document.getElementById('ipadProducts');
  var categoriesEl = document.getElementById('ipadCategories');
  var cartFab = document.getElementById('cartFab');
  var cartBadge = document.getElementById('cartBadge');
  var cartSheet = document.getElementById('cartSheet');
  var sheetOverlay = document.getElementById('sheetOverlay');
  var sheetList = document.getElementById('sheetList');
  var sheetTotal = document.getElementById('sheetTotal');
  var loadingEl = document.getElementById('loadingSpinner');

  // ── Load settings ──
  function loadSettings(callback) {
    fbGetAll('settings').then(function (arr) {
      if (arr.length > 0) {
        settings = arr[0];
      }
      if (hasService) {
        enableService = settings.enableService !== false;
        serviceRate = settings.serviceTax || 10;
        enableTax = settings.enableTax !== false;
        taxRate = settings.taxRate || 14;
      }
      callback();
    }).catch(function () {
      callback();
    });
  }

  // ── Calculate totals ──
  function calculateTotals(baseTotal) {
    var serviceAmount = 0;
    var taxAmount = 0;
    var grandTotal = baseTotal;
    if (enableService && serviceRate > 0) {
      serviceAmount = Math.round(baseTotal * serviceRate / 100);
      grandTotal = baseTotal + serviceAmount;
    }
    if (enableTax && taxRate > 0) {
      taxAmount = Math.round(grandTotal * taxRate / 100);
      grandTotal = grandTotal + taxAmount;
    }
    return { serviceAmount: serviceAmount, taxAmount: taxAmount, grandTotal: grandTotal };
  }

  // ── Render categories ──
  function renderCategories() {
    categoriesEl.innerHTML = '<button class="ipad-cat-btn active" data-category="all">الكل</button>';
    for (var i = 0; i < categories.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'ipad-cat-btn';
      btn.setAttribute('data-category', categories[i].slug);
      btn.textContent = categories[i].name;
      categoriesEl.appendChild(btn);
    }
  }

  // ── Render products ──
  function renderProducts(list) {
    productsEl.innerHTML = '';
    if (list.length === 0) {
      productsEl.innerHTML = '<div class="ipad-loading"><span>لا توجد منتجات</span></div>';
      return;
    }
    var fallbackImg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f5f4"/><text x="50" y="55" text-anchor="middle" font-size="40">🍽</text></svg>';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p.available && p.available !== undefined) continue;
      var card = document.createElement('div');
      card.className = 'ipad-product-card';
      card.setAttribute('data-category', p.category || '');
      var imgSrc = sanitizeUrl(p.image) || fallbackImg;
      var html = '';
      html += '<div class="ipad-product-img"><img src="' + imgSrc + '" alt="' + esc(p.name) + '" onerror="this.src=\'' + fallbackImg + '\'"></div>';
      html += '<h3>' + esc(p.name) + '</h3>';
      if (p.nameEn) html += '<div class="ipad-en">' + esc(p.nameEn) + '</div>';
      if (p.description) html += '<div class="ipad-desc">' + esc(p.description) + '</div>';
      html += '<div class="ipad-price">' + num(p.price, 0) + ' جنيه</div>';
      html += '<button class="ipad-add-btn" data-price="' + num(p.price, 0) + '"><i class="fa-solid fa-plus"></i> إضافة</button>';
      card.innerHTML = html;
      productsEl.appendChild(card);
    }
  }

  // ── Category filter ──
  function attachCategoryFilter() {
    categoriesEl.addEventListener('click', function (e) {
      var btn = e.target;
      if (!btn.classList.contains('ipad-cat-btn')) return;
      var allBtns = categoriesEl.querySelectorAll('.ipad-cat-btn');
      for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
      btn.classList.add('active');
      var cat = btn.getAttribute('data-category');
      var cards = productsEl.querySelectorAll('.ipad-product-card');
      for (var j = 0; j < cards.length; j++) {
        if (cat === 'all' || cards[j].getAttribute('data-category') === cat) {
          cards[j].style.display = '';
        } else {
          cards[j].style.display = 'none';
        }
      }
    });
  }

  // ── Search ──
  function attachSearch() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('keyup', function () {
      var q = input.value.toLowerCase();
      var cards = productsEl.querySelectorAll('.ipad-product-card');
      for (var i = 0; i < cards.length; i++) {
        var text = cards[i].textContent.toLowerCase();
        cards[i].style.display = text.indexOf(q) !== -1 ? '' : 'none';
      }
    });
  }

  // ── Add to cart ──
  function attachAddButtons() {
    productsEl.addEventListener('click', function (e) {
      var btn = e.target;
      while (btn && !btn.classList.contains('ipad-add-btn')) {
        btn = btn.parentElement;
        if (!btn || btn === productsEl) return;
      }
      if (!btn) return;
      var card = btn;
      while (card && !card.classList.contains('ipad-product-card')) card = card.parentElement;
      if (!card) return;
      var name = card.querySelector('h3').textContent;
      var price = num(btn.getAttribute('data-price'), 0);
      addToCart(name, price);
    });
  }

  function addToCart(name, price) {
    var found = false;
    for (var i = 0; i < orderItems.length; i++) {
      if (orderItems[i].name === name) {
        orderItems[i].qty++;
        found = true;
        break;
      }
    }
    if (!found) {
      orderItems.push({ name: name, price: price, qty: 1, note: '' });
    }
    recalcTotal();
    renderSheet();
    occupyTable();
  }

  function removeFromCart(index) {
    orderItems.splice(index, 1);
    recalcTotal();
    renderSheet();
  }

  function changeQty(index, delta) {
    orderItems[index].qty += delta;
    if (orderItems[index].qty <= 0) {
      removeFromCart(index);
      return;
    }
    recalcTotal();
    renderSheet();
  }

  function clearCart() {
    orderItems = [];
    total = 0;
    recalcTotal();
    renderSheet();
  }

  function recalcTotal() {
    total = 0;
    for (var i = 0; i < orderItems.length; i++) {
      total += orderItems[i].qty * orderItems[i].price;
    }
    var t = calculateTotals(total);
    sheetTotal.textContent = t.grandTotal + ' جنيه';
    var count = 0;
    for (var j = 0; j < orderItems.length; j++) count += orderItems[j].qty;
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  // ── Render cart sheet ──
  function renderSheet() {
    if (orderItems.length === 0) {
      sheetList.innerHTML = '<div class="ipad-empty-cart"><i class="fa-solid fa-bag-shopping"></i><span>لم تُضف منتجات بعد</span></div>';
      return;
    }
    var html = '';
    for (var i = 0; i < orderItems.length; i++) {
      var item = orderItems[i];
      var itemTotal = item.qty * item.price;
      html += '<div class="ipad-order-item">';
      html += '  <div class="ipad-oi-info">';
      html += '    <div class="ipad-oi-name">' + esc(item.name) + '</div>';
      if (item.note) html += '    <div class="ipad-oi-note">' + esc(item.note) + '</div>';
      html += '    <div class="ipad-oi-price">' + itemTotal + ' جنيه</div>';
      html += '  </div>';
      html += '  <div class="ipad-oi-controls">';
      html += '    <button class="ipad-oi-btn ipad-oi-minus" data-idx="' + i + '">-</button>';
      html += '    <span class="ipad-oi-qty">' + item.qty + '</span>';
      html += '    <button class="ipad-oi-btn ipad-oi-plus" data-idx="' + i + '">+</button>';
      html += '    <button class="ipad-oi-delete ipad-oi-del" data-idx="' + i + '"><i class="fa-solid fa-trash"></i></button>';
      html += '  </div>';
      html += '</div>';
    }
    sheetList.innerHTML = html;
  }

  // ── Sheet controls ──
  function attachSheetControls() {
    sheetList.addEventListener('click', function (e) {
      var btn = e.target;
      var idx;
      if (btn.classList.contains('ipad-oi-minus')) {
        idx = parseInt(btn.getAttribute('data-idx'));
        changeQty(idx, -1);
      } else if (btn.classList.contains('ipad-oi-plus')) {
        idx = parseInt(btn.getAttribute('data-idx'));
        changeQty(idx, 1);
      } else if (btn.classList.contains('ipad-oi-del')) {
        idx = parseInt(btn.getAttribute('data-idx'));
        removeFromCart(idx);
      }
    });
  }

  // ── Open / Close sheet ──
  function openSheet() {
    cartSheet.classList.add('open');
    sheetOverlay.classList.add('show');
  }
  function closeSheet() {
    cartSheet.classList.remove('open');
    sheetOverlay.classList.remove('show');
  }

  // ── Occupy table ──
  function occupyTable() {
    if (!tableNum || orderItems.length === 0) return;
    var tableName = 'طاولة ' + tableNum;
    fbGetAll('tables_').then(function (allTables) {
      var tbl = null;
      for (var i = 0; i < allTables.length; i++) {
        if (allTables[i].name === tableName) { tbl = allTables[i]; break; }
      }
      if (tbl) {
        return fbUpdate('tables_', tbl.id, { status: 'occupied' });
      } else {
        return fbSet('tables_', 't' + tableNum, {
          name: tableName, capacity: 4, status: 'occupied',
          currentOrder: null, hasService: false
        });
      }
    }).catch(function (e) {
      console.warn('[occupy]', e);
    });
  }

  // ── Checkout ──
  function openCheckout() {
    if (orderItems.length === 0) {
      alert('الطلب فارغ، أضف منتجات أولاً');
      return;
    }
    var baseTotal = 0;
    for (var i = 0; i < orderItems.length; i++) {
      baseTotal += orderItems[i].qty * orderItems[i].price;
    }
    var t = calculateTotals(baseTotal);
    // Build summary
    var sumHtml = '';
    for (var j = 0; j < orderItems.length; j++) {
      var it = orderItems[j];
      sumHtml += '<div class="ipad-sum-item"><span>' + esc(it.name) + ' x' + it.qty + '</span><span>' + (it.qty * it.price) + ' ج.م</span></div>';
    }
    if (t.serviceAmount > 0) {
      sumHtml += '<div class="ipad-sum-item"><span>خدمة (' + serviceRate + '%)</span><span>' + t.serviceAmount + ' ج.م</span></div>';
    }
    if (t.taxAmount > 0) {
      sumHtml += '<div class="ipad-sum-item"><span>ضريبة (' + taxRate + '%)</span><span>' + t.taxAmount + ' ج.م</span></div>';
    }
    sumHtml += '<div class="ipad-sum-item" style="font-weight:700;font-size:15px;border-top:2px dashed #ddd;padding-top:6px;margin-top:4px"><span>الإجمالي</span><span>' + t.grandTotal + ' ج.م</span></div>';
    document.getElementById('checkoutSummary').innerHTML = sumHtml;
    document.getElementById('paidAmount').value = '';
    document.getElementById('changeAmount').textContent = '0 جنيه';
    document.getElementById('changeRow').className = 'ipad-change-row';
    document.getElementById('checkoutModal').classList.add('show');
    // Store for confirm
    document.getElementById('checkoutModal')._grandTotal = t.grandTotal;
    document.getElementById('checkoutModal')._serviceAmount = t.serviceAmount;
    document.getElementById('checkoutModal')._taxAmount = t.taxAmount;
  }

  function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('show');
  }

  function updateChange() {
    var grandTotal = document.getElementById('checkoutModal')._grandTotal || 0;
    var paid = num(document.getElementById('paidAmount').value, 0);
    var change = paid - grandTotal;
    var changeRow = document.getElementById('changeRow');
    var changeEl = document.getElementById('changeAmount');
    if (change >= 0) {
      changeEl.textContent = change + ' جنيه';
      changeRow.className = 'ipad-change-row positive';
    } else {
      changeEl.textContent = Math.abs(change) + ' جنيه (متبقي)';
      changeRow.className = 'ipad-change-row negative';
    }
  }

  function confirmCheckout() {
    var grandTotal = document.getElementById('checkoutModal')._grandTotal || 0;
    var serviceAmount = document.getElementById('checkoutModal')._serviceAmount || 0;
    var taxAmount = document.getElementById('checkoutModal')._taxAmount || 0;
    var paid = num(document.getElementById('paidAmount').value, 0);
    var method = document.getElementById('paymentMethod').value;
    var table = tableNum ? 'طاولة ' + tableNum : null;

    if (paid <= 0) {
      alert('يرجى إدخال المبلغ المدفوع');
      return;
    }

    // Show loading
    document.getElementById('checkoutLoading').style.display = 'flex';

    var invId = 'INV-' + safeId().slice(0, 8).toUpperCase();
    var itemsData = [];
    for (var i = 0; i < orderItems.length; i++) {
      itemsData.push({
        name: orderItems[i].name,
        qty: orderItems[i].qty,
        price: orderItems[i].price,
        note: orderItems[i].note || '',
        hasMilk: false
      });
    }

    var invData = {
      id: invId,
      customer: 'نقدي',
      table: table,
      date: nowISO(),
      items: itemsData,
      total: grandTotal,
      paid: paid,
      change: Math.max(0, paid - grandTotal),
      remaining: Math.max(0, grandTotal - paid),
      serviceAmount: serviceAmount,
      taxAmount: taxAmount,
      paymentMethod: method,
      status: 'pending',
      customerType: 'regular',
      itemsValue: total,
      createdBy: 'iPad'
    };

    fbRunTransaction(function (tx) {
      // Update table status
      if (tableNum) {
        return fbGetAll('tables_').then(function (allTables) {
          var tbl = null;
          for (var i = 0; i < allTables.length; i++) {
            if (allTables[i].name === 'طاولة ' + tableNum) { tbl = allTables[i]; break; }
          }
          if (tbl) {
            tx.update(db.collection('tables_').doc(tbl.id), { status: 'occupied' });
          }
          tx.set(db.collection('invoices').doc(invId), invData);
        });
      } else {
        tx.set(db.collection('invoices').doc(invId), invData);
      }
    }).then(function () {
      document.getElementById('checkoutLoading').style.display = 'none';
      closeCheckout();
      // Show success
      document.getElementById('successTitle').textContent = 'تم إنشاء الفاتورة';
      var detHtml = '<div style="text-align:right;font-size:14px;line-height:1.8">';
      detHtml += '<div><b>رقم:</b> ' + invId + '</div>';
      detHtml += '<div><b>الإجمالي:</b> ' + grandTotal + ' جنيه</div>';
      detHtml += '<div><b>المدفوع:</b> ' + paid + ' جنيه</div>';
      if (paid > grandTotal) {
        detHtml += '<div style="color:#059669"><b>الباقي:</b> ' + (paid - grandTotal) + ' جنيه</div>';
      }
      if (table) detHtml += '<div><b>الطاولة:</b> ' + table + '</div>';
      detHtml += '</div>';
      document.getElementById('successDetails').innerHTML = detHtml;
      document.getElementById('successModal').classList.add('show');
      clearCart();
    }).catch(function (e) {
      document.getElementById('checkoutLoading').style.display = 'none';
      console.error('[checkout] error:', e);
      alert('حدث خطأ أثناء إنشاء الفاتورة: ' + (e.message || e));
    });
  }

  // ── Clear modal ──
  function openClearModal() {
    if (orderItems.length === 0) return;
    document.getElementById('clearModal').classList.add('show');
  }
  function closeClearModal() {
    document.getElementById('clearModal').classList.remove('show');
  }

  // ── Init ──
  function startApp() {
    // Set table label
    if (isCustomer) {
      document.getElementById('tableLabel').textContent = 'القائمة - طاولة ' + tableNum;
    }

    // Load categories + products
    Promise.all([
      fbGetAll('categories'),
      fbGetAll('products')
    ]).then(function (results) {
      var rawCats = results[0];
      var rawProds = results[1];

      // Dedupe categories
      var seen = {};
      categories = [];
      for (var i = 0; i < rawCats.length; i++) {
        if (!seen[rawCats[i].slug]) {
          seen[rawCats[i].slug] = true;
          categories.push(rawCats[i]);
        }
      }
      categories.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

      // Sort products by category order
      var catOrder = [];
      for (var j = 0; j < categories.length; j++) catOrder.push(categories[j].slug);
      products = rawProds;
      products.sort(function (a, b) {
        return catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
      });

      renderCategories();
      renderProducts(products);
      attachCategoryFilter();
      attachSearch();
      attachAddButtons();

      // Load settings for tax/service
      loadSettings(function () {
        // Ready
      });
    }).catch(function (e) {
      console.error('[load] error:', e);
      productsEl.innerHTML = '<div class="ipad-loading"><span>خطأ في تحميل المنتجات</span></div>';
    });
  }

  // ── Event bindings ──
  cartFab.addEventListener('click', openSheet);
  document.getElementById('sheetClose').addEventListener('click', closeSheet);
  sheetOverlay.addEventListener('click', closeSheet);
  document.getElementById('sheetCheckout').addEventListener('click', function () {
    closeSheet();
    openCheckout();
  });
  document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
  document.getElementById('cancelCheckout').addEventListener('click', closeCheckout);
  document.getElementById('confirmCheckout').addEventListener('click', confirmCheckout);
  document.getElementById('paidAmount').addEventListener('input', updateChange);
  document.getElementById('closeSuccess').addEventListener('click', function () {
    document.getElementById('successModal').classList.remove('show');
  });
  document.getElementById('cancelClear').addEventListener('click', closeClearModal);
  document.getElementById('confirmClear').addEventListener('click', function () {
    clearCart();
    closeClearModal();
  });

  // Long press on cart fab to clear
  var longPressTimer = null;
  cartFab.addEventListener('mousedown', function () {
    longPressTimer = setTimeout(openClearModal, 800);
  });
  cartFab.addEventListener('mouseup', function () { clearTimeout(longPressTimer); });
  cartFab.addEventListener('mouseleave', function () { clearTimeout(longPressTimer); });

  // ── Boot ──
  initFirebase(function (err) {
    if (err) {
      productsEl.innerHTML = '<div class="ipad-loading"><span>خطأ في الاتصال بالخادم</span></div>';
      return;
    }
    startApp();
  });

  attachSheetControls();
})();
