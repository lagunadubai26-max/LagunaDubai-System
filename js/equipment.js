let equipment = [];
let allEquipment = [];
const eqList = document.getElementById('eqList');
const eqMonth = document.getElementById('eqMonth');
const eqFilterCat = document.getElementById('eqFilterCat');
const eqCategory = document.getElementById('eqCategory');

const _eqMonthNow = () => { const d = FB.clockNow(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
eqMonth.value = _eqMonthNow();

const DEFAULT_EQ_CATEGORIES = ['كوباوات', 'شاي', 'قهوة', 'حليب', 'أخرى'];

function getEqCategories() {
  try { var saved = JSON.parse(localStorage.getItem('laguna_eq_categories')); if (Array.isArray(saved) && saved.length) return saved; } catch(e) {}
  return DEFAULT_EQ_CATEGORIES.slice();
}

function saveEqCategories(cats) { localStorage.setItem('laguna_eq_categories', JSON.stringify(cats)); }

function renderEqCategories() {
  var cats = getEqCategories();
  eqCategory.innerHTML = '';
  eqFilterCat.innerHTML = '<option value="">كل الفئات</option>';
  cats.forEach(function(c) {
    var opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    eqCategory.appendChild(opt.cloneNode(true));
    eqFilterCat.appendChild(opt);
  });
}

document.getElementById('addEqCatBtn').onclick = function() {
  var name = prompt('اسم فئة المعدات الجديد:');
  if (!name || !name.trim()) return;
  name = name.trim();
  var cats = getEqCategories();
  if (cats.indexOf(name) !== -1) return alert('هذه الفئة موجودة بالفعل');
  cats.push(name);
  saveEqCategories(cats);
  renderEqCategories();
  eqCategory.value = name;
};

function getMonthRange(value) {
  if (!value) { value = _eqMonthNow(); }
  const [year, month] = value.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end, year, month };
}

function filterByDate(items, range) {
  if (!range || !range.start) return items;
  return items.filter(item => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d >= range.start && d <= range.end;
  });
}

function fmtMoney(v) { return Number(v || 0).toLocaleString('ar-EG') + ' ج.م'; }

async function render() {
  allEquipment = await DB.equipment.all() || [];
  const range = getMonthRange(eqMonth.value);
  equipment = filterByDate(allEquipment, range);

  const catFilter = eqFilterCat.value;
  if (catFilter) equipment = equipment.filter(e => e.category === catFilter);

  eqList.innerHTML = '';
  const total = equipment.reduce((s, e) => s + Number(e.totalCost || 0), 0);
  const monthTotal = allEquipment.reduce((s, e) => s + Number(e.totalCost || 0), 0);

  document.getElementById('eqTotal').textContent = fmtMoney(total);
  document.getElementById('eqCount').textContent = equipment.length;

  // Top category
  const catTotals = {};
  equipment.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.totalCost || 0); });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('eqTopCat').textContent = topCat ? topCat[0] + ' — ' + fmtMoney(topCat[1]) : '—';

  equipment.forEach(e => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML =
      '<span>' + escapeHtml(e.name) + '</span>' +
      '<span>' + escapeHtml(e.category) + '</span>' +
      '<span>' + (e.quantity || 0) + '</span>' +
      '<span>' + fmtMoney(e.unitCost) + '</span>' +
      '<span style="font-weight:700">' + fmtMoney(e.totalCost) + '</span>' +
      '<span>' + escapeHtml(e.supplier || '—') + '</span>' +
      '<div class="actions"><button class="delete-btn" data-id="' + e.id + '"><i class="fa-solid fa-trash"></i></button></div>';
    eqList.appendChild(row);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف هذا الصنف؟')) return;
      await DB.equipment.remove(btn.dataset.id);
      render();
    };
  });
}

document.getElementById('addEqBtn').onclick = async () => {
  const name = document.getElementById('eqName').value.trim();
  const category = document.getElementById('eqCategory').value;
  const quantity = Number(document.getElementById('eqQty').value);
  const unitCost = Number(document.getElementById('eqUnitCost').value);
  const supplier = document.getElementById('eqSupplier').value.trim();
  const notes = document.getElementById('eqNotes').value.trim();
  if (!name || !quantity || !unitCost) return alert('يرجى إدخال الاسم والكمية والتكلفة');
  const totalCost = quantity * unitCost;
  await DB.equipment.add({ name, category, quantity, unitCost, totalCost, supplier, notes, date: FB.nowISO() });
  document.getElementById('eqName').value = '';
  document.getElementById('eqQty').value = '';
  document.getElementById('eqUnitCost').value = '';
  document.getElementById('eqSupplier').value = '';
  document.getElementById('eqNotes').value = '';
  render();
};

function csvEsc(val) {
  const s = String(val || '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

document.getElementById('exportEqBtn').onclick = () => {
  let csv = 'الصنف,الفئة,الكمية,تكلفة الوحدة,الإجمالي,المورد,ملاحظات,التاريخ\n';
  equipment.forEach(e => {
    csv += [csvEsc(e.name), csvEsc(e.category), csvEsc(e.quantity), csvEsc(e.unitCost), csvEsc(e.totalCost), csvEsc(e.supplier), csvEsc(e.notes), csvEsc(e.date)].join(',') + '\n';
  });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'laguna-equipment-' + eqMonth.value + '.csv';
  link.click();
};

eqMonth.addEventListener('change', render);
eqFilterCat.addEventListener('change', render);
renderEqCategories();
render();
