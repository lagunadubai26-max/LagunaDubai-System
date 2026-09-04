let incomes = [];
let allIncomes = [];
const incList = document.getElementById('incList');
const incMonth = document.getElementById('incMonth');
const incDate = document.getElementById('incDate');

const _incMonthNow = () => { const d = FB.clockNow(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };

incMonth.value = _incMonthNow();
incDate.value = localDateKey(FB.clockNow());

function getMonthRange(value) {
  if (!value) { value = _incMonthNow(); }
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

async function render() {
  allIncomes = await DB.incomes.all() || [];
  const range = getMonthRange(incMonth.value);
  incomes = filterByDate(allIncomes, range);

  incList.innerHTML = '';
  const total = incomes.reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthTotal = allIncomes.reduce((s, e) => s + Number(e.amount || 0), 0);

  document.getElementById('incTotal').textContent = total.toLocaleString() + ' ج.م';
  document.getElementById('incToday').textContent = incomes.length;
  document.getElementById('incCount').textContent = monthTotal.toLocaleString() + ' ج.م';

  incomes.forEach(e => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.style.gridTemplateColumns = '2fr 1fr 1.2fr 1fr';
    row.innerHTML = `
      <span>${escapeHtml(e.description)}</span>
      <span style="color:var(--success);font-weight:700">+${Number(e.amount).toLocaleString()} ج.م</span>
      <span>${new Date(e.date).toLocaleDateString('ar-EG')}</span>
      <div class="actions"><button class="delete-btn" data-id="${e.id}"><i class="fa-solid fa-trash"></i></button></div>`;
    incList.appendChild(row);
  });

  document.querySelectorAll('#incList .delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف هذا الإيراد؟')) return;
      await DB.incomes.remove(btn.dataset.id);
      render();
    };
  });
}

function csvEsc(val) {
  const s = String(val || '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

document.getElementById('exportIncBtn').onclick = () => {
  let csv = 'الوصف,المبلغ,التاريخ\n';
  incomes.forEach(e => {
    csv += [csvEsc(e.description), csvEsc(e.amount), csvEsc(e.date)].join(',') + '\n';
  });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'laguna-incomes-' + incMonth.value + '.csv';
  link.click();
};

document.getElementById('addIncBtn').onclick = async () => {
    const description = document.getElementById('incDesc').value.trim();
    const amount = Number(document.getElementById('incAmount').value);
    const dateVal = incDate.value;
    if (!description || !amount) return alert('يرجى إدخال الوصف والمبلغ');
    const d = dateVal ? new Date(dateVal + 'T12:00:00') : FB.clockNow();
    await DB.incomes.add({ description, amount, date: localISO(d) });
    document.getElementById('incDesc').value = '';
    document.getElementById('incAmount').value = '';
    render();
  };

incMonth.addEventListener('change', render);
render();
