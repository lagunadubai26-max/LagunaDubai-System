const test = require('node:test');
const assert = require('node:assert/strict');
const { pageRanges } = require('../src/js/report-export.js');

test('export keeps rows and charts together without gaps or duplicated content', () => {
  const ranges = pageRanges(3500, 1200, [{ top: 1150, bottom: 1220 }, { top: 2240, bottom: 2580 }]);
  assert.deepEqual(ranges, [{ start: 0, height: 1150 }, { start: 1150, height: 1090 }, { start: 2240, height: 1200 }, { start: 3440, height: 60 }]);
});
test('very long reports use bounded canvases, oversized blocks still progress', () => {
  const ranges = pageRanges(65000, 1200, [{ top: 1100, bottom: 4100 }]);
  assert(ranges.every(r => r.height > 0 && r.height <= 1200));
  assert.equal(ranges.reduce((n, r) => n + r.height, 0), 65000);
  ranges.forEach((r, i) => { if (i) assert.equal(r.start, ranges[i - 1].start + ranges[i - 1].height); });
});
