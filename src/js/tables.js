let tables = [];
let editTableId = null;
const grid = document.getElementById('tablesGrid');
const modal = document.getElementById('tableModal');
const modalTitle = document.getElementById('modalTitle');
const tableName = document.getElementById('tableName');
const tableCapacity = document.getElementById('tableCapacity');
const tableService = document.getElementById('tableService');
const saveBtn = document.getElementById('saveTable');

async function render() {
  tables = (await DB.tables.all() || []).sort((a, b) => {
    const na = parseInt(String(a.name || '').replace(/\D/g, '')) || 0;
    const nb = parseInt(String(b.name || '').replace(/\D/g, '')) || 0;
    return na - nb;
  });
  grid.innerHTML = '';
  const statusMap = { available: 'متاحة', occupied: 'مشغولة', reserved: 'محجوزة' };
  const colorMap = { available: '#047857', occupied: '#b91c1c', reserved: '#92400e' };

  tables.forEach(t => {
    const card = document.createElement('div');
    card.className = 'table-card';
    card.innerHTML = `
      <div class="table-status" style="background:${colorMap[t.status]}"></div>
      <h3>${escapeHtml(t.name)}</h3>
      <p><i class="fa-solid fa-chair"></i> ${validateNumber(t.capacity)} كراسي ${t.hasService ? '<span style="color:#d97706;font-size:12px;margin-right:8px"><i class="fa-solid fa-star"></i> ضيافة</span>' : ''}</p>
      <span class="badge" style="background:${colorMap[t.status]}">${statusMap[t.status]}</span>
      <div class="table-actions">
        <button class="edit-btn" data-id="${escapeHtml(t.id)}" title="تعديل الترابيزة" aria-label="تعديل الترابيزة"><i class="fa-solid fa-pen"></i></button>
        <button class="qr-btn" data-id="${escapeHtml(t.id)}" data-num="${String(t.name || '').replace(/\D/g, '')}" title="عرض QR الترابيزة" aria-label="عرض QR الترابيزة"><i class="fa-solid fa-qrcode"></i></button>
        <select class="status-select" data-id="${escapeHtml(t.id)}" aria-label="حالة الترابيزة">
          <option value="available" ${t.status === 'available' ? 'selected' : ''}>متاحة</option>
          <option value="occupied" ${t.status === 'occupied' ? 'selected' : ''}>مشغولة</option>
          <option value="reserved" ${t.status === 'reserved' ? 'selected' : ''}>محجوزة</option>
        </select>
        <button class="delete-btn" data-id="${escapeHtml(t.id)}" title="حذف الترابيزة" aria-label="حذف الترابيزة"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    grid.appendChild(card);
  });

  document.getElementById('totalTables').textContent = tables.length;
  document.getElementById('availableTables').textContent = tables.filter(t => t.status === 'available').length;
  document.getElementById('occupiedTables').textContent = tables.filter(t => t.status === 'occupied').length;
  document.getElementById('reservedTables').textContent = tables.filter(t => t.status === 'reserved').length;
  attachEvents();
}

function attachEvents() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const t = tables.find(x => x.id === btn.dataset.id);
      if (!t) return;
      editTableId = t.id;
      modalTitle.textContent = 'تعديل طاولة';
      tableName.value = t.name;
      tableCapacity.value = t.capacity;
      tableService.checked = t.hasService || false;
      modal.classList.add('show');
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف هذه الطاولة؟')) return;
      btn.disabled = true;
      try {
        await DB.tables.remove(btn.dataset.id);
        await render();
      } catch (e) { alert('تعذر حذف الترابيزة: ' + (e.message || e)); }
      finally { btn.disabled = false; }
    };
  });
  document.querySelectorAll('.status-select').forEach(sel => {
    sel.onchange = async function () {
      this.disabled = true;
      try {
        await DB.tables.update(this.dataset.id, { status: this.value, ...(this.value === 'available' ? { currentOrder: null } : {}) });
      } catch (e) { alert('تعذر تغيير حالة الترابيزة: ' + (e.message || e)); }
      finally { this.disabled = false; await render(); }
    };
  });
  document.querySelectorAll('.qr-btn').forEach(btn => {
    btn.onclick = () => {
      if (!btn.dataset.num) return alert('أضف رقمًا لاسم الترابيزة أولًا');
      window.open('qr.html?tableId=' + encodeURIComponent(btn.dataset.id), '_blank', 'noopener');
    };
  });
}

document.getElementById('addTableBtn').onclick = () => {
  editTableId = null;
  modalTitle.textContent = 'إضافة طاولة';
  tableName.value = '';
  tableCapacity.value = '';
  tableService.checked = false;
  modal.classList.add('show');
};

saveBtn.onclick = async () => {
  const name = tableName.value.trim();
  const capacity = Number(tableCapacity.value);
  if (!name || !Number.isInteger(capacity) || capacity < 1) return alert('يرجى إدخال اسم الترابيزة وعدد كراسي صحيح أكبر من صفر');
  const number = name.replace(/\D/g, '');
  if (tables.some(t => t.id !== editTableId && (String(t.name || '').trim() === name || (number && String(t.name || '').replace(/\D/g, '') === number)))) return alert('اسم أو رقم الترابيزة موجود بالفعل');
  const hasService = tableService.checked;
  saveBtn.disabled = true;
  try {
    if (editTableId) {
      await DB.tables.update(editTableId, { name, capacity, hasService });
    } else {
      const tnum = name.replace(/\D/g, '').trim() || Date.now();
      await DB.tables.add({ id: 't' + tnum, name, capacity, status: 'available', currentOrder: null, hasService });
    }
    modal.classList.remove('show');
    await render();
  } catch (e) { alert('تعذر حفظ الترابيزة: ' + (e.message || e)); }
  finally { saveBtn.disabled = false; }
};

document.getElementById('cancelTable').onclick = () => modal.classList.remove('show');
document.getElementById('closeTableModal').onclick = () => modal.classList.remove('show');
window.onclick = (e) => { if (e.target === modal) modal.classList.remove('show'); };

document.getElementById('resetAllBtn').onclick = async () => {
  if (!confirm('هل تريد جعل جميع الطاولات متاحة؟\nسيتم تغيير حالة كل الطاولات المشغولة والمحجوزة إلى متاحة.')) return;
  const nonAvailable = tables.filter(t => t.status !== 'available');
  if (nonAvailable.length === 0) return alert('جميع الطاولات متاحة بالفعل');
  let count = 0;
  for (var i = 0; i < nonAvailable.length; i++) {
    try {
      await DB.tables.update(nonAvailable[i].id, { status: 'available', currentOrder: null });
      count++;
    } catch (e) {
      console.warn('[tables] reset error:', e);
    }
  }
  alert('تم جعل ' + count + ' طاولة متاحة');
  render();
};

render();
