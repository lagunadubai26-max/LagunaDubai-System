async function updateDashboard() {
  const invoices = await DB.invoices.all() || [];
  const totalSales = invoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const customers = (await DB.customers.all() || []).length;
  const totalOrders = invoices.reduce((s, i) => s + (i.items ? i.items.reduce((a, b) => a + Number(b.qty || 0), 0) : 0), 0);

  const cards = document.querySelectorAll('.card');
  if (cards.length >= 4) {
    cards[0].querySelector('h2').textContent = totalSales.toLocaleString() + ' جنيه';
    cards[0].querySelector('small').textContent = 'إجمالي';
    cards[1].querySelector('h2').textContent = invoices.length;
    cards[1].querySelector('small').textContent = 'فاتورة';
    cards[2].querySelector('h2').textContent = customers || '0';
    cards[2].querySelector('small').textContent = 'عميل';
    cards[3].querySelector('h2').textContent = totalOrders || '0';
    cards[3].querySelector('small').textContent = 'طلب';
  }

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
      datasets: [{ label: 'المبيعات', data: weeklyData, borderColor: '#12B5C8', backgroundColor: 'rgba(18,181,200,0.15)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#12B5C8' }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}

updateDashboard();
