const dayReportDate = document.getElementById('dayReportDate');
const dayReportShowBtn = document.getElementById('dayReportShowBtn');
const dayReportPdfBtn = document.getElementById('dayReportPdfBtn');
const dayReportImgBtn = document.getElementById('dayReportImgBtn');
const dayReportEl = document.getElementById('dayReport');

async function setDayReportDate() {
  let day = localDateKey(FB.clockNow());
  try {
    const openShift = await DB.shifts.getOpen();
    if (openShift && openShift.openDate) day = openShift.openDate;
  } catch(e) { console.warn('[dayreport] shift default:', e); }
  dayReportDate.value = day;
}

function fmtMoney(v) {
  return Number(v || 0).toLocaleString('ar-EG') + ' ج.م';
}

function buildDrinkTable(itemsMap) {
  const rows = Object.values(itemsMap).sort((a, b) => b.revenue - a.revenue);
  if (!rows.length) return '<div class="dr-empty">لا توجد مبيعات في هذا اليوم</div>';
  let html = '<table class="dr-table"><thead><tr><th>المشروب / المنتج</th><th>الكمية</th><th>الإيراد</th></tr></thead><tbody>';
  rows.forEach(r => {
    html += '<tr><td>' + escapeHtml(r.name) + (r.hasMilk ? ' (+لبن)' : '') + (r.note ? ' <span style="color:#888;font-size:11px">(' + escapeHtml(r.note) + ')</span>' : '') + '</td><td>' + r.qty + '</td><td>' + fmtMoney(r.revenue) + '</td></tr>';
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

function buildLatePaymentsTable(latePayments) {
  if (!latePayments.length) return '';
  let html = '<table class="dr-table"><thead><tr><th>الوقت</th><th>رقم الفاتورة</th><th>العميل</th><th>المبلغ المحصل</th><th>الطريقة</th></tr></thead><tbody>';
  latePayments.forEach(p => {
    const t = new Date(p.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    html += '<tr style="color:#b45309"><td>' + t + '</td><td>' + escapeHtml(p.id) + '</td><td>' + escapeHtml(p.customer) + '</td><td style="font-weight:700">+' + fmtMoney(p.amount) + '</td><td>' + escapeHtml(methodLabel(p.method)) + '</td></tr>';
  });
  html += '</tbody></table>';
  return html;
}

function methodLabel(m) {
  if (m === 'Cash') return 'كاش';
  if (m === 'Card' || m === 'Visa') return 'شبكة/فيزا';
  if (m === 'Wallet') return 'محفظة';
  return m || '—';
}

async function resolveDayRange(dateVal, latestInvTs) {
  try {
    const shifts = await DB.shifts.all() || [];
    const sorted = shifts.filter(s => s.openDate && s.openedAt).sort((a, b) => new Date(a.openedAt) - new Date(b.openedAt));
    const i = sorted.findIndex(s => s.openDate === dateVal);
    if (i !== -1) {
      const start = new Date(sorted[i].openedAt);
      let end = null;
      if (i + 1 < sorted.length) end = new Date(sorted[i + 1].openedAt);
      else if (sorted[i].closedAt) end = new Date(sorted[i].closedAt);
      else end = new Date(Math.max(FB.clockNow().getTime(), latestInvTs || 0));
      return { start, end };
    }
  } catch(e) { console.warn('[dayreport] range:', e); }
  return { start: new Date(dateVal + 'T00:00:00'), end: new Date(dateVal + 'T23:59:59.999') };
}

function buildItemsMap(invs) {
  const m = {};
  (invs || []).forEach(inv => {
    (inv.items || []).forEach(it => {
      const key = (it.name || '') + '|' + (it.hasMilk ? '1' : '0') + '|' + (it.note || '');
      if (!m[key]) m[key] = { name: it.name || '\u0645\u0646\u062a\u062c', qty: 0, revenue: 0, hasMilk: !!it.hasMilk, note: it.note || '' };
      m[key].qty += Number(it.qty || 1);
      m[key].revenue += Number(it.qty || 1) * Number(it.price || 0);
    });
  });
  return m;
}

function customerBadge(inv) {
  if (inv.customerType === 'workers') return ' <span class="dr-badge dr-badge-workers">\u0639\u0645\u0627\u0644\u0629</span>';
  if (inv.customerType === 'free') return ' <span class="dr-badge dr-badge-free">\u0636\u064a\u0627\u0641\u0629</span>';
  if (inv.customerType === 'special') return ' <span class="dr-badge dr-badge-special">\u0645\u0645\u064a\u0632</span>';
  return '';
}

function invoiceItemsSummary(inv) {
  return (inv.items || []).map(function(it) {
    var label = escapeHtml(it.name || '\u0645\u0646\u062a\u062c');
    if (it.hasMilk) label += ' (+\u0644\u0628\u0646)';
    return label + ' \u00d7' + Number(it.qty || 1);
  }).join(', ');
}

function buildPaidInvoicesTable(paidInvoices) {
  if (!paidInvoices.length) return '';
  var html = '<table class="dr-table dr-table-invoices"><thead><tr>' +
    '<th>\u0627\u0644\u0648\u0642\u062a</th>' +
    '<th>\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629</th>' +
    '<th>\u0627\u0644\u0639\u0645\u064a\u0644</th>' +
    '<th>\u0627\u0644\u062a\u0631\u0627\u0628\u064a\u0632\u0629</th>' +
    '<th>\u0627\u0644\u0623\u0635\u0646\u0627\u0641</th>' +
    '<th>\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a</th>' +
    '<th>\u0627\u0644\u0637\u0631\u064a\u0642\u0629</th>' +
    '</tr></thead><tbody>';
  paidInvoices.forEach(function(inv) {
    var t = inv.date ? new Date(inv.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '\u2014';
    var isWorker = inv.customerType === 'workers';
    var isFree = inv.customerType === 'free';
    var rowClass = isWorker ? ' class="dr-row-workers"' : isFree ? ' class="dr-row-free"' : '';
    var custName = escapeHtml(inv.customer || '\u2014') + customerBadge(inv);
    var tableNum = inv.table ? '#' + escapeHtml(String(inv.table)) : '\u2014';
    var items = invoiceItemsSummary(inv);
    var method = methodLabel(inv.paymentMethod);
    html += '<tr' + rowClass + '>' +
      '<td>' + t + '</td>' +
      '<td>' + escapeHtml(inv.id) + '</td>' +
      '<td>' + custName + '</td>' +
      '<td>' + tableNum + '</td>' +
      '<td class="dr-inv-items">' + items + '</td>' +
      '<td style="font-weight:700">' + fmtMoney(inv.total) + '</td>' +
      '<td>' + method + '</td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function buildPendingInvoicesTable(pendingInvoices) {
  if (!pendingInvoices.length) return '';
  var html = '<table class="dr-table dr-table-invoices"><thead><tr>' +
    '<th>\u0627\u0644\u0648\u0642\u062a</th>' +
    '<th>\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629</th>' +
    '<th>\u0627\u0644\u0639\u0645\u064a\u0644</th>' +
    '<th>\u0627\u0644\u062a\u0631\u0627\u0628\u064a\u0632\u0629</th>' +
    '<th>\u0627\u0644\u0623\u0635\u0646\u0627\u0641</th>' +
    '<th>\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a</th>' +
    '<th>\u0627\u0644\u0645\u062a\u0628\u0642\u064a</th>' +
    '</tr></thead><tbody>';
  pendingInvoices.forEach(function(inv) {
    var t = inv.date ? new Date(inv.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '\u2014';
    var isWorker = inv.customerType === 'workers';
    var isFree = inv.customerType === 'free';
    var rowClass = isWorker ? ' class="dr-row-workers"' : isFree ? ' class="dr-row-free"' : '';
    var custName = escapeHtml(inv.customer || '\u2014') + customerBadge(inv);
    var tableNum = inv.table ? '#' + escapeHtml(String(inv.table)) : '\u2014';
    var items = invoiceItemsSummary(inv);
    var remaining = Math.max(0, Number(inv.total || 0) - Number(inv.paid || 0));
    html += '<tr' + rowClass + '>' +
      '<td>' + t + '</td>' +
      '<td>' + escapeHtml(inv.id) + '</td>' +
      '<td>' + custName + '</td>' +
      '<td>' + tableNum + '</td>' +
      '<td class="dr-inv-items">' + items + '</td>' +
      '<td style="font-weight:700">' + fmtMoney(inv.total) + '</td>' +
      '<td style="color:#d97706;font-weight:700">' + fmtMoney(remaining) + '</td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

async function showDayReport() {
  const dateVal = dayReportDate.value;
  if (!dateVal) return alert('\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0623\u0648\u0644\u0627\u064b');
  dayReportEl.innerHTML = '<div class="dr-empty"><i class="fa-solid fa-spinner fa-spin"></i> \u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062a\u0642\u0631\u064a\u0631...</div>';

  try {
    const [allInvoices, allExpenses, allReturns, menu, allDaycloses, allAudit, allIncomes] = await Promise.all([
      DB.invoices.all(), DB.expenses.all(), DB.returns.all(), DB.products.all(), DB.daycloses.all(), DB.audit.all(), DB.incomes.all()
    ]);

    const latestInvTs = (allInvoices || []).reduce((m, i) => i.date ? Math.max(m, new Date(i.date).getTime()) : m, 0);
    const { start, end } = await resolveDayRange(dateVal, latestInvTs);
    const dayInvoices = (allInvoices || []).filter(i => i.date && (() => { const d = new Date(i.date); return d >= start && d <= end; })());
    const dayExpenses = (allExpenses || []).filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
    const dayReturns = (allReturns || []).filter(r => { const d = new Date(r.date); return d >= start && d <= end; });
    const dayIncomes = (allIncomes || []).filter(e => { const d = new Date(e.date); return d >= start && d <= end; });

    const soldInvoices = dayInvoices.filter(i => i.status !== 'returned' && i.status !== '\u0645\u0631\u062a\u062c\u0639\u0629');

    // الفواتير المدفوعة = الليpaidAt بتاعها اليوم ده (بغض النظر عن تاريخ الإنشاء)
    const paidInvoices = (allInvoices || []).filter(i => {
      if (i.status === 'returned' || i.status === '\u0645\u0631\u062a\u062c\u0639\u0629') return false;
      if (!i.paidAt) return false;
      const paidDate = new Date(i.paidAt);
      return paidDate >= start && paidDate <= end;
    });

    // الفواتير المعلقة = اللي اتنشأت اليوم ولسه متسددتش
    // (لو اتسددت بعدين تتشال من هنا وتتحول للفواتير المدفوعة في يوم التسديد)
    const pendingInvoices = dayInvoices.filter(i => {
      if (i.status === 'paid' || i.status === '\u0645\u062f\u0641\u0648\u0639\u0629') return false;
      if (!i.paidAt) return true;
      const paidDate = new Date(i.paidAt);
      return paidDate > end;
    });

    const totalSales = paidInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
    const totalCash = paidInvoices.filter(i => i.paymentMethod === 'Cash' || i.paymentMethod === '\u0643\u0627\u0634').reduce((s, i) => s + Number(i.paid != null && Number(i.paid) > 0 ? i.paid : (i.total || 0)), 0);
    const totalCard = paidInvoices.filter(i => i.paymentMethod !== 'Cash' && i.paymentMethod !== '\u0643\u0627\u0634').reduce((s, i) => s + Number(i.paid != null && Number(i.paid) > 0 ? i.paid : (i.total || 0)), 0);
    const totalExpenses = dayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalReturns = dayReturns.reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalIncome = dayIncomes.reduce((s, e) => s + Number(e.amount || 0), 0);

    // خريطة الفواتير الموجودة فعليًا (لاستبعاد المحذوف من سجل العمليات)
    const existingInvMap = {};
    (allInvoices || []).forEach(i => { if (i && i.id) existingInvMap[i.id] = i; });

    // فواتير العمالة (مجانية تتحسب كمصروف)
    const workerInvoices = soldInvoices.filter(i => i.customerType === 'workers');
    const workersCost = workerInvoices.reduce((s, i) => s + Number(i.itemsValue != null ? i.itemsValue : ((i.items || []).reduce((ss, it) => ss + Number(it.qty || 1) * Number(it.price || 0), 0))), 0);

    // تحصيلات متأخرة: مدفوعات سُجلت في هذا اليوم لفواتير أُنشئت في أيام أخرى
    const latePayments = [];
    (allAudit || []).forEach(a => {
      if (a.type !== 'invoice_payment' || !a.timestamp) return;
      const t = new Date(a.timestamp);
      if (!(t >= start && t <= end)) return;
      let det = {}; try { det = JSON.parse(a.detail || '{}'); } catch(e) {}
      const amount = Number(det.amount || 0);
      if (!(amount > 0)) return;
      const created = det.invDate ? new Date(det.invDate) : null;
      const isSameDayCreation = created && created >= start && created <= end;
      if (isSameDayCreation) return; // تسديد في نفس يوم الإنشاء محسوب أصلًا من بيانات الفواتير
      latePayments.push({ time: t, id: det.id || '\u2014', customer: det.customer || '\u2014', amount, method: det.method || '' });
    });
    latePayments.sort((a, b) => a.time - b.time);
    const lateTotal = latePayments.reduce((s, p) => s + p.amount, 0);
    const lateCash = latePayments.filter(p => p.method === 'Cash' || p.method === '\u0643\u0627\u0634').reduce((s, p) => s + p.amount, 0);
    const lateCard = lateTotal - lateCash;

    const netProfit = totalSales + totalIncome + lateTotal - totalReturns - totalExpenses - workersCost;
    const liveSales = paidInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
    const pendingAmount = pendingInvoices.reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.paid || 0)), 0);

    const auditInvoices = (allAudit || [])
      .filter(a => {
        if (a.type !== 'invoice_created' || !a.timestamp) return false;
        const t = new Date(a.timestamp); const maxT = new Date(FB.clockNow().getTime() + 5 * 60 * 1000);
        if (!(t >= start && t <= end && t <= maxT)) return false;
        let det = {}; try { det = JSON.parse(a.detail || '{}'); } catch(e) {}
        const id = a.detail_id || det.id;
        return !!id && !!existingInvMap[id]; // تجاهل الفواتير المحذوفة
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let auditHtml = '<div class="dr-empty">\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0648\u0627\u062a\u064a\u0631 \u0645\u0633\u062c\u0644\u0629 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645</div>';
    if (auditInvoices.length) {
      let rows = '';
      auditInvoices.forEach(a => {
        let det = {};
        try { det = JSON.parse(a.detail || '{}'); } catch(e) {}
        const t = new Date(a.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const invRef = existingInvMap[a.detail_id || det.id];
        const isWorkerRow = (invRef ? invRef.customerType === 'workers' : det.customerType === 'workers');
        const isFreeRow = (invRef ? invRef.customerType === 'free' : det.customerType === 'free');
        const custHtml = escapeHtml(det.customer || '—') +
          (isWorkerRow ? ' <span class="dr-badge dr-badge-workers">(عمالة)</span>' :
           isFreeRow ? ' <span class="dr-badge dr-badge-free">(ضيافة)</span>' : '');
        const rowStyle = isWorkerRow ? ' class="dr-row-workers"' : isFreeRow ? ' class="dr-row-free"' : '';
        rows += '<tr' + rowStyle + '><td>' + t + '</td><td>' + escapeHtml(a.detail_id || det.id || '—') + '</td><td>' + custHtml + '</td><td>' + fmtMoney(det.total || 0) + '</td><td>' + escapeHtml(det.method || '—') + '</td></tr>';
      });
      auditHtml = '<table class="dr-table"><thead><tr><th>\u0627\u0644\u0648\u0642\u062a</th><th>\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629</th><th>\u0627\u0644\u0639\u0645\u064a\u0644</th><th>\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a</th><th>\u0627\u0644\u0637\u0631\u064a\u0642\u0629</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }

    const summaryHtml = (title, cards, extra) =>
      '<div class="dr-header">' +
        '<img src="images/logo.png" alt="Laguna Dubai">' +
        '<h2>\u0644\u0627\u062c\u0648\u0646\u0627 \u062f\u0628\u064a - \u0643\u0627\u0641\u064a\u0647 \u0648\u0645\u0637\u0639\u0645</h2>' +
        '<p>' + title + ' - ' + dateVal + '</p>' +
      '</div>' +
      '<div class="dr-summary">' + cards + '</div>' +
      '<div class="dr-title">\u0641\u0648\u0627\u062a\u064a\u0631 \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645 (\u0645\u0646 \u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a)</div>' +
      auditHtml +
      (latePayments.length ? '<div class="dr-title" style="color:#b45309">\u062a\u062d\u0635\u064a\u0644\u0627\u062a \u0641\u0648\u0627\u062a\u064a\u0631 \u0633\u0627\u0628\u0642\u0629 (\u0645\u062a\u0623\u062e\u0631\u0627\u062a \u0627\u062a\u0633\u062f\u062f\u062a \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645)</div>' + buildLatePaymentsTable(latePayments) : '') +
      (extra || '');

    if (auditInvoices.length && !soldInvoices.length) {
      // All invoices for this day were deleted — show audit trail only
      const audSales = auditInvoices.reduce((s, a) => { let det = {}; try { det = JSON.parse(a.detail || '{}'); } catch(e) {} return s + Number(det.total || 0); }, 0);
      const audCash = auditInvoices.reduce((s, a) => { let det = {}; try { det = JSON.parse(a.detail || '{}'); } catch(e) {} return s + ((det.method === 'Cash' || det.method === '\u0643\u0627\u0634') ? Number(det.total || 0) : 0); }, 0);
      const cards =
        '<div class="card"><span>\u0639\u062f\u062f \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631</span><b>' + auditInvoices.length + '</b></div>' +
        '<div class="card"><span>\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a</span><b>' + fmtMoney(audSales) + '</b></div>' +
        '<div class="card"><span>\u0643\u0627\u0634</span><b>' + fmtMoney(audCash) + '</b></div>' +
        '<div class="card"><span>\u0634\u0628\u0643\u0629 / \u0641\u064a\u0632\u0627</span><b>' + fmtMoney(audSales - audCash) + '</b></div>';
      dayReportEl.innerHTML = summaryHtml('\u0627\u0644\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u064a\u0648\u0645\u064a (\u0645\u0646 \u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a)', cards, '');
    } else if (!paidInvoices.length && !pendingInvoices.length && !dayReturns.length && !dayExpenses.length) {
      dayReportEl.innerHTML = '<div class="dr-empty">\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645</div>';
    } else {
      // Always use live invoice data (not dayclose snapshots) for accuracy
      const itemsMap = buildItemsMap(paidInvoices);

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
          '<h2>\u0644\u0627\u062c\u0648\u0646\u0627 \u062f\u0628\u064a - \u0643\u0627\u0641\u064a\u0647 \u0648\u0645\u0637\u0639\u0645</h2>' +
          '<p>\u0627\u0644\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u064a\u0648\u0645\u064a - ' + dateVal + '</p>' +
        '</div>' +
        '<div class="dr-summary">' +
          '<div class="card"><span>\u0639\u062f\u062f \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0629</span><b>' + paidInvoices.length + '</b></div>' +
          '<div class="card"><span>\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a</span><b>' + fmtMoney(totalSales) + '</b></div>' +
          '<div class="card"><span>\u0643\u0627\u0634</span><b>' + fmtMoney(totalCash + lateCash) + '</b></div>' +
          '<div class="card"><span>\u0634\u0628\u0643\u0629 / \u0641\u064a\u0632\u0627</span><b>' + fmtMoney(totalCard + lateCard) + '</b></div>' +
          '<div class="card"><span>\u0639\u062f\u062f \u0627\u0644\u0645\u0634\u0631\u0648\u0628\u0627\u062a</span><b>' + totalItemsQty + '</b></div>' +
          '<div class="card"><span>\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u062e\u0627\u0645\u0627\u062a (\u062a\u0642\u0631\u064a\u0628\u064a)</span><b>' + fmtMoney(recipesCost) + '</b></div>' +
          '<div class="card"><span>\u0627\u0644\u0645\u0631\u062a\u062c\u0639\u0627\u062a</span><b style="color:#dc2626">-' + fmtMoney(totalReturns) + '</b></div>' +
          '<div class="card"><span>\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062a</span><b style="color:#dc2626">-' + fmtMoney(totalExpenses) + '</b></div>' +
          (workersCost > 0 ? '<div class="card"><span>\u0645\u0635\u0627\u0631\u064a\u0641 \u0627\u0644\u0639\u0645\u0627\u0644\u0629 (\u0645\u062c\u0627\u0646\u064a\u0629)</span><b style="color:#dc2626">-' + fmtMoney(workersCost) + '</b></div>' : '') +
          (lateTotal > 0 ? '<div class="card"><span>\u062a\u062d\u0635\u064a\u0644\u0627\u062a \u0645\u062a\u0623\u062e\u0631\u0629</span><b style="color:#d97706">+' + fmtMoney(lateTotal) + '</b></div>' : '') +
          '<div class="card"><span>\u0625\u064a\u0631\u0627\u062f\u0627\u062a \u0623\u062e\u0631\u0649</span><b style="color:var(--success)">' + fmtMoney(totalIncome) + '</b></div>' +
          '<div class="card"><span>\u0635\u0627\u0641\u064a \u0627\u0644\u0631\u0628\u062d</span><b style="color:var(--success)">' + fmtMoney(netProfit) + '</b></div>' +
          (pendingInvoices.length ? '<div class="card"><span>\u0641\u0648\u0627\u062a\u064a\u0631 \u0645\u0639\u0644\u0642\u0629 (\u0645\u0633\u062a\u0628\u0639\u062f\u0629)</span><b style="color:#d97706">' + pendingInvoices.length + ' \u0641\u0627\u062a\u0648\u0631\u0629 / ' + fmtMoney(pendingAmount) + '</b></div>' : '') +
        '</div>' +
        '<div class="dr-title">\u0641\u0648\u0627\u062a\u064a\u0631 \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645 (\u0645\u0646 \u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a)</div>' +
        auditHtml +
        (latePayments.length ? '<div class="dr-title" style="color:#b45309">\u062a\u062d\u0635\u064a\u0644\u0627\u062a \u0641\u0648\u0627\u062a\u064a\u0631 \u0633\u0627\u0628\u0642\u0629 (\u0645\u062a\u0623\u062e\u0631\u0627\u062a \u0627\u062a\u0633\u062f\u062f\u062a \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645)</div>' + buildLatePaymentsTable(latePayments) : '') +
        '<div class="dr-title">\u0627\u0644\u0645\u0634\u0631\u0648\u0628\u0627\u062a \u0648\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0628\u0627\u0639\u0629</div>' +
        '<div style="color:#6b7280;font-size:12px;margin:-8px 0 12px">\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0642\u0628\u0644 \u0627\u0644\u062e\u0635\u0648\u0645\u0627\u062a \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u062a \u2014 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0641\u0639\u0644\u064a \u064a\u0636\u0645\u0646 \u0627\u0644\u062e\u0635\u0648\u0645\u0627\u062a</div>' +
        buildDrinkTable(itemsMap) +
        (paidInvoices.length ? '<div class="dr-title">\u0641\u0648\u0627\u062a\u064a\u0631 \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0629</div>' + buildPaidInvoicesTable(paidInvoices) : '') +
        (pendingInvoices.length ? '<div class="dr-title" style="color:#d97706">\u0641\u0648\u0627\u062a\u064a\u0631 \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0645\u0639\u0644\u0642\u0629</div>' + buildPendingInvoicesTable(pendingInvoices) : '') +
        '<div class="dr-title">\u0645\u0631\u062a\u062c\u0639\u0627\u062a \u0627\u0644\u064a\u0648\u0645</div>' +
        buildReturnTable(dayReturns) +
        (latePayments.length ? '<div class="dr-title" style="color:#b45309">\u062a\u062d\u0635\u064a\u0644\u0627\u062a \u0641\u0648\u0627\u062a\u064a\u0631 \u0633\u0627\u0628\u0642\u0629</div>' + buildLatePaymentsTable(latePayments) : '');
    }
  } catch (e) {
    console.error('[dayreport]', e);
    dayReportEl.innerHTML = '<div class="dr-empty" style="color:#dc2626">\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062a\u0642\u0631\u064a\u0631: ' + escapeHtml(e.message || e) + '</div>';
  }
}
async function ensureExportFonts() {
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    if (document.fonts && document.fonts.load) {
      try { await document.fonts.load('400 16px Cairo'); } catch (e) {}
      try { await document.fonts.load('700 16px Cairo'); } catch (e) {}
    }
  } catch (e) { console.warn('[dayreport] fonts:', e); }
}

function buildLogoDataUri() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70"><rect width="70" height="70" rx="14" fill="#d97706"/><text x="35" y="48" font-size="36" text-anchor="middle" fill="#fff" font-family="Arial">L</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

async function exportDayReport(asImage) {
  const el = dayReportEl;
  if (!el || !el.innerHTML || el.innerHTML.indexOf('dr-header') === -1) return alert('اعرض اليوم أولاً قبل التحميل');
  if (!window.domtoimage) return alert('مكتبة التصدير لم تُحمّل — تأكد من الاتصال بالإنترنت ثم أعد المحاولة');

  const imgs = el.querySelectorAll('img');
  const orig = Array.from(imgs).map(i => i.src);
  imgs.forEach(img => { img.src = buildLogoDataUri(); img.removeAttribute('crossorigin'); });

  try {
    console.log('EX1 fonts');
    await ensureExportFonts();
    console.log('EX2 toPng');
    const dataUrl = await domtoimage.toPng(el, {
      width: el.scrollWidth,
      height: el.scrollHeight,
      scale: 1.5,
      backgroundColor: '#ffffff',
      style: { margin: '0', boxShadow: 'none' }
    });
    console.log('EX3 img');
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('فشل تجهيز الصورة')); img.src = dataUrl; });
    console.log('EX4 pages');

    // تقسيم المحتوى على صفحات A4 متتالية بحجم طبيعي (بدل ضغط الكل في صفحة واحدة)
    const pageW = img.width;
    const pageH = Math.round(img.width * (297 / 210));
    const numPages = Math.max(1, Math.ceil(img.height / pageH));
    const fileName = 'تقرير-يومي-' + dayReportDate.value;

    const pages = [];
    for (let i = 0; i < numPages; i++) {
      const p = document.createElement('canvas');
      p.width = pageW;
      p.height = pageH;
      const pctx = p.getContext('2d');
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(0, 0, pageW, pageH);
      pctx.drawImage(img, 0, i * pageH, pageW, pageH, 0, 0, pageW, pageH);
      pages.push(p);
    }
    console.log('EX5 jspdf ' + pages.length + ' pages');

    if (asImage) {
      pages.forEach((p, i) => {
        const link = document.createElement('a');
        link.href = p.toDataURL('image/jpeg', 0.9);
        link.download = fileName + (pages.length > 1 ? '-صفحة-' + (i + 1) : '') + '.jpg';
        setTimeout(() => link.click(), i * 150);
      });
    } else {
      const { jsPDF } = window.jspdf;
      console.log('EX6 jsPDF ctor');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pages.forEach((p, i) => {
        if (i > 0) pdf.addPage();
        pdf.addImage(p.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297);
      });
      console.log('EX7 save');
      pdf.save(fileName + '.pdf');
      console.log('EX8 done');
    }
  } catch (e) {
    console.error('[dayreport-export]', e);
    alert('حدث خطأ أثناء التحميل: ' + escapeHtml(e.message || e));
  } finally {
    imgs.forEach((img, i) => { img.src = orig[i]; });
  }
}

if (dayReportShowBtn) dayReportShowBtn.onclick = showDayReport;
if (dayReportPdfBtn) dayReportPdfBtn.onclick = () => exportDayReport(false);
if (dayReportImgBtn) dayReportImgBtn.onclick = () => exportDayReport(true);
setDayReportDate().then(showDayReport);
