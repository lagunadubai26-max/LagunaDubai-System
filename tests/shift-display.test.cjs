const test = require('node:test');
const assert = require('node:assert/strict');
const { describe } = require('../src/js/shift-display.js');
test('shows actual start and duration of an eight-day abandoned shift', () => {
  const result = describe({ openedAt: '2026-09-21T15:00:00' }, new Date('2026-09-29T17:35:00'));
  assert(result.text.includes('8 يوم · 2 ساعة · 35 دقيقة'));
  assert(result.text.includes('ممتد من يوم سابق')); assert.equal(result.overdue, true);
});
test('crossing midnight is labelled even if fewer than 24 hours elapsed', () => {
  const result = describe({ openedAt: '2026-09-29T23:30:00' }, new Date('2026-09-30T00:10:00'));
  assert.equal(result.overdue, true); assert(result.text.includes('40 دقيقة'));
});
test('missing, malformed and future-date states remain readable', () => {
  assert(describe(null, new Date()).text.includes('لا يوجد'));
  assert(describe({ openedAt: 'invalid' }, new Date()).text.includes('غير متاح'));
  assert(describe({ openedAt: '2026-09-30T18:00:00' }, new Date('2026-09-30T17:00:00')).text.includes('0 ساعة · 0 دقيقة'));
});
