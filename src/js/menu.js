const buttons = document.querySelectorAll(".product-card button");
const orderBox = document.querySelector(".order-box");
const totalPrice = document.querySelector(".total strong");
let total = 0;

buttons.forEach(button => {
  button.addEventListener("click", function () {
    const card = this.parentElement;
    const name = card.querySelector("h3").innerText;
    const price = parseInt(card.querySelector("h2").innerText);
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
    totalPrice.innerText = total + " جنيه";
    updateButtons();
  });
});

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
      totalPrice.innerText = total + " جنيه";
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
        totalPrice.innerText = total + " جنيه";
      }
    };
  });
  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = function () {
      const item = this.closest(".order-item");
      const qty = parseInt(item.querySelector(".qty").innerText);
      const price = parseInt(item.dataset.price);
      total -= qty * price;
      totalPrice.innerText = total + " جنيه";
      item.remove();
      if (document.querySelectorAll(".order-list .order-item").length === 0) {
        document.querySelector(".order-list").innerHTML = `<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>`;
      }
    };
  });
}

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll(".product-card").forEach(card => {
    const name = card.querySelector("h3").innerText.toLowerCase();
    const english = card.querySelector("p") ? card.querySelector("p").innerText.toLowerCase() : "";
    card.style.display = name.includes(value) || english.includes(value) ? "" : "none";
  });
});

const categoryButtons = document.querySelectorAll(".category-btn");
const products = document.querySelectorAll(".product-card");
categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    const category = button.dataset.category;
    products.forEach(product => {
      product.style.display = category === "all" || product.dataset.category === category ? "block" : "none";
    });
  });
});

const clearBtn = document.querySelector(".clear-order");
const modal = document.querySelector(".confirm-modal");
const yesBtn = document.querySelector(".confirm-btn");
const noBtn = document.querySelector(".cancel-btn");

clearBtn.addEventListener("click", () => modal.classList.add("show"));
noBtn.addEventListener("click", () => modal.classList.remove("show"));
yesBtn.addEventListener("click", () => {
  document.querySelector(".order-list").innerHTML = `<div class="order-item"><span>لا توجد منتجات</span><strong>0</strong></div>`;
  total = 0;
  totalPrice.innerText = "0 جنيه";
  modal.classList.remove("show");
});

const checkoutBtn = document.querySelector(".checkout");
checkoutBtn.addEventListener("click", async () => {
  const items = [];
  document.querySelectorAll(".order-item .name").forEach(el => {
    const itemEl = el.closest(".order-item");
    const qty = parseInt(itemEl.querySelector(".qty").innerText);
    const priceText = itemEl.dataset.price;
    if (priceText) items.push({ name: el.innerText, qty, price: parseInt(priceText) });
  });
  if (items.length === 0) return alert("الطلب فارغ، أضف منتجات أولاً");
  const totalAmount = items.reduce((s, i) => s + i.qty * i.price, 0);
  const customer = prompt("اسم العميل (اختياري)") || "نقدي";
  const method = prompt("طريقة الدفع (Cash/Visa/Wallet)", "Cash") || "Cash";
  const inv = await DB.invoices.add({ customer, date: new Date().toISOString(), items, total: totalAmount, status: "paid", paymentMethod: method });
  alert(`تم إنشاء الفاتورة ${inv ? inv.id : ''} بنجاح بقيمة ${totalAmount} جنيه`);
  document.querySelector(".clear-order").click();
});
