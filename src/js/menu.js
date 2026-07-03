let total = 0;
let serviceTaxRate = 0;
let checkoutProcessing = false;
const COOLDOWN_MS = 5000;
const urlParams = new URLSearchParams(window.location.search);
const tableNum = urlParams.get('table');
const hasService = urlParams.get('service') === '1';
const isCustomer = !!tableNum;
if (isCustomer) {
  document.querySelector('.menu-header h1').innerHTML = '<i class="fa-solid fa-utensils"></i> القائمة - طاولة ' + tableNum + (hasService ? ' <span style="color:#d97706;font-size:14px">🌟 ضيافة</span>' : '');
  document.querySelectorAll('.sidebar, #sidebarToggle, .sidebar-overlay').forEach(el => el && (el.style.display = 'none'));
  const mainEl = document.querySelector('.main');
  if (mainEl) { mainEl.style.marginRight = '0'; mainEl.style.width = '100%'; }
  // Hide admin-only checkout fields
  const custSec = document.getElementById('checkoutCustomerSection');
  const paidSec = document.getElementById('checkoutPaidSection');
  const remSec = document.getElementById('checkoutRemainingSection');
  if (custSec) custSec.style.display = 'none';
  if (paidSec) paidSec.style.display = 'none';
  if (remSec) remSec.style.display = 'none';
}
(async () => {
  await DB.seed();
  if (hasService) {
    const settings = await DB.settings.get();
    serviceTaxRate = settings.serviceTax || 10;
  }
})();

function getTotalWithService() {
  if (serviceTaxRate > 0) return total + Math.round(total * serviceTaxRate / 100);
  return total;
}

function syncSheetNotesToOrderBox() {
  const sheetList = document.getElementById('sheetOrderList');
  if (!sheetList) return;
  sheetList.querySelectorAll('.order-item').forEach(el => {
    const ni = el.querySelector('.note-input');
    if (!ni || !ni.value) return;
    const nm = el.querySelector('.name');
    if (!nm) return;
    document.querySelectorAll('.order-box .order-list .order-item').forEach(oe => {
      const on = oe.querySelector('.name');
      if (on && on.innerText === nm.innerText) {
        const oi = oe.querySelector('.note-input');
        if (oi) oi.value = ni.value;
      }
    });
  });
}

function syncOrderSheet() {
  const orderList = document.querySelector('.order-box .order-list');
  const sheetList = document.getElementById('sheetOrderList');
  const sheetTotal = document.getElementById('sheetTotal');
  const sheetNoteSave = [];
  if (orderList && sheetList) {
    sheetList.querySelectorAll('.order-item').forEach(el => {
      const ni = el.querySelector('.note-input');
      if (ni && ni.value) {
        const nm = el.querySelector('.name');
        if (nm) sheetNoteSave.push({ name: nm.innerText, note: ni.value });
      }
    });
    sheetList.innerHTML = orderList.innerHTML;
    sheetNoteSave.forEach(({ name, note }) => {
      sheetList.querySelectorAll('.order-item .name').forEach(n => {
        if (n.innerText === name) {
          n.closest('.order-item').querySelector('.note-input').value = note;
        }
      });
    });
  }
  const displayTotal = getTotalWithService();
  if (sheetTotal) sheetTotal.textContent = displayTotal + ' جنيه' + (serviceTaxRate > 0 ? ' (شامل ' + serviceTaxRate + '% خدمة)' : '');
  let count = 0;
  document.querySelectorAll('.order-box .order-item').forEach(i => {
    const name = i.querySelector('.name');
    if (name) count++;
  });
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = count;
  if (count > 0) badge && (badge.style.display = 'flex'); else badge && (badge.style.display = 'none');
}

async function loadProducts() {
  const categories = await DB.categories.all() || [];
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));

  const menuCategories = document.getElementById('menuCategories');
  if (menuCategories) {
    menuCategories.innerHTML = '<button class="category-btn active" data-category="all">الكل</button>';
    categories.forEach(c => {
      menuCategories.innerHTML += `<button class="category-btn" data-category="${c.slug}">${c.name}</button>`;
    });
  }

  const products = await DB.products.all() || [];
  const container = document.querySelector('.products');
  if (!container) return;
  container.innerHTML = '';

  const categoryOrder = categories.map(c => c.slug);
  products.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
  products.forEach(p => {
    if (!p.available) return;
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = p.category;
    card.innerHTML = `
      <div class="menu-icon"><img loading="lazy" src="${p.image || ''}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23f5f5f4%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2240%22>🍽</text></svg>'"></div>
      <h3>${p.name}</h3>
      <p>${p.nameEn || ''}</p>
      ${p.description ? `<p class="desc">${p.description}</p>` : ''}
      <h2>${p.price} جنيه</h2>
      <button data-price="${p.price}">إضافة</button>`;
    container.appendChild(card);
  });

  attachAddToCart();
  attachCategoryFilter();
  attachSearch();
}

function attachAddToCart() {
  document.querySelectorAll(".product-card button").forEach(button => {
    button.addEventListener("click", function () {
      const card = this.parentElement;
      const name = card.querySelector("h3").innerText;
      const price = parseInt(this.dataset.price);
      const emptyItem = document.querySelector(".order-box .order-list .order-item");
      if (emptyItem && !emptyItem.querySelector(".name")) emptyItem.remove();
      let found = false;
      document.querySelectorAll(".order-box .order-list .order-item").forEach(item => {
        const product = item.querySelector(".name");
        if (!product) return;
        if (product.innerText === name) {
          const qtyEl = item.querySelector(".qty");
          let qty = parseInt(qtyEl.innerText);
          qty++;
          qtyEl.innerText = qty;
          item.querySelector(".price").innerText = (qty * price) + " جنيه";
          found = true;
        }
      });
      if (!found) {
        const item = document.createElement("div");
        item.className = "order-item";
        item.dataset.price = price;
        item.dataset.hasMilk = 'false';
        item.innerHTML = `
          <div class="order-top"><span class="name">${name}</span><button class="note-btn"><i class="fa-solid fa-pen"></i></button><button class="delete"><i class="fa-solid fa-trash"></i></button></div>
          <div class="price">${price} جنيه</div>
          <div class="item-note" style="display:none"><input class="note-input" placeholder="إضافة (قهوة محوج، بدون سكر...)" style="width:100%;height:36px;border:1px solid var(--border);border-radius:8px;padding:0 10px;font-size:13px;font-family:inherit;outline:none;background:#fafaf9;margin-bottom:8px"></div>
          <div class="order-bottom"><div class="controls"><button class="minus">-</button><span class="qty">1</span><button class="plus">+</button></div><label class="milk-toggle"><input type="checkbox" class="milk-check"><span class="checkmark"></span> +حليب 5 ج.م</label></div>`;
        document.querySelector(".order-box .order-list").appendChild(item);
      }
      total += price;
      document.querySelector(".total strong").innerText = total + " جنيه";
      syncOrderSheet();
    });
  });
}

function getItemPrice(itemEl) {
  return parseInt(itemEl.dataset.price) + (itemEl.dataset.hasMilk === 'true' ? 5 : 0);
}

function formatItemPrice(itemEl) {
  const base = parseInt(itemEl.dataset.price);
  const milk = itemEl.dataset.hasMilk === 'true';
  const qty = parseInt(itemEl.querySelector('.qty').innerText);
  const effective = milk ? base + 5 : base;
  return (qty * effective) + ' جنيه' + (milk ? ' (مع حليب)' : '');
}

function handleOrderClick(e) {
  const btn = e.target.closest('.plus, .minus, .delete, .note-btn, .milk-toggle');
  if (!btn) return;
  if (btn.classList.contains('milk-toggle')) {
    const clickedItem = btn.closest('.order-item');
    const nameEl = clickedItem.querySelector('.name');
    if (!nameEl) return;
    const name = nameEl.innerText;
    let targetItem = null;
    document.querySelectorAll('.order-box .order-list .order-item').forEach(el => {
      const n = el.querySelector('.name');
      if (n && n.innerText === name) targetItem = el;
    });
    if (!targetItem) return;
    targetItem.dataset.hasMilk = targetItem.dataset.hasMilk === 'true' ? 'false' : 'true';
    const base = parseInt(targetItem.dataset.price);
    const milk = targetItem.dataset.hasMilk === 'true';
    const qty = parseInt(targetItem.querySelector('.qty').innerText);
    const effective = milk ? base + 5 : base;
    total += (milk ? 1 : -1) * 5 * qty;
    targetItem.querySelector('.price').innerText = formatItemPrice(targetItem);
    document.querySelector('.total strong').innerText = total + ' جنيه';
    syncOrderSheet();
    return;
  }
  if (btn.classList.contains('note-btn')) {
    const item = btn.closest('.order-item');
    if (!item) return;
    const noteDiv = item.querySelector('.item-note');
    if (noteDiv) noteDiv.style.display = noteDiv.style.display === 'none' ? 'block' : 'none';
    return;
  }
  const item = btn.closest('.order-item');
  if (!item) return;
  const nameEl = item.querySelector('.name');
  if (!nameEl) return;
  const name = nameEl.innerText;
  // Source of truth is always order-box list
  let targetItem = null;
  document.querySelectorAll('.order-box .order-list .order-item').forEach(el => {
    const n = el.querySelector('.name');
    if (n && n.innerText === name) targetItem = el;
  });
  if (!targetItem) return;
  if (btn.classList.contains('plus')) {
    const qty = targetItem.querySelector('.qty');
    let q = parseInt(qty.innerText);
    q++;
    qty.innerText = q;
    const effective = getItemPrice(targetItem);
    targetItem.querySelector('.price').innerText = (q * effective) + ' جنيه';
    total += effective;
  } else if (btn.classList.contains('minus')) {
    const qtyEl = targetItem.querySelector('.qty');
    let q = parseInt(qtyEl.innerText);
    if (q <= 1) return;
    q--;
    qtyEl.innerText = q;
    const effective = getItemPrice(targetItem);
    targetItem.querySelector('.price').innerText = (q * effective) + ' جنيه';
    total -= effective;
  } else if (btn.classList.contains('delete')) {
    const qty = parseInt(targetItem.querySelector('.qty').innerText);
    const effective = getItemPrice(targetItem);
    total -= qty * effective;
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

function attachCategoryFilter() {
  const catButtons = document.querySelectorAll(".category-btn");
  catButtons.forEach(button => {
    button.addEventListener("click", () => {
      catButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const category = button.dataset.category;
      document.querySelectorAll(".product-card").forEach(product => {
        product.style.display = category === "all" || product.dataset.category === category ? "block" : "none";
      });
    });
  });
}

function attachSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  searchInput.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();
    document.querySelectorAll(".product-card").forEach(card => {
      const name = card.querySelector("h3").innerText.toLowerCase();
      const english = card.querySelector("p") ? card.querySelector("p").innerText.toLowerCase() : "";
      card.style.display = name.includes(value) || english.includes(value) ? "" : "none";
    });
  });
}

const clearBtn = document.querySelector(".clear-order");
const clearModal = document.getElementById('confirmModal');
const clearYesBtn = clearModal.querySelector(".confirm-btn");
const clearNoBtn = clearModal.querySelector(".cancel-btn");

clearBtn.addEventListener("click", () => clearModal.classList.add("show"));
clearNoBtn.addEventListener("click", () => clearModal.classList.remove("show"));
function clearOrder() {
  document.querySelector(".order-box .order-list").innerHTML = `<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>`;
  const sol = document.getElementById('sheetOrderList');
  if (sol) sol.innerHTML = `<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>`;
  total = 0;
  document.querySelector(".total strong").innerText = "0 جنيه";
  const st = document.getElementById('sheetTotal');
  if (st) st.textContent = "0 جنيه";
  syncOrderSheet();
}
clearYesBtn.addEventListener("click", () => {
  clearOrder();
  clearModal.classList.remove("show");
});

const checkoutBtn = document.querySelector(".checkout");
checkoutBtn.addEventListener("click", () => {
  const items = [];
  document.querySelectorAll(".order-box .order-list .order-item .name").forEach(el => {
    const itemEl = el.closest(".order-item");
    const qty = parseInt(itemEl.querySelector(".qty").innerText);
    const priceText = itemEl.dataset.price;
    const noteInput = itemEl.querySelector('.note-input');
    const note = noteInput ? noteInput.value.trim() : '';
    const hasMilk = itemEl.dataset.hasMilk === 'true';
    const effectivePrice = parseInt(priceText) + (hasMilk ? 5 : 0);
    if (priceText) items.push({ name: el.innerText, qty, price: effectivePrice, note, hasMilk });
  });
  if (items.length === 0) return alert("الطلب فارغ، أضف منتجات أولاً");
  const totalAmount = items.reduce((s, i) => s + i.qty * i.price, 0);
  const serviceAmount = serviceTaxRate > 0 ? Math.round(totalAmount * serviceTaxRate / 100) : 0;
  const grandTotal = totalAmount + serviceAmount;
  // Reset checkout form
  document.getElementById('checkoutCustomerType').value = 'regular';
  document.getElementById('checkoutSpecialFields').style.display = 'none';
  document.getElementById('checkoutSpecialName').value = '';
  document.getElementById('checkoutSpecialPrice').value = '';
  document.getElementById('checkoutTotal').textContent = grandTotal + ' جنيه' + (serviceTaxRate > 0 ? ' (الخدمة ' + serviceAmount + ' ج.م)' : '');
  document.getElementById('checkoutPaid').value = grandTotal;
  window._itemsTotal = grandTotal;
  window._checkoutTotal = grandTotal;
  window._checkoutItems = items;
  window._checkoutService = serviceAmount;
  window.calcRemaining();
  document.getElementById('checkoutModal').classList.add('show');
});

// Customer type toggle — show/hide special fields and update total
document.getElementById('checkoutCustomerType').onchange = function() {
  const isSpecial = this.value === 'special';
  document.getElementById('checkoutSpecialFields').style.display = isSpecial ? 'block' : 'none';
  if (isSpecial) {
    const val = Number(document.getElementById('checkoutSpecialPrice').value);
    if (val > 0) {
      window._checkoutTotal = val;
      document.getElementById('checkoutTotal').textContent = val + ' جنيه';
    }
  } else {
    window._checkoutTotal = window._itemsTotal;
    document.getElementById('checkoutTotal').textContent = window._itemsTotal + ' جنيه';
  }
  window.calcRemaining();
};

// Special price input — update total dynamically
document.getElementById('checkoutSpecialPrice').addEventListener('input', function() {
  if (document.getElementById('checkoutCustomerType').value !== 'special') return;
  const val = Number(this.value) || 0;
  window._checkoutTotal = val;
  document.getElementById('checkoutTotal').textContent = val + ' جنيه';
  document.getElementById('checkoutPaid').value = val;
  window.calcRemaining();
});

// Calculate remaining/change in checkout modal
window.calcRemaining = function() {
  const total = window._checkoutTotal || 0;
  const paid = Number(document.getElementById('checkoutPaid').value) || 0;
  const diff = total - paid;
  const remLabel = document.getElementById('checkoutRemainingLabel');
  const remSpan = document.getElementById('checkoutRemaining');
  const remSection = document.getElementById('checkoutRemainingSection');
  if (!remSpan) return;
  if (paid > total) {
    remLabel.textContent = 'الباقي للعميل';
    remSpan.textContent = (paid - total) + ' جنيه';
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

document.getElementById('confirmCheckout').onclick = async () => {
  if (checkoutProcessing) return;
  if (isCustomer && tableNum) {
    const lastKey = 'laguna_last_order_t' + tableNum;
    const lastTime = Number(localStorage.getItem(lastKey)) || 0;
    if (Date.now() - lastTime < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - lastTime)) / 1000);
      return alert('يرجى الانتظار ' + remaining + ' ثوانٍ قبل إرسال طلب جديد');
    }
    localStorage.setItem(lastKey, Date.now());
  }
  checkoutProcessing = true;
  document.getElementById('confirmCheckout').disabled = true;
  document.getElementById('confirmCheckout').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';

  const resetCheckout = () => {
    checkoutProcessing = false;
    document.getElementById('confirmCheckout').disabled = false;
    document.getElementById('confirmCheckout').innerHTML = 'تأكيد الدفع';
  };

  try {
    syncSheetNotesToOrderBox();
    const custType = document.getElementById('checkoutCustomerType').value;
    let customer, totalAmount;
    if (custType === 'special') {
      customer = document.getElementById('checkoutSpecialName').value.trim() || 'عميل خاص';
      totalAmount = Number(document.getElementById('checkoutSpecialPrice').value);
      if (!totalAmount || totalAmount <= 0) { resetCheckout(); return alert('يرجى إدخال السعر المخصص للعميل الخاص'); }
    } else {
      customer = 'نقدي';
      totalAmount = window._checkoutTotal;
    }
    const method = document.getElementById('checkoutMethod').value;
    const items = window._checkoutItems;
    const serviceAmount = window._checkoutService || 0;
    const table = tableNum ? 'طاولة ' + tableNum : null;
    const paid = Math.max(0, Number(document.getElementById('checkoutPaid').value) || totalAmount);
    const change = Math.max(0, paid - totalAmount);
    const inv = await DB.invoices.add({ customer, table, date: new Date().toISOString(), items, total: totalAmount, paid, change, remaining: Math.max(0, totalAmount - paid), serviceAmount, paymentMethod: method, status: paid >= totalAmount ? 'paid' : 'pending' });
    console.log('[checkout] invoice saved:', inv ? inv.id : 'null');
    if (custType === 'special') {
      const existing = (await DB.customers.all() || []).find(c => c.name === customer);
      if (existing) {
        await DB.customers.update(existing.id, { visits: (existing.visits || 0) + 1, totalSpent: (existing.totalSpent || 0) + totalAmount, lastVisit: new Date().toISOString() });
      } else {
        await DB.customers.add({ name: customer, phone: '', totalSpent: totalAmount, visits: 1, lastVisit: new Date().toISOString() });
      }
    }
    document.getElementById('checkoutModal').classList.remove('show');
    if (inv && inv.id) {
      const isAdmin = !!sessionStorage.getItem('laguna_user');
      const printSettings = (await DB.settings.get()) || {};
      const autoPrintReceipt = printSettings.autoPrintReceipt !== false;
      const autoPrintKitchen = printSettings.autoPrintKitchen !== false;
      const copies = printSettings.printCopies || 1;
      const hasPrinter = typeof PRINTER !== 'undefined' && PRINTER.isConnected();

      if (isCustomer || !isAdmin) {
        alert(`تم إنشاء الفاتورة ${inv.id}\nالإجمالي: ${totalAmount} ج.م\nالمدفوع: ${paid} ج.م`);
      } else {
        const changeText = change > 0 ? `<span style="color:#059669">الباقي للعميل: ${change} ج.م</span>` : '';
        const remainText = inv.remaining > 0 ? `<span style="color:#dc2626">المتبقي: ${inv.remaining} ج.م</span>` : '';
        const itemsList = inv.items && inv.items.length
          ? inv.items.map(it => `${it.name} x${it.qty} = ${it.qty * it.price} ج.م${it.hasMilk ? ' +حليب' : ''}${it.note ? ' (' + it.note + ')' : ''}`).join('<br>') + '<hr style="margin:8px 0;border:none;border-top:1px dashed #ddd">'
          : '';
        document.getElementById('successDetails').innerHTML = `
          <div style="font-size:11px;color:#888;margin-bottom:4px">#${inv.id}</div>
          ${itemsList}
          <div style="display:flex;justify-content:space-between;margin:2px 0"><span>الإجمالي</span><span>${totalAmount} ج.م</span></div>
          <div style="display:flex;justify-content:space-between;margin:2px 0"><span>المدفوع</span><span>${paid} ج.م</span></div>
          ${inv.change > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#059669"><span>الباقي للعميل</span><span>${inv.change} ج.م</span></div>` : ''}
          ${inv.remaining > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#dc2626"><span>المتبقي</span><span>${inv.remaining} ج.م</span></div>` : ''}
        `.trim();

        const btnContainer = document.getElementById('successButtons');
        btnContainer.innerHTML = '';
        const printBtn = document.createElement('button');
        printBtn.style.cssText = 'flex:1;height:44px;border-radius:12px;font-size:14px;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent-light));color:#fff;border:none;cursor:pointer';
        printBtn.innerHTML = '<i class="fa-solid fa-print"></i> طباعة الفاتورة';

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'flex:1;height:44px;border-radius:12px;font-size:14px;font-weight:600;background:#f5f5f4;color:var(--primary);border:none;cursor:pointer';
        closeBtn.textContent = 'إغلاق';

        btnContainer.appendChild(closeBtn);
        btnContainer.appendChild(printBtn);

        document.getElementById('successModal').classList.add('show');

        printBtn.onclick = async () => {
          document.getElementById('successModal').classList.remove('show');
          printReceipt(inv);
        };
        const hideSuccess = () => document.getElementById('successModal').classList.remove('show');
        closeBtn.onclick = hideSuccess;

        if (hasPrinter && autoPrintReceipt) {
          try {
            for (let i = 0; i < copies; i++) await PRINTER.printReceipt(inv);
            if (paid >= totalAmount) await PRINTER.openDrawer();
            if (autoPrintKitchen) await PRINTER.printKitchenOrder(inv);
            await DB.invoices.update(inv.id, { printed: true });
          } catch (e) {
            console.warn('[printer] error:', e);
            printBtn.textContent = 'إعادة الطباعة';
          }
        }
      }
    } else {
      alert(`تم إنشاء الفاتورة\nالإجمالي: ${totalAmount} ج.م\nالمدفوع: ${paid} ج.م`);
    }
    clearOrder();
  } catch (e) {
    console.error('[checkout] error:', e);
    alert('حدث خطأ أثناء إنشاء الفاتورة: ' + e.message);
  }
  resetCheckout();
};
document.getElementById('cancelCheckout').onclick = () => {
  document.getElementById('checkoutModal').classList.remove('show');
};

// Mobile cart floating button
const cartFloat = document.getElementById('cartFloat');
const cartSheet = document.getElementById('cartSheet');
const sheetClose = document.getElementById('sheetClose');
const sheetOrderList = document.getElementById('sheetOrderList');
const sheetTotal = document.getElementById('sheetTotal');
const sheetCheckout = document.getElementById('sheetCheckout');
const sheetClear = document.getElementById('sheetClear');

if (cartFloat && cartSheet) {
  cartFloat.onclick = () => { cartSheet.style.display = 'flex'; syncOrderSheet(); };
  sheetClose.onclick = () => cartSheet.style.display = 'none';
  cartSheet.onclick = (e) => { if (e.target === cartSheet) cartSheet.style.display = 'none'; };
  sheetCheckout.onclick = () => { cartSheet.style.display = 'none'; checkoutBtn.click(); };
  sheetClear.onclick = () => { cartSheet.style.display = 'none'; clearBtn.click(); };
}

loadProducts();

function printReceipt(inv) {
  const w = window.open('', '_blank', 'width=400,height=600');
  let itemsHtml = '';
  if (inv.items) inv.items.forEach(item => {
    const milkTxt = item.hasMilk ? ' +حليب' : '';
    const noteTxt = item.note ? '<br><small>' + item.note + '</small>' : '';
    itemsHtml += `<tr><td class="item-name">${item.name}${milkTxt}${noteTxt}</td><td>${item.qty}</td><td>${item.qty * item.price} ج.م</td></tr>`;
  });
  const paid = inv.paid ?? inv.total;
  const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
  const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG');
  w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>فاتورة ${inv.id}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;font-size:12px;padding:8px;color:#000}
.header{text-align:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed #000}
.header h2{font-size:16px;font-weight:700;margin-bottom:2px}
.header p{font-size:11px;color:#555}
.receipt-table{width:100%;border-collapse:collapse;margin:6px 0;font-size:11px}
.receipt-table th,.receipt-table td{padding:3px 2px;text-align:center}
.receipt-table th{border-bottom:1px solid #000}
.receipt-table td{border-bottom:1px dotted #ccc}
.receipt-table .item-name{text-align:right}
.summary{margin:6px 0;padding:4px 0;border-top:1px dashed #000}
.summary .line{display:flex;justify-content:space-between;font-size:11px;padding:1px 0}
.summary .total{font-size:15px;font-weight:700;border-top:1px solid #000;padding-top:4px;margin-top:2px}
.footer{text-align:center;margin-top:8px;padding-top:6px;border-top:1px dashed #000;font-size:10px;color:#555}
@media print{@page{margin:0;size:58mm 300mm}}
</style></head><body>
<div class="header"><h2>☕ Laguna Cafe</h2><p style="font-weight:700">** فاتورة كاشير **</p><p>${dateStr}</p><p>${inv.customer}${inv.table ? ' | ' + inv.table : ''}</p><p style="font-size:10px">#${inv.id}</p></div>
<table class="receipt-table"><thead><tr><th class="item-name">الصنف</th><th>الكمية</th><th>الإجمالي</th></tr></thead><tbody>${itemsHtml}</tbody></table>
<div class="summary"><div class="line"><span>الإجمالي</span><span>${Number(inv.total).toLocaleString()} ج.م</span></div>
<div class="line"><span>المدفوع</span><span>${Number(paid).toLocaleString()} ج.م</span></div>${inv.change > 0 ? `<div class="line" style="color:#059669"><span>الباقي للعميل</span><span>${Number(inv.change).toLocaleString()} ج.م</span></div>` : ''}${remaining > 0 ? `<div class="line" style="color:#dc2626"><span>المتبقي</span><span>${Number(remaining).toLocaleString()} ج.م</span></div>` : ''}
<div class="line total"><span>${remaining > 0 ? 'معلق' : 'مدفوع'}</span><span>${inv.paymentMethod || 'كاش'}</span></div></div>
<div class="footer">شكراً لزيارتكم<br>Laguna Cafe ☕</div>
<script>window.print();window.close();<\/script></body></html>`);
}
