const dayReportDate = document.getElementById('dayReportDate');
const dayReportShowBtn = document.getElementById('dayReportShowBtn');
const dayReportPdfBtn = document.getElementById('dayReportPdfBtn');
const dayReportImgBtn = document.getElementById('dayReportImgBtn');
const dayReportEl = document.getElementById('dayReport');

function setDayReportDate() {
  dayReportDate.value = localDateKey(new Date());
}

function fmtMoney(v) {
  return Number(v || 0).toLocaleString('ar-EG') + ' ج.م';
}

function buildDrinkTable(itemsMap) {
  const rows = Object.values(itemsMap).sort((a, b) => b.revenue - a.revenue);
  if (!rows.length) return '<div class="dr-empty">لا توجد مبيعات في هذا اليوم</div>';
  let html = '<table class="dr-table"><thead><tr><th>المشروب / المنتج</th><th>الكمية</th><th>الإيراد</th></tr></thead><tbody>';
  rows.forEach(r => {
    html += '<tr><td>' + escapeHtml(r.name) + (r.hasMilk ? ' (+حليب)' : '') + (r.note ? ' <span style="color:#888;font-size:11px">(' + escapeHtml(r.note) + ')</span>' : '') + '</td><td>' + r.qty + '</td><td>' + fmtMoney(r.revenue) + '</td></tr>';
  });
  html += '</tbody></table>';
  return html;
}

function buildReturnTable(returns) {
  if (!returns.length) return '<div class="dr-empty">لا توجد مرتجعات في هذا اليوم</div>';
  let html = '<table class="dr-table"><thead><tr><th>الوقت</th><th>المنتج</th><th>الكمية</th><th>المبلغ</th><th>السبب</th></tr></thead><tbody>';
  returns.forEach(r => {
    const t = r.date ? new Date(r.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—';
    html += '<tr><td>' + t + '</td><td>' + escapeHtml(r.productName || '—') + '</td><td>' + (r.qty || 1) + '</td><td style="color:#dc2626">-' + fmtMoney(r.amount) + '</td><td>' + escapeHtml(r.reason || '—') + '</td></tr>';
  });
  html += '</tbody></table>';
  return html;
}

async function showDayReport() {
  const dateVal = dayReportDate.value;
  if (!dateVal) return alert('اختر التاريخ أولاً');
  dayReportEl.innerHTML = '<div class="dr-empty"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل التقرير...</div>';

  try {
    const [allInvoices, allExpenses, allReturns, menu] = await Promise.all([
      DB.invoices.all(), DB.expenses.all(), DB.returns.all(), DB.products.all()
    ]);

    const start = new Date(dateVal + 'T00:00:00');
    const end = new Date(dateVal + 'T23:59:59.999');
    const dayInvoices = (allInvoices || []).filter(i => i.date) && (allInvoices || []).filter(i => { const d = new Date(i.date); return d >= start && d <= end; });
    const dayExpenses = (allExpenses || []).filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
    const dayReturns = (allReturns || []).filter(r => { const d = new Date(r.date); return d >= start && d <= end; });

    const paidInvoices = dayInvoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
    const totalSales = paidInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
    const totalCash = paidInvoices.filter(i => i.paymentMethod === 'Cash' || i.paymentMethod === 'كاش').reduce((s, i) => s + Number(i.paid != null ? i.paid : (i.total || 0)), 0);
    const totalCard = paidInvoices.filter(i => i.paymentMethod !== 'Cash' && i.paymentMethod !== 'كاش').reduce((s, i) => s + Number(i.paid != null ? i.paid : (i.total || 0)), 0);
    const totalExpenses = dayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalReturns = dayReturns.reduce((s, r) => s + Number(r.amount || 0), 0);
    const netProfit = totalSales - totalReturns - totalExpenses;

    const itemsMap = {};
    paidInvoices.forEach(inv => {
      (inv.items || []).forEach(it => {
        const key = (it.name || '') + '|' + (it.hasMilk ? '1' : '0') + '|' + (it.note || '');
        if (!itemsMap[key]) itemsMap[key] = { name: it.name || 'منتج', qty: 0, revenue: 0, hasMilk: !!it.hasMilk, note: it.note || '' };
        itemsMap[key].qty += Number(it.qty || 1);
        itemsMap[key].revenue += Number(it.qty || 1) * Number(it.price || 0);
      });
    });

    const totalItemsQty = Object.values(itemsMap).reduce((s, r) => s + r.qty, 0);
    const menuMap = (menu || []).reduce((m, p) => { m[p.id] = p; return m; }, {});
    let recipesCost = 0;
    Object.values(itemsMap).forEach(r => {
      const prod = menuMap[r.name] || menu.find(p => p.name === r.name);
      if (prod && prod.cost) recipesCost += Number(prod.cost) * r.qty;
    });

    dayReportEl.innerHTML =
      '<div class="dr-header">' +
        '<img src="images/logo.png" alt="Laguna Dubai">' +
        '<h2>لاجونا دبي - كافيه ومطعم</h2>' +
        '<p>التقرير اليومي - ' + dateVal + '</p>' +
      '</div>' +
      '<div class="dr-summary">' +
        '<div class="card"><span>عدد الفواتير المدفوعة</span><b>' + paidInvoices.length + '</b></div>' +
        '<div class="card"><span>إجمالي المبيعات</span><b>' + fmtMoney(totalSales) + '</b></div>' +
        '<div class="card"><span>كاش</span><b>' + fmtMoney(totalCash) + '</b></div>' +
        '<div class="card"><span>شبكة / فيزا</span><b>' + fmtMoney(totalCard) + '</b></div>' +
        '<div class="card"><span>عدد المشروبات</span><b>' + totalItemsQty + '</b></div>' +
        '<div class="card"><span>تكلفة الخامات (تقريبي)</span><b>' + fmtMoney(recipesCost) + '</b></div>' +
        '<div class="card"><span>المرتجعات</span><b style="color:#dc2626">-' + fmtMoney(totalReturns) + '</b></div>' +
        '<div class="card"><span>المصروفات</span><b style="color:#dc2626">-' + fmtMoney(totalExpenses) + '</b></div>' +
        '<div class="card"><span>صافي الربح</span><b style="color:var(--success)">' + fmtMoney(netProfit) + '</b></div>' +
      '</div>' +
      '<div class="dr-title">المشروبات والمنتجات المباعة (كمية × إيراد)</div>' +
      buildDrinkTable(itemsMap) +
      '<div class="dr-title">مرتجعات اليوم</div>' +
      buildReturnTable(dayReturns);

    if (!paidInvoices.length && !dayReturns.length && !dayExpenses.length) {
      dayReportEl.innerHTML = '<div class="dr-empty">لا توجد بيانات في هذا اليوم</div>';
    }
  } catch (e) {
    console.error('[dayreport]', e);
    dayReportEl.innerHTML = '<div class="dr-empty" style="color:#dc2626">حدث خطأ أثناء تحميل التقرير: ' + escapeHtml(e.message || e) + '</div>';
  }
}

async function exportDayReport(asImage) {
  const el = dayReportEl;
  if (!el || !el.innerHTML || el.innerHTML.indexOf('dr-header') === -1) return alert('اعرض اليوم أولاً قبل التحميل');
  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 900 });
    const imgData = canvas.toDataURL('image/png');
    const fileName = 'تقرير-يومي-' + dayReportDate.value;
    if (asImage) {
      const link = document.createElement('a');
      link.href = imgData;
      link.download = fileName + '.png';
      link.click();
    } else {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'landscape' : 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(fileName + '.pdf');
    }
  } catch (e) {
    console.error('[dayreport-export]', e);
    alert('حدث خطأ أثناء التحميل: ' + escapeHtml(e.message || e));
  }
}

if (dayReportShowBtn) dayReportShowBtn.onclick = showDayReport;
if (dayReportPdfBtn) dayReportPdfBtn.onclick = () => exportDayReport(false);
if (dayReportImgBtn) dayReportImgBtn.onclick = () => exportDayReport(true);
setDayReportDate();
showDayReport();
