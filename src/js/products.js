let products = [];
let categories = [];
let catMap = {};
let editProdId = null;
let deleteTargetId = null;
let productMenuType = 'cafe';
const prodList = document.getElementById('prodList');
const searchInput = document.getElementById('prodSearch');
const catFilter = document.getElementById('prodCategory');
const modal = document.getElementById('prodModal');
const deleteModal = document.getElementById('deleteProdModal');

async function loadCategories() {
  const raw = await DB.categories.all() || [];
  // De-duplicate by slug
  const seen = {};
  categories = [];
  raw.forEach(c => { if (!seen[c.slug]) { seen[c.slug] = true; categories.push(c); } });
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  catMap = {};
  categories.forEach(c => catMap[c.slug] = c.name);
  populateCategoryDropdowns();
  renderCategoryList();
}

function populateCategoryDropdowns() {
  const oldCategory = document.getElementById('prodCategoryModal').value;
  catFilter.innerHTML = '<option value="all">كل الأقسام</option>';
  const modalSelect = document.getElementById('prodCategoryModal');
  modalSelect.innerHTML = '';
  categories.filter(c => Catalog.inMenu(c, productMenuType) || products.some(p => p.category === c.slug && Catalog.inMenu(p, productMenuType))).forEach(c => {
    const opt1 = document.createElement('option');
    opt1.value = c.slug;
    opt1.textContent = c.name;
    catFilter.appendChild(opt1);
  });
  const selectedType = document.getElementById('prodMenuType').value;
  categories.filter(c => selectedType === 'both' || Catalog.inMenu(c, selectedType)).forEach(c => {
    const opt2 = document.createElement('option');
    opt2.value = c.slug;
    opt2.textContent = c.name;
    modalSelect.appendChild(opt2);
  });
  if (Array.from(modalSelect.options).some(o => o.value === oldCategory)) modalSelect.value = oldCategory;
}

function renderCategoryList() {
  const catList = document.getElementById('catList');
  if (!catList) return;
  catList.innerHTML = '';
  categories.filter(c => Catalog.inMenu(c, productMenuType)).forEach(c => {
    const tag = document.createElement('span');
    tag.style.cssText = 'display:inline-flex;align-items:center;gap:6px;background:var(--bg);border:2px solid var(--border);border-radius:10px;padding:6px 12px;font-size:13px';
    tag.textContent = c.name;
    const btn = document.createElement('button');
    btn.className = 'del-cat-btn';
    btn.dataset.id = c.id;
    btn.style.cssText = 'background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0';
    btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    tag.appendChild(btn);
    catList.appendChild(tag);
  });
  document.querySelectorAll('.del-cat-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const cat = categories.find(c => c.id === id);
      const inUse = products.some(p => p.category === cat.slug);
      if (inUse) return alert('لا يمكن حذف هذا القسم لسه فيه منتجات. نقل المنتجات لقسم تاني الأول.');
      if (!confirm('حذف قسم "' + cat.name + '"؟')) return;
      await DB.categories.remove(id);
      await loadCategories();
      render();
    };
  });
}

document.getElementById('addCatBtn').onclick = async () => {
  const slug = document.getElementById('newCatSlug').value.trim();
  const name = document.getElementById('newCatName').value.trim();
  if (!slug || !name) return alert('ادخل الاسم الإنجليزي والعربي');
  if (categories.find(c => c.slug === slug)) return alert('القسم ده موجود بالفعل');
  const maxOrder = categories.reduce((m, c) => Math.max(m, c.order || 0), 0);
  await DB.categories.add({ slug, name, order: maxOrder + 1, menuType: productMenuType });
  document.getElementById('newCatSlug').value = '';
  document.getElementById('newCatName').value = '';
  await loadCategories();
  render();
};

async function render() {
  products = await DB.products.all() || [];
  prodList.innerHTML = '';
  const val = searchInput.value.toLowerCase();
  const cat = catFilter.value;
  const filtered = products.filter(p => Catalog.inMenu(p, productMenuType) && (p.name || '').toLowerCase().includes(val) && (cat === 'all' || p.category === cat));

  filtered.forEach(p => {
    if (!p.name) return;
    const stCls = p.available ? 'active' : 'stopped';
    const stTxt = p.available ? 'متاح' : 'غير متاح';
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <div><img class="thumb" src="${sanitizeUrl(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍽</text></svg>'"></div>
      <span>${escapeHtml(p.name)}${Catalog.type(p) === 'both' ? '<small class="shared-product-label">الكافيه والمطعم</small>' : ''}</span><span>${escapeHtml(catMap[p.category] || p.category)}</span>
      <span>${productPriceLabel(p)}</span>
      <span class="status ${stCls}">${escapeHtml(stTxt)}</span>
      <div class="actions">
        <button class="edit-btn" data-id="${escapeHtml(p.id)}"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn" data-id="${escapeHtml(p.id)}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    prodList.appendChild(row);
  });

  // Click on stat cards to filter by availability
  document.querySelectorAll('.product-stats .stat-card').forEach((card, idx) => {
    card.style.cursor = 'pointer';
    card.onclick = () => {
      if (idx === 2) { // متاح
        catFilter.value = 'all';
        searchInput.value = '';
        renderFiltered(true);
      } else if (idx === 3) { // غير متاح
        catFilter.value = 'all';
        searchInput.value = '';
        renderFiltered(false);
      } else {
        catFilter.value = 'all';
        searchInput.value = '';
        render();
      }
    };
  });
  const scoped = products.filter(p => Catalog.inMenu(p, productMenuType));
  document.getElementById('prodTotal').textContent = scoped.length;
  document.getElementById('prodCategories').textContent = categories.filter(c => Catalog.inMenu(c, productMenuType)).length;
  document.getElementById('prodActive').textContent = scoped.filter(p => p.available).length;
  document.getElementById('prodInactive').textContent = scoped.filter(p => !p.available).length;
  attachEvents();
}

function renderFiltered(available) {
  prodList.innerHTML = '';
  const filtered = products.filter(p => Catalog.inMenu(p, productMenuType) && !!p.available === available);
  filtered.forEach(p => {
    if (!p.name) return;
    const stCls = p.available ? 'active' : 'stopped';
    const stTxt = p.available ? 'متاح' : 'غير متاح';
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <div><img class="thumb" src="${sanitizeUrl(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍽</text></svg>'"></div>
      <span>${escapeHtml(p.name)}</span><span>${escapeHtml(catMap[p.category] || p.category)}</span>
      <span>${productPriceLabel(p)}</span>
      <span class="status ${stCls}">${escapeHtml(stTxt)}</span>
      <div class="actions">
        <button class="edit-btn" data-id="${escapeHtml(p.id)}"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn" data-id="${escapeHtml(p.id)}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    prodList.appendChild(row);
  });
  attachEvents();
}

function attachEvents() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const p = products.find(x => x.id === btn.dataset.id);
      if (!p) return;
      editProdId = p.id;
      document.getElementById('prodMenuType').value = Catalog.type(p);
      populateCategoryDropdowns();
      fillVariants(p);
      document.getElementById('prodModalTitle').textContent = 'تعديل منتج';
      document.getElementById('prodName').value = p.name;
      document.getElementById('prodNameEn').value = p.nameEn || '';
      document.getElementById('prodCategoryModal').value = p.category;
      document.getElementById('prodPrice').value = p.price;
      document.getElementById('prodDesc').value = p.description || '';
      document.getElementById('prodImage').value = p.image || '';
      document.getElementById('prodImageFile').value = '';
      if (p.image) {
        const preview = document.getElementById('prodImagePreview');
        preview.style.display = 'block';
        preview.querySelector('img').src = p.image;
      } else {
        document.getElementById('prodImagePreview').style.display = 'none';
      }
      document.getElementById('prodAvailable').checked = p.available;
      modal.classList.add('show');
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      deleteTargetId = btn.dataset.id;
      deleteModal.classList.add('show');
    };
  });
}

function resetProductForm() {
  document.getElementById('prodMenuType').value = productMenuType;
  populateCategoryDropdowns();
  fillVariants({ menuType: productMenuType, variants: [], defaultVariantKey: 'medium' });
  document.getElementById('prodName').value = '';
  document.getElementById('prodNameEn').value = '';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodDesc').value = '';
  document.getElementById('prodImage').value = '';
  document.getElementById('prodImageFile').value = '';
  document.getElementById('prodImagePreview').style.display = 'none';
  document.getElementById('prodAvailable').checked = true;
}

document.getElementById('prodImageFile').onchange = function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const maxW = 400;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = c.toDataURL('image/jpeg', 0.6);
      document.getElementById('prodImage').value = compressed;
      const preview = document.getElementById('prodImagePreview');
      preview.style.display = 'block';
      preview.querySelector('img').src = compressed;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

document.getElementById('addProdBtn').onclick = () => {
  editProdId = null;
  document.getElementById('prodModalTitle').textContent = 'إضافة منتج';
  resetProductForm();
  modal.classList.add('show');
};

document.getElementById('saveProd').onclick = async () => {
  const name = document.getElementById('prodName').value.trim();
  const nameEn = document.getElementById('prodNameEn').value.trim();
  const category = document.getElementById('prodCategoryModal').value;
  let price = Number(document.getElementById('prodPrice').value);
  const menuType = document.getElementById('prodMenuType').value;
  const pricingMode = document.getElementById('prodPricingMode').value;
  const sized = pricingMode === 'sizes';
  const variants = sized ? Catalog.sizes.map(key => {
    const value = document.getElementById('sizePrice-' + key).value.trim();
    return { key, label: Catalog.labels[key], price: value === '' ? null : Number(value), available: document.getElementById('sizeEnabled-' + key).checked };
  }) : [];
  const defaultVariantKey = sized ? document.getElementById('prodDefaultVariant').value : '';
  if (variants.some(v => (v.price !== null && (!Number.isFinite(v.price) || v.price < 0)) || (v.available && v.price === null))) return alert('أدخل سعرًا صحيحًا لكل مقاس مفعل');
  if (sized) {
    const def = variants.find(v => v.key === defaultVariantKey && v.available && v.price !== null);
    if (!def) return alert('اختر مقاسًا افتراضيًا مسعّرًا ومفعلًا');
    price = def.price;
  }
  const description = document.getElementById('prodDesc').value.trim();
  const image = document.getElementById('prodImage').value.trim();
  const available = document.getElementById('prodAvailable').checked;
  if (!name || !category || !Number.isFinite(price) || price < 0 || (!sized && document.getElementById('prodPrice').value === '')) return alert('يرجى إدخال اسم المنتج والقسم والسعر الصحيح');
  const btn = document.getElementById('saveProd');
  if (btn.disabled) return;
  btn.disabled = true;
  try {
    if (editProdId) {
      await DB.products.update(editProdId, { name, nameEn, category, price, description, image, available, menuType, pricingMode, variants, defaultVariantKey });
    } else {
      await DB.products.add({ id: safeId(), name, nameEn, category, price, description, image, available, menuType, pricingMode, variants, defaultVariantKey });
    }
    modal.classList.remove('show');
    await render();
  } catch (e) { alert('تعذر حفظ المنتج: ' + e.message); }
  finally { btn.disabled = false; }
};

document.getElementById('cancelProd').onclick = () => modal.classList.remove('show');
document.getElementById('closeProdModal').onclick = () => modal.classList.remove('show');
document.getElementById('cancelDelete').onclick = () => deleteModal.classList.remove('show');
document.getElementById('confirmDelete').onclick = async () => {
  if (deleteTargetId) {
    await DB.products.remove(deleteTargetId);
    deleteTargetId = null;
    deleteModal.classList.remove('show');
    render();
  }
};
searchInput.addEventListener('keyup', render);
catFilter.addEventListener('change', render);

function productPriceLabel(p) {
  return Catalog.variants(p).map(v => (Catalog.labels[v.key] || '') + ' ' + Number(v.price) + ' ج.م').join('<br>') || 'لا يوجد مقاس مفعل';
}
function fillVariants(p) {
  document.getElementById('prodPricingMode').value = Catalog.hasVariants(p) ? 'sizes' : 'single';
  updatePricingMode();
  document.getElementById('variantRows').innerHTML = Catalog.sizes.map(key => {
    const v = (p.variants || []).find(x => x.key === key) || {};
    return '<div class="variant-row"><input type="checkbox" id="sizeEnabled-' + key + '"' + (v.available ? ' checked' : '') + '><label for="sizeEnabled-' + key + '">' + Catalog.labels[key] + '</label><input type="number" min="0" step="0.01" id="sizePrice-' + key + '" aria-label="سعر ' + Catalog.labels[key] + '" value="' + (v.price == null ? '' : Number(v.price)) + '"></div>';
  }).join('');
  document.getElementById('prodDefaultVariant').value = p.defaultVariantKey || 'medium';
}
document.getElementById('prodMenuType').onchange = () => {
  populateCategoryDropdowns();
};
function updatePricingMode() {
  const sized = document.getElementById('prodPricingMode').value === 'sizes';
  document.getElementById('prodVariants').hidden = !sized;
  document.getElementById('prodPrice').disabled = sized;
}
document.getElementById('prodPricingMode').onchange = updatePricingMode;
Catalog.tabs(document.getElementById('productMenuTypes'), type => {
  productMenuType = type;
  populateCategoryDropdowns(); renderCategoryList(); render();
});

(async () => {
  try {
    await DB.seed();
  } catch (e) {
    console.error('[products] seed error:', e);
  }
  products = await DB.products.all() || [];
  await loadCategories();
  render();
})();
