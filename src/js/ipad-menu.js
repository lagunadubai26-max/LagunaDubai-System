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

  // ── Parse URL params (fallback if no UI selection) ──
  function getParam(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1]) : null;
  }
  var urlTableNum = /^\d+$/.test(getParam('table')) ? getParam('table') : '';
  var urlHasService = getParam('service') === '1';

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
  var tableNum = urlTableNum;
  var hasService = urlHasService;
  var customerType = 'regular';
  var customerName = '';
  var customersCache = [];

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
  var sidebarList = document.getElementById('sidebarList');
  var sidebarTotal = document.getElementById('sidebarTotal');
  var tableBadge = document.getElementById('tableBadge');
  var tableBadgeText = document.getElementById('tableBadgeText');
  var tableSelectEl = document.getElementById('tableSelect');
  var serviceToggleEl = document.getElementById('serviceToggle');
  var serviceToggleTextEl = document.getElementById('serviceToggleText');
  var customerTypeEl = document.getElementById('customerTypeSelect');
  var customerNameGroupEl = document.getElementById('customerNameGroup');
  var customerNameInputEl = document.getElementById('customerNameInput');
  var customersListEl = document.getElementById('customersList');

  // ── Load tables from Firestore ──
  function loadTables(callback) {
    fbGetAll('tables_').then(function (arr) {
      arr.sort(function (a, b) {
        var na = parseInt((a.name || '').replace(/\D/g, '')) || 0;
        var nb = parseInt((b.name || '').replace(/\D/g, '')) || 0;
        return na - nb;
      });
      var html = '<option value="">بدون طاولة</option>';
      for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        var num = (t.name || '').replace(/\D/g, '');
        var statusLabel = '';
        if (t.status === 'occupied') statusLabel = ' (مشغولة)';
        else if (t.status === 'reserved') statusLabel = ' (محجوزة)';
        html += '<option value="' + esc(num) + '">' + esc(t.name) + statusLabel + '</option>';
      }
      if (tableSelectEl) tableSelectEl.innerHTML = html;
      // Restore selected value if URL param was set
      if (urlTableNum && tableSelectEl) {
        tableSelectEl.value = urlTableNum;
      }
      callback();
    }).catch(function () {
      callback();
    });
  }

  // ── Load settings + customers ──
  function loadSettings(callback) {
    fbGetAll('settings').then(function (arr) {
      if (arr.length > 0) {
        settings = arr[0];
      }
      callback();
    }).catch(function () {
      callback();
    });
    // Fetch customers for VIP dropdown
    fbGetAll('customers').then(function (arr) {
      customersCache = arr;
      var html = '';
      for (var i = 0; i < arr.length; i++) {
        html += '<option value="' + esc(arr[i].name) + '">';
      }
      if (customersListEl) customersListEl.innerHTML = html;
    }).catch(function () {});
  }

  // ── Real-time listeners for categories + products ──
  function startRealtimeListeners() {
    // Categories listener
    db.collection('categories').orderBy('__name__', 'asc').onSnapshot(function (snap) {
      var rawCats = [];
      snap.forEach(function (d) {
        var data = d.data();
        data.id = d.id;
        rawCats.push(data);
      });
      // Dedupe
      var seen = {};
      categories = [];
      for (var i = 0; i < rawCats.length; i++) {
        if (!seen[rawCats[i].slug]) {
          seen[rawCats[i].slug] = true;
          categories.push(rawCats[i]);
        }
      }
      categories.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      renderCategories();
      // Re-attach category filter
      attachCategoryFilter();
      // Re-filter current view
      var activeBtn = categoriesEl.querySelector('.ipad-cat-btn.active');
      if (activeBtn) {
        var cat = activeBtn.getAttribute('data-category');
        var cards = productsEl.querySelectorAll('.ipad-product-card');
        for (var j = 0; j < cards.length; j++) {
          if (cat === 'all' || cards[j].getAttribute('data-category') === cat) {
            cards[j].style.display = '';
          } else {
            cards[j].style.display = 'none';
          }
        }
      }
    }, function (err) {
      console.warn('[realtime] categories error:', err);
    });

    // Products listener
    db.collection('products').orderBy('__name__', 'asc').onSnapshot(function (snap) {
      var rawProds = [];
      snap.forEach(function (d) {
        var data = d.data();
        data.id = d.id;
        rawProds.push(data);
      });
      products = rawProds;
      // Sort by category order
      var catOrder = [];
      for (var j = 0; j < categories.length; j++) catOrder.push(categories[j].slug);
      products.sort(function (a, b) {
        return catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
      });
      renderProducts(products);
      attachAddButtons();
    }, function (err) {
      console.warn('[realtime] products error:', err);
    });
  }

  // ── Apply service/tax based on UI toggle ──
  function applyServiceFromSettings() {
    if (hasService && settings.enableService !== false) {
      enableService = true;
      serviceRate = settings.serviceTax || 10;
    } else {
      enableService = false;
      serviceRate = 0;
    }
    if (hasService && settings.enableTax !== false) {
      enableTax = true;
      taxRate = settings.taxRate || 14;
    } else {
      enableTax = false;
      taxRate = 0;
    }
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
    var fallbackBg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f5f4"/><text x="50" y="55" text-anchor="middle" font-size="40">🍽</text></svg>';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p.available && p.available !== undefined) continue;
      var card = document.createElement('div');
      card.className = 'ipad-product-card';
      card.setAttribute('data-category', p.category || '');
      var imgSrc = sanitizeUrl(p.image) || '';
      if (imgSrc && imgSrc.indexOf('.webp') !== -1) {
        imgSrc = imgSrc.replace('.webp', '.jpg');
      }
      if (!imgSrc) imgSrc = fallbackBg;
      var html = '';
      html += '<div class="ipad-product-img" style="background-image:url(\'' + imgSrc + '\')"></div>';
      html += '<h3>' + esc(p.name) + '</h3>';
      if (p.nameEn) html += '<div class="ipad-en">' + esc(p.nameEn) + '</div>';
      if (p.description) html += '<div class="ipad-desc">' + esc(p.description) + '</div>';
      html += '<div class="ipad-price">' + num(p.price, 0) + ' جنيه</div>';
      html += '<button class="ipad-add-btn" data-price="' + num(p.price, 0) + '"><i class="fa-solid fa-plus"></i> إضافة</button>';
      card.innerHTML = html;
      productsEl.appendChild(card);
    }
  }

  // ── Category filter (delegated, attach once) ──
  var _catFilterAttached = false;
  function attachCategoryFilter() {
    if (_catFilterAttached) return;
    _catFilterAttached = true;
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

  // ── Search (attach once) ──
  var _searchAttached = false;
  function attachSearch() {
    if (_searchAttached) return;
    _searchAttached = true;
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

  // ── Add to cart (delegated, attach once) ──
  var _addBtnAttached = false;
  function attachAddButtons() {
    if (_addBtnAttached) return;
    _addBtnAttached = true;
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
    applyServiceFromSettings();
    var t = calculateTotals(total);
    var grandTotal = t.grandTotal;

    // Apply customer type adjustments
    if (customerType === 'special') {
      grandTotal = Math.round(grandTotal * 0.75);
    } else if (customerType === 'free') {
      grandTotal = 0;
    }

    var totalText = grandTotal + ' جنيه';
    if (customerType === 'free') {
      totalText = '0 جنيه (ضيافة)';
    }
    sheetTotal.textContent = totalText;
    if (sidebarTotal) sidebarTotal.textContent = totalText;
    var count = 0;
    for (var j = 0; j < orderItems.length; j++) count += orderItems[j].qty;
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  // ── Render cart sheet + sidebar ──
  function renderSheet() {
    var html = '';
    if (orderItems.length === 0) {
      html = '<div class="ipad-empty-cart"><i class="fa-solid fa-bag-shopping"></i><span>لم تُضف منتجات بعد</span></div>';
    } else {
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
    }
    sheetList.innerHTML = html;
    if (sidebarList) sidebarList.innerHTML = html;
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
    applyServiceFromSettings();
    var t = calculateTotals(baseTotal);
    var grandTotal = t.grandTotal;

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

    // Apply customer type
    if (customerType === 'special') {
      var disc = Math.round(grandTotal * 0.25);
      grandTotal = grandTotal - disc;
      sumHtml += '<div class="ipad-sum-item" style="color:#059669"><span>خصم مميز (25%)</span><span>-' + disc + ' ج.م</span></div>';
    } else if (customerType === 'free') {
      grandTotal = 0;
      sumHtml += '<div class="ipad-sum-item" style="color:#d97706"><span>ضيافة مجانية</span><span>مجاني</span></div>';
    }

    sumHtml += '<div class="ipad-sum-item" style="font-weight:700;font-size:15px;border-top:2px dashed #ddd;padding-top:6px;margin-top:4px"><span>الإجمالي</span><span>' + grandTotal + ' ج.م</span></div>';
    document.getElementById('checkoutSummary').innerHTML = sumHtml;
    document.getElementById('paidAmount').value = grandTotal > 0 ? '' : '0';
    document.getElementById('changeAmount').textContent = '0 جنيه';
    document.getElementById('changeRow').className = 'ipad-change-row';
    document.getElementById('checkoutModal').classList.add('show');
    // Store for confirm
    document.getElementById('checkoutModal')._grandTotal = grandTotal;
    document.getElementById('checkoutModal')._baseTotal = baseTotal;
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
    var baseTotal = document.getElementById('checkoutModal')._baseTotal || 0;
    var serviceAmount = document.getElementById('checkoutModal')._serviceAmount || 0;
    var taxAmount = document.getElementById('checkoutModal')._taxAmount || 0;
    var method = document.getElementById('paymentMethod').value;
    var table = tableNum ? 'طاولة ' + tableNum : null;

    // Determine invoice status
    var invStatus = 'pending';
    var paid = num(document.getElementById('paidAmount').value, 0);
    if (customerType === 'free') {
      paid = 0;
      grandTotal = 0;
      invStatus = 'paid';
    } else if (paid >= grandTotal) {
      invStatus = 'paid';
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

    var custLabel = 'نقدي';
    if (customerType === 'special' && customerName) {
      custLabel = customerName;
    } else if (customerType === 'free') {
      custLabel = 'الاستاذ محمد الجوهري';
    }

    var invData = {
      id: invId,
      customer: custLabel,
      table: table,
      date: nowISO(),
      items: itemsData,
      total: customerType === 'free' ? 0 : baseTotal,
      grandTotal: grandTotal,
      paid: paid,
      change: Math.max(0, paid - grandTotal),
      remaining: Math.max(0, grandTotal - paid),
      serviceAmount: customerType === 'free' ? 0 : serviceAmount,
      taxAmount: customerType === 'free' ? 0 : taxAmount,
      paymentMethod: method,
      status: invStatus,
      customerType: customerType,
      itemsValue: total,
      createdBy: 'iPad'
    };

    fbRunTransaction(function (tx) {
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
      // Update customer stats if VIP
      if (customerType === 'special' && customerName) {
        for (var k = 0; k < customersCache.length; k++) {
          if (customersCache[k].name === customerName) {
            var c = customersCache[k];
            fbUpdate('customers', c.id, {
              visits: (c.visits || 0) + 1,
              totalSpent: (c.totalSpent || 0) + baseTotal,
              lastVisit: nowISO()
            }).catch(function () {});
            break;
          }
        }
      }
      document.getElementById('checkoutLoading').style.display = 'none';
      closeCheckout();
      // Show success
      document.getElementById('successTitle').textContent = 'تم إنشاء الفاتورة';
      var detHtml = '<div style="text-align:right;font-size:14px;line-height:1.8">';
      detHtml += '<div><b>رقم:</b> ' + invId + '</div>';
      if (customerType === 'free') {
        detHtml += '<div><b>الإجمالي:</b> 0 جنيه (ضيافة مجانية)</div>';
        detHtml += '<div><b>المدفوع:</b> 0 جنيه</div>';
      } else {
        detHtml += '<div><b>الإجمالي:</b> ' + grandTotal + ' جنيه</div>';
        detHtml += '<div><b>المدفوع:</b> ' + paid + ' جنيه</div>';
        if (paid > grandTotal) {
          detHtml += '<div style="color:#059669"><b>الباقي:</b> ' + (paid - grandTotal) + ' جنيه</div>';
        } else if (paid < grandTotal) {
          detHtml += '<div style="color:#dc2626"><b>المتبقي:</b> ' + (grandTotal - paid) + ' جنيه</div>';
        }
      }
      if (table) detHtml += '<div><b>الطاولة:</b> ' + table + '</div>';
      if (customerType === 'special') detHtml += '<div><b>العميل:</b> ' + esc(custLabel) + ' (مميز)</div>';
      if (customerType === 'free') detHtml += '<div style="color:#d97706"><b>ضيافة:</b> ' + esc(custLabel) + '</div>';
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

  // ── Update table badge display ──
  function updateTableBadge() {
    if (tableNum) {
      document.getElementById('tableLabel').textContent = 'القائمة - طاولة ' + tableNum;
      if (tableBadge && tableBadgeText) {
        tableBadgeText.textContent = 'طاولة ' + tableNum;
        tableBadge.style.display = '-webkit-box';
      }
    } else {
      document.getElementById('tableLabel').textContent = 'القائمة';
      if (tableBadge) tableBadge.style.display = 'none';
    }
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
    // Set table from URL if provided
    if (urlTableNum && tableSelectEl) {
      tableSelectEl.value = urlTableNum;
    }
    // Set service from URL if provided
    if (urlHasService && serviceToggleEl) {
      serviceToggleEl.checked = true;
      if (serviceToggleTextEl) serviceToggleTextEl.textContent = 'نعم';
    }
    // Sync table badge
    updateTableBadge();

    // Table select handler
    if (tableSelectEl) {
      tableSelectEl.addEventListener('change', function () {
        tableNum = tableSelectEl.value;
        updateTableBadge();
      });
    }
    // Service toggle handler
    if (serviceToggleEl) {
      serviceToggleEl.addEventListener('change', function () {
        hasService = serviceToggleEl.checked;
        if (serviceToggleTextEl) serviceToggleTextEl.textContent = hasService ? 'نعم' : 'بدون';
        applyServiceFromSettings();
        recalcTotal();
      });
    }
    // Customer type handler
    if (customerTypeEl) {
      customerTypeEl.addEventListener('change', function () {
        customerType = customerTypeEl.value;
        if (customerNameGroupEl) {
          customerNameGroupEl.style.display = (customerType === 'special') ? '-webkit-box' : 'none';
        }
        recalcTotal();
      });
    }
    // Customer name handler
    if (customerNameInputEl) {
      customerNameInputEl.addEventListener('input', function () {
        customerName = customerNameInputEl.value;
      });
    }

    // Load tables from Firestore
    loadTables(function () {
      // Tables loaded, sync table badge
      if (urlTableNum && tableSelectEl) {
        tableNum = urlTableNum;
        updateTableBadge();
      }
    });

    // Load categories + products (initial fetch)
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

      // Start real-time listeners for live updates
      startRealtimeListeners();

      // Load settings for tax/service
      loadSettings(function () {
        applyServiceFromSettings();
        recalcTotal();
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

  // Sidebar cart events
  if (document.getElementById('sidebarCheckout')) {
    document.getElementById('sidebarCheckout').addEventListener('click', openCheckout);
  }
  if (document.getElementById('sidebarClear')) {
    document.getElementById('sidebarClear').addEventListener('click', openClearModal);
  }

  // Sidebar cart item controls (delegated)
  if (sidebarList) {
    sidebarList.addEventListener('click', function (e) {
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
