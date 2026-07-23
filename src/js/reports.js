const periodSelect = document.getElementById('reportPeriod');

function getPeriodRange(period) {
  const now = new Date();
  if (period === 'day') {
    const s = new Date(now); s.setHours(0, 0, 0, 0);
    return { start: s, end: now };
  }
  if (period === 'week') {
    const s = new Date(now); s.setDate(now.getDate() - 7); s.setHours(0, 0, 0, 0);
    return { start: s, end: now };
  }
  if (period === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: s, end: now };
  }
  if (period === 'year') {
    const s = new Date(now.getFullYear(), 0, 1);
    return { start: s, end: now };
  }
  return { start: null, end: null };
}

function getPrevPeriodRange(period) {
  const { start, end } = getPeriodRange(period);
  if (!start) return { start: null, end: null };
  const diff = end - start;
  return { start: new Date(start.getTime() - diff), end: new Date(start.getTime() - 1) };
}

function filterByDate(items, range) {
  if (!range.start) return items;
  return items.filter(item => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d >= range.start && d <= range.end;
  });
}

function calcStats(invoices, expenses, returns) {
  const paidInvoices = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'مدفوعة' && i.status !== 'returned' && i.status !== 'مرتجعة');
  const totalSales = paidInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const totalPending = pendingInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
  const totalReturns = returns.filter(r => r.status === 'success').reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const collectedCash = paidInvoices.filter(i => i.paymentMethod === 'Cash' || i.paymentMethod === 'كاش').reduce((s, i) => s + Number(i.paid != null ? i.paid : (i.total || 0)), 0);
  const netProfit = totalSales - totalReturns - totalExpenses;
  const numPaid = paidInvoices.length;
  const avgInvoice = numPaid > 0 ? Math.round(totalSales / numPaid) : 0;
  const specialTotal = invoices.filter(i => i.customer && i.customer !== 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0);
  return { totalSales, totalPending, totalReturns, totalExpenses, netProfit, collectedCash, avgInvoice, specialTotal, numPaid, numInvoices: invoices.length };
}

function fmtMoney(v) { return v.toLocaleString() + ' ج.م'; }

function pctChange(current, previous) {
  if (!previous || previous === 0) return { pct: 0, direction: 'neutral' };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(pct), direction: pct >= 0 ? 'positive' : 'negative' };
}

function renderChangeBadge(container, current, previous) {
  if (!container) return;
  if (previous === undefined || previous === null) { container.innerHTML = ''; return; }
  const change = pctChange(current, previous);
  if (change.direction === 'neutral' || change.pct === 0) { container.innerHTML = '<span class="change-badge" style="background:#f5f5f4;color:#888">—</span>'; return; }
  container.innerHTML = '<span class="change-badge ' + change.direction + '">' + (change.direction === 'positive' ? '▲' : '▼') + ' ' + change.pct + '%</span>';
}

let charts = {};

function destroyChart(key) {
  if (charts[key]) { charts[key].destroy(); delete charts[key]; }
}

function destroyAllCharts() {
  Object.keys(charts).forEach(destroyChart);
}

let rendering = false;

async function render() {
  if (rendering) return;
  rendering = true;
  try {
    const period = periodSelect.value;
    const range = getPeriodRange(period);
    const prevRange = getPrevPeriodRange(period);

    const allInvoices = await DB.invoices.all() || [];
    const allExpenses = await DB.expenses.all() || [];
    const allReturns = await DB.returns.all() || [];
    const products = await DB.products.all() || [];

    const invoices = filterByDate(allInvoices, range);
    const prevInvoices = filterByDate(allInvoices, prevRange);
    const expenses = filterByDate(allExpenses, range);
    const returns = filterByDate(allReturns, range);

    const stats = calcStats(invoices, expenses, returns);
    const prevStats = calcStats(prevInvoices, [], []);

    document.getElementById('reportSales').textContent = fmtMoney(stats.totalSales);
    document.getElementById('reportInvoices').textContent = stats.numInvoices;
    document.getElementById('reportAvgInvoice').textContent = fmtMoney(stats.avgInvoice);
    document.getElementById('reportReturns').textContent = fmtMoney(stats.totalReturns);
    document.getElementById('reportExpenses').textContent = fmtMoney(stats.totalExpenses);
    document.getElementById('reportNetProfit').textContent = fmtMoney(stats.netProfit);
    document.getElementById('reportPending').textContent = fmtMoney(stats.totalPending);
    document.getElementById('reportCashDrawer').textContent = fmtMoney(stats.collectedCash);

    renderChangeBadge(document.getElementById('reportSalesChange'), stats.totalSales, prevStats.totalSales);
    renderChangeBadge(document.getElementById('reportInvoicesChange'), stats.numInvoices, prevStats.numInvoices);
    renderChangeBadge(document.getElementById('reportProfitChange'), stats.netProfit, prevStats.netProfit);

    const paidInvoices = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');

    drawSalesChart(paidInvoices, period);
    drawPaymentChart(paidInvoices);
    drawCategoryChart(paidInvoices, products);
    drawHourlyChart(paidInvoices);
    drawDayChart(paidInvoices);
    drawTopProducts(paidInvoices);
  } catch (e) {
    console.error('[reports]', e);
  }
  rendering = false;
}

function drawSalesChart(invoices, period) {
  destroyChart('sales');
  const canvas = document.getElementById('reportSalesChart');
  if (!canvas) return;
  const buckets = {};
  const order = [];
  invoices.forEach(inv => {
    if (!inv.date) return;
    const d = new Date(inv.date);
    let label;
    if (period === 'year') { label = d.toLocaleString('ar-EG', { month: 'long' }); }
    else if (period === 'all') { label = d.getFullYear().toString(); }
    else { label = d.toLocaleDateString('ar-EG'); }
    const ts = d.getTime();
    if (!buckets[label]) { buckets[label] = 0; order.push({ ts, label }); }
    buckets[label] += Number(inv.total || 0);
  });
  order.sort((a, b) => a.ts - b.ts);
  const labels = order.map(d => d.label);
  const data = labels.map(k => buckets[k]);
  charts.sales = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'المبيعات', data, backgroundColor: '#d97706', borderRadius: 6 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' ج.م' } } } }
  });
}

function drawPaymentChart(invoices) {
  destroyChart('payment');
  const canvas = document.getElementById('reportPaymentChart');
  if (!canvas) return;
  const paymentMap = {};
  invoices.forEach(inv => {
    const method = inv.paymentMethod || 'Cash';
    paymentMap[method] = (paymentMap[method] || 0) + Number(inv.total || 0);
  });
  const labels = Object.keys(paymentMap);
  const data = Object.values(paymentMap);
  charts.payment = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: ['#d97706', '#059669', '#f59e0b', '#dc2626', '#7c3aed'].slice(0, labels.length) }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => ctx.label + ': ' + Number(ctx.raw).toLocaleString() + ' ج.م' } } } }
  });
}

function drawCategoryChart(invoices, products) {
  destroyChart('category');
  const canvas = document.getElementById('reportCategoryChart');
  if (!canvas) return;
  const catMap = {};
  const nameToCat = {};
  products.forEach(p => { nameToCat[p.name] = p.category || 'أخرى'; });
  invoices.forEach(inv => {
    if (!inv.items) return;
    inv.items.forEach(item => {
      const cat = nameToCat[item.name] || 'أخرى';
      catMap[cat] = (catMap[cat] || 0) + Number(item.qty || 0) * Number(item.price || 0);
    });
  });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(s => s[0]);
  const data = sorted.map(s => s[1]);
  const colors = ['#d97706', '#059669', '#2563eb', '#7c3aed', '#dc2626', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];
  charts.category = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length) }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => ctx.label + ': ' + Number(ctx.raw).toLocaleString() + ' ج.م' } } } }
  });
}

function drawHourlyChart(invoices) {
  destroyChart('hourly');
  const canvas = document.getElementById('reportHourlyChart');
  if (!canvas) return;
  const hourly = new Array(24).fill(0);
  const counts = new Array(24).fill(0);
  invoices.forEach(inv => {
    if (!inv.date) return;
    const h = new Date(inv.date).getHours();
    hourly[h] += Number(inv.total || 0);
    counts[h]++;
  });
  const labels = [];
  for (let i = 0; i < 24; i++) {
    labels.push(i.toString().padStart(2, '0') + ':00');
  }
  charts.hourly = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: [
      { label: 'المبيعات', data: hourly, borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, yAxisID: 'y' },
      { label: 'عدد الفواتير', data: counts, borderColor: '#d97706', backgroundColor: 'rgba(217,119,6,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, yAxisID: 'y1' }
    ] },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } },
      scales: {
        y: { beginAtZero: true, position: 'left', ticks: { callback: v => v.toLocaleString() + ' ج.م' } },
        y1: { beginAtZero: true, position: 'right', grid: { display: false }, ticks: { callback: v => v + ' فاتورة' } }
      }
    }
  });
}

function drawDayChart(invoices) {
  destroyChart('day');
  const canvas = document.getElementById('reportDayChart');
  if (!canvas) return;
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayData = new Array(7).fill(0);
  const dayCount = new Array(7).fill(0);
  invoices.forEach(inv => {
    if (!inv.date) return;
    const day = new Date(inv.date).getDay();
    dayData[day] += Number(inv.total || 0);
    dayCount[day]++;
  });
  const labels = dayNames;
  const data = dayData;
  charts.day = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'المبيعات', data, backgroundColor: dayData.map((v, i) => i === 5 || i === 6 ? '#dc2626' : '#2563eb'), borderRadius: 6 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' ج.م' } } } }
  });
}

function drawTopProducts(invoices) {
  destroyChart('topQty');
  destroyChart('topRevenue');
  const qtyCanvas = document.getElementById('reportTopQtyChart');
  const revCanvas = document.getElementById('reportTopRevenueChart');

  const prodQty = {};
  const prodRev = {};
  invoices.forEach(inv => {
    if (!inv.items) return;
    inv.items.forEach(item => {
      const name = item.name;
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      prodQty[name] = (prodQty[name] || 0) + qty;
      prodRev[name] = (prodRev[name] || 0) + qty * price;
    });
  });

  const topQty = Object.entries(prodQty).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topRev = Object.entries(prodRev).sort((a, b) => b[1] - a[1]).slice(0, 10);

  if (qtyCanvas && topQty.length > 0) {
    charts.topQty = new Chart(qtyCanvas, {
      type: 'bar',
      data: {
        labels: topQty.map(p => p[0]),
        datasets: [{ label: 'الكمية', data: topQty.map(p => p[1]), backgroundColor: '#059669', borderRadius: 6 }]
      },
      options: {
        responsive: true, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  if (revCanvas && topRev.length > 0) {
    charts.topRevenue = new Chart(revCanvas, {
      type: 'bar',
      data: {
        labels: topRev.map(p => p[0]),
        datasets: [{ label: 'الإيراد', data: topRev.map(p => p[1]), backgroundColor: '#d97706', borderRadius: 6 }]
      },
      options: {
        responsive: true, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' ج.م' } } }
      }
    });
  }
}

periodSelect.addEventListener('change', () => { destroyAllCharts(); render(); });

document.getElementById('exportBtn').onclick = async () => {
  const invoices = await DB.invoices.all() || [];
  const products = await DB.products.all() || [];
  const nameToCat = {};
  products.forEach(p => { nameToCat[p.name] = p.category || 'أخرى'; });

  function csvEsc(val) {
    const s = String(val || '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  let csv = 'رقم الفاتورة,العميل,الطاولة,التاريخ,طريقة الدفع,الحالة,الإجمالي,المدفوع,المتبقي,خدمة,ضريبة,المنتج,الفئة,الكمية,سعر الوحدة,الإجمالي الفرعي,ملاحظة\n';
  invoices.forEach(i => {
    if (i.items && i.items.length > 0) {
      i.items.forEach(item => {
        const cat = nameToCat[item.name] || '';
        const lineTotal = (Number(item.qty || 0) * Number(item.price || 0));
        csv += [csvEsc(i.id), csvEsc(i.customer), csvEsc(i.table), csvEsc(i.date), csvEsc(i.paymentMethod), csvEsc(i.status), csvEsc(i.total), csvEsc(i.paid), csvEsc(i.remaining), csvEsc(i.serviceAmount), csvEsc(i.taxAmount), csvEsc(item.name), csvEsc(cat), csvEsc(item.qty), csvEsc(item.price), csvEsc(lineTotal), csvEsc(item.note || '')].join(',') + '\n';
      });
    } else {
      csv += [csvEsc(i.id), csvEsc(i.customer), csvEsc(i.table), csvEsc(i.date), csvEsc(i.paymentMethod), csvEsc(i.status), csvEsc(i.total), csvEsc(i.paid), csvEsc(i.remaining), csvEsc(i.serviceAmount), csvEsc(i.taxAmount), '', '', '', '', '', ''].join(',') + '\n';
    }
  });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'laguna-report-detailed.csv';
  link.click();
};

render();