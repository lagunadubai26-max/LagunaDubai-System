// Real renderer and PDF serialization; database and network are fixture-backed.
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { open } = require('./restaurant-browser.cjs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const name of ['daily-report', 'weekly-report', 'reports']) {
      const fixture = await open(browser, name, 1280, true), p = fixture.page;
      const report = name === 'daily-report' ? '#dayReport' : name === 'weekly-report' ? '#weekReport' : '#monthlyReport';
      const pdfButton = name === 'daily-report' ? '#dayReportPdfBtn' : name === 'weekly-report' ? '#weekPdfBtn' : '#monthlyPdfBtn';
      const imageButton = name === 'daily-report' ? '#dayReportImgBtn' : name === 'weekly-report' ? '#weekImgBtn' : '#monthlyImgBtn';
      await p.waitForSelector('.department-report');
      await p.evaluate(async () => {
        window.store.invoices[0].items.push({ name: 'زيادة ماء', qty: 128, price: 1 }, { name: 'اسموزي مانجو', qty: 6, price: 50 });
        window.store.invoices[0].total += 428;
        if (typeof showDayReport === 'function') await showDayReport();
        else if (typeof showWeekReport === 'function') await showWeekReport();
        else await render();
      });
      assert(!(await p.locator('.department-report').innerText()).includes('غير مصنف'));
      await p.evaluate(selector => {
        const el = document.querySelector(selector);
        const table = document.createElement('table');
        table.innerHTML = '<tbody>' + Array.from({ length: 85 }, (_, i) => '<tr><td style="padding:12px">صف المنتج للاختبار ' + i + '</td><td>125 ج.م</td></tr>').join('') + '</tbody>';
        el.appendChild(table);
        const graph = document.createElement('canvas'); graph.width = 400; graph.height = 150;
        const ctx = graph.getContext('2d'); ctx.fillStyle = '#e00000'; ctx.fillRect(0, 0, 400, 150);
        el.appendChild(graph);
        window.renderedPages = [];
        const render = window.html2canvas;
        window.html2canvas = async (...args) => {
          const c = await render(...args), pixels = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          let ink = 0, red = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i] < 180 && pixels[i + 1] < 180 && pixels[i + 2] < 180 && pixels[i + 3]) ink++;
            if (pixels[i] > 180 && pixels[i + 1] < 50 && pixels[i + 2] < 50) red++;
          }
          window.renderedPages.push({ ink, red, height: c.height, width: c.width });
          return c;
        };
      }, report);
      const logoBefore = await p.locator(report + ' img').first().getAttribute('src');
      const pending = p.waitForEvent('download').catch(async e => { throw new Error(e.message + '\n' + JSON.stringify(await p.evaluate(() => ({ alerts: window.alerts, pages: window.renderedPages, renderer: typeof window.html2canvas, pdf: typeof window.jspdf }))) + '\n' + fixture.errors.join('\n')); });
      await p.locator(pdfButton).click();
      const download = await pending;
      const pdf = await PDFDocument.load(await fs.readFile(await download.path()));
      const pages = await p.evaluate(() => window.renderedPages);
      assert(pdf.getPageCount() > 2); assert.equal(pdf.getPageCount(), pages.length);
      assert(pages.every(page => page.ink > 100 && page.height <= 2050), 'Blank or unbounded page');
      assert(pages.some(page => page.red > 1000), 'Canvas graph missing from PDF');
      assert.equal(await p.locator('.report-export-copy').count(), 0);
      assert.equal(await p.locator(report + ' img').first().getAttribute('src'), logoBefore);
      assert(!(await p.locator(pdfButton).isDisabled()));
      await p.locator(imageButton).click();
      await p.waitForSelector('#reportImageDownloads a');
      assert.equal(await p.locator('#reportImageDownloads a').count(), pages.length);
      const imagePending = p.waitForEvent('download');
      await p.locator('#reportImageDownloads a').first().click();
      const image = await imagePending, data = await fs.readFile(await image.path());
      assert.equal(data[0], 0xff); assert.equal(data[1], 0xd8);
      await p.locator('#reportImageDownloads button').click();
      // Failure restores controls and removes only the export copy.
      await p.evaluate(() => { window.html2canvas = async () => { throw new Error('test capture failure'); }; });
      await p.locator(pdfButton).click();
      await p.waitForFunction(() => window.alerts.some(t => t.includes('test capture failure')));
      assert(!(await p.locator(pdfButton).isDisabled()));
      assert.equal(await p.locator('.report-export-copy').count(), 0);
      assert.deepEqual(fixture.errors, []);
      console.log('PASS ' + name + ': legacy cafe classification; ' + pages.length + ' nonblank PDF/JPG pages; canvas charts; error recovery');
      await fixture.context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
