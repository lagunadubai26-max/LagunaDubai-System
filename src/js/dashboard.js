async function updateDashboard() {
  const invoices = await DB.invoices.all() || [];
  const totalSales = invoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const customers = (await DB.customers.all() || []).length;
  const totalOrders = invoices.reduce((s, i) => s + (i.items ? i.items.reduce((a, b) => a + Number(b.qty || 0), 0) : 0), 0);

  document.getElementById('totalSales').textContent = totalSales.toLocaleString() + ' جنيه';
  document.getElementById('salesStatus').textContent = 'إجمالي';
  document.getElementById('totalInvoices').textContent = invoices.length;
  document.getElementById('totalCustomers').textContent = customers || '0';
  document.getElementById('totalOrders').textContent = totalOrders || '0';

  // Payment percentages
  const methods = { Cash: 0, Visa: 0, Wallet: 0 };
  invoices.forEach(i => { const m = i.paymentMethod || 'Cash'; if (methods[m] !== undefined) methods[m]++; });
  const total = Object.values(methods).reduce((a, b) => a + b, 0) || 1;
  document.getElementById('cashPercent').textContent = Math.round(methods.Cash / total * 100) + '%';
  document.getElementById('visaPercent').textContent = Math.round(methods.Visa / total * 100) + '%';
  document.getElementById('walletPercent').textContent = Math.round(methods.Wallet / total * 100) + '%';

  updateChart(invoices);
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
  if (window.salesChart instanceof Chart) window.salesChart.destroy();
  window.salesChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{ label: 'المبيعات', data: weeklyData, borderColor: '#d97706', backgroundColor: 'rgba(217,119,6,0.12)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#d97706' }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}

updateDashboard();
