const _ownerUser = (() => {
  try { return JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { return null; }
})();
if (!_ownerUser || _ownerUser.role !== 'Owner') window.location.href = 'auth.html';

function logout() {
  sessionStorage.removeItem('laguna_user');
  sessionStorage.removeItem('laguna_token');
  ['laguna_session_start','laguna_last_active','laguna_inv_count'].forEach(k => sessionStorage.removeItem(k));
  window.location.href = 'auth.html';
}

let g = { invoices: [], expenses: [], returns: [], employees: [], customers: [], attendance: [], products: [] };
let charts = {};

function fmt(v) { return Number(v || 0).toLocaleString() + ' ج.م'; }
function monthVal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }

function getMonthRange(value) {
  const [year, month] = (value || monthVal(new Date())).split('-').map(Number);
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0, 23, 59, 59, 999), year, month };
}

function filterByDate(items, range) {
  if (!range || !range.start) return items || [];
  return (items || []).filter(item => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d >= range.start && d <= range.end;
  });
}

function destroyCharts(keys) {
  (keys || Object.keys(charts)).forEach(k => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });
}

async function loadAll() {
  [g.invoices, g.expenses, g.returns, g.employees, g.customers, g.attendance, g.products] = await Promise.all([
    (await DB.invoices.all()) || [],
    (await DB.expenses.all()) || [],
    (await DB.returns.all()) || [],
    (await DB.employees.all()) || [],
    (await DB.customers.all()) || [],
    (await DB.attendance.all()) || [],
    (await DB.products.all()) || []
  ]);
}

// ================================================================
// DASHBOARD
// ================================================================
function renderDashboard() {
  const range = getMonthRange();
  const paid = g.invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const monthPaid = filterByDate(paid, range);
  const monthExpenses = filterByDate(g.expenses, range);
  const monthReturns = filterByDate(g.returns.filter(r => r.status === 'success'), range);
  const pending = g.invoices.filter(i => i.status !== 'paid' && i.status !== 'مدفوعة' && i.status !== 'returned' && i.status !== 'مرتجعة');

  const totalSales = monthPaid.reduce((s, i) => s + Number(i.total || 0), 0);
  const vipSales = monthPaid.filter(i => i.customer && i.customer !== 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);
  const regularSales = monthPaid.filter(i => !i.customer || i.customer === 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);
  const totalExpenses = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalReturns = monthReturns.reduce((s, r) => s + Number(r.amount || 0), 0);
  const netProfit = totalSales - totalReturns - totalExpenses;
  const pendingTotal = pending.reduce((s, i) => s + Number(i.total || 0), 0);

  const prevDate = new Date(); prevDate.setMonth(prevDate.getMonth() - 1);
  const prevRange = getMonthRange(monthVal(prevDate));
  const prevPaid = filterByDate(paid, prevRange);
  const prevSales = prevPaid.reduce((s, i) => s + Number(i.total || 0), 0);
  const prevExpenses = filterByDate(g.expenses, prevRange).reduce((s, e) => s + Number(e.amount || 0), 0);
  const prevReturns = filterByDate(g.returns.filter(r => r.status === 'success'), prevRange).reduce((s, r) => s + Number(r.amount || 0), 0);
  const prevProfit = prevSales - prevReturns - prevExpenses;

  document.getElementById('dashMonthlySales').textContent = fmt(totalSales);
  document.getElementById('dashVIPSales').textContent = fmt(vipSales);
  document.getElementById('dashVIPPercent').textContent = totalSales > 0 ? Math.round(vipSales / totalSales * 100) + '% من الإجمالي' : '—';
  document.getElementById('dashRegularSales').textContent = fmt(regularSales);
  document.getElementById('dashRegularPercent').textContent = totalSales > 0 ? Math.round(regularSales / totalSales * 100) + '% من الإجمالي' : '—';
  document.getElementById('dashExpenses').textContent = fmt(totalExpenses);
  document.getElementById('dashNetProfit').textContent = fmt(netProfit);
  document.getElementById('dashPending').textContent = pending.length;
  document.getElementById('dashPendingValue').textContent = fmt(pendingTotal);

  const sc = prevSales > 0 ? Math.round((totalSales - prevSales) / prevSales * 100) : 0;
  const scEl = document.getElementById('dashMonthlySalesChange');
  scEl.textContent = sc >= 0 ? '▲ +' + sc + '% عن الشهر الماضي' : '▼ ' + sc + '% عن الشهر الماضي';
  scEl.style.color = sc >= 0 ? 'var(--success)' : 'var(--danger)';

  const pc = prevProfit > 0 ? Math.round((netProfit - prevProfit) / prevProfit * 100) : 0;
  const pcEl = document.getElementById('dashProfitChange');
  pcEl.textContent = pc >= 0 ? '▲ +' + pc + '%' : '▼ ' + pc + '%';
  pcEl.style.color = pc >= 0 ? 'var(--success)' : 'var(--danger)';

  drawAnomalies(monthPaid, monthExpenses, range);
  drawDailyChart('dashDailyChart', monthPaid, range);
  drawSplitChart('dashSplitChart', vipSales, regularSales);
}

function drawAnomalies(monthPaid, monthExpenses, range) {
  const container = document.getElementById('dashAnomalies');
  container.innerHTML = '';
  const dailySales = {}, dailyExp = {};
  let cursor = new Date(range.start);
  while (cursor <= range.end) {
    const k = cursor.toISOString().slice(0, 10);
    dailySales[k] = 0; dailyExp[k] = 0;
    cursor.setDate(cursor.getDate() + 1);
  }
  monthPaid.forEach(i => { if (i.date) { const k = i.date.slice(0, 10); if (dailySales[k] !== undefined) dailySales[k] += Number(i.total || 0); } });
  monthExpenses.forEach(e => { if (e.date) { const k = e.date.slice(0, 10); if (dailyExp[k] !== undefined) dailyExp[k] += Number(e.amount || 0); } });
  const sv = Object.values(dailySales).filter(v => v > 0);
  const ev = Object.values(dailyExp).filter(v => v > 0);
  const avgSales = sv.length > 0 ? sv.reduce((a, b) => a + b, 0) / sv.length : 0;
  const avgExp = ev.length > 0 ? ev.reduce((a, b) => a + b, 0) / ev.length : 0;

  const alerts = [];
  Object.keys(dailySales).forEach(day => {
    const s = dailySales[day], e = dailyExp[day] || 0;
    if (avgSales > 0 && s > 0 && s < avgSales * 0.5) alerts.push({ icon: '📉', text: day + ': المبيعات ' + fmt(s) + ' (أقل من 50% من المتوسط ' + fmt(Math.round(avgSales)) + ')' });
    if (avgExp > 0 && e > avgExp * 2) alerts.push({ icon: '⚠️', text: day + ': مصروفات ' + fmt(e) + ' (أكثر من ضعف المتوسط ' + fmt(Math.round(avgExp)) + ')' });
  });
  if (alerts.length === 0) return;
  container.innerHTML = '<div class="alert-box"><h4><i class="fa-solid fa-triangle-exclamation"></i> تنبيهات</h4>' + alerts.map(a => '<div class="alert-item"><span>' + a.icon + '</span><span>' + a.text + '</span></div>').join('') + '</div>';
}

function drawDailyChart(id, invoices, range) {
  destroyCharts([id]);
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const buckets = {}, order = [];
  invoices.forEach(i => {
    if (!i.date) return;
    const d = new Date(i.date), label = d.getDate().toString();
    if (!buckets[label]) { buckets[label] = 0; order.push({ ts: d.getTime(), label }); }
    buckets[label] += Number(i.total || 0);
  });
  order.sort((a, b) => a.ts - b.ts);
  const labels = order.map(o => o.label);
  const data = labels.map(l => buckets[l]);
  charts[id] = new Chart(canvas, {
    type: 'bar', data: { labels, datasets: [{ label: 'المبيعات', data, backgroundColor: '#f59e0b', borderRadius: 6 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() } } } }
  });
}

function drawSplitChart(id, vip, regular) {
  destroyCharts([id]);
  const canvas = document.getElementById(id);
  if (!canvas || vip + regular === 0) return;
  charts[id] = new Chart(canvas, {
    type: 'doughnut', data: { labels: ['عملاء مميزون (VIP)', 'نقدي / عادي'], datasets: [{ data: [vip, regular], backgroundColor: ['#3b82f6', '#a8a29e'] }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#a8a29e' } } } }
  });
}

// ================================================================
// CUSTOMERS
// ================================================================
function renderCustomers() {
  const val = (document.getElementById('custSearch').value || '').toLowerCase();
  const sort = document.getElementById('custSort').value;

  let list = g.customers.filter(c => c.name.toLowerCase().includes(val));
  if (sort === 'spent') list.sort((a, b) => Number(b.totalSpent || 0) - Number(a.totalSpent || 0));
  else if (sort === 'visits') list.sort((a, b) => Number(b.visits || 0) - Number(a.visits || 0));
  else list.sort((a, b) => a.name.localeCompare(b.name));

  const range = getMonthRange();
  const monthPaid = filterByDate(g.invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة'), range);
  const totalSpent = list.reduce((s, c) => s + Number(c.totalSpent || 0), 0);
  const monthSpent = monthPaid.filter(i => i.customer && i.customer !== 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);

  document.getElementById('custTotal').textContent = list.length;
  document.getElementById('custTotalSpent').textContent = fmt(totalSpent);
  document.getElementById('custMonthSpent').textContent = fmt(monthSpent);

  const tbody = document.getElementById('custTableBody');
  tbody.innerHTML = '';
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-secondary)">لا يوجد عملاء مميزون</td></tr>'; return; }

  list.forEach(c => {
    const custMonth = monthPaid.filter(i => i.customer === c.name).reduce((s, i) => s + Number(i.total || 0), 0);
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `<td><strong>${escapeHtml(c.name)}</strong></td>
      <td style="color:var(--text-secondary)">${escapeHtml(c.phone || '—')}</td>
      <td style="color:var(--accent);font-weight:600">${fmt(c.totalSpent || 0)}</td>
      <td>${fmt(custMonth)}</td>
      <td>${c.visits || 0}</td>
      <td style="color:var(--text-secondary);font-size:12px">${c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('ar-EG') : '—'}</td>
      <td><button class="btn btn-sm btn-outline" onclick="showCustDetail('${escapeHtml(c.id)}')"><i class="fa-solid fa-eye"></i></button></td>`;
    tbody.appendChild(tr);
  });
}

function showCustDetail(id) {
  const c = g.customers.find(x => x.id === id);
  if (!c) return;
  const range = getMonthRange();
  const custInvoices = g.invoices.filter(i => i.customer === c.name && i.status !== 'returned' && i.status !== 'مرتجعة');
  const monthInvoices = filterByDate(custInvoices, range);
  const monthTotal = monthInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const avg = monthInvoices.length > 0 ? Math.round(monthTotal / monthInvoices.length) : 0;

  document.getElementById('custModalName').textContent = escapeHtml(c.name);
  document.getElementById('custMDTotal').textContent = fmt(c.totalSpent || 0);
  document.getElementById('custMDMonth').textContent = fmt(monthTotal);
  document.getElementById('custMDVisits').textContent = monthInvoices.length || '0';
  document.getElementById('custMDAvg').textContent = fmt(avg);

  const tbody = document.getElementById('custMDInvoices');
  tbody.innerHTML = '';
  if (monthInvoices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-secondary)">لا توجد فواتير لهذا الشهر</td></tr>';
  } else {
    monthInvoices.forEach(inv => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="font-family:monospace;font-size:12px">${escapeHtml(inv.id)}</td>
        <td style="color:var(--text-secondary);font-size:12px">${new Date(inv.date).toLocaleDateString('ar-EG')}</td>
        <td>${escapeHtml(inv.paymentMethod || 'كاش')}</td>
        <td style="color:var(--accent);font-weight:600">${fmt(inv.total || 0)}</td>
        <td>${fmt(inv.paid != null ? inv.paid : inv.total)}</td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById('custModal').classList.add('show');
}

function closeCustModal() { document.getElementById('custModal').classList.remove('show'); }

// ================================================================
// EMPLOYEES & SALARIES
// ================================================================
function renderEmployees() {
  const active = g.employees.filter(e => e.status === 'active');
  document.getElementById('empTotal').textContent = active.length;
  document.getElementById('empTotalSalary').textContent = fmt(active.reduce((s, e) => s + Number(e.salary || 0), 0));

  const tbody = document.getElementById('empTableBody');
  tbody.innerHTML = '';
  if (g.employees.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-secondary)">لا يوجد موظفون</td></tr>'; return; }

  g.employees.forEach(e => {
    const stCls = e.status === 'active' ? 'success' : e.status === 'vacation' ? 'warning' : 'danger';
    const stTxt = e.status === 'active' ? 'يعمل' : e.status === 'vacation' ? 'إجازة' : 'موقوف';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${escapeHtml(e.name)}</strong></td>
      <td style="color:var(--text-secondary)">${escapeHtml(e.job || '—')}</td>
      <td style="color:var(--text-secondary);font-size:12px">${escapeHtml(e.phone || '—')}</td>
      <td style="color:var(--text-secondary);font-size:12px">${e.hireDate || '—'}</td>
      <td><input class="editable-salary" type="number" value="${Number(e.salary || 0)}" data-id="${escapeHtml(e.id)}" onchange="updateSalary(this)"></td>
      <td><span class="badge ${stCls}">${stTxt}</span></td>
      <td><button class="btn-icon ${e.status === 'active' ? 'danger' : ''}" onclick="${e.status === 'active' ? `fireEmp('${escapeHtml(e.id)}','${escapeHtml(e.name)}')` : `reactivateEmp('${escapeHtml(e.id)}','${escapeHtml(e.name)}')`}" title="${e.status === 'active' ? 'إنهاء' : 'إعادة تفعيل'}"><i class="fa-solid ${e.status === 'active' ? 'fa-user-xmark' : 'fa-user-check'}"></i></button></td>`;
    tbody.appendChild(tr);
  });
}

async function updateSalary(input) {
  const id = input.dataset.id;
  const val = Number(input.value);
  if (!id || val < 0) return;
  try {
    await DB.employees.update(id, { salary: val });
    renderEmployees();
  } catch (e) { console.warn('[salary]', e); alert('حدث خطأ في حفظ الراتب'); }
}

async function fireEmp(id, name) {
  if (!confirm('هل أنت متأكد من إنهاء ' + name + '؟')) return;
  try {
    await DB.employees.update(id, { status: 'stopped' });
    await loadAll();
    renderEmployees();
    renderAttendance();
  } catch (e) { console.warn('[fire]', e); alert('حدث خطأ'); }
}

async function reactivateEmp(id, name) {
  if (!confirm('إعادة تفعيل ' + name + '؟')) return;
  try {
    await DB.employees.update(id, { status: 'active' });
    await loadAll();
    renderEmployees();
    renderAttendance();
  } catch (e) { console.warn('[reactivate]', e); alert('حدث خطأ'); }
}

function showAddEmpModal() { document.getElementById('addEmpModal').classList.add('show'); }
function closeAddEmpModal() { document.getElementById('addEmpModal').classList.remove('show'); }

async function saveNewEmp() {
  const name = document.getElementById('empFormName').value.trim();
  const job = document.getElementById('empFormJob').value.trim();
  const phone = document.getElementById('empFormPhone').value.trim();
  const salary = Number(document.getElementById('empFormSalary').value) || 0;
  const hireDate = document.getElementById('empFormHireDate').value || new Date().toISOString().slice(0, 10);
  const pin = document.getElementById('empFormPin').value.trim();
  if (!name || !job) return alert('الاسم والوظيفة مطلوبان');
  try {
    const emp = { name, job, phone, salary, hireDate, status: 'active', pin: pin || '1234' };
    emp.id = crypto.randomUUID().slice(0, 8);
    await DB.employees.add(emp);
    closeAddEmpModal();
    document.getElementById('empFormName').value = '';
    document.getElementById('empFormJob').value = '';
    document.getElementById('empFormPhone').value = '';
    document.getElementById('empFormSalary').value = '';
    document.getElementById('empFormHireDate').value = '';
    document.getElementById('empFormPin').value = '';
    await loadAll();
    renderEmployees();
  } catch (e) { console.warn('[add-emp]', e); alert('حدث خطأ في إضافة الموظف'); }
}

// ================================================================
// ATTENDANCE
// ================================================================
function renderAttendance() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayAttendance = g.attendance.filter(a => a.date && a.date.slice(0, 10) === todayKey);
  const present = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const activeCount = g.employees.filter(e => e.status === 'active').length;
  document.getElementById('empTodayPresent').textContent = present;
  document.getElementById('empTodayTotal').textContent = activeCount;

  const tbody = document.getElementById('attendanceTodayBody');
  tbody.innerHTML = '';
  if (activeCount === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-secondary)">لا يوجد موظفون نشطاء</td></tr>'; return; }

  g.employees.filter(e => e.status === 'active').forEach(emp => {
    const rec = todayAttendance.find(a => a.employeeId === emp.id);
    const stCls = rec ? (rec.status === 'present' ? 'success' : rec.status === 'late' ? 'warning' : 'danger') : 'neutral';
    const stTxt = rec ? (rec.status === 'present' ? 'حاضر' : rec.status === 'late' ? 'متأخر' : 'غائب') : 'لم يسجل';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${escapeHtml(emp.name)}</strong></td>
      <td><span class="badge ${stCls}">${stTxt}</span></td>
      <td style="color:var(--text-secondary);font-size:12px">${rec && rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
      <td style="color:var(--text-secondary);font-size:12px">${rec && rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>`;
    tbody.appendChild(tr);
  });
}

// ================================================================
// REPORTS
// ================================================================
function renderReports() {
  const monthInput = document.getElementById('reportMonth');
  monthInput.value = monthVal(new Date());
  monthInput.addEventListener('change', () => { destroyCharts(['repDailyChart','repPaymentChart']); loadReport(); });
  loadReport();
}

async function loadReport() {
  const range = getMonthRange(document.getElementById('reportMonth').value);
  const prevDate = new Date(range.year, range.month - 2, 1);
  const prevRange = getMonthRange(monthVal(prevDate));

  const paid = g.invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const monthPaid = filterByDate(paid, range);
  const prevPaid = filterByDate(paid, prevRange);
  const monthExpenses = filterByDate(g.expenses, range);
  const prevMonthExpenses = filterByDate(g.expenses, prevRange);
  const monthReturns = filterByDate(g.returns.filter(r => r.status === 'success'), range);
  const prevMonthReturns = filterByDate(g.returns.filter(r => r.status === 'success'), prevRange);

  const sales = monthPaid.reduce((s, i) => s + Number(i.total || 0), 0);
  const prevSales = prevPaid.reduce((s, i) => s + Number(i.total || 0), 0);
  const vip = monthPaid.filter(i => i.customer && i.customer !== 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);
  const prevVip = prevPaid.filter(i => i.customer && i.customer !== 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);
  const regular = monthPaid.filter(i => !i.customer || i.customer === 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);
  const prevRegular = prevPaid.filter(i => !i.customer || i.customer === 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);
  const expenses = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const prevExpenses = prevMonthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const returnsTotal = monthReturns.reduce((s, r) => s + Number(r.amount || 0), 0);
  const prevReturnsTotal = prevMonthReturns.reduce((s, r) => s + Number(r.amount || 0), 0);
  const profit = sales - returnsTotal - expenses;
  const prevProfit = prevSales - prevReturnsTotal - prevExpenses;
  const numPaid = monthPaid.length;
  const avgInvoice = numPaid > 0 ? Math.round(sales / numPaid) : 0;

  function setStat(id, val, prevVal) {
    document.getElementById(id).textContent = fmt(val);
    const el = document.getElementById(id + 'Change');
    if (!el) return;
    if (prevVal === 0) { el.textContent = ''; return; }
    const p = Math.round((val - prevVal) / prevVal * 100);
    el.textContent = p >= 0 ? '▲ +' + p + '%' : '▼ ' + Math.abs(p) + '%';
    el.style.color = p >= 0 ? 'var(--success)' : 'var(--danger)';
  }

  setStat('repSales', sales, prevSales);
  setStat('repVIP', vip, prevVip);
  setStat('repRegular', regular, prevRegular);
  setStat('repExpenses', expenses, prevExpenses);
  setStat('repProfit', profit, prevProfit);
  document.getElementById('repInvoices').textContent = numPaid;
  document.getElementById('repAvg').textContent = fmt(avgInvoice);

  drawDailyChart('repDailyChart', monthPaid, range);
  drawPaymentChart('repPaymentChart', monthPaid);
}

function drawPaymentChart(id, invoices) {
  destroyCharts([id]);
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const map = {};
  invoices.forEach(i => { const m = i.paymentMethod || 'Cash'; map[m] = (map[m] || 0) + Number(i.total || 0); });
  const labels = Object.keys(map);
  const data = Object.values(map);
  if (labels.length === 0) return;
  charts[id] = new Chart(canvas, {
    type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: ['#f59e0b','#059669','#3b82f6','#8b5cf6'].slice(0, labels.length) }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#a8a29e' } } } }
  });
}

function exportReport() {
  const range = getMonthRange(document.getElementById('reportMonth').value);
  const paid = g.invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const monthPaid = filterByDate(paid, range);
  function esc(v) { const s = String(v || ''); return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s; }
  let csv = 'رقم الفاتورة,العميل,التاريخ,طريقة الدفع,الإجمالي,المدفوع,الحالة\n';
  monthPaid.forEach(i => { csv += [esc(i.id), esc(i.customer), esc(i.date), esc(i.paymentMethod), esc(i.total), esc(i.paid != null ? i.paid : i.total), esc(i.status)].join(',') + '\n'; });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'laguna-report-' + range.year + '-' + String(range.month).padStart(2, '0') + '.csv';
  link.click();
}

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('ownerName').textContent = _ownerUser.name;
  document.getElementById('ownerAvatar').textContent = _ownerUser.name.charAt(0);

  document.querySelectorAll('.tab-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const section = document.getElementById('tab-' + btn.dataset.tab);
      if (section) section.classList.add('active');
    });
  });

  document.getElementById('custSearch').addEventListener('keyup', renderCustomers);
  document.getElementById('custSort').addEventListener('change', renderCustomers);

  await loadAll();
  renderDashboard();
  renderCustomers();
  renderEmployees();
  renderAttendance();
  renderReports();

  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
  });
});
