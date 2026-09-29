/* One export path for daily, weekly and monthly reports. */
(function (root) {
  'use strict';
  let busy = false;
  let imageUrls = [];
  function clearImages() {
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    imageUrls = [];
    const panel = document.getElementById('reportImageDownloads');
    if (panel) panel.remove();
  }
  function pageRanges(height, pageHeight, blocks) {
    const pages = [];
    let start = 0;
    while (start < height) {
      let end = Math.min(height, start + pageHeight);
      // Keep table rows, headings with the next line, and charts on one page.
      let changed = true;
      while (changed) {
        changed = false;
        for (const block of blocks) {
          if (block.top > start && block.top < end && block.bottom > end && block.bottom - block.top <= pageHeight) {
            end = block.top; changed = true;
          }
        }
      }
      end = Math.max(start + 1, Math.floor(end));
      pages.push({ start, height: end - start });
      start = end;
    }
    return pages;
  }
  async function prepare(element) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const copy = element.cloneNode(true);
    copy.classList.add('report-export-copy');
    copy.style.cssText = 'position:absolute;left:-10000px;top:0;width:960px;max-width:none;margin:0;padding:20px;box-sizing:border-box;height:auto;max-height:none;overflow:visible;background:#fff;color:#292524;direction:rtl;';
    const canvases = element.querySelectorAll('canvas');
    copy.querySelectorAll('canvas').forEach((canvas, i) => {
      const source = canvases[i];
      const chart = root.Chart && root.Chart.getChart && root.Chart.getChart(source);
      if (chart) chart.update('none');
      const image = document.createElement('img');
      image.src = source.toDataURL('image/png');
      image.alt = source.getAttribute('aria-label') || 'رسم بياني';
      image.style.cssText = 'display:block;width:100%;height:auto;max-width:100%;';
      canvas.replaceWith(image);
    });
    const style = document.createElement('style');
    style.textContent = '.report-export-copy *{animation:none!important;transition:none!important;box-shadow:none!important}' +
      '.report-export-copy .report-cards,.report-export-copy .dr-summary{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}' +
      '.report-export-copy .report-charts,.report-export-copy .report-charts-three{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important}' +
      '.report-export-copy .chart-card{min-width:0!important;height:auto!important}' +
      '.report-export-copy table{width:100%!important;table-layout:fixed;direction:rtl}' +
      '.report-export-copy td,.report-export-copy th{overflow-wrap:anywhere;white-space:normal!important}' +
      '.report-export-copy .week-days-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}';
    copy.appendChild(style);
    document.body.appendChild(copy);
    try {
      await Promise.all(Array.from(copy.querySelectorAll('img')).map(async image => {
        try { await image.decode(); }
        catch (_) { const fallback = document.createElement('span'); fallback.textContent = image.alt || 'Laguna Dubai'; image.replaceWith(fallback); }
      }));
      return copy;
    } catch (e) { copy.remove(); throw e; }
  }
  function showImages(files) {
    const panel = document.createElement('section');
    panel.id = 'reportImageDownloads';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'صور التقرير');
    panel.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;max-width:500px;margin:auto;max-height:60vh;overflow:auto;z-index:10000;background:#fff;color:#292524;border:2px solid #78350f;border-radius:12px;padding:20px;direction:rtl';
    const title = document.createElement('h3'); title.textContent = 'صور التقرير جاهزة — حمّل كل صفحة'; panel.appendChild(title);
    files.forEach((file, index) => {
      const link = document.createElement('a');
      link.href = file.url; link.download = file.name;
      link.textContent = 'تحميل الصورة — صفحة ' + (index + 1);
      link.style.cssText = 'display:block;padding:12px;color:#78350f;text-decoration:underline;min-height:44px';
      panel.appendChild(link);
    });
    const close = document.createElement('button'); close.type = 'button'; close.textContent = 'إغلاق'; close.style.cssText = 'padding:12px;min-height:44px'; close.onclick = clearImages;
    panel.appendChild(close); document.body.appendChild(panel);
    if (files.length === 1) panel.querySelector('a').click();
    else panel.querySelector('a').focus();
  }
  async function download(options) {
    if (busy) return;
    if (!root.html2canvas || (!options.asImage && !(root.jspdf && root.jspdf.jsPDF))) throw new Error('تعذر تحميل مكتبة التصدير. حدّث الصفحة وأعد المحاولة');
    if (!options.element || !options.element.textContent.trim()) throw new Error('اعرض التقرير أولًا');
    busy = true;
    const buttons = (options.buttons || []).filter(Boolean).map(el => ({ el, html: el.innerHTML, disabled: el.disabled }));
    buttons.forEach(b => { b.el.disabled = true; b.el.textContent = 'جاري تجهيز التقرير…'; });
    let copy;
    const files = [];
    try {
      clearImages();
      copy = await prepare(options.element);
      const rect = copy.getBoundingClientRect();
      const width = Math.ceil(rect.width), pageHeight = Math.floor(width * 270 / 190);
      const blocks = Array.from(copy.querySelectorAll('tr,.chart-card,.stat-card,.card,.week-day-card,h2,h3,h4,.dr-title')).map(el => {
        const r = el.getBoundingClientRect();
        return { top: Math.floor(r.top - rect.top), bottom: Math.ceil(r.bottom - rect.top + (/^H[234]$/.test(el.tagName) || el.classList.contains('dr-title') ? 40 : 0)) };
      });
      const ranges = pageRanges(Math.ceil(copy.scrollHeight), pageHeight, blocks);
      const pdf = options.asImage ? null : new root.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      for (let i = 0; i < ranges.length; i++) {
        buttons.forEach(b => { b.el.textContent = 'جاري التصدير ' + (i + 1) + ' / ' + ranges.length; });
        const range = ranges[i];
        // Render only one page at a time: avoids browser maximum canvas height
        // and preserves charts without SVG/foreignObject rendering.
        const canvas = await root.html2canvas(copy, { width, height: range.height, y: range.start, scale: 1.5, useCORS: true, allowTaint: false, foreignObjectRendering: false, backgroundColor: '#fff', logging: false, windowWidth: 1280, windowHeight: 1024, scrollX: 0, scrollY: 0 });
        if (pdf) {
          if (i) pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 10, 10, 190, range.height * 190 / width);
          pdf.setFontSize(9); pdf.setTextColor(90);
          pdf.text((i + 1) + ' / ' + ranges.length, 105, 290, { align: 'center' });
        } else {
          const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('فشل تجهيز صورة التقرير')), 'image/jpeg', 0.94));
          const url = URL.createObjectURL(blob); imageUrls.push(url);
          files.push({ url, name: options.fileName + (ranges.length > 1 ? '-صفحة-' + (i + 1) : '') + '.jpg' });
        }
        canvas.width = 0; canvas.height = 0;
      }
      if (pdf) pdf.save(options.fileName + '.pdf');
      else showImages(files);
    } catch (e) { clearImages(); throw e; }
    finally {
      if (copy) copy.remove();
      buttons.forEach(b => { b.el.innerHTML = b.html; b.el.disabled = b.disabled; });
      busy = false;
    }
  }
  root.ReportExport = { download, pageRanges };
  if (typeof module !== 'undefined' && module.exports) module.exports = { pageRanges };
}(typeof window !== 'undefined' ? window : this));
