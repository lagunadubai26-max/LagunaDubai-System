// Run with Playwright available in NODE_PATH. All requests/Firestore writes are mocked.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.join(__dirname, '../src');
const seed = { window: {}, Catalog: require('../src/js/catalog.js') };
vm.runInNewContext(fs.readFileSync(root + '/js/restaurant-seed.js', 'utf8'), seed);
const products = JSON.parse(JSON.stringify(seed.window.RestaurantSeed.products()));
products.push({ id: 'coffee', name: 'قهوة', category: 'coffee', price: 30, available: true });
products.push({ id: 'water', name: 'مياه', category: 'coffee', price: 20, available: true, menuType: 'both', pricingMode: 'single' });
const categories = [...new Set(products.map(p => p.category))].map(slug => ({ id: slug, slug, name: slug, menuType: slug === 'coffee' ? 'cafe' : 'restaurant' }));

async function open(browser, name, width = 1440, exportLibraries = false) {
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  await context.addInitScript(({ products, categories }) => {
    sessionStorage.setItem('laguna_user', JSON.stringify({ name: 'Test', role: 'Administrator' }));
    window.localDateKey = value => { const d = new Date(value), pad = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    window.safeId = () => crypto.randomUUID();
    const date = new Date().toISOString(), day = window.localDateKey(new Date());
    const inv = { id: 'inv-test', status: 'paid', date, paidAt: date, customer: 'test', total: 155, paid: 155, customerType: 'regular', items: [
      { productId: 'coffee', name: 'قهوة', price: 30, qty: 1, menuType: 'cafe' },
      { productId: 'restaurant-pizza-vegetable', name: 'بيتزا خضروات — Medium', baseName: 'بيتزا خضروات', variantKey: 'medium', variantLabel: 'Medium', menuType: 'restaurant', category: 'restaurant-pizza', price: 125, qty: 1 }
    ] };
    window.store = { products, categories, invoices: [inv], shifts: [{ id: 'shift', openDate: day, openedAt: day + 'T00:00:00', closedAt: null, invoiceVersion: 0 }], tables_: [], settings: [], customers: [], returns: [], expenses: [], incomes: [], audit: [], daycloses: [] };
    window.saved = []; window.alerts = []; window.alert = t => window.alerts.push(t); window.confirm = () => true; window.FIREBASE_CONFIG = {};
    const snap = (col, row) => ({ id: row.id, exists: true, data: () => structuredClone(row), ref: { col, id: row.id } });
    const db = { collection: col => ({
      doc: id => ({ col, id }), orderBy: () => db.collection(col), where: () => db.collection(col), limit: () => db.collection(col),
      get: async () => { const docs = (window.store[col] || []).map(row => snap(col, row)); return { docs, empty: !docs.length, forEach: fn => docs.forEach(fn) }; }
    }), runTransaction: async fn => fn({
      get: async ref => { const row = (window.store[ref.col] || []).find(x => x.id === ref.id); return row ? snap(ref.col, row) : { exists: false }; },
      set: (ref, data) => { window.store[ref.col] ||= []; window.store[ref.col].push(structuredClone(data)); if (ref.col === 'invoices') window.saved.push(structuredClone(data)); },
      update: (ref, data) => Object.assign((window.store[ref.col] || []).find(x => x.id === ref.id), data)
    }) };
    db.batch = () => ({ update: (ref, data) => Object.assign(window.store[ref.col].find(x => x.id === ref.id), data), commit: async () => {} });
    window.firebase = { initializeApp: () => {}, firestore: () => db, auth: () => ({ signInAnonymously: async () => ({ user: { uid: 'test' } }) }) };
    window.FB = { ensure: async () => {}, getDb: () => db, getUid: () => 'test', clockNow: () => new Date(), nowISO: () => new Date().toISOString(), getCollectionFresh: async col => structuredClone(window.store[col] || []), invalidate: async () => {}, runTransaction: fn => db.runTransaction(fn), onCollection: async (col, fn) => { setTimeout(() => fn(window.store[col]), 10); return () => {}; } };
    window.DB = { seed: async () => {}, settings: { get: async () => ({ _svcMigrated: 2, enableService: false, enableTax: false }), save: async () => {} }, audit: { all: async () => [], log: async () => {} } };
    for (const col of ['products', 'categories', 'invoices', 'expenses', 'returns', 'incomes', 'customers', 'tables', 'daycloses', 'shifts']) {
      const key = col === 'tables' ? 'tables_' : col;
      window.DB[col] = { all: async () => structuredClone(window.store[key] || []), add: async data => { window.store[key].push(data); return data; }, update: async (id, data) => Object.assign(window.store[key].find(x => x.id === id), data), remove: async id => { window.store[key] = window.store[key].filter(x => x.id !== id); } };
    }
    window.DB.shifts.getOpen = async () => window.store.shifts[0]; window.DB.shifts.get = async () => window.store.shifts[0];
    window.Chart = class { destroy() {} };
    window.PRINTER = { restorePrinters: async () => {}, isConnected: () => true };
  }, { products, categories });
  const allowed = new Set(['catalog.js', 'restaurant-seed.js', 'menu.js', 'ipad-menu.js', 'products.js', 'invoices.js', 'daily-report.js', 'weekly-report.js', 'reports.js', 'sanitize.js', 'template-engine.js', 'report-export.js', 'shift-display.js', 'backup-core.js', 'backup-ui.js', 'dashboard.js']);
  if (exportLibraries) allowed.add('jspdf.umd.min.js');
  await context.route('**/*', async route => {
    const url = new URL(route.request().url()), rel = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (exportLibraries && url.hostname !== 'laguna.test') {
      if (url.pathname.includes('html2canvas-pro')) return route.fulfill({ body: fs.readFileSync(path.join(path.dirname(require.resolve('html2canvas-pro')), 'html2canvas-pro.min.js')), contentType: 'text/javascript' });
      if (url.pathname.includes('chart.js')) return route.fulfill({ body: fs.readFileSync(path.join(path.dirname(require.resolve('chart.js')), 'chart.umd.js')), contentType: 'text/javascript' });
    }
    if (url.hostname !== 'laguna.test' || (rel.startsWith('js/') && !allowed.has(path.basename(rel)))) return route.fulfill({ body: '', contentType: 'text/javascript' });
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ body: fs.readFileSync(file), contentType: rel.endsWith('.js') ? 'text/javascript' : rel.endsWith('.css') ? 'text/css' : rel.endsWith('.html') ? 'text/html' : 'image/png' });
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://laguna.test/' + name + '.html');
  await page.waitForTimeout(150);
  return { page, context, errors };
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await open(browser, 'menu'), p = desktop.page;
    await p.locator('[data-menu-type=restaurant]').click();
    const card = p.locator('[data-product-id=restaurant-pizza-vegetable]');
    await card.waitFor();
    assert(await card.locator('button').isDisabled()); assert.equal(await card.locator('option[value=small]').count(), 0);
    await card.locator('select').selectOption('medium'); await card.locator('button').click();
    await card.locator('select').selectOption('large'); await card.locator('button').click(); await card.locator('button').click();
    assert.deepEqual(await p.locator('.order-box .order-item .qty').allTextContents(), ['1', '2']);
    await p.locator('[data-menu-type=cafe]').click(); await p.locator('[data-product-id=coffee] button').click();
    await p.locator('.order-box .order-item').last().locator('.milk-toggle').click();
    await p.locator('.order-box .order-item').first().locator('.note-btn').click();
    await p.locator('.order-box .order-item').first().locator('.note-input').fill('بدون بصل');
    await p.locator('.order-box .checkout').click();
    const items = await p.evaluate(() => window._checkoutItems);
    assert.equal(items[0].note, 'بدون بصل'); assert.equal(items[2].price, 45);
    assert.equal(await p.evaluate(() => window._itemsTotal), 500);
    await p.locator('#checkoutPaid').fill('600'); await p.locator('#confirmCheckout').click(); await p.waitForTimeout(100);
    const saved = await p.evaluate(() => window.saved);
    assert.equal(saved.length, 1, await p.evaluate(() => window.alerts.join('\n')));
    assert.equal(saved[0].items[1].variantKey, 'large'); assert.equal(saved[0].paid, 500); assert.equal(saved[0].change, 100);
    assert.deepEqual(desktop.errors, []); console.log('PASS desktop checkout: mixed sizes, notes, milk, change'); await desktop.context.close();

    const ipad = await open(browser, 'ipad', 1280), t = ipad.page;
    await t.locator('[data-menu-type=restaurant]').click();
    const pizza = t.locator('[data-product-id=restaurant-pizza-vegetable]');
    await pizza.locator('select').selectOption('medium'); await pizza.locator('button').click();
    await pizza.locator('select').selectOption('large'); await pizza.locator('button').click();
    await t.locator('[data-menu-type=cafe]').click(); await t.locator('[data-product-id=coffee] button').click();
    await t.locator('#sidebarList .ipad-oi-milk').click(); await t.locator('#sidebarCheckout').click();
    await t.locator('#paidAmount').fill('500'); await t.locator('#confirmCheckout').click(); await t.waitForTimeout(100);
    const ti = await t.evaluate(() => window.saved);
    assert.equal(ti.length, 1, await t.evaluate(() => window.alerts.join('\n')));
    assert.equal(ti[0].items.length, 3); assert.equal(ti[0].total, 335); assert.equal(ti[0].paid, 335); assert.equal(ti[0].change, 165); assert.equal(ti[0].items[2].price, 45);
    assert.deepEqual(ipad.errors, []); console.log('PASS tablet checkout: mixed sizes, milk, change'); await ipad.context.close();

    const admin = await open(browser, 'products'), a = admin.page;
    await a.locator('[data-menu-type=restaurant]').click();
    assert.equal(await a.locator('#prodList .table-row').count(), 45);
    assert.equal(await a.locator('#importRestaurant').count(), 0);
    await a.locator('.edit-btn[data-id=restaurant-pizza-vegetable]').click();
    await a.locator('#sizeEnabled-small').check(); await a.locator('#sizePrice-small').fill('90');
    await a.locator('#prodDefaultVariant').selectOption('small'); await a.locator('#saveProd').click(); await a.waitForTimeout(100);
    const updated = await a.evaluate(() => window.store.products.find(p => p.id === 'restaurant-pizza-vegetable'));
    assert.equal(updated.price, 90); assert.equal(updated.variants[0].available, true); assert.equal(updated.variants[2].price, 165);
    await a.locator('.edit-btn[data-id=restaurant-pizza-vegetable]').click();
    await a.locator('#prodMenuType').selectOption('both'); await a.locator('#saveProd').click();
    await a.locator('[data-menu-type=cafe]').click();
    await a.locator('.edit-btn[data-id=restaurant-pizza-vegetable]').waitFor();
    const shared = await a.evaluate(() => window.store.products.find(p => p.id === 'restaurant-pizza-vegetable'));
    assert.equal(shared.menuType, 'both'); assert.equal(shared.variants[2].price, 165);
    assert.deepEqual(admin.errors, []); console.log('PASS product size activation and editing'); await admin.context.close();

    for (const name of ['daily-report', 'weekly-report', 'reports']) {
      const report = await open(browser, name);
      await report.page.waitForSelector('.department-report');
      const text = await report.page.locator('.department-report').innerText();
      assert(text.includes('المطعم') && text.includes('الكافيه') && text.includes('Medium'));
      assert.deepEqual(report.errors, []); console.log('PASS ' + name); await report.context.close();
    }
    const invoice = await open(browser, 'invoices'), i = invoice.page;
    await i.evaluate(() => openAddItemsModal(window.store.invoices[0])); await i.waitForTimeout(50);
    await i.locator('#addMenuTypes [data-menu-type=restaurant]').click();
    const add = i.locator('#addProductsGrid .add-prod-card').filter({ hasText: 'بيتزا خضروات' });
    await add.locator('select').selectOption('large'); await add.locator('button').click();
    await i.locator('#confirmAddItems').click(); await i.waitForTimeout(100);
    const changed = await i.evaluate(() => window.store.invoices[0]);
    assert.equal(changed.items.length, 3, await i.evaluate(() => window.alerts.join('\n')));
    assert.equal(changed.items[2].variantKey, 'large'); assert.equal(changed.total, 320);
    assert.deepEqual(invoice.errors, []); console.log('PASS adding sized items to an existing invoice'); await invoice.context.close();

    const mobile = await open(browser, 'menu', 375), m = mobile.page;
    await m.locator('[data-menu-type=restaurant]').click();
    const mc = m.locator('[data-product-id=restaurant-pizza-vegetable]');
    await mc.locator('select').selectOption('large'); await mc.locator('button').click();
    await m.locator('#cartFloat').click();
    await m.locator('#sheetOrderList .note-btn').click();
    await m.locator('#sheetOrderList .note-input').fill('بدون بصل');
    await m.locator('#sheetOrderList .plus').click();
    await m.locator('#sheetCheckout').click();
    assert.equal(await m.evaluate(() => window._checkoutItems[0].note), 'بدون بصل');
    assert.equal(await m.evaluate(() => window._checkoutItems[0].qty), 2);
    assert.deepEqual(mobile.errors, []);
    assert(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile page overflows');
    console.log('PASS 375px mobile cart and note sync'); await mobile.context.close();

    for (const name of ['menu', 'ipad']) {
      const shared = await open(browser, name, 1280), s = shared.page;
      await s.locator('[data-product-id=water] button').click();
      await s.locator('[data-menu-type=restaurant]').click();
      await s.locator('[data-product-id=water] button').click();
      const category = name === 'menu' ? '#menuCategories' : '#ipadCategories';
      assert.equal(await s.locator(category + ' [data-category=coffee]').count(), 1);
      await s.locator(name === 'menu' ? '.order-box .checkout' : '#sidebarCheckout').click();
      await s.locator(name === 'menu' ? '#checkoutPaid' : '#paidAmount').fill('40');
      await s.locator('#confirmCheckout').click(); await s.waitForTimeout(100);
      const invoice = await s.evaluate(() => window.saved[0]);
      assert.equal(invoice.total, 40); assert.deepEqual(invoice.items.map(it => it.menuType), ['cafe', 'restaurant']);
      assert.deepEqual(shared.errors, []); console.log('PASS shared product department snapshots: ' + name); await shared.context.close();
    }
  } finally { await browser.close(); }
}
module.exports = { open };
if (require.main === module) run().catch(e => { console.error(e); process.exitCode = 1; });
