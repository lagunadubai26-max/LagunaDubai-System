let inventory = [];
let editInvId = null;
const invList = document.getElementById('invList');
const searchInput = document.getElementById('invSearch');
const catFilter = document.getElementById('invCategory');
const modal = document.getElementById('invModal');

async function render() {
  inventory = await DB.inventory.all() || [];
  invList.innerHTML = '';
  const val = searchInput.value.toLowerCase();
  const cat = catFilter.value;
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(val) && (cat === 'all' || i.category === cat));

  filtered.forEach(i => {
    const stCls = i.quantity <= 0 ? 'stopped' : i.quantity <= i.minQuantity ? 'vacation' : 'active';
    const stTxt = i.quantity <= 0 ? 'نفذ' : i.quantity <= i.minQuantity ? 'منخفض' : 'متوفر';
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <span>${escapeHtml(i.name)}</span><span>${escapeHtml(i.category)}</span><span>${i.quantity}</span><span>${i.unit}</span><span>${i.minQuantity}</span>
      <span class="status ${stCls}">${stTxt}</span>
      <div class="actions">
        <button class="edit-btn" data-id="${i.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn" data-id="${i.id}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    invList.appendChild(row);
  });

  document.getElementById('invTotal').textContent = inventory.length;
  document.getElementById('invInStock').textContent = inventory.filter(i => i.quantity > i.minQuantity).length;
  document.getElementById('invLowStock').textContent = inventory.filter(i => i.quantity > 0 && i.quantity <= i.minQuantity).length;
  document.getElementById('invOutOfStock').textContent = inventory.filter(i => i.quantity <= 0).length;
  attachEvents();
}

function attachEvents() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const i = inventory.find(x => x.id === btn.dataset.id);
      if (!i) return;
      editInvId = i.id;
      document.getElementById('invModalTitle').textContent = 'تعديل صنف';
      document.getElementById('invName').value = i.name;
      document.getElementById('invCategoryModal').value = i.category;
      document.getElementById('invQty').value = i.quantity;
      document.getElementById('invUnit').value = i.unit;
      document.getElementById('invMin').value = i.minQuantity;
      modal.classList.add('show');
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف هذا الصنف؟')) return;
      await DB.inventory.remove(btn.dataset.id);
      render();
    };
  });
}

document.getElementById('addInvBtn').onclick = () => {
  editInvId = null;
  document.getElementById('invModalTitle').textContent = 'إضافة صنف';
  document.getElementById('invName').value = '';
  document.getElementById('invCategoryModal').value = 'قهوة';
  document.getElementById('invQty').value = '';
  document.getElementById('invUnit').value = 'كجم';
  document.getElementById('invMin').value = '';
  modal.classList.add('show');
};

document.getElementById('saveInv').onclick = async () => {
  const name = document.getElementById('invName').value.trim();
  const category = document.getElementById('invCategoryModal').value;
  const quantity = Number(document.getElementById('invQty').value);
  const unit = document.getElementById('invUnit').value;
  const minQuantity = Number(document.getElementById('invMin').value);
  if (!name) return alert('يرجى إدخال اسم الصنف');
  if (editInvId) {
    await DB.inventory.update(editInvId, { name, category, quantity, unit, minQuantity });
  } else {
    await DB.inventory.add({ name, category, quantity, unit, minQuantity });
  }
  modal.classList.remove('show');
  render();
};

document.getElementById('cancelInv').onclick = () => modal.classList.remove('show');
document.getElementById('closeInvModal').onclick = () => modal.classList.remove('show');
searchInput.addEventListener('keyup', render);
catFilter.addEventListener('change', render);

// --- Toast ---
function showToast(message, type) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation' };
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
}

// --- Weekly Inventory ---
const weeklyInvBtn = document.getElementById('weeklyInvBtn');
const weeklyInvModal = document.getElementById('weeklyInvModal');
const weeklyInvList = document.getElementById('weeklyInvList');
const saveWeeklyInv = document.getElementById('saveWeeklyInv');

weeklyInvBtn.onclick = async () => {
  inventory = await DB.inventory.all() || [];
  weeklyInvList.innerHTML = '';
  inventory.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:10px;border-bottom:1px solid var(--border)">${escapeHtml(item.name)}</td>
      <td style="padding:10px;border-bottom:1px solid var(--border)">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid var(--border)"><input type="number" class="weekly-qty" data-id="${item.id}" value="${item.quantity}" style="width:70px;padding:6px 10px;border:2px solid var(--border);border-radius:8px;font-size:13px;outline:none"></td>
      <td style="padding:10px;border-bottom:1px solid var(--border)">${item.minQuantity}</td>`;
    weeklyInvList.appendChild(tr);
  });
  weeklyInvModal.classList.add('show');
};

saveWeeklyInv.onclick = async () => {
  const dateStr = new Date().toISOString().slice(0, 10);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekKey = weekStart.toISOString().slice(0, 10);

  const lowStockItems = [];
  const inputs = document.querySelectorAll('.weekly-qty');
  try {
    await FB.runTransaction(async (tx) => {
      const rawDb = FB.getDb();
      for (const input of inputs) {
        const actualQty = Number(input.value);
        const itemId = input.dataset.id;
        const itemRef = rawDb.collection('inventory').doc(itemId);
        const itemSnap = await tx.get(itemRef);
        if (!itemSnap.exists) continue;
        const item = itemSnap.data();
        const countId = itemId + '-' + weekKey;
        tx.set(rawDb.collection('inventory_counts').doc(countId), {
          itemId, itemName: item.name, weekKey, date: dateStr,
          systemQty: item.quantity, actualQty, minQty: item.minQuantity
        });
        tx.update(itemRef, { quantity: actualQty });
        if (actualQty < item.minQuantity) {
          lowStockItems.push(item.name);
        }
      }
    });
  } catch (e) {
    showToast('فشل الجرد: ' + e.message, 'error');
    return;
  }

  weeklyInvModal.classList.remove('show');
  if (lowStockItems.length > 0) {
    showToast('تم حفظ الجرد الأسبوعي', 'success');
    lowStockItems.forEach(name => showToast('تنبيه: ' + name + ' أقل من الحد الأدنى', 'warning'));
  } else {
    showToast('✓ تم حفظ الجرد الأسبوعي بنجاح', 'success');
  }
  render();
};

document.getElementById('cancelWeeklyInv').onclick = () => weeklyInvModal.classList.remove('show');
document.getElementById('closeWeeklyInv').onclick = () => weeklyInvModal.classList.remove('show');

render();
