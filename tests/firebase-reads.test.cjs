const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync(require('node:path').join(__dirname, '../src/js/firebase-client.js'), 'utf8');
function fixture() {
  const reads = {}, versions = { products: 1, categories: 1 };
  const storage = { getItem: key => storage[key] || null, setItem: (key, value) => { storage[key] = value; }, removeItem: key => { delete storage[key]; } };
  let fail = false, price = 10;
  function page(uid = 'owner') {
    const auth = { currentUser: { uid }, onAuthStateChanged: callback => { setTimeout(() => callback(auth.currentUser), 0); return () => {}; } };
    const db = { collection: name => ({
      doc: id => ({
        get: async () => { reads.meta = (reads.meta || 0) + 1; await new Promise(resolve => setTimeout(resolve, 5)); return { exists: true, data: () => ({ versions: { ...versions } }) }; },
        set: async data => { if (id !== 'versions') throw new Error('clock skipped'); for (const key in data.versions) versions[key] = (versions[key] || 0) + 1; }
      }),
      orderBy: () => ({ get: async () => {
        reads[name] = (reads[name] || 0) + 1;
        await new Promise(resolve => setTimeout(resolve, 5));
        if (fail) throw new Error('network failed');
        return { forEach: callback => callback({ id: 'p1', data: () => ({ price }) }) };
      } })
    }) };
    const context = vm.createContext({ location: { pathname: '/menu.html' }, localStorage: storage, sessionStorage: storage, console: { warn() {} }, setInterval() {}, firebase: { apps: [], initializeApp: () => ({}), firestore: Object.assign(() => db, { FieldValue: { serverTimestamp: () => null, increment: () => 1 } }), auth: () => auth }, FIREBASE_CONFIG: { projectId: 'test-project' } });
    vm.runInContext(code + '\nthis.FB = FB;', context);
    return context.FB;
  }
  return { page, reads, storage, versions, fail: value => { fail = value; }, price: value => { price = value; } };
}
test('parallel consumers share one collection read and one versions read', async () => {
  const f = fixture(), fb = f.page();
  await Promise.all([fb.getCollection('products'), fb.getCollection('products'), fb.getCollection('categories')]);
  assert.equal(f.reads.products, 1);
  assert.equal(f.reads.categories, 1);
  assert.equal(f.reads.meta, 1);
});
test('navigation retains only public menu caches and checks versions before reuse', async () => {
  const f = fixture();
  await f.page().getCollection('products');
  f.storage.setItem('laguna_cache_employees', JSON.stringify({ data: ['private'] }));
  await f.page('cashier').getCollection('products');
  assert.equal(f.reads.products, 1);
  assert.equal(f.storage.getItem('laguna_cache_employees'), null);
  f.price(20); f.versions.products++;
  assert.equal((await f.page().getCollection('products'))[0].price, 20);
  assert.equal(f.reads.products, 2);
});
test('failed shared read can retry; fresh financial reads always hit server', async () => {
  const f = fixture(), fb = f.page(); f.fail(true);
  await assert.rejects(fb.getCollection('invoices'), /network failed/);
  f.fail(false);
  await fb.getCollection('invoices');
  await fb.getCollectionFresh('invoices');
  await fb.getCollectionFresh('invoices');
  assert.equal(f.reads.invoices, 4);
});
test('local product invalidation reloads the new price', async () => {
  const f = fixture(), fb = f.page();
  await fb.getCollection('products');
  f.price(30);
  await fb.invalidate('products');
  assert.equal((await fb.getCollection('products'))[0].price, 30);
  assert.equal(f.reads.products, 2);
});
test('a read finishing after invalidation cannot repopulate the old memo', async () => {
  const f = fixture(), fb = f.page();
  const pending = fb.getCollection('invoices');
  while (!f.reads.invoices) await new Promise(resolve => setTimeout(resolve, 1));
  await fb.invalidate('invoices');
  await pending;
  await fb.getCollection('invoices');
  assert.equal(f.reads.invoices, 2);
});
