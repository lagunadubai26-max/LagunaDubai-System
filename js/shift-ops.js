(function (root) {
  function summary(shift, invoices, returns, payments = []) {
    const all = invoices.filter(i => i.shiftId === shift.id && !['merged', 'cancelled', 'returned', 'مرتجعة'].includes(i.status));
    const paid = all.filter(i => ['paid', 'مدفوعة'].includes(i.status));
    const collected = i => Math.min(Number(i.total || 0), Number(i.paid || 0));
    const shiftPayments = payments.filter(p => p.shiftId === shift.id);
    const cash = shiftPayments.filter(p => ['Cash', 'كاش'].includes(p.method)).reduce((s, p) => s + Number(p.amount || 0), 0);
    const card = shiftPayments.filter(p => ['Visa', 'Card', 'فيزا', 'شبكة'].includes(p.method)).reduce((s, p) => s + Number(p.amount || 0), 0);
    const wallet = shiftPayments.filter(p => ['Wallet', 'محفظة'].includes(p.method)).reduce((s, p) => s + Number(p.amount || 0), 0);
    const totalSales = paid.reduce((s, i) => s + Number(i.total || 0), 0);
    const totalReturns = returns.filter(r => r.shiftId === shift.id && r.status === 'success').reduce((s, r) => s + Number(r.amount || 0), 0);
    const workersCost = all.filter(i => i.customerType === 'workers').reduce((s, i) => s + Number(i.itemsValue || 0), 0);
    return { date: shift.openDate, totalSales, numInvoices: all.length, cashAmount: cash, cardAmount: card, otherAmount: wallet,
      itemsSold: paid.reduce((s, i) => s + (i.items || []).reduce((n, it) => n + Number(it.qty || 0), 0), 0),
      totalExpenses: Number(shift.expenseTotal || 0), totalIncome: Number(shift.incomeTotal || 0), totalReturns, workersCost,
      pendingAmount: all.reduce((s, i) => s + Number(i.remaining || 0), 0),
      netProfit: totalSales + Number(shift.incomeTotal || 0) - Number(shift.expenseTotal || 0) - totalReturns - workersCost };
  }
  async function fresh(shiftId) {
    const shift = await DB.shifts.get(shiftId);
    if (!shift || shift.closedAt != null) throw new Error('تم إغلاق الشيفت بالفعل');
    const [invoices, returns, payments] = await Promise.all([FB.getCollectionFresh('invoices'), FB.getCollectionFresh('returns'), FB.getCollectionFresh('invoice_payments')]);
    return { shift, data: summary(shift, invoices, returns, payments) };
  }
  root.ShiftOps = { summary, fresh };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ShiftOps;
})(typeof window !== 'undefined' ? window : globalThis);
