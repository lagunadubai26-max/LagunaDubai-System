const test = require('node:test');
const assert = require('node:assert/strict');
const { summary } = require('../src/js/shift-ops.js');
test('morning invoice paid in evening keeps ownership while cash follows actual payment shift', () => {
  const morning = { id: 'm', shiftType: 'morning', openDate: '2026-10-02', expenseTotal: 5, incomeTotal: 2 };
  const evening = { id: 'e', shiftType: 'evening', openDate: '2026-10-02' };
  const invoices = [{ id: 'i', shiftId: 'm', status: 'paid', total: 100, paid: 100, remaining: 0, items: [{ qty: 2, price: 50 }] }];
  const payments = [{ invoiceId: 'i', shiftId: 'm', amount: 40, method: 'Cash' }, { invoiceId: 'i', shiftId: 'e', amount: 60, method: 'Visa' }];
  assert.equal(summary(morning, invoices, [], payments).totalSales, 100);
  assert.equal(summary(morning, invoices, [], payments).cashAmount, 40);
  assert.equal(summary(evening, invoices, [], payments).cardAmount, 60);
  assert.equal(summary(evening, invoices, [], payments).numInvoices, 0);
});
test('merged sources cannot inflate counts/sales and partial payments remain visible', () => {
  const shift = { id: 's' };
  const invoices = [
    { id: 'source1', shiftId: 's', total: 30, paid: 30, remaining: 0, status: 'merged' },
    { id: 'source2', shiftId: 's', total: 20, paid: 0, remaining: 20, status: 'merged' },
    { id: 'parent', shiftId: 's', total: 50, paid: 30, remaining: 20, status: 'pending' }
  ];
  const result = summary(shift, invoices, [], [{ shiftId: 's', invoiceId: 'source1', amount: 30, method: 'Cash' }]);
  assert.equal(result.numInvoices, 1); assert.equal(result.cashAmount, 30); assert.equal(result.pendingAmount, 20);
  assert.equal(result.totalSales, 0);
});
