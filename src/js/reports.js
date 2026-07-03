const periodSelect = document.getElementById('reportPeriod');

async function getFilteredInvoices() {
  const all = await DB.invoices.all() || [];
  const period = periodSelect.value;
  const now = new Date();
  return all.filter(inv => {
    if (!inv.date) return false;
    const d = new Date(inv.date);
    if (period === 'week') { const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); return d >= weekAgo; }
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  });
}

async function render() {
  const invoices = await getFilteredInvoices();
  const expenses = await DB.expenses.all() || [];
  const returns = await DB.returns.all() || [];

  const totalSales = invoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const totalReturns = returns.filter(r => r.status === 'success').reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = totalSales - totalReturns - totalExpenses;

  document.getElementById('reportSales').textContent = totalSales.toLocaleString() + ' ج.م';
  document.getElementById('reportInvoices').textContent = invoices.length;
  document.getElementById('reportReturns').textContent = totalReturns.toLocaleString() + ' ج.م';
  document.getElementById('reportExpenses').textContent = totalExpenses.toLocaleString() + ' ج.م';
  document.getElementById('reportNetProfit').textContent = netProfit.toLocaleString() + ' ج.م';
  const specialInvoices = invoices.filter(i => i.customer && i.customer !== 'نقدي');
  const specialTotal = specialInvoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  document.getElementById('reportSpecialCustomers').textContent = specialTotal.toLocaleString() + ' ج.م';

  drawSalesChart(invoices);
  drawPaymentChart(invoices);
  renderTopProducts(invoices);
}

function drawSalesChart(invoices) {
  const canvas = document.getElementById('reportSalesChart');
  if (!canvas) return;
  if (window.reportSalesChart) window.reportSalesChart.destroy();
  const days = {};
  invoices.forEach(inv => {
    if (!inv.date) return;
    const d = new Date(inv.date).toLocaleDateString('ar-EG');
    days[d] = (days[d] || 0) + Number(inv.total || 0);
  });
  const labels = Object.keys(days).sort();
  const data = labels.map(k => days[k]);
  window.reportSalesChart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'المبيعات', data, backgroundColor: '#d97706', borderRadius: 8 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}

function drawPaymentChart(invoices) {
  const canvas = document.getElementById('reportPaymentChart');
  if (!canvas) return;
  if (window.reportPaymentChart) window.reportPaymentChart.destroy();
  const paymentMap = {};
  invoices.forEach(inv => {
    const method = inv.paymentMethod || 'Cash';
    paymentMap[method] = (paymentMap[method] || 0) + Number(inv.total || 0);
  });
  const labels = Object.keys(paymentMap);
  const data = Object.values(paymentMap);
  window.reportPaymentChart = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: ['#d97706', '#059669', '#f59e0b', '#dc2626', '#7c3aed'].slice(0, labels.length) }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

function renderTopProducts(invoices) {
  const container = document.getElementById('topProducts');
  const productMap = {};
  invoices.forEach(inv => {
    if (inv.items) inv.items.forEach(item => { productMap[item.name] = (productMap[item.name] || 0) + Number(item.qty || 0); });
  });
  const sorted = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sorted.length === 0) { container.innerHTML = '<p class="empty">لا توجد بيانات كافية</p>'; return; }
  let html = '<div class="table-header"><span>المنتج</span><span>الكمية</span></div>';
  sorted.forEach(([name, qty]) => { html += `<div class="table-row"><span>${name}</span><span>${qty}</span></div>`; });
  container.innerHTML = html;
}

periodSelect.addEventListener('change', render);

document.getElementById('exportBtn').onclick = async () => {
  const invoices = await DB.invoices.all() || [];
  let csv = 'رقم الفاتورة,العميل,التاريخ,الإجمالي,الحالة\n';
  invoices.forEach(i => { csv += `${i.id},${i.customer},${i.date},${i.total},${i.status}\n`; });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'laguna-report.csv';
  link.click();
};

render();
