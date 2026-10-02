const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { open } = require('./restaurant-browser.cjs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const f = await open(browser, 'menu'), p = f.page;
    await p.evaluate(() => {
      window.store.customer_orders = [{ id: 'guest-safe', _uid: 'guest', status: 'new', table: '', items: [{ productId: 'coffee', menuType: 'cafe', qty: 2, price: 0, note: 'بدون سكر' }] }];
      window.store.shift_state = [{ id: 'current', openShiftId: 'shift' }];
      const db = FB.getDb(), original = db.collection;
      db.collection = name => {
        const ref = original(name);
        if (name === 'customer_orders') {
          ref.where = () => ref;
          ref.onSnapshot = callback => { const docs = window.store.customer_orders.map(row => ({ id: row.id, data: () => row, ref: {} })); callback({ docs, size: docs.length }); return () => {}; };
        }
        return ref;
      };
    });
    await p.addScriptTag({ content: fs.readFileSync(path.join(__dirname, '../src/js/customer-orders.js'), 'utf8') });
    await p.waitForSelector('#customerOrderInbox .confirm-btn');
    await p.locator('#customerOrderInbox .confirm-btn').click();
    await p.waitForFunction(() => window.saved.length === 1);
    const invoice = await p.evaluate(() => window.saved[0]);
    assert.equal(invoice.total, 60, 'Customer-supplied price must be ignored');
    assert.equal(invoice.paid, 0); assert.equal(invoice.remaining, 60); assert.equal(invoice.status, 'pending');
    assert.equal(invoice.createdByUid, 'test'); assert.equal(invoice.shiftType, 'morning');
    await p.locator('#customerOrderInbox .confirm-btn').evaluate(btn => { btn.disabled = false; btn.click(); });
    await p.waitForTimeout(100);
    assert.equal(await p.evaluate(() => window.saved.length), 1, 'Approval retry must not duplicate invoice');
    assert.deepEqual(f.errors, []);
    console.log('PASS customer approval: authoritative catalog price; pending only; shift/actor stamped; duplicate approval harmless');
    await f.context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
