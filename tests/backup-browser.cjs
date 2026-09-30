const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { open } = require('./restaurant-browser.cjs');
const { validate } = require('../src/js/backup-core.js');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const f = await open(browser, 'settings'), p = f.page;
    await p.evaluate(() => {
      window.FIREBASE_CONFIG.projectId = 'lagunadubaicafe';
      firebase.firestore.FieldPath = { documentId: () => '__name__' };
      window.failBackup = false;
      const docs = Array.from({ length: 301 }, (_, i) => ({ id: 'INV-' + String(i).padStart(4, '0'), total: i, items: [{ name: 'صنف', qty: 1, price: i }] }));
      FB.getDb = () => ({ collection: name => {
        if (window.failBackup && name === 'products') throw new Error('backup read failed');
        let after = '', max = 300;
        const q = { orderBy: () => q, limit: n => { max = n; return q; }, startAfter: doc => { after = doc.id; return q; }, get: async options => {
          if (options.source !== 'server') throw new Error('Not a server read');
          const list = name === 'invoices' ? docs : [];
          return { docs: list.filter(row => row.id > after).slice(0, max).map(row => ({ id: row.id, data: () => row })) };
        } }; return q;
      } });
    });
    const downloadEvent = p.waitForEvent('download');
    await p.locator('#downloadBackup').click();
    const download = await downloadEvent;
    const buffer = await fs.readFile(await download.path()), backup = JSON.parse(buffer);
    assert.equal((await validate(backup)).total, 301);
    assert.equal(backup.payload.collections.invoices.length, 301);
    await p.locator('#validateBackup').setInputFiles({ name: 'test.json', mimeType: 'application/json', buffer });
    await p.waitForFunction(() => document.getElementById('backupStatus').textContent.includes('الملف سليم'));
    backup.payload.collections.invoices[0].fields.total.integerValue = '999';
    await p.locator('#validateBackup').setInputFiles({ name: 'tampered.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await p.waitForFunction(() => document.getElementById('backupStatus').textContent.includes('فشل فحص النسخة'));
    await p.evaluate(() => { window.failBackup = true; });
    await p.locator('#downloadBackup').click();
    await p.waitForFunction(() => document.getElementById('backupStatus').textContent.includes('لم تُنشأ نسخة مكتملة'));
    assert.equal(await p.locator('#backupDownloadLinks a').count(), 0);
    assert.equal(await p.locator('#downloadBackup').isDisabled(), false);
    assert.deepEqual(f.errors, []);
    console.log('PASS browser backup: 301 documents paginated; JSON downloaded/validated; corruption detected; read failure produces no partial file');
    await f.context.close();
    const report = await open(browser, 'reports');
    await report.page.evaluate(async () => { DB.shifts.getOpen = async () => ({ openedAt: '2026-09-01T12:00:00' }); await checkDayCloseStatus(); });
    assert((await report.page.locator('#reportShiftDetails').innerText()).includes('ممتد من يوم سابق'));
    assert.equal(await report.page.locator('#reportShiftDetails.shift-overdue').count(), 1);
    assert.deepEqual(report.errors, []);
    console.log('PASS old shift start/duration label'); await report.context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
