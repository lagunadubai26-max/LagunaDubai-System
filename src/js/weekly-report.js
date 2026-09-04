var weekStartDate = document.getElementById('weekStartDate');
var weekReportEl = document.getElementById('weekReport');
var dayNames = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function getSaturdayOffset(weeksAgo) {
  var now = FB.clockNow();
  var day = now.getDay();
  var diff = (day === 6) ? 0 : (day + 1) % 7;
  var sat = new Date(now);
  sat.setDate(now.getDate() - diff - (weeksAgo * 7));
  sat.setHours(0, 0, 0, 0);
  return localDateKey(sat);
}

function setDefaultWeekStart() {
  weekStartDate.value = getSaturdayOffset(0);
}

function selectWeek(weeksAgo) {
  weekStartDate.value = getSaturdayOffset(weeksAgo);
  showWeekReport();
}

function getWeekDays(startStr) {
  var parts = startStr.split('-').map(Number);
  var start = new Date(parts[0], parts[1] - 1, parts[2]);
  start.setHours(0, 0, 0, 0);
  var days = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ date: new Date(d), dateKey: localDateKey(d), label: dayNames[i] });
  }
  return days;
}

function getPrevWeekStart(startStr) {
  var parts = startStr.split('-').map(Number);
  var d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - 7);
  return localDateKey(d);
}

function fmtMoney(v) { return Number(v || 0).toLocaleString('ar-EG') + ' ج.م'; }

function pctChange(curr, prev) {
  if (!prev) return curr > 0 ? '<span class="change-badge change-up">جديد</span>' : '';
  var pct = ((curr - prev) / prev * 100).toFixed(1);
  if (pct > 0) return '<span class="change-badge change-up">+' + pct + '%</span>';
  if (pct < 0) return '<span class="change-badge change-down">' + pct + '%</span>';
  return '<span class="change-badge">0%</span>';
}

function escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ── Resolve shift-based day range (same logic as daily report) ──
function resolveDayRangeSync(dateKey, shiftsSorted, latestInvTs) {
  var i = shiftsSorted.findIndex(function(s) { return s.openDate === dateKey; });
  if (i !== -1) {
    var start = new Date(shiftsSorted[i].openedAt);
    var end = null;
    if (i + 1 < shiftsSorted.length) end = new Date(shiftsSorted[i + 1].openedAt);
    else if (shiftsSorted[i].closedAt) end = new Date(shiftsSorted[i].closedAt);
    else end = new Date(Math.max(FB.clockNow().getTime(), latestInvTs || 0));
    return { start: start, end: end, hasShift: true };
  }
  return { start: null, end: null, hasShift: false };
}

// ── Filter paid invoices (same logic as daily report) ──
function filterPaidInvoices(allInvoices, start, end) {
  return allInvoices.filter(function(i) {
    if (i._warning) return false;
    if (i.status === 'returned' || i.status === 'مرتجعة') return false;
    if (i.paidAt) {
      var paidDate = new Date(i.paidAt);
      return paidDate >= start && paidDate <= end;
    }
    if (i.status === 'paid' && (i.customerType === 'workers' || i.customerType === 'free')) {
      var created = new Date(i.date);
      return created >= start && created <= end;
    }
    return false;
  }).sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
}

// ── Filter pending invoices (same logic as daily report) ──
function filterPendingInvoices(dayInvoices, end) {
  return dayInvoices.filter(function(i) {
    if (i.status === 'paid' || i.status === 'مدفوعة') return false;
    if (!i.paidAt) return true;
    var paidDate = new Date(i.paidAt);
    return paidDate > end;
  }).sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
}

// ── Filter day invoices (created in range, no _warning) ──
function filterDayInvoices(allInvoices, start, end) {
  return allInvoices.filter(function(i) {
    if (i._warning) return false;
    if (!i.date) return false;
    var d = new Date(i.date);
    return d >= start && d <= end;
  });
}

// ── Filter generic items by range ──
function filterRange(items, start, end) {
  return items.filter(function(it) {
    if (!it.date) return false;
    var d = new Date(it.date);
    return d >= start && d <= end;
  });
}

function calcDayStats(paid, exps, rets, incs) {
  var sales = paid.reduce(function(s, i) { return s + Number(i.total || 0); }, 0);
  var expTotal = exps.reduce(function(s, e) { return s + Number(e.amount || 0); }, 0);
  var retTotal = rets.reduce(function(s, r) { return s + Number(r.amount || 0); }, 0);
  var incTotal = incs.reduce(function(s, i) { return s + Number(i.amount || 0); }, 0);
  var itemsQty = 0;
  paid.forEach(function(inv) { (inv.items || []).forEach(function(it) { itemsQty += Number(it.qty || 1); }); });
  return { sales: sales, invoices: paid.length, expenses: expTotal, returns: retTotal, income: incTotal, itemsQty: itemsQty };
}

function buildItemsMap(invs) {
  var m = {};
  invs.forEach(function(inv) {
    (inv.items || []).forEach(function(it) {
      var key = (it.name || '') + '|' + (it.hasMilk ? '1' : '0');
      if (!m[key]) m[key] = { name: it.name || 'منتج', qty: 0, revenue: 0, hasMilk: !!it.hasMilk };
      m[key].qty += Number(it.qty || 1);
      m[key].revenue += Number(it.qty || 1) * Number(it.price || 0);
    });
  });
  return m;
}

async function showWeekReport() {
  var startStr = weekStartDate.value;
  if (!startStr) return alert('اختر بداية الأسبوع');
  weekReportEl.innerHTML = '<div class="dr-empty"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل التقرير...</div>';

  try {
    var allInvoices = await DB.invoices.all() || [];
    var allExpenses = await DB.expenses.all() || [];
    var allReturns = await DB.returns.all() || [];
    var allIncomes = await DB.incomes.all() || [];
    var menu = await DB.products.all() || [];

    // ── Load shifts and sort (same as daily report) ──
    var shifts = await DB.shifts.all() || [];
    var shiftsSorted = shifts.filter(function(s) { return s.openDate && s.openedAt; })
      .sort(function(a, b) { return new Date(a.openedAt) - new Date(b.openedAt); });

    var latestInvTs = allInvoices.reduce(function(m, i) { return i.date ? Math.max(m, new Date(i.date).getTime()) : m; }, 0);

    var weekDays = getWeekDays(startStr);
    var prevStartStr = getPrevWeekStart(startStr);
    var prevDays = getWeekDays(prevStartStr);

    // ── Resolve shift-based ranges for current week ──
    var dayRanges = [];
    for (var i = 0; i < 7; i++) {
      dayRanges.push(resolveDayRangeSync(weekDays[i].dateKey, shiftsSorted, latestInvTs));
    }

    // ── Resolve shift-based ranges for previous week ──
    var prevDayRanges = [];
    for (var j = 0; j < 7; j++) {
      prevDayRanges.push(resolveDayRangeSync(prevDays[j].dateKey, shiftsSorted, latestInvTs));
    }

    // ── Process current week ──
    var weekPaidAll = [];
    var weekPendingAll = [];
    var weekExpenses = [];
    var weekReturns = [];
    var weekIncomes = [];
    var dayStatsArr = [];

    for (var k = 0; k < 7; k++) {
      var range = dayRanges[k];
      var dayPaid, dayPending, dayExps, dayRets, dayIncs;

      if (!range.hasShift) {
        dayPaid = [];
        dayPending = [];
        dayExps = [];
        dayRets = [];
        dayIncs = [];
      } else {
        var dayInvoices = filterDayInvoices(allInvoices, range.start, range.end);
        dayPaid = filterPaidInvoices(allInvoices, range.start, range.end);
        dayPending = filterPendingInvoices(dayInvoices, range.end);
        dayExps = filterRange(allExpenses, range.start, range.end);
        dayRets = filterRange(allReturns, range.start, range.end);
        dayIncs = filterRange(allIncomes, range.start, range.end);
      }

      weekPaidAll = weekPaidAll.concat(dayPaid);
      weekPendingAll = weekPendingAll.concat(dayPending);
      weekExpenses = weekExpenses.concat(dayExps);
      weekReturns = weekReturns.concat(dayRets);
      weekIncomes = weekIncomes.concat(dayIncs);
      dayStatsArr.push(calcDayStats(dayPaid, dayExps, dayRets, dayIncs));
    }

    // ── Process previous week ──
    var prevPaidAll = [];
    var prevPendingAll = [];
    var prevWeekExpenses = [];
    var prevWeekReturns = [];
    var prevWeekIncomes = [];

    for (var p = 0; p < 7; p++) {
      var pr = prevDayRanges[p];
      if (!pr.hasShift) continue;
      var prevDayInvoices = filterDayInvoices(allInvoices, pr.start, pr.end);
      prevPaidAll = prevPaidAll.concat(filterPaidInvoices(allInvoices, pr.start, pr.end));
      prevPendingAll = prevPendingAll.concat(filterPendingInvoices(prevDayInvoices, pr.end));
      prevWeekExpenses = prevWeekExpenses.concat(filterRange(allExpenses, pr.start, pr.end));
      prevWeekReturns = prevWeekReturns.concat(filterRange(allReturns, pr.start, pr.end));
      prevWeekIncomes = prevWeekIncomes.concat(filterRange(allIncomes, pr.start, pr.end));
    }

    // ── Totals ──
    var totalSales = weekPaidAll.reduce(function(s, i) { return s + Number(i.total || 0); }, 0);
    var totalExpenses = weekExpenses.reduce(function(s, e) { return s + Number(e.amount || 0); }, 0);
    var totalReturns = weekReturns.reduce(function(s, r) { return s + Number(r.amount || 0); }, 0);
    var totalIncome = weekIncomes.reduce(function(s, i) { return s + Number(i.amount || 0); }, 0);
    var netProfit = totalSales + totalIncome - totalReturns - totalExpenses;

    var prevSales = prevPaidAll.reduce(function(s, i) { return s + Number(i.total || 0); }, 0);
    var prevExpenses = prevWeekExpenses.reduce(function(s, e) { return s + Number(e.amount || 0); }, 0);
    var prevReturns = prevWeekReturns.reduce(function(s, r) { return s + Number(r.amount || 0); }, 0);
    var prevIncome = prevWeekIncomes.reduce(function(s, i) { return s + Number(i.amount || 0); }, 0);
    var prevNetProfit = prevSales + prevIncome - prevReturns - prevExpenses;

    var totalItemsQty = 0;
    weekPaidAll.forEach(function(inv) { (inv.items || []).forEach(function(it) { totalItemsQty += Number(it.qty || 1); }); });

    var weekItemsMap = buildItemsMap(weekPaidAll);
    var weekProducts = Object.values(weekItemsMap).sort(function(a, b) { return b.revenue - a.revenue; });

    var endStr = localDateKey(weekDays[6].date);

    var cards = '<div class="card"><span>إجمالي المبيعات</span><b>' + fmtMoney(totalSales) + '</b>' + pctChange(totalSales, prevSales) + '</div>' +
      '<div class="card"><span>عدد الفواتير</span><b>' + weekPaidAll.length + '</b>' + pctChange(weekPaidAll.length, prevPaidAll.length) + '</div>' +
      '<div class="card"><span>المنتجات المباعة</span><b>' + totalItemsQty + '</b></div>' +
      '<div class="card"><span>المصروفات</span><b style="color:#dc2626">-' + fmtMoney(totalExpenses) + '</b>' + pctChange(totalExpenses, prevExpenses) + '</div>' +
      '<div class="card"><span>المرتجعات</span><b style="color:#dc2626">-' + fmtMoney(totalReturns) + '</b></div>' +
      '<div class="card"><span>أخرى (إيرادات)</span><b style="color:#059669">' + fmtMoney(totalIncome) + '</b></div>' +
      '<div class="card"><span>صافي الربح</span><b style="color:#059669">' + fmtMoney(netProfit) + '</b>' + pctChange(netProfit, prevNetProfit) + '</div>';

    var daysGrid = '<div class="week-days-grid">';
    for (var d = 0; d < 7; d++) {
      var ds = dayStatsArr[d];
      var noShift = !dayRanges[d].hasShift ? ' style="opacity:0.4"' : '';
      daysGrid += '<div class="week-day-card"' + noShift + '><h4>' + weekDays[d].label + '</h4><div class="day-sales">' + fmtMoney(ds.sales) + '</div><div class="day-invoices">' + ds.invoices + ' فاتورة | ' + ds.itemsQty + ' منتج</div></div>';
    }
    daysGrid += '</div>';

    var productsTable = '<div class="dr-empty">لا توجد منتجات مباعة هذا الأسبوع</div>';
    if (weekProducts.length) {
      var pRows = '';
      weekProducts.forEach(function(p) {
        var pct = totalSales > 0 ? (p.revenue / totalSales * 100).toFixed(1) : 0;
        pRows += '<tr><td>' + escapeHtml(p.name) + (p.hasMilk ? ' (+لبن)' : '') + '</td><td>' + p.qty + '</td><td>' + fmtMoney(p.revenue) + '</td><td>' + pct + '%</td></tr>';
      });
      productsTable = '<table class="dr-table"><thead><tr><th>المنتج</th><th>الكمية</th><th>الإيراد</th><th>النسبة</th></tr></thead><tbody>' + pRows + '</tbody></table>';
    }

    var html = '<div class="dr-header">' +
      '<img src="images/logo.png" alt="Laguna Dubai">' +
      '<h2>لاغونا دبي - كافيه ومطعم</h2>' +
      '<p>التقرير الأسبوعي — من ' + startStr + ' إلى ' + endStr + '</p>' +
    '</div>' +
    '<div class="dr-summary">' + cards + '</div>' +
    '<div class="dr-title">المبيعات يوم بيوم</div>' +
    daysGrid +
    '<div class="dr-title">المنتجات المباعة هذا الأسبوع</div>' +
    productsTable;

    weekReportEl.innerHTML = html;
  } catch (e) {
    console.error('[weekreport]', e);
    weekReportEl.innerHTML = '<div class="dr-empty" style="color:#dc2626">حدث خطأ أثناء تحميل التقرير: ' + escapeHtml(e.message || e) + '</div>';
  }
}

async function exportWeekReport(asImage) {
  var el = weekReportEl;
  if (!el || !el.innerHTML || el.innerHTML.indexOf('dr-header') === -1) return alert('اعرض الأسبوع أولاً قبل التحميل');
  if (!window.domtoimage) return alert('مكتبة التصدير لم تُحمّل — تأكد من الاتصال بالإنترنت ثم أعد المحاولة');

  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    var dataUrl = await domtoimage.toPng(el, { width: el.scrollWidth, height: el.scrollHeight, scale: 1.5, backgroundColor: '#ffffff', style: { margin: '0', boxShadow: 'none' } });
    var img = new Image();
    await new Promise(function(resolve, reject) { img.onload = resolve; img.onerror = function() { reject(new Error('فشل تجهيز الصورة')); }; img.src = dataUrl; });

    var pageW = img.width;
    var pageH = Math.round(img.width * (297 / 210));
    var numPages = Math.max(1, Math.ceil(img.height / pageH));
    var fileName = 'تقرير-أسبوعي-' + weekStartDate.value;

    var pages = [];
    for (var i = 0; i < numPages; i++) {
      var p = document.createElement('canvas');
      p.width = pageW; p.height = pageH;
      var pctx = p.getContext('2d');
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(0, 0, pageW, pageH);
      pctx.drawImage(img, 0, i * pageH, pageW, pageH, 0, 0, pageW, pageH);
      pages.push(p);
    }

    if (asImage) {
      pages.forEach(function(pg, idx) {
        var link = document.createElement('a');
        link.href = pg.toDataURL('image/jpeg', 0.9);
        link.download = fileName + (pages.length > 1 ? '-صفحة-' + (idx + 1) : '') + '.jpg';
        setTimeout(function() { link.click(); }, idx * 150);
      });
    } else {
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pages.forEach(function(pg, idx) {
        if (idx > 0) pdf.addPage();
        pdf.addImage(pg.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297);
      });
      pdf.save(fileName + '.pdf');
    }
  } catch (e) {
    console.error('[weekreport-export]', e);
    alert('حدث خطأ أثناء التحميل: ' + escapeHtml(e.message || e));
  }
}

document.getElementById('weekShowBtn').onclick = showWeekReport;
document.getElementById('weekPdfBtn').onclick = function() { exportWeekReport(false); };
document.getElementById('weekImgBtn').onclick = function() { exportWeekReport(true); };
setDefaultWeekStart();
showWeekReport();
