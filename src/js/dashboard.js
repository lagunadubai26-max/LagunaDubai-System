async function updateDashboard() {
  const invoices = await DB.invoices.all() || [];
  const paidInvoices = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const totalSales = paidInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const pendingTotal = invoices.filter(i => i.status !== 'paid' && i.status !== 'مدفوعة' && i.status !== 'returned' && i.status !== 'مرتجعة').reduce((s, i) => s + Number(i.total || 0), 0);
  const customers = (await DB.customers.all() || []).length;
  const totalOrders = invoices.reduce((s, i) => s + (i.items ? i.items.reduce((a, b) => a + Number(b.qty || 0), 0) : 0), 0);

  document.getElementById('totalSales').textContent = totalSales.toLocaleString() + ' جنيه';
  const salesStatus = document.getElementById('salesStatus');
  if (salesStatus) salesStatus.textContent = (pendingTotal > 0 ? pendingTotal.toLocaleString() + ' ج.م معلقة | ' : '') + 'مدفوعة';
  document.getElementById('totalInvoices').textContent = invoices.length;
  document.getElementById('totalCustomers').textContent = customers || '0';
  document.getElementById('totalOrders').textContent = totalOrders || '0';

  // Hide day close for Owner
  const user = JSON.parse(sessionStorage.getItem('laguna_user') || '{}');
  const dayCloseBtn = document.getElementById('dashDayCloseBtn');
  if (user.role === 'Owner') { dayCloseBtn.style.display = 'none'; }
  else { dayCloseBtn.style.display = 'flex'; }

  // Payment percentages
  const methods = { Cash: 0, Visa: 0, Wallet: 0 };
  invoices.forEach(i => { const m = i.paymentMethod || 'Cash'; if (methods[m] !== undefined) methods[m]++; });
  const total = Object.values(methods).reduce((a, b) => a + b, 0) || 1;
  document.getElementById('cashPercent').textContent = Math.round(methods.Cash / total * 100) + '%';
  document.getElementById('visaPercent').textContent = Math.round(methods.Visa / total * 100) + '%';
  document.getElementById('walletPercent').textContent = Math.round(methods.Wallet / total * 100) + '%';

  updateChart(paidInvoices);
  checkDashDayClose();
}

function updateChart(invoices) {
  const canvas = document.getElementById('salesChart');
  if (!canvas) return;
  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const weeklyData = new Array(7).fill(0);
  invoices.forEach(inv => {
    if (!inv.date) return;
    const d = new Date(inv.date);
    const dayIdx = (d.getDay() + 1) % 7;
    weeklyData[dayIdx] += Number(inv.total || 0);
  });
  if (typeof Chart !== 'undefined' && window.salesChart instanceof Chart) window.salesChart.destroy();
  window.salesChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{ label: 'المبيعات', data: weeklyData, borderColor: '#d97706', backgroundColor: 'rgba(217,119,6,0.12)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#d97706' }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}

// ── Day Close on Dashboard ──
function fmtMoney(v) { return v.toLocaleString() + ' ج.م'; }

function filterDate(items, start, end) {
  if (!items) return [];
  return items.filter(item => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d >= start && d <= end;
  });
}

async function checkDashDayClose() {
  const existing = await DB.daycloses.today();
  const btn = document.getElementById('dashDayCloseBtn');
  if (existing) {
    btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> تم إغلاق اليوم';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
  } else {
    btn.innerHTML = '<i class="fa-solid fa-moon"></i> إغلاق اليوم';
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  }
}

document.getElementById('dashDayCloseBtn').onclick = async () => {
  const existing = await DB.daycloses.today();
  if (existing) { alert('✅ تم إغلاق هذا اليوم بالفعل'); return; }
  showDashDayCloseModal();
};

async function showDashDayCloseModal() {
  const allInvoices = await DB.invoices.all() || [];
  const allExpenses = await DB.expenses.all() || [];
  const allReturns = await DB.returns.all() || [];

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const invoices = filterDate(allInvoices, todayStart, todayEnd);
  const expenses = filterDate(allExpenses, todayStart, todayEnd);
  const returns = filterDate(allReturns, todayStart, todayEnd);
  const paidInvoices = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');

  const totalSales = paidInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const cashAmount = paidInvoices.filter(i => i.paymentMethod === 'Cash' || i.paymentMethod === 'كاش').reduce((s, i) => s + Number(i.paid != null ? i.paid : (i.total || 0)), 0);
  const cardAmount = paidInvoices.filter(i => i.paymentMethod === 'Card' || i.paymentMethod === 'شبكة' || i.paymentMethod === 'فيزا').reduce((s, i) => s + Number(i.paid != null ? i.paid : (i.total || 0)), 0);
  const otherAmount = totalSales - cashAmount - cardAmount;
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalReturns = returns.filter(r => r.status === 'success').reduce((s, r) => s + Number(r.amount || 0), 0);
  const netProfit = totalSales - totalReturns - totalExpenses;
  const itemsSold = paidInvoices.reduce((s, i) => s + (i.items ? i.items.reduce((ss, it) => ss + Number(it.qty || 0), 0) : 0), 0);

  const todayStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('dashDcDate').textContent = todayStr;
  document.getElementById('dashDcSales').textContent = fmtMoney(totalSales);
  document.getElementById('dashDcInvoices').textContent = paidInvoices.length;
  document.getElementById('dashDcCash').textContent = fmtMoney(cashAmount);
  document.getElementById('dashDcCard').textContent = fmtMoney(cardAmount);
  document.getElementById('dashDcItemsSold').textContent = itemsSold;
  document.getElementById('dashDcExpenses').textContent = fmtMoney(totalExpenses);
  document.getElementById('dashDcReturns').textContent = fmtMoney(totalReturns);
  document.getElementById('dashDcNet').textContent = fmtMoney(netProfit);

  const confBtn = document.getElementById('dashConfirmDayClose');
  confBtn.dataset.cashAmount = cashAmount;
  confBtn.dataset.cardAmount = cardAmount;
  confBtn.dataset.totalSales = totalSales;
  confBtn.dataset.paidInvoices = paidInvoices.length;
  confBtn.dataset.itemsSold = itemsSold;
  confBtn.dataset.totalExpenses = totalExpenses;
  confBtn.dataset.totalReturns = totalReturns;
  confBtn.dataset.netProfit = netProfit;

  document.getElementById('dashDayCloseModal').classList.add('show');
}

document.getElementById('dashConfirmDayClose').onclick = async () => {
  const btn = document.getElementById('dashConfirmDayClose');
  const user = JSON.parse(sessionStorage.getItem('laguna_user') || '{}');
  const todayISO = new Date().toISOString().slice(0, 10);
  const data = {
    date: todayISO,
    totalSales: Number(btn.dataset.totalSales),
    numInvoices: Number(btn.dataset.paidInvoices),
    cashAmount: Number(btn.dataset.cashAmount),
    cardAmount: Number(btn.dataset.cardAmount),
    totalExpenses: Number(btn.dataset.totalExpenses),
    totalReturns: Number(btn.dataset.totalReturns),
    netProfit: Number(btn.dataset.netProfit),
    itemsSold: Number(btn.dataset.itemsSold),
    closedBy: user.name || 'الكاشير',
    closedAt: new Date().toISOString()
  };
  try {
    await DB.daycloses.close(data);
    DB.audit.log('day_close', { date: data.date, totalSales: data.totalSales, cashInDrawer: data.cashInDrawer });
    document.getElementById('dashDayCloseModal').classList.remove('show');
    checkDashDayClose();
    alert('✅ تم إغلاق اليوم بنجاح');
  } catch (e) {
    console.error('[dash-dayclose]', e);
    alert('❌ حدث خطأ أثناء إغلاق اليوم');
  }
};

function closeDashDayClose() { document.getElementById('dashDayCloseModal').classList.remove('show'); }
document.getElementById('dashCloseDayClose').onclick = closeDashDayClose;
document.getElementById('dashCancelDayClose').onclick = closeDashDayClose;
window.addEventListener('click', e => { if (e.target === document.getElementById('dashDayCloseModal')) closeDashDayClose(); });

updateDashboard();
