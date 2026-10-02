const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const firebase = require('firebase/compat/app'); require('firebase/compat/firestore');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { setDoc, doc, getDocs, collection } = require('firebase/firestore');
const code = fs.readFileSync(path.join(__dirname, '../src/js/data.js'), 'utf8');
(async () => {
  const projectId = 'demo-laguna-transactions';
  const env = await initializeTestEnvironment({ projectId, firestore: { rules: fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8') } });
  const apps = [];
  try {
    const profiles = [
      { uid: 'morning', name: 'الصباحي', username: '12345678', role: 'Cashier', shiftType: 'morning', enabled: true },
      { uid: 'evening', name: 'المسائي', username: '22345678', role: 'Cashier', shiftType: 'evening', enabled: true },
      { uid: 'owner', name: 'المالك', username: '32345678', role: 'Owner', shiftType: '', enabled: true }
    ];
    await env.withSecurityRulesDisabled(async ctx => {
      const seedDb = ctx.firestore();
      for (const profile of profiles) await setDoc(doc(seedDb, 'user_mappings', profile.uid), profile);
      await setDoc(doc(seedDb, 'shift_state/current'), { openShiftId: null });
    });
    function client(profile) {
      const app = firebase.initializeApp({ projectId }, profile.uid); apps.push(app);
      const db = app.firestore(); db.useEmulator('127.0.0.1', 8080, { mockUserToken: { sub: profile.uid, user_id: profile.uid, firebase: { sign_in_provider: 'password' } } });
      const FB = { ensure: async () => {}, requireStaff: async () => profile, getUid: () => profile.uid, getDb: () => db, clockNow: () => new Date('2026-10-02T10:00:00'), nowISO: () => '2026-10-02T10:00:00', invalidate: async () => {}, removeDoc: (name, id) => db.collection(name).doc(id).delete(), runTransaction: fn => db.runTransaction(tx => fn({
        get: ref => tx.get(ref), delete: ref => tx.delete(ref), set: (ref, data) => tx.set(ref, JSON.parse(JSON.stringify(data))), update: (ref, data) => tx.update(ref, JSON.parse(JSON.stringify(data)))
      })), getCollectionFresh: async name => (await db.collection(name).get({ source: 'server' })).docs.map(s => ({ id: s.id, ...s.data() })) };
      const context = vm.createContext({ FB, console, crypto: require('node:crypto').webcrypto, sessionStorage: { getItem: () => JSON.stringify(profile) } });
      vm.runInContext(code + '\nthis.DB = DB;', context);
      return { DB: context.DB, db };
    }
    const m = client(profiles[0]), e = client(profiles[1]), o = client(profiles[2]);
    const results = await Promise.allSettled([m.DB.shifts.open('الصباحي'), e.DB.shifts.open('المسائي')]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1, results.map(r => r.reason?.message || 'success').join('\n'));
    const opened = results.find(r => r.status === 'fulfilled').value;
    const active = opened.shiftType === 'morning' ? m : e;
    const actor = opened.shiftType === 'morning' ? profiles[0] : profiles[1];
    const invoiceId = 'actual-invoice';
    const invoice = { id: invoiceId, items: [{ name: 'قهوة', qty: 1, price: 100 }], total: 100, paid: 0, remaining: 100, status: 'pending', shiftId: opened.id, shiftType: opened.shiftType, createdByUid: actor.uid, createdBy: actor.name };
    await active.db.runTransaction(async tx => {
      const ref = active.db.collection('shifts').doc(opened.id), snap = await tx.get(ref);
      tx.set(active.db.collection('invoices').doc(invoiceId), invoice); tx.update(ref, { invoiceVersion: snap.data().invoiceVersion + 1 });
    });
    const pays = await Promise.allSettled([active.DB.invoices.update(invoiceId, { paid: 40, remaining: 60, status: 'pending', paymentMethod: 'Cash' }, 0), active.DB.invoices.update(invoiceId, { paid: 40, remaining: 60, status: 'pending', paymentMethod: 'Cash' }, 0)]);
    assert.equal(pays.filter(r => r.status === 'fulfilled').length, 1, 'Only one concurrent payment should succeed');
    const snapshot = await active.DB.shifts.get(opened.id);
    await o.DB.expenses.add({ amount: 5, description: 'test', date: '2026-10-02T10:00:00' });
    assert.equal((await active.DB.shifts.get(opened.id)).expenseTotal, 5);
    await assert.rejects(active.DB.shifts.closeDay(opened.id, { closedAt: '2026-10-02T10:00:00', closedBy: actor.name }, snapshot.invoiceVersion));
    const updated = await active.DB.shifts.get(opened.id);
    await active.DB.shifts.closeDay(opened.id, { date: opened.openDate, totalSales: 0, cashAmount: 40, closedAt: '2026-10-02T10:00:00', closedBy: actor.name }, updated.invoiceVersion);
    const other = opened.shiftType === 'morning' ? e : m;
    const next = await other.DB.shifts.open('التالي');
    await other.DB.invoices.update(invoiceId, { paid: 100, remaining: 0, status: 'paid', paymentMethod: 'Visa', paidAt: '2026-10-02T10:00:00' }, 40);
    const payments = (await o.db.collection('invoice_payments').get()).docs.map(d => d.data());
    assert.equal(payments.reduce((s, p) => s + p.amount, 0), 100);
    assert.equal(payments.find(p => p.shiftId === next.id).amount, 60);
    assert.equal((await o.db.collection('invoices').doc(invoiceId).get()).data().createdByUid, actor.uid);
    await assert.rejects(other.DB.invoices.remove(invoiceId));
    console.log('PASS real application transactions: concurrent opening; one payment only; expense aggregation/version conflict; handover and late payment; cashier delete denied');
  } finally { await Promise.all(apps.map(app => app.delete())); await env.cleanup(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
