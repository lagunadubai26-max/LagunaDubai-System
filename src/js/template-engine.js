window.TEMPLATE = (() => {
  const PLACEHOLDERS = {
    cashier: [
      'logo', 'title', 'id', 'date', 'customer', 'table',
      'items', 'serviceAmount', 'taxAmount', 'total', 'paid',
      'change', 'remaining', 'paymentMethod', 'status', 'footer'
    ],
    kitchen: [
      'logo', 'title', 'id', 'date', 'table', 'items', 'footer'
    ]
  };

  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildItemsHtml(inv, type) {
    if (!inv.items || !inv.items.length) return '';
    if (type === 'kitchen') {
      return inv.items.map(item => {
        const safeName = escape(item.name);
        const milkTxt = item.hasMilk ? ' +حليب' : '';
        const safeNote = escape(item.note || '');
        const noteTxt = safeNote ? '<br><small>' + safeNote + '</small>' : '';
        return '<div class="kitchen-item">'
          + '<span class="item-name">' + safeName + milkTxt + noteTxt + '</span>'
          + '<span class="item-qty">×' + item.qty + '</span>'
          + '</div>';
      }).join('');
    }
    return inv.items.map(item => {
      const safeName = escape(item.name);
      const milkTxt = item.hasMilk ? ' +حليب' : '';
      const safeNote = escape(item.note || '');
      const noteTxt = safeNote ? '<br><small>' + safeNote + '</small>' : '';
      return '<tr>'
        + '<td class="item-name">' + safeName + milkTxt + noteTxt + '</td>'
        + '<td>' + item.qty + '</td>'
        + '<td>' + item.price + ' ج.م</td>'
        + '<td>' + (item.qty * item.price) + ' ج.م</td>'
        + '</tr>';
    }).join('');
  }

  function buildItemsPlain(inv) {
    if (!inv.items || !inv.items.length) return '';
    return inv.items.map(item => {
      const milkTxt = item.hasMilk ? ' +حليب' : '';
      const noteTxt = item.note ? ' (' + item.note + ')' : '';
      return '\n\u2022 ' + item.name + milkTxt + noteTxt + ' x' + item.qty + ' = ' + (item.qty * item.price) + ' ج.م';
    }).join('');
  }

  function defaultCashierTemplate() {
    return '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>فاتورة {{id}}</title><style>\n'
      + '*{margin:0;padding:0;box-sizing:border-box}\n'
      + 'body{font-family:\'Courier New\',monospace;font-size:12px;padding:8px;color:#000}\n'
      + '.header{text-align:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed #000}\n'
      + '.header .logo{font-size:20px;font-weight:700;margin-bottom:4px}\n'
      + '.header h2{font-size:14px;font-weight:700;margin-bottom:2px}\n'
      + '.header p{font-size:11px;color:#555}\n'
      + '.receipt-table{width:100%;border-collapse:collapse;margin:6px 0;font-size:11px}\n'
      + '.receipt-table th,.receipt-table td{padding:3px 2px;text-align:center}\n'
      + '.receipt-table th{border-bottom:1px solid #000}\n'
      + '.receipt-table td{border-bottom:1px dotted #ccc}\n'
      + '.receipt-table .item-name{text-align:right}\n'
      + '.summary{margin:6px 0;padding:4px 0}\n'
      + '.summary .dashed{border-top:1px dashed #000;margin-bottom:4px}\n'
      + '.summary .line{display:flex;justify-content:space-between;font-size:11px;padding:1px 0}\n'
      + '.summary .total{font-size:15px;font-weight:700;border-top:2px solid #000;padding-top:4px;margin-top:4px}\n'
      + '.footer{text-align:center;margin-top:8px;padding-top:6px;border-top:1px dashed #000;font-size:10px;color:#555}\n'
      + '@media print{@page{margin:0;size:58mm 300mm}}\n'
      + '</style></head><body>\n'
      + '<div class="header">{{logo}}<div style="font-size:14px;font-weight:700;margin-bottom:4px">LagunaDubai</div><h2>{{title}}</h2><p>{{date}}</p><p>{{customer}}{{table}}</p><p style="font-size:10px">#{{id}}</p></div>\n'
      + '<table class="receipt-table"><thead><tr><th class="item-name">الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>{{items}}</tbody></table>\n'
      + '<div class="summary"><div class="dashed"></div>{{serviceAmount}}{{taxAmount}}<div class="line"><span>الإجمالي</span><span>{{total}} ج.م</span></div>\n'
      + '<div class="line"><span>المدفوع</span><span>{{paid}} ج.م</span></div>{{change}}{{remaining}}\n'
      + '<div class="line total"><span>{{status}}</span><span>{{paymentMethod}}</span></div></div>\n'
      + '<div class="footer">{{footer}}</div>\n'
      + '<script>document.getElementById(\'logoImg\').onload=function(){window.print();window.close()};setTimeout(function(){window.print();window.close()},3000);<\/script></body></html>';
  }

  function defaultKitchenTemplate() {
    return '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>طلب مطبخ {{id}}</title><style>\n'
      + '*{margin:0;padding:0;box-sizing:border-box}\n'
      + 'body{font-family:\'Courier New\',monospace;font-size:14px;padding:8px;color:#000}\n'
      + '.header{text-align:center;margin-bottom:8px;padding-bottom:6px;border-bottom:2px dashed #d97706}\n'
      + '.header h2{font-size:18px;font-weight:700;margin-bottom:2px;color:#d97706}\n'
      + '.header p{font-size:12px;color:#555}\n'
      + '.kitchen-item{display:flex;justify-content:space-between;padding:6px 4px;border-bottom:1px dashed #ddd;font-size:15px}\n'
      + '.kitchen-item .item-name{font-weight:700}\n'
      + '.kitchen-item .item-qty{font-weight:700;color:#d97706}\n'
      + '.footer{text-align:center;margin-top:12px;padding-top:8px;border-top:2px dashed #d97706;font-size:11px;color:#555}\n'
      + '.divider{text-align:center;color:#d97706;margin:6px 0;font-weight:700}\n'
      + '@media print{@page{margin:0;size:58mm 300mm}}\n'
      + '</style></head><body>\n'
      + '<div class="header"><h2>{{title}}</h2><p>{{date}}</p><p>{{table}}</p><p style="font-size:11px">#{{id}}</p></div>\n'
      + '<div class="divider">—————— المطلوب ——————</div>\n'
      + '{{items}}\n'
      + '<div class="footer">{{footer}}<br>🍳 المطبخ</div>\n'
      + '<script>window.print();window.close();<\/script></body></html>';
  }

  function renderCashier(inv, templateStr) {
    const tpl = templateStr || defaultCashierTemplate();
    const paid = inv.paid != null ? inv.paid : inv.total;
    const remaining = inv.remaining != null ? inv.remaining : Math.max(0, (inv.total || 0) - paid);
    const change = inv.change || 0;
    const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG');
    const status = remaining > 0 ? 'معلق' : 'مدفوع';
    const baseUrl = window.location.origin + '/LagunaDubai-System/';
    const logoHtml = '<img src="' + baseUrl + 'images/logo.png" id="logoImg" style="height:65px;margin-bottom:4px;background:#222;padding:6px;border-radius:8px" alt="LagunaDubai">';

    const vars = {
      logo: logoHtml,
      title: '** فاتورة كاشير **',
      id: escape(inv.id || ''),
      date: dateStr,
      customer: escape(inv.customer || ''),
      table: inv.table ? ' | ' + escape(inv.table) : '',
      items: buildItemsHtml(inv, 'cashier'),
      serviceAmount: inv.serviceAmount > 0
        ? '<div class="line"><span>خدمة الضيافة</span><span>' + Number(inv.serviceAmount).toLocaleString() + ' ج.م</span></div>'
        : '',
      taxAmount: inv.taxAmount > 0
        ? '<div class="line"><span>ضريبة القيمة المضافة</span><span>' + Number(inv.taxAmount).toLocaleString() + ' ج.م</span></div>'
        : '',
      total: Number(inv.total || 0).toLocaleString(),
      paid: Number(paid).toLocaleString(),
      change: change > 0
        ? '<div class="line" style="color:#059669"><span>الباقي للعميل</span><span>' + Number(change).toLocaleString() + ' ج.م</span></div>'
        : '',
      remaining: remaining > 0
        ? '<div class="line" style="color:#dc2626"><span>المتبقي</span><span>' + Number(remaining).toLocaleString() + ' ج.م</span></div>'
        : '',
      paymentMethod: inv.paymentMethod || 'كاش',
      status: status,
      footer: 'شكراً لزيارتكم<br>☕ LagunaDubai'
    };

    let result = tpl;
    for (const [key, val] of Object.entries(vars)) {
      result = result.replace(new RegExp('{{' + key + '}}', 'g'), val);
    }
    return result;
  }

  function renderKitchen(inv, templateStr) {
    const tpl = templateStr || defaultKitchenTemplate();
    const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG');
    const baseUrl = window.location.origin + '/LagunaDubai-System/';
    const logoHtml = '<img src="' + baseUrl + 'images/logo.png" style="height:50px;margin-bottom:4px;background:#222;padding:6px;border-radius:8px" alt="LagunaDubai">';

    const vars = {
      logo: logoHtml,
      title: '** طلب مطبخ **',
      id: escape(inv.id || ''),
      date: dateStr,
      table: inv.table || '',
      items: buildItemsHtml(inv, 'kitchen'),
      footer: ''
    };

    let result = tpl;
    for (const [key, val] of Object.entries(vars)) {
      result = result.replace(new RegExp('{{' + key + '}}', 'g'), val);
    }
    return result;
  }

  // ===== ESCPOS Template =====
  const ESCPOS_CMD = {
    init: [0x1B, 0x40],
    center: [0x1B, 0x61, 0x01],
    left: [0x1B, 0x61, 0x00],
    boldOn: [0x1B, 0x45, 0x01],
    boldOff: [0x1B, 0x45, 0x00],
    sizeNormal: [0x1B, 0x21, 0x00],
    sizeDoubleH: [0x1B, 0x21, 0x10],
    sizeDoubleW: [0x1B, 0x21, 0x20],
    sizeDouble: [0x1B, 0x21, 0x30],
    cut: [0x1D, 0x56, 0x00],
    drawer: [0x1B, 0x70, 0x00, 0x19, 0xFA],
    newline: [0x0A]
  };

  function escposBytes(...bytes) { return new Uint8Array(bytes.flat()); }

  function concatUint8(arrays) {
    let len = 0;
    arrays.forEach(a => len += a.length);
    const r = new Uint8Array(len);
    let off = 0;
    arrays.forEach(a => { r.set(a, off); off += a.length; });
    return r;
  }

  function textEncoder(s) {
    return new TextEncoder().encode(s + '\n');
  }

  function defaultEscposCashier() {
    return '{init}{center}{size=double}☕ LagunaDubai\n{size=normal}{bold}** فاتورة كاشير **\n{bold=off}{left}\n{date}\n#{id}\n{customer}{table}\n---\n{items:name:qty:total}\n---\n{subtotal}\n{serviceAmount}\n{taxAmount}\n{bold}{total}\n{bold=off}{paid}\n{change}\n{remaining}\n{paymentMethod}\n---\n{footer}\n{cut}';
  }

  function defaultEscposKitchen() {
    return '{init}{center}{size=double}☕ LagunaDubai\n{size=normal}{bold}** طلب مطبخ **\n{bold=off}\n{date}\n#{id}\n{table}\n---\n{items:name:qty}\n---\n{cut}';
  }

  function renderEscpos(inv, templateStr, type) {
    const tpl = templateStr || (type === 'cashier' ? defaultEscposCashier() : defaultEscposKitchen());
    const paid = inv.paid != null ? Number(inv.paid) : Number(inv.total || 0);
    const total = Number(inv.total || 0);
    const remaining = inv.remaining != null ? Number(inv.remaining) : Math.max(0, total - paid);
    const change = inv.change || 0;
    const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-SA') : new Date().toLocaleString('ar-SA');
    const status = remaining > 0 ? 'معلق' : 'مدفوع';
    const maxLen = 32;

    const vars = {
      date: dateStr,
      id: inv.id || '',
      customer: inv.customer || '',
      table: inv.table || '',
      total: 'الإجمالي:  ' + total.toLocaleString() + ' ج.م',
      paid: 'المدفوع:   ' + paid.toLocaleString() + ' ج.م',
      change: change > 0 ? 'الباقي للعميل: ' + change.toLocaleString() + ' ج.م' : '',
      remaining: remaining > 0 ? 'المتبقي:  ' + remaining.toLocaleString() + ' ج.م' : '',
      serviceAmount: inv.serviceAmount > 0 ? 'خدمة:      ' + Number(inv.serviceAmount).toLocaleString() + ' ج.م' : '',
      taxAmount: inv.taxAmount > 0 ? 'ضريبة:     ' + Number(inv.taxAmount).toLocaleString() + ' ج.م' : '',
      subtotal: 'المجموع:   ' + (total - (inv.serviceAmount || 0) - (inv.taxAmount || 0)).toLocaleString() + ' ج.م',
      paymentMethod: (inv.paymentMethod || 'كاش') + '    ' + status,
      footer: 'شكراً لزيارتكم\nLagunaDubai',
      status: status
    };

    const lines = tpl.split('\n');
    const parts = [];

    for (let line of lines) {
      // Handle commands
      if (line.startsWith('{init}')) { parts.push(escposBytes(ESCPOS_CMD.init)); continue; }
      if (line.startsWith('{center}')) { parts.push(escposBytes(ESCPOS_CMD.center)); continue; }
      if (line.startsWith('{left}')) { parts.push(escposBytes(ESCPOS_CMD.left)); continue; }
      if (line.startsWith('{bold=off}') || line.startsWith('{boldoff}')) { parts.push(escposBytes(ESCPOS_CMD.boldOff)); continue; }
      if (line.startsWith('{bold}') || line.startsWith('{bold=on}')) { parts.push(escposBytes(ESCPOS_CMD.boldOn)); continue; }
      if (line.startsWith('{size=double}') || line.startsWith('{size=2}')) { parts.push(escposBytes(ESCPOS_CMD.sizeDouble)); continue; }
      if (line.startsWith('{size=normal}') || line.startsWith('{size=1}')) { parts.push(escposBytes(ESCPOS_CMD.sizeNormal)); continue; }
      if (line.startsWith('{cut}')) { parts.push(escposBytes(ESCPOS_CMD.cut)); continue; }
      if (line.startsWith('{drawer}') || line.startsWith('{cashdrawer}')) { parts.push(escposBytes(ESCPOS_CMD.drawer)); continue; }
      if (line.startsWith('---')) { parts.push(textEncoder('------------------------------')); continue; }
      if (line.startsWith('{items:')) {
        const match = line.match(/\{items:([^}]+)\}/);
        if (!match || !inv.items) continue;
        const cols = match[1].split(':');
        inv.items.forEach(item => {
          const milkTxt = item.hasMilk ? ' +حليب' : '';
          const noteTxt = item.note ? ' (' + item.note + ')' : '';
          let buf = '';
          if (cols.length === 3) {
            const name = ('\u2022 ' + item.name + milkTxt).substring(0, maxLen - 8);
            const qty = '' + item.qty + 'x';
            const total_price = '' + (item.qty * item.price);
            const padded = name.padEnd(maxLen - qty.length - total_price.length) + qty + total_price;
            buf = padded;
          } else {
            buf = '\u2022 ' + item.name + milkTxt + noteTxt;
          }
          parts.push(textEncoder(buf));
          if (item.note) parts.push(textEncoder('  ' + item.note));
        });
        continue;
      }

      // Replace variables
      let text = line;
      for (const [key, val] of Object.entries(vars)) {
        if (val) {
          const re = new RegExp('\\{' + key + '\\}', 'g');
          text = text.replace(re, val);
        }
      }
      text = text.replace(/\{empty\}/g, '').replace(/\{spacer\}/g, ' ');

      if (text.trim() || text === '') {
        parts.push(textEncoder(text));
      }
    }

    return concatUint8(parts);
  }

  async function getTemplate(type) {
    try {
      const settings = await DB.settings.get();
      if (type === 'cashier') return settings.invoiceTemplateCashier || null;
      if (type === 'kitchen') return settings.invoiceTemplateKitchen || null;
    } catch {}
    return null;
  }

  async function getEscposTemplate(type) {
    try {
      const settings = await DB.settings.get();
      if (type === 'cashier') return settings.escposTemplateCashier || null;
      if (type === 'kitchen') return settings.escposTemplateKitchen || null;
    } catch {}
    return null;
  }

  return {
    renderCashier,
    renderKitchen,
    renderEscpos,
    getTemplate,
    getEscposTemplate,
    defaultCashierTemplate: defaultCashierTemplate(),
    defaultKitchenTemplate: defaultKitchenTemplate(),
    defaultEscposCashier: defaultEscposCashier(),
    defaultEscposKitchen: defaultEscposKitchen(),
    PLACEHOLDERS
  };
})();
