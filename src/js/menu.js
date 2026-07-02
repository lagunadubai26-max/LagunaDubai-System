let total = 0;

async function loadProducts() {
  const products = await DB.products.all() || [];
  const container = document.querySelector('.products');
  if (!container) return;
  container.innerHTML = '';

  products.forEach(p => {
    if (!p.available) return;
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = p.category;
    card.innerHTML = `
      <div class="menu-icon"><img loading="lazy" src="${p.image || 'images/menu/placeholder.webp'}" alt="${p.name}"></div>
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
      updateButtons();
    });
  });
}

function updateButtons() {
  document.querySelectorAll(".plus").forEach(btn => {
    btn.onclick = function () {
      const item = this.closest(".order-item");
      const qty = item.querySelector(".qty");
      let q = parseInt(qty.innerText);
      q++;
      qty.innerText = q;
      const price = parseInt(item.dataset.price);
      item.querySelector(".price").innerText = (q * price) + " جنيه";
      total += price;
      document.querySelector(".total strong").innerText = total + " جنيه";
    };
  });
  document.querySelectorAll(".minus").forEach(btn => {
    btn.onclick = function () {
      const item = this.closest(".order-item");
      const qty = item.querySelector(".qty");
      let q = parseInt(qty.innerText);
      if (q > 1) {
        q--;
        qty.innerText = q;
        const price = parseInt(item.dataset.price);
        item.querySelector(".price").innerText = (q * price) + " جنيه";
        total -= price;
        document.querySelector(".total strong").innerText = total + " جنيه";
      }
    };
  });
  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = function () {
      const item = this.closest(".order-item");
      const qty = parseInt(item.querySelector(".qty").innerText);
      const price = parseInt(item.dataset.price);
      total -= qty * price;
      document.querySelector(".total strong").innerText = total + " جنيه";
      item.remove();
      if (document.querySelectorAll(".order-list .order-item").length === 0) {
        document.querySelector(".order-list").innerHTML = `<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>`;
      }
    };
  });
}

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
const modal = document.querySelector(".confirm-modal");
const yesBtn = document.querySelector(".confirm-btn");
const noBtn = document.querySelector(".cancel-btn");

clearBtn.addEventListener("click", () => modal.classList.add("show"));
noBtn.addEventListener("click", () => modal.classList.remove("show"));
yesBtn.addEventListener("click", () => {
  document.querySelector(".order-list").innerHTML = `<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>`;
  total = 0;
  document.querySelector(".total strong").innerText = "0 جنيه";
  modal.classList.remove("show");
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
  document.getElementById('checkoutTotal').textContent = totalAmount + ' جنيه';
  document.getElementById('checkoutModal').classList.add('show');
  window._checkoutItems = items;
  window._checkoutTotal = totalAmount;
});

document.getElementById('confirmCheckout').onclick = async () => {
  const customer = document.getElementById('checkoutCustomer').value.trim() || 'نقدي';
  const method = document.getElementById('checkoutMethod').value;
  const items = window._checkoutItems;
  const totalAmount = window._checkoutTotal;
  const inv = await DB.invoices.add({ customer, date: new Date().toISOString(), items, total: totalAmount, status: "paid", paymentMethod: method });
  document.getElementById('checkoutModal').classList.remove('show');
  alert(`تم إنشاء الفاتورة ${inv ? inv.id : ''} بنجاح بقيمة ${totalAmount} جنيه`);
  document.querySelector(".clear-order").click();
};
document.getElementById('cancelCheckout').onclick = () => {
  document.getElementById('checkoutModal').classList.remove('show');
};

loadProducts();
