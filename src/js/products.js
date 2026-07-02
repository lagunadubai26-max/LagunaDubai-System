let products = [];
let editProdId = null;
const prodList = document.getElementById('prodList');
const searchInput = document.getElementById('prodSearch');
const catFilter = document.getElementById('prodCategory');
const modal = document.getElementById('prodModal');

const categoryNames = {
  coffee: 'قهوة', hot: 'مشروبات ساخنة', ice: 'آيس كوفي', matcha: 'ماتشا',
  frappe: 'فرابيه', smoothie: 'سموزي', milkshake: 'ميلك شيك', yogurt: 'زبادي',
  juice: 'عصائر فريش', cocktail: 'كوكتيلات', mojito: 'موهيتو', cans: 'كانز',
  desserts: 'حلويات'
};

async function render() {
  products = await DB.products.all() || [];
  prodList.innerHTML = '';
  const val = searchInput.value.toLowerCase();
  const cat = catFilter.value;
  const filtered = products.filter(p => p.name.toLowerCase().includes(val) && (cat === 'all' || p.category === cat));

  filtered.forEach(p => {
    const stCls = p.available ? 'active' : 'stopped';
    const stTxt = p.available ? 'متاح' : 'غير متاح';
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <div><img class="thumb" src="${p.image || 'images/menu/placeholder.webp'}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍕</text></svg>'"></div>
      <span>${p.name}</span><span>${categoryNames[p.category] || p.category}</span>
      <span>${p.price} ج.م</span>
      <span class="status ${stCls}">${stTxt}</span>
      <div class="actions">
        <button class="edit-btn" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    prodList.appendChild(row);
  });

  document.getElementById('prodTotal').textContent = products.length;
  document.getElementById('prodCategories').textContent = new Set(products.map(p => p.category)).size;
  document.getElementById('prodActive').textContent = products.filter(p => p.available).length;
  document.getElementById('prodInactive').textContent = products.filter(p => !p.available).length;
  attachEvents();
}

function attachEvents() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const p = products.find(x => x.id === btn.dataset.id);
      if (!p) return;
      editProdId = p.id;
      document.getElementById('prodModalTitle').textContent = 'تعديل منتج';
      document.getElementById('prodName').value = p.name;
      document.getElementById('prodNameEn').value = p.nameEn || '';
      document.getElementById('prodCategoryModal').value = p.category;
      document.getElementById('prodPrice').value = p.price;
      document.getElementById('prodImage').value = p.image || '';
      document.getElementById('prodAvailable').checked = p.available;
      modal.classList.add('show');
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف هذا المنتج؟')) return;
      await DB.products.remove(btn.dataset.id);
      render();
    };
  });
}

document.getElementById('addProdBtn').onclick = () => {
  editProdId = null;
  document.getElementById('prodModalTitle').textContent = 'إضافة منتج';
  document.getElementById('prodName').value = '';
  document.getElementById('prodNameEn').value = '';
  document.getElementById('prodCategoryModal').value = 'coffee';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodImage').value = '';
  document.getElementById('prodAvailable').checked = true;
  modal.classList.add('show');
};

document.getElementById('saveProd').onclick = async () => {
  const name = document.getElementById('prodName').value.trim();
  const nameEn = document.getElementById('prodNameEn').value.trim();
  const category = document.getElementById('prodCategoryModal').value;
  const price = Number(document.getElementById('prodPrice').value);
  const image = document.getElementById('prodImage').value.trim();
  const available = document.getElementById('prodAvailable').checked;
  if (!name || !price) return alert('يرجى إدخال اسم المنتج والسعر');
  if (editProdId) {
    await DB.products.update(editProdId, { name, nameEn, category, price, image, available });
  } else {
    await DB.products.add({ id: Date.now().toString(36), name, nameEn, category, price, image, available });
  }
  modal.classList.remove('show');
  render();
};

document.getElementById('cancelProd').onclick = () => modal.classList.remove('show');
document.getElementById('closeProdModal').onclick = () => modal.classList.remove('show');
searchInput.addEventListener('keyup', render);
catFilter.addEventListener('change', render);

render();
