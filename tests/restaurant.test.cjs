const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const Catalog = require('../src/js/catalog.js');
const seedCode = fs.readFileSync(path.join(__dirname, '../src/js/restaurant-seed.js'), 'utf8');
function seedContext(extra = {}) {
  const context = { Catalog, ...extra, window: {} };
  vm.runInNewContext(seedCode, context);
  return context.window.RestaurantSeed;
}
const products = JSON.parse(JSON.stringify(seedContext().products()));
const pizza = products.find(p => p.id === 'restaurant-pizza-vegetable');

test('approved 44 products, prices and disabled unpriced sizes', () => {
  assert.equal(products.length, 44);
  assert.equal(new Set(products.map(p => p.id)).size, 44);
  assert.equal(new Set(products.map(p => p.category)).size, 8);
  assert.equal(Catalog.variant(pizza, 'medium').price, 125);
  assert.equal(Catalog.variant(pizza, 'large').price, 165);
  assert.equal(Catalog.variant(pizza, 'small'), null);
  assert.throws(() => Catalog.line(pizza, 'small'));
  assert.throws(() => Catalog.line(pizza, ''));
  assert.equal(products.find(p => p.id === 'restaurant-combo-meat-potato').price, 200);
  assert.equal(Catalog.variant(products.find(p => p.id === 'restaurant-offers-kids'), 'small').price, 150);
  assert.equal(Catalog.variant(products.find(p => p.id === 'restaurant-offers-family'), 'large').price, 400);
  products.forEach(p => {
    assert.equal(p.variants.length, 3);
    assert.equal(p.price, Catalog.variant(p, p.defaultVariantKey).price);
    assert(!JSON.stringify(p).includes('undefined'));
    assert(!p.variants.some(v => v.available && v.price === null));
  });
});

test('line snapshots preserve identity, price and size after catalog edits', () => {
  const source = structuredClone(pizza);
  const medium = Catalog.line(source, 'medium');
  const large = Catalog.line(source, 'large');
  assert.notEqual(Catalog.key(medium), Catalog.key(large));
  assert.notEqual(Catalog.key(medium), Catalog.key({ ...medium, productId: 'same-name-different-product' }));
  assert.notEqual(Catalog.key(medium), Catalog.key({ ...medium, price: 140 }));
  assert.notEqual(Catalog.key(medium), Catalog.key({ ...medium, note: 'بدون جبنة' }));
  source.name = 'renamed'; source.variants[1].price = 999;
  assert.equal(medium.price, 125);
  assert.equal(medium.name, 'بيتزا خضروات — Medium');
  assert.equal(medium.menuType, 'restaurant');
});

test('legacy cafe and missing/ambiguous historical names', () => {
  const cafe = { id: 'coffee', name: 'قهوة', price: 30, available: 1 };
  assert.equal(Catalog.line(cafe, '').price, 30);
  assert.equal(Catalog.line(cafe, '').menuType, 'cafe');
  assert.equal(Catalog.classify({ name: 'قهوة' }, [cafe]), 'cafe');
  assert.equal(Catalog.classify({ name: 'قهوة' }, [cafe, { ...cafe, id: 'other' }]), 'unknown');
  assert.equal(Catalog.classify({ name: 'منتج محذوف' }, []), 'unknown');
  assert.equal(Catalog.classify(Catalog.line(pizza, 'large'), []), 'restaurant');
});

test('mixed invoices reconcile service/tax/discount, free sales and cent rounding', () => {
  const items = [{ name: 'قهوة', menuType: 'cafe', qty: 1, price: 30 }, Catalog.line(pizza, 'medium')];
  for (const total of [155, 194.37, 116.25, 0, 0.01, 155.99]) {
    const inv = { total, items };
    assert.equal(Catalog.allocate(inv).reduce((a, b) => a + b, 0), Math.round(total * 100));
    const s = Catalog.summary([inv], products);
    assert.equal(s.cafe.cents + s.restaurant.cents + s.unknown.cents, Math.round(total * 100));
    assert.equal(s.restaurant.qty, 1);
    assert.equal(s.cafe.invoices, 1);
    assert.equal(s.restaurant.invoices, 1);
  }
  assert.deepEqual(Catalog.allocate({ total: 0.01, items: [{ qty: 1, price: 1 }, { qty: 1, price: 1 }] }), [1, 0]);
  assert.equal(Catalog.summary([{ total: 25, items: [] }], []).unknown.cents, 2500);
  const returns = [{ menuType: 'restaurant', status: 'pending', amount: 100 }, { menuType: 'restaurant', status: 'success', amount: 20 }];
  assert.equal(Catalog.summary([], [], returns).restaurant.returnCents, 2000);
});

test('report escapes product names and preserves size on cashier/kitchen printouts', () => {
  const item = Catalog.line(pizza, 'large');
  const report = Catalog.reportHTML([{ total: 165, items: [item, { name: '<img onerror=alert(1)>', qty: 0, price: 0 }] }], []);
  assert(report.includes('Large'));
  assert(!report.includes('<img onerror'));
  const context = { window: { location: { origin: 'https://laguna.test', pathname: '/menu.html' } }, console, TextEncoder, DB: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/js/sanitize.js'), 'utf8'), context);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/js/template-engine.js'), 'utf8'), context);
  const invoice = { id: 'test', date: '2026-09-29T12:00:00', total: 165, items: [item] };
  assert(context.window.TEMPLATE.renderCashier(invoice).includes('Large'));
  assert(context.window.TEMPLATE.renderKitchen(invoice).includes('Large'));
  const longItem = { ...item, baseName: 'اسم منتج طويل جدا لاختبار المقاس في الطباعة', name: 'اسم منتج طويل جدا لاختبار المقاس في الطباعة — Large' };
  const thermal = context.window.TEMPLATE.renderEscpos({ ...invoice, items: [longItem] }, null, 'cashier');
  assert(new TextDecoder().decode(thermal).includes('Large'));
});

test('restaurant import is atomic, idempotent and preserves edited products', async () => {
  const store = new Map();
  const existing = { ...pizza, name: 'اسم معدل', price: 999 };
  store.set('products/' + pizza.id, existing);
  let rejectCommit = true;
  const db = {
    collection: collection => ({ doc: id => ({ path: collection + '/' + id }) }),
    runTransaction: async callback => {
      const writes = [];
      const result = await callback({
        get: async ref => ({ exists: store.has(ref.path), data: () => store.get(ref.path) }),
        set: (ref, data) => writes.push([ref.path, data])
      });
      if (rejectCommit) throw new Error('permission-denied');
      writes.forEach(([key, value]) => store.set(key, value));
      return result;
    }
  };
  const api = seedContext({ FB: { ensure: async () => {}, getDb: () => db, invalidate: async () => {} }, firebase: { firestore: { FieldValue: { increment: n => n } } } });
  await assert.rejects(api.importMenu(), /permission-denied/);
  assert.equal(store.size, 1);
  rejectCommit = false;
  assert.equal(await api.importMenu(), 51);
  assert.equal(store.get('products/' + pizza.id).name, 'اسم معدل');
  const size = store.size;
  assert.equal(await api.importMenu(), 0);
  assert.equal(store.size, size);
  assert.equal(store.get('meta/versions').versions.products, 1);
});
