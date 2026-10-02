const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../src/js/data.js'), 'utf8');

function fixture(initial = {}) {
  const store = new Map(Object.entries(initial));
  let offline = false, failCommit = false, queue = Promise.resolve();
  const snap = ref => ({ id: ref.id, exists: store.has(ref.key), data: () => structuredClone(store.get(ref.key)) });
  const db = { collection: name => ({
    doc: id => { const ref = { id, key: name + '/' + id }; ref.get = async options => { assert.equal(options.source, 'server'); if (offline) throw new Error('offline'); return snap(ref); }; return ref; },
    where: () => ({ get: async options => { assert.equal(options.source, 'server'); if (offline) throw new Error('offline'); return { docs: [...store.entries()].filter(([key, data]) => key.startsWith(name + '/') && data.closedAt === null).map(([key]) => snap({ key, id: key.split('/')[1] })) }; } })
  }) };
  const FB = {
    requireStaff: async () => ({ uid: 'test', name: 'test', username: '12345678', role: 'Cashier', shiftType: 'morning' }),
    ensure: async () => { if (offline) throw new Error('offline'); }, getDb: () => db,
    getUid: () => 'test', clockNow: () => new Date('2026-09-30T18:00:00'), invalidate: async () => {},
    runTransaction: fn => {
      const result = queue.then(async () => {
        const writes = [];
        await fn({ get: async ref => snap(ref), set: (ref, data) => writes.push([ref.key, data]), update: (ref, data) => writes.push([ref.key, { ...store.get(ref.key), ...data }]) });
        if (offline || failCommit) throw new Error('commit failed');
        writes.forEach(([key, value]) => store.set(key, structuredClone(value)));
      });
      queue = result.catch(() => {}); return result;
    }
  };
  const context = vm.createContext({ FB, console, crypto: require('node:crypto').webcrypto });
  vm.runInContext(code + '\nthis.DB = DB;', context);
  return { DB: context.DB, store, offline: v => { offline = v; }, failCommit: v => { failCommit = v; } };
}
const oldShift = { id: 'old', shiftType: 'morning', openedBy: 'test', openDate: '2026-09-20', openedAt: '2026-09-20T15:00:00', closedAt: null, invoiceVersion: 5 };

test('ten-day-old shift remains open and blocks another shift until closed', async () => {
  const f = fixture({ 'shifts/old': oldShift, 'shift_state/current': { openShiftId: 'old' } });
  assert.equal((await f.DB.shifts.getOpen()).openDate, '2026-09-20');
  await assert.rejects(f.DB.shifts.open('cashier'), e => e.code === 'shift/already-open');
  await f.DB.shifts.closeDay('old', { date: oldShift.openDate, closedAt: '2026-09-30T18:00:00', closedBy: 'cashier', totalSales: 500 }, 5);
  assert.equal(f.store.get('daycloses/dc-old').date, '2026-09-20');
  assert.equal(f.store.get('daycloses/dc-old').totalSales, 500);
  assert.equal(await f.DB.shifts.getOpen(), null);
  const next = await f.DB.shifts.open('cashier');
  assert.equal(next.openDate, '2026-09-30');
});

test('two devices opening concurrently create exactly one open shift', async () => {
  const f = fixture();
  const results = await Promise.allSettled([f.DB.shifts.open('A'), f.DB.shifts.open('B')]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal([...f.store.keys()].filter(k => k.startsWith('shifts/')).length, 1);
});

test('failed close saves neither snapshot nor closure; network retry succeeds', async () => {
  const f = fixture({ 'shifts/old': oldShift, 'shift_state/current': { openShiftId: 'old' } });
  f.failCommit(true);
  const data = { date: oldShift.openDate, closedAt: '2026-09-30T18:00:00', closedBy: 'test', totalSales: 500 };
  await assert.rejects(f.DB.shifts.closeDay('old', data, 5));
  assert.equal(f.store.has('daycloses/dc-old'), false);
  assert.equal(f.store.get('shifts/old').closedAt, null);
  f.failCommit(false); f.offline(true);
  await assert.rejects(f.DB.shifts.getOpen(), /offline/);
  f.offline(false);
  await f.DB.shifts.closeDay('old', data, 5);
  await assert.rejects(f.DB.shifts.closeDay('old', data, 5), e => e.code === 'shift/already-closed');
  assert.equal([...f.store.keys()].filter(k => k.startsWith('daycloses/')).length, 1);
});

test('invoice arriving after summary blocks closure without losing invoices', async () => {
  const f = fixture({ 'shifts/old': oldShift, 'shift_state/current': { openShiftId: 'old' } });
  await assert.rejects(f.DB.shifts.closeDay('old', { closedAt: '2026-09-30T18:00:00', closedBy: 'test' }, 4), e => e.code === 'shift/data-changed');
  assert.equal(f.store.has('daycloses/dc-old'), false);
  assert.equal(f.store.get('shifts/old').closedAt, null);
});

test('missing or stale state pointer still finds the existing open shift', async () => {
  for (const state of [{ openShiftId: null }, { openShiftId: 'deleted' }]) {
    const f = fixture({ 'shifts/old': oldShift, 'shift_state/current': state });
    assert.equal((await f.DB.shifts.getOpen()).id, 'old');
    await assert.rejects(f.DB.shifts.open('test'), e => e.code === 'shift/already-open');
  }
});

test('Firebase concurrent reads await authentication and failed auth can retry', async () => {
  let calls = 0, fail = true;
  const auth = { currentUser: null, onAuthStateChanged: callback => { setTimeout(() => callback(auth.currentUser), 0); return () => {}; }, signInAnonymously: async () => {
    calls++; await new Promise(resolve => setTimeout(resolve, 10));
    if (fail) throw new Error('network unavailable');
    auth.currentUser = { uid: 'test' }; return { user: auth.currentUser };
  } };
  let reads = 0;
  const db = { collection: () => ({ orderBy: () => ({ get: async () => { assert(auth.currentUser); reads++; return { forEach: () => {} }; } }), doc: () => ({ set: async () => { throw new Error('clock skipped'); } }) }) };
  const context = vm.createContext({ location: { pathname: '/ipad.html' }, localStorage: {}, console: { warn: () => {} }, setInterval: () => {}, firebase: { apps: [], initializeApp: () => ({}), firestore: Object.assign(() => db, { FieldValue: { serverTimestamp: () => null } }), auth: () => auth }, FIREBASE_CONFIG: {} });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/firebase-client.js'), 'utf8') + '\nthis.FB = FB;', context);
  const results = await Promise.allSettled([context.FB.getCollection('invoices'), context.FB.getCollection('shifts')]);
  assert(results.every(r => r.status === 'rejected')); assert.equal(calls, 1); assert.equal(reads, 0);
  fail = false;
  await Promise.all([context.FB.getCollection('invoices'), context.FB.getCollection('shifts')]);
  assert.equal(calls, 2); assert.equal(reads, 2);
});
