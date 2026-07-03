let total = 0;
let serviceTaxRate = 0;
const urlParams = new URLSearchParams(window.location.search);
const tableNum = urlParams.get('table');
const hasService = urlParams.get('service') === '1';
const isCustomer = !!tableNum;
if (isCustomer) {
  document.querySelector('.menu-header h1').innerHTML = '<i class="fa-solid fa-utensils"></i> القائمة - طاولة ' + tableNum + (hasService ? ' <span style="color:#d97706;font-size:14px">🌟 ضيافة</span>' : '');
  document.querySelectorAll('.sidebar, #sidebarToggle, .sidebar-overlay').forEach(el => el && (el.style.display = 'none'));
  const mainEl = document.querySelector('.main');
  if (mainEl) { mainEl.style.marginRight = '0'; mainEl.style.width = '100%'; }
}
(async () => {
  if (hasService) {
    const settings = await DB.settings.get();
    serviceTaxRate = settings.serviceTax || 10;
  }
})();

function getTotalWithService() {
  if (serviceTaxRate > 0) return total + Math.round(total * serviceTaxRate / 100);
  return total;
}

function syncOrderSheet() {
  const orderList = document.querySelector('.order-box .order-list');
  const sheetList = document.getElementById('sheetOrderList');
  const sheetTotal = document.getElementById('sheetTotal');
  if (orderList && sheetList) sheetList.innerHTML = orderList.innerHTML;
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
  const products = await DB.products.all() || [];
  const container = document.querySelector('.products');
  if (!container) return;
  container.innerHTML = '';

  const categoryOrder = ['coffee','hot','ice','matcha','frappe','smoothie','milkshake','yogurt','juice','cocktail','mojito','cans','desserts'];
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
      const emptyItem = document.querySelector(".order-list .order-item");
      if (emptyItem && !emptyItem.querySelector(".name")) emptyItem.remove();
      let found = false;
      document.querySelectorAll(".order-item").forEach(item => {
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
        item.innerHTML = `
          <div class="order-top"><span class="name">${name}</span><button class="delete"><i class="fa-solid fa-trash"></i></button></div>
          <div class="price">${price} جنيه</div>
          <div class="order-bottom"><div class="controls"><button class="minus">-</button><span class="qty">1</span><button class="plus">+</button></div></div>`;
        document.querySelector(".order-list").appendChild(item);
      }
      total += price;
      document.querySelector(".total strong").innerText = total + " جنيه";
      syncOrderSheet();
    });
  });
}

function handleOrderClick(e) {
  const btn = e.target.closest('.plus, .minus, .delete');
  if (!btn) return;
  const item = btn.closest('.order-item');
  if (!item) return;
  if (btn.classList.contains('plus')) {
    const qty = item.querySelector('.qty');
    let q = parseInt(qty.innerText);
    q++;
    qty.innerText = q;
    const price = parseInt(item.dataset.price);
    item.querySelector('.price').innerText = (q * price) + ' جنيه';
    total += price;
  } else if (btn.classList.contains('minus')) {
    const qtyEl = item.querySelector('.qty');
    let q = parseInt(qtyEl.innerText);
    if (q <= 1) return;
    q--;
    qtyEl.innerText = q;
    const price = parseInt(item.dataset.price);
    item.querySelector('.price').innerText = (q * price) + ' جنيه';
    total -= price;
  } else if (btn.classList.contains('delete')) {
    const qty = parseInt(item.querySelector('.qty').innerText);
    const price = parseInt(item.dataset.price);
    total -= qty * price;
    item.remove();
    if (document.querySelectorAll('.order-list .order-item, #sheetOrderList .order-item').length === 0) {
      document.querySelector('.order-list').innerHTML = '<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>';
    }
  }
  document.querySelector('.total strong').innerText = total + ' جنيه';
  syncOrderSheet();
}

document.querySelector('.order-list').addEventListener('click', handleOrderClick);
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
  document.querySelector(".order-list").innerHTML = `<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>`;
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
  document.querySelectorAll(".order-item .name").forEach(el => {
    const itemEl = el.closest(".order-item");
    const qty = parseInt(itemEl.querySelector(".qty").innerText);
    const priceText = itemEl.dataset.price;
    if (priceText) items.push({ name: el.innerText, qty, price: parseInt(priceText) });
  });
  if (items.length === 0) return alert("الطلب فارغ، أضف منتجات أولاً");
  const totalAmount = items.reduce((s, i) => s + i.qty * i.price, 0);
  const serviceAmount = serviceTaxRate > 0 ? Math.round(totalAmount * serviceTaxRate / 100) : 0;
  const grandTotal = totalAmount + serviceAmount;
  document.getElementById('checkoutTotal').textContent = grandTotal + ' جنيه' + (serviceTaxRate > 0 ? ' (الخدمة ' + serviceAmount + ' ج.م)' : '');
  document.getElementById('checkoutModal').classList.add('show');
  window._checkoutItems = items;
  window._checkoutTotal = grandTotal;
  window._checkoutService = serviceAmount;
});

document.getElementById('checkoutCustomerType').onchange = () => {
  const isSpecial = document.getElementById('checkoutCustomerType').value === 'special';
  document.getElementById('checkoutSpecialFields').style.display = isSpecial ? 'block' : 'none';
};

document.getElementById('confirmCheckout').onclick = async () => {
  const custType = document.getElementById('checkoutCustomerType').value;
  let customer, totalAmount;
  if (custType === 'special') {
    customer = document.getElementById('checkoutSpecialName').value.trim() || 'عميل خاص';
    totalAmount = Number(document.getElementById('checkoutSpecialPrice').value);
    if (!totalAmount || totalAmount <= 0) return alert('يرجى إدخال السعر المخصص للعميل الخاص');
  } else {
    customer = 'نقدي';
    totalAmount = window._checkoutTotal;
  }
  const method = document.getElementById('checkoutMethod').value;
  const items = window._checkoutItems;
  const serviceAmount = window._checkoutService || 0;
  const table = tableNum ? 'طاولة ' + tableNum : null;
  const inv = await DB.invoices.add({ customer, table, date: new Date().toISOString(), items, total: totalAmount, serviceAmount, paymentMethod: method, status: "paid" });
  if (custType === 'special') {
    const existing = (await DB.customers.all() || []).find(c => c.name === customer);
    if (existing) {
      await DB.customers.update(existing.id, { visits: (existing.visits || 0) + 1, totalSpent: (existing.totalSpent || 0) + totalAmount, lastVisit: new Date().toISOString() });
    } else {
      await DB.customers.add({ name: customer, phone: '', totalSpent: totalAmount, visits: 1, lastVisit: new Date().toISOString() });
    }
  }
  document.getElementById('checkoutModal').classList.remove('show');
  alert(`تم إنشاء الفاتورة ${inv ? inv.id : ''} بنجاح بقيمة ${totalAmount} جنيه`);
  clearOrder();
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
