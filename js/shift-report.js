(function (root) {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => Number(n || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 }) + ' ج.م';
  function html(shifts, invoices, payments, returns, products) {
    let output = '<section class="department-report"><h3>الشيفت الصباحي والمسائي</h3><p>التحصيلات تُنسب للشيفت الذي استلم الدفع؛ قيمة الفواتير تُنسب لشيفت إنشائها. الفواتير المدموجة لا تُحسب مرتين.</p>';
    for (const type of ['morning', 'evening']) {
      const sessions = shifts.filter(s => s.shiftType === type).sort((a, b) => new Date(a.openedAt) - new Date(b.openedAt));
      output += '<h4>' + (type === 'morning' ? 'الصباحي' : 'المسائي') + '</h4>';
      if (!sessions.length) { output += '<p>لا يوجد شيفت في الفترة المختارة</p>'; continue; }
      for (const shift of sessions) {
        const items = invoices.filter(i => i.shiftId === shift.id && !['merged', 'cancelled', 'returned', 'مرتجعة'].includes(i.status));
        const data = ShiftOps.summary(shift, invoices, returns, payments);
        const gross = items.reduce((sum, i) => sum + Number(i.total || 0), 0);
        output += '<details open><summary><b>' + esc(shift.openDate) + ' — ' + esc(shift.openedBy) + ' — ' + (shift.closedAt ? 'مغلق' : 'مفتوح') + '</b></summary>';
        output += '<p>البداية: ' + esc(shift.openedAt) + ' · الإغلاق: ' + esc(shift.closedAt || 'لم يُغلق بعد') + '</p>';
        output += '<p>قيمة الفواتير (مسددة + معلقة): <b>' + money(gross) + '</b> · الفواتير: ' + items.length + ' · المعلق: ' + money(data.pendingAmount) + '</p>';
        output += '<p>كاش محصل: ' + money(data.cashAmount) + ' · فيزا: ' + money(data.cardAmount) + ' · محفظة: ' + money(data.otherAmount) + ' · مرتجعات معتمدة: ' + money(data.totalReturns) + ' · مصروفات: ' + money(data.totalExpenses) + ' · إيرادات أخرى: ' + money(data.totalIncome) + '</p>';
        output += '<table class="dr-table"><thead><tr><th>الفاتورة</th><th>الكاشير</th><th>العميل</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead><tbody>';
        output += items.map(i => '<tr><td>' + esc(i.id) + '</td><td>' + esc(i.createdBy) + '</td><td>' + esc(i.customer) + '</td><td>' + money(i.total) + '</td><td>' + money(i.paid) + '</td><td>' + money(i.remaining) + '</td><td>' + esc(i.status) + '</td></tr>').join('');
        output += '</tbody></table>' + Catalog.reportHTML(items.filter(i => ['paid', 'مدفوعة'].includes(i.status)), products, returns.filter(r => r.shiftId === shift.id)) + '</details>';
      }
    }
    return output + '</section>';
  }
  root.ShiftReport = { html };
})(window);
