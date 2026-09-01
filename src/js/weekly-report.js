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
  return sat.toISOString().slice(0, 10);
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
    var end = new Date(d);
    end.setHours(23, 59, 59, 999);
    days.push({ date: new Date(d), start: new Date(d), end: end, label: dayNames[i] });
  }
  return days;
}

function getPrevWeekStart(startStr) {
  var parts = startStr.split('-').map(Number);
  var d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
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

    var weekDays = getWeekDays(startStr);
    var prevStartStr = getPrevWeekStart(startStr);
    var prevDays = getWeekDays(prevStartStr);

    function filterRange(items, range) {
      return items.filter(function(it) {
        if (!it.date) return false;
        var d = new Date(it.date);
        return d >= range.start && d <= range.end;
      });
    }

    function calcDayStats(invs, exps, rets, incs) {
      var paid = invs.filter(function(i) { return i.status === 'paid' || i.status === 'مدفوعة'; });
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

    var weekInvoices = [];
    var weekExpenses = [];
    var weekReturns = [];
    var weekIncomes = [];
    var dayStatsArr = [];

    for (var i = 0; i < 7; i++) {
      var di = filterRange(allInvoices, weekDays[i]);
      var de = filterRange(allExpenses, weekDays[i]);
      var dr = filterRange(allReturns, weekDays[i]);
      var dn = filterRange(allIncomes, weekDays[i]);
      weekInvoices = weekInvoices.concat(di);
      weekExpenses = weekExpenses.concat(de);
      weekReturns = weekReturns.concat(dr);
      weekIncomes = weekIncomes.concat(dn);
      dayStatsArr.push(calcDayStats(di, de, dr, dn));
    }

    var prevWeekInvoices = [];
    var prevWeekExpenses = [];
    var prevWeekReturns = [];
    var prevWeekIncomes = [];
    for (var j = 0; j < 7; j++) {
      prevWeekInvoices = prevWeekInvoices.concat(filterRange(allInvoices, prevDays[j]));
      prevWeekExpenses = prevWeekExpenses.concat(filterRange(allExpenses, prevDays[j]));
      prevWeekReturns = prevWeekReturns.concat(filterRange(allReturns, prevDays[j]));
      prevWeekIncomes = prevWeekIncomes.concat(filterRange(allIncomes, prevDays[j]));
    }

    var weekPaid = weekInvoices.filter(function(i) { return i.status === 'paid' || i.status === 'مدفوعة'; });
    var prevPaid = prevWeekInvoices.filter(function(i) { return i.status === 'paid' || i.status === 'مدفوعة'; });

    var totalSales = weekPaid.reduce(function(s, i) { return s + Number(i.total || 0); }, 0);
    var totalExpenses = weekExpenses.reduce(function(s, e) { return s + Number(e.amount || 0); }, 0);
    var totalReturns = weekReturns.reduce(function(s, r) { return s + Number(r.amount || 0); }, 0);
    var totalIncome = weekIncomes.reduce(function(s, i) { return s + Number(i.amount || 0); }, 0);
    var netProfit = totalSales + totalIncome - totalReturns - totalExpenses;

    var prevSales = prevPaid.reduce(function(s, i) { return s + Number(i.total || 0); }, 0);
    var prevExpenses = prevWeekExpenses.reduce(function(s, e) { return s + Number(e.amount || 0); }, 0);
    var prevReturns = prevWeekReturns.reduce(function(s, r) { return s + Number(r.amount || 0); }, 0);
    var prevIncome = prevWeekIncomes.reduce(function(s, i) { return s + Number(i.amount || 0); }, 0);
    var prevNetProfit = prevSales + prevIncome - prevReturns - prevExpenses;

    var totalItemsQty = 0;
    weekPaid.forEach(function(inv) { (inv.items || []).forEach(function(it) { totalItemsQty += Number(it.qty || 1); }); });

    var weekItemsMap = buildItemsMap(weekPaid);
    var weekProducts = Object.values(weekItemsMap).sort(function(a, b) { return b.revenue - a.revenue; });

    var endStr = weekDays[6].date.toISOString().slice(0, 10);

    var cards = '<div class="card"><span>إجمالي المبيعات</span><b>' + fmtMoney(totalSales) + '</b>' + pctChange(totalSales, prevSales) + '</div>' +
      '<div class="card"><span>عدد الفواتير</span><b>' + weekPaid.length + '</b>' + pctChange(weekPaid.length, prevPaid.length) + '</div>' +
      '<div class="card"><span>المنتجات المباعة</span><b>' + totalItemsQty + '</b></div>' +
      '<div class="card"><span>المصروفات</span><b style="color:#dc2626">-' + fmtMoney(totalExpenses) + '</b>' + pctChange(totalExpenses, prevExpenses) + '</div>' +
      '<div class="card"><span>المرتجعات</span><b style="color:#dc2626">-' + fmtMoney(totalReturns) + '</b></div>' +
      '<div class="card"><span>أخرى (إيرادات)</span><b style="color:#059669">' + fmtMoney(totalIncome) + '</b></div>' +
      '<div class="card"><span>صافي الربح</span><b style="color:#059669">' + fmtMoney(netProfit) + '</b>' + pctChange(netProfit, prevNetProfit) + '</div>';

    var daysGrid = '<div class="week-days-grid">';
    for (var k = 0; k < 7; k++) {
      var ds = dayStatsArr[k];
      daysGrid += '<div class="week-day-card"><h4>' + weekDays[k].label + '</h4><div class="day-sales">' + fmtMoney(ds.sales) + '</div><div class="day-invoices">' + ds.invoices + ' فاتورة | ' + ds.itemsQty + ' منتج</div></div>';
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
