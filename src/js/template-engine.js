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
    return '<div style="width:300px;margin:0 auto;font-family:\'Cairo\',\'Tahoma\',sans-serif;color:#16294a;background:#fff;padding:14px 12px;direction:rtl;">\n'
      + '<div style="text-align:center;margin-bottom:10px;">\n'
      + '<svg width="60" height="60" viewBox="0 0 100 100" style="display:block;margin:0 auto;">\n'
      + '<polygon points="50,10 45,35 42,70 40,88 60,88 58,70 55,35" fill="#c9a05a"/>\n'
      + '<path d="M15,78 Q50,95 85,78 Q50,88 15,78 Z" fill="#c9a05a"/>\n'
      + '<path d="M10,86 Q50,100 90,86 Q50,94 10,86 Z" fill="#c9a05a"/>\n'
      + '</svg>\n'
      + '<div style="font-size:20px;font-weight:900;color:#c9a05a;letter-spacing:1px;margin-top:4px;">LAGUNA DUBAI</div>\n'
      + '<div style="font-size:11px;color:#9a8a6a;">كافيه • مطعم</div>\n'
      + '</div>\n'
      + '<div style="border-top:1px dashed #c9a05a;margin:10px 0;"></div>\n'
      + '<div style="font-size:12px;line-height:1.9;">\n'
      + '<div style="display:flex;justify-content:space-between;"><span>رقم الفاتورة</span><span>#{id}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>التاريخ</span><span>{date}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>الطاولة</span><span>{table}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>العميل</span><span>{customer}</span></div>\n'
      + '</div>\n'
      + '<div style="border-top:1px dashed #c9a05a;margin:10px 0;"></div>\n'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:#9a8a6a;margin-bottom:6px;">\n'
      + '<span>الصنف</span><span>الكمية × السعر</span>\n'
      + '</div>\n'
      + '{items}\n'
      + '<div style="display:flex;align-items:flex-end;margin-bottom:7px;">\n'
      + '<span style="font-size:13px;font-weight:600;white-space:nowrap;">{name}</span>\n'
      + '<span style="flex:1;border-bottom:1px dotted #c9a05a;margin:0 5px 3px;"></span>\n'
      + '<span style="font-size:13px;white-space:nowrap;">{qty} × {total}</span>\n'
      + '</div>\n'
      + '{/items}\n'
      + '<div style="border-top:1px dashed #c9a05a;margin:10px 0;"></div>\n'
      + '<div style="font-size:12px;line-height:2;">\n'
      + '<div style="display:flex;justify-content:space-between;"><span>الإجمالي الفرعي</span><span>{subtotal}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>الضريبة</span><span>{taxAmount}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>الخدمة</span><span>{serviceAmount}</span></div>\n'
      + '</div>\n'
      + '<div style="background:#0b1c33;color:#fff;border-radius:8px;padding:10px 14px;margin:10px 0;display:flex;justify-content:space-between;align-items:center;">\n'
      + '<span style="font-size:14px;">الإجمالي الكلي</span>\n'
      + '<span style="font-size:20px;font-weight:900;color:#c9a05a;">{total}</span>\n'
      + '</div>\n'
      + '<div style="font-size:12px;line-height:2;">\n'
      + '<div style="display:flex;justify-content:space-between;"><span>طريقة الدفع</span><span>{paymentMethod}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>المدفوع</span><span>{paid}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>الباقي</span><span>{change}</span></div>\n'
      + '</div>\n'
      + '<div style="border-top:1px dashed #c9a05a;margin:12px 0 8px;"></div>\n'
      + '<div style="text-align:center;font-size:12px;color:#9a8a6a;">{footer}</div>\n'
      + '<div style="text-align:center;font-size:11px;color:#c9a05a;margin-top:4px;">شكراً لزيارتكم ✨</div>\n'
      + '<script>window.print();window.close();<\/script>\n'
      + '</div>';
  }

  function defaultKitchenTemplate() {
    return '<div style="width:300px;margin:0 auto;font-family:\'Cairo\',\'Tahoma\',sans-serif;color:#16294a;background:#fff;padding:14px 12px;direction:rtl;">\n'
      + '<div style="text-align:center;margin-bottom:6px;">\n'
      + '<div style="font-size:22px;font-weight:900;">أمر مطبخ</div>\n'
      + '</div>\n'
      + '<div style="border-top:2px solid #16294a;margin:8px 0;"></div>\n'
      + '<div style="font-size:14px;line-height:1.9;font-weight:700;">\n'
      + '<div style="display:flex;justify-content:space-between;"><span>طاولة</span><span>{table}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>رقم الطلب</span><span>#{id}</span></div>\n'
      + '<div style="display:flex;justify-content:space-between;"><span>الوقت</span><span>{date}</span></div>\n'
      + '</div>\n'
      + '<div style="border-top:2px dashed #16294a;margin:10px 0;"></div>\n'
      + '{items}\n'
      + '<div style="display:flex;align-items:center;margin-bottom:12px;border-bottom:1px dotted #ccc;padding-bottom:8px;">\n'
      + '<span style="font-size:20px;font-weight:900;min-width:34px;">{qty}×</span>\n'
      + '<span style="font-size:18px;font-weight:700;margin-right:6px;">{name}</span>\n'
      + '</div>\n'
      + '{/items}\n'
      + '<div style="border-top:2px solid #16294a;margin:14px 0 6px;"></div>\n'
      + '<div style="text-align:center;font-size:11px;color:#888;">{footer}</div>\n'
      + '<script>window.print();window.close();<\/script>\n'
      + '</div>';
  }

  function replaceVars(text, vars) {
    let r = text;
    for (const [key, val] of Object.entries(vars)) {
      r = r.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), val);
      r = r.replace(new RegExp('\\{' + key + '\\}', 'g'), val);
    }
    return r;
  }

  function renderItemsBlock(tpl, inv) {
    const start = tpl.indexOf('{items}');
    const end = tpl.indexOf('{/items}');
    if (start === -1 || end === -1) return tpl;

    const before = tpl.slice(0, start);
    const itemTpl = tpl.slice(start + 7, end);
    const after = tpl.slice(end + 8);

    let itemsHtml = '';
    if (inv.items) {
      inv.items.forEach(item => {
        const milkTxt = item.hasMilk ? ' +حليب' : '';
        const hasMilkHtml = item.hasMilk ? ' +حليب' : '';
        const safeNote = escape(item.note || '');
        let line = itemTpl;
        const itemVars = {
          name: escape(item.name) + milkTxt,
          qty: item.qty,
          price: item.price + ' ج.م',
          total: (item.qty * item.price) + ' ج.م',
          note: safeNote,
          hasMilk: item.hasMilk ? 'true' : 'false'
        };
        line = replaceVars(line, itemVars);
        itemsHtml += line;
      });
    }

    return before + itemsHtml + renderItemsBlock(after, inv);
  }

  function renderTemplate(tpl, inv, type) {
    const paid = inv.paid != null ? Number(inv.paid) : Number(inv.total || 0);
    const total = Number(inv.total || 0);
    const remaining = inv.remaining != null ? Number(inv.remaining) : Math.max(0, total - paid);
    const change = inv.change || 0;
    const subtotal = total - (inv.serviceAmount || 0) - (inv.taxAmount || 0);
    const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG');
    const status = remaining > 0 ? 'معلق' : 'مدفوع';
    const baseUrl = window.location.origin + '/LagunaDubai-System/';
    const logoHtml = '<img src="' + baseUrl + 'images/logo.png" id="logoImg" style="height:65px;margin-bottom:4px;background:#222;padding:6px;border-radius:8px" alt="LagunaDubai">';

    const commonVars = {
      logo: logoHtml,
      id: escape(inv.id || ''),
      date: dateStr,
      customer: escape(inv.customer || ''),
      table: escape(inv.table || ''),
      items: '',
      serviceAmount: inv.serviceAmount > 0 ? Number(inv.serviceAmount).toLocaleString() + ' ج.م' : '',
      taxAmount: inv.taxAmount > 0 ? Number(inv.taxAmount).toLocaleString() + ' ج.م' : '',
      subtotal: Number(subtotal).toLocaleString() + ' ج.م',
      total: Number(total).toLocaleString() + ' ج.م',
      paid: Number(paid).toLocaleString() + ' ج.م',
      change: change > 0 ? Number(change).toLocaleString() + ' ج.م' : '0 ج.م',
      remaining: remaining > 0 ? Number(remaining).toLocaleString() + ' ج.م' : '0 ج.م',
      paymentMethod: inv.paymentMethod || 'كاش',
      status: status,
      footer: 'شكراً لزيارتكم ☕'
    };

    if (type === 'cashier') {
      commonVars.title = '** فاتورة كاشير **';
    } else {
      commonVars.title = '** طلب مطبخ **';
      commonVars.table = escape(inv.table || '');
    }

    // First render the items block
    let result = renderItemsBlock(tpl, inv);
    // Then replace all remaining variables
    result = replaceVars(result, commonVars);
    // Clean up any unreplaced placeholders
    result = result.replace(/\{[^}]+\}/g, '');
    result = result.replace(/\{\{[^}]+\}\}/g, '');
    // Wrap in full HTML if not already (for proper @page CSS in thermal printing)
    if (!result.match(/<html/i)) {
      result = '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">'
        + '<style>@media print{@page{margin:0;size:58mm 300mm}}body{margin:0;padding:0}</style>'
        + '</head><body>' + result + '</body></html>';
    }
    return result;
  }

  function renderCashier(inv, templateStr) {
    const tpl = templateStr || defaultCashierTemplate();
    return renderTemplate(tpl, inv, 'cashier');
  }

  function renderKitchen(inv, templateStr) {
    const tpl = templateStr || defaultKitchenTemplate();
    return renderTemplate(tpl, inv, 'kitchen');
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
