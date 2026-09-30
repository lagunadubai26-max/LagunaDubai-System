const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { open } = require('./restaurant-browser.cjs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const f = await open(browser, 'reports');
    const p = f.page;
    await p.evaluate(async () => {
      window.originalInvoices = DB.invoices.all;
      DB.invoices.all = async () => { throw new Error('network unavailable'); };
      await render();
    });
    await p.waitForSelector('#retryReport');
    await p.evaluate(() => { DB.invoices.all = window.originalInvoices; });
    await p.locator('#retryReport').click();
    await p.waitForFunction(() => document.getElementById('reportLoadError').hidden);
    await p.evaluate(async () => {
      window.originalOpen = DB.shifts.getOpen;
      DB.shifts.getOpen = async () => { throw new Error('offline'); };
      await checkDayCloseStatus();
    });
    await p.locator('#dayCloseBtn').click();
    assert.equal(await p.locator('#dayCloseModal.show').count(), 0);
    assert.equal(await p.evaluate(() => window.alerts.length), 0, 'Retry should not invoke shift action');
    await p.evaluate(() => { DB.shifts.getOpen = window.originalOpen; });
    await p.locator('#dayCloseBtn').click();
    assert((await p.locator('#dayCloseBtn').innerText()).includes('غلق الشيفت'));
    await p.locator('#dayCloseBtn').click();
    await p.waitForSelector('#dayCloseModal.show');
    assert.deepEqual(f.errors, []);
    console.log('PASS report retry and shift retry recover from network failure');
    await f.context.close();
    const daily = await open(browser, 'daily-report');
    await daily.page.evaluate(async () => {
      DB.shifts.all = async () => { throw new Error('shift network failed'); };
      await showDayReport();
    });
    assert((await daily.page.locator('#dayReport').innerText()).includes('shift network failed'));
    assert(!(await daily.page.locator('#dayReport').innerText()).includes('لا يوجد شيفت'));
    console.log('PASS daily report does not mistake failed shift reads for missing shifts');
    await daily.context.close();
    const tablet = await open(browser, 'ipad', 1280), t = tablet.page;
    await t.evaluate(() => { window.store.shifts = []; });
    await t.locator('[data-product-id=coffee] button').click();
    await t.locator('#sidebarCheckout').click();
    await t.locator('#confirmCheckout').click();
    await t.waitForFunction(() => window.alerts.some(text => text.includes('لا يوجد شيفت مفتوح')));
    assert.equal(await t.evaluate(() => window.saved.length), 0);
    assert.equal(await t.locator('#checkoutLoading').isVisible(), false);
    assert.deepEqual(tablet.errors, []);
    console.log('PASS tablet blocks invoices without a shift and restores checkout');
    await tablet.context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
