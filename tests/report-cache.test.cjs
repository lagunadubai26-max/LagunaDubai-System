const { test } = require('node:test');
const assert = require('node:assert/strict');
const { create } = require('../src/js/report-cache.js');
function fixture() {
  let time = 1000000, reads = 0, user = { uid: 'manager', role: 'Administrator' }, fail = false;
  const map = new Map();
  const storage = { getItem: k => map.get(k) || null, setItem: (k, v) => map.set(k, v), removeItem: k => map.delete(k) };
  const options = { storage, now: () => time, authorize: async () => user, load: async () => {
    reads += 1000;
    if (fail) throw new Error('network failed');
    return Array.from({ length: 8 }, (_, index) => [{ id: index, total: reads }]);
  } };
  return { options, cache: () => create(options), reads: () => reads, tick: n => { time += n; }, user: value => { user = value; }, fail: () => { fail = true; }, invalidate: () => storage.removeItem('laguna_report_snapshot_v1') };
}
test('reopening reports in a new page instance reuses data instead of reading 1000 more documents', async () => {
  const f = fixture(), first = await f.cache().get();
  f.tick(30000);
  assert.deepEqual(await f.cache().get(), first);
  assert.equal(f.reads(), 1000);
});
test('TTL, explicit refresh and local mutation each fetch a new snapshot', async () => {
  const f = fixture(), cache = f.cache();
  await cache.get();
  f.tick(300000);
  await cache.get();
  assert.equal(f.reads(), 2000);
  await cache.get(true);
  assert.equal(f.reads(), 3000);
  f.invalidate();
  await cache.get();
  assert.equal(f.reads(), 4000);
});
test('simultaneous requests share one fetch and failed refresh never silently returns old data', async () => {
  const f = fixture(), cache = f.cache();
  await Promise.all([cache.get(), cache.get()]);
  assert.equal(f.reads(), 1000);
  f.fail();
  await assert.rejects(cache.get(true), /network failed/);
  await assert.rejects(cache.get(), /network failed/);
});
test('verified identity changes cannot reuse another account snapshot; cashier is denied', async () => {
  const f = fixture(), cache = f.cache();
  await cache.get();
  f.user({ uid: 'owner', role: 'Owner' });
  assert.equal((await cache.get()).uid, 'owner');
  assert.equal(f.reads(), 2000);
  f.user({ uid: 'owner', role: 'Cashier' });
  await assert.rejects(cache.get(), /التقارير/);
  assert.equal(f.reads(), 2000);
});
