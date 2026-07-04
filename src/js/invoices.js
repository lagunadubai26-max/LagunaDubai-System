let invoices = [];
const searchInput = document.querySelector('.filter-box input');
const statusSelect = document.querySelector('.filter-box select');
const tableBody = document.querySelector('.invoice-table');

async function render() {
  invoices = await DB.invoices.all() || [];

  const existing = tableBody.querySelectorAll('.invoice-row');
  existing.forEach(r => r.remove());

  const val = searchInput ? searchInput.value.toLowerCase() : '';
  const filterStatus = statusSelect ? statusSelect.value : 'كل الحالات';

  const filtered = invoices.filter(inv => {
    if (!inv || !inv.id || typeof inv.id !== 'string' || !inv.customer) { console.warn('[invoices] skipped malformed:', inv); return false; }
    const matchSearch = inv.id.toLowerCase().includes(val) || inv.customer.toLowerCase().includes(val);
    const st = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const matchStatus = filterStatus === 'كل الحالات' || st === filterStatus;
    return matchSearch && matchStatus;
  });

  filtered.forEach(inv => {
    const row = document.createElement('div');
    row.className = 'invoice-row';
    const stCls = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'paid' : inv.status === 'pending' || inv.status === 'معلقة' ? 'pending' : 'cancelled';
    const stTxt = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const dateStr = inv.date ? new Date(inv.date).toLocaleDateString('ar-EG') : '—';
    const paid = inv.paid ?? inv.total;
    const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
    const safeCustomer = escapeHtml(inv.customer || '');
    const safeTable = escapeHtml(inv.table || '');
    const safeId = escapeHtml(inv.id);
    row.innerHTML = `
      <span>${safeId}</span><span>${safeCustomer}</span><span>${dateStr}</span>
      <span>${safeTable}</span>
      <span>${Number(inv.total).toLocaleString()} ج.م</span>
      <span style="font-size:12px;color:${remaining > 0 ? '#dc2626' : '#059669'}">${remaining > 0 ? 'باقي ' + Number(remaining).toLocaleString() : 'مدفوع كامل'}</span>
      <span class="${stCls}">${stTxt}</span>
      <span style="font-size:11px;color:${inv.printed ? '#059669' : '#a8a29e'}">${inv.printed ? '✓ مطبوعة' : '—'}</span>
      <div class="actions">
        ${remaining > 0 ? `<button class="pay-btn" data-id="${safeId}" title="تسديد الباقي"><i class="fa-solid fa-coins"></i></button>` : ''}
        <button class="toggle-status-btn" data-id="${safeId}" data-status="${inv.status}" title="${stTxt === 'مدفوعة' ? 'تحويل لمرتجع' : 'تحويل لمدفوعة'}"><i class="fa-solid ${stTxt === 'مدفوعة' ? 'fa-arrow-rotate-left' : 'fa-check'}"></i></button>
        <button class="view-btn" data-id="${safeId}"><i class="fa-solid fa-eye"></i></button>
        <button class="print-btn" data-id="${safeId}"><i class="fa-solid fa-print"></i></button>
        <button class="delete-btn" data-id="${safeId}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    tableBody.appendChild(row);
  });

  const active = invoices.filter(i => i.status !== 'returned' && i.status !== 'مرتجعة');
  const cards = document.querySelectorAll('.invoice-stats .stat-card h2');
  if (cards.length >= 5) {
    cards[0].textContent = invoices.length;
    cards[1].textContent = active.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
    cards[2].textContent = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة').length;
    cards[3].textContent = invoices.filter(i => i.status === 'pending' || i.status === 'معلقة').length;
    cards[4].textContent = active.reduce((s, i) => s + (i.paid !== undefined ? Number(i.paid) : (i.status === 'paid' || i.status === 'مدفوعة' ? Number(i.total || 0) : 0)), 0).toLocaleString() + ' ج.م';
  }
  attachActions();
}

function attachActions() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      let items = '';
      if (inv.items) inv.items.forEach(item => { items += `\n• ${item.name} x${item.qty} = ${item.qty * item.price} ج.م${item.hasMilk ? ' +حليب' : ''}${item.note ? ' (' + item.note + ')' : ''}`; });
      const paid = inv.paid ?? inv.total;
      const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
      const change = inv.change || 0;
      alert(`رقم الفاتورة: ${inv.id}\nالعميل: ${inv.customer}\n${inv.table ? 'الطاولة: ' + inv.table + '\n' : ''}التاريخ: ${new Date(inv.date).toLocaleDateString('ar-EG')}\nطريقة الدفع: ${inv.paymentMethod || 'كاش'}${items ? '\n\nالمنتجات:' + items : ''}\n\nالإجمالي: ${Number(inv.total).toLocaleString()} ج.م\nالمدفوع: ${Number(paid).toLocaleString()} ج.م\n${change > 0 ? 'الباقي للعميل: ' + Number(change).toLocaleString() + ' ج.م\n' : ''}${remaining > 0 ? 'المتبقي: ' + Number(remaining).toLocaleString() + ' ج.م\n' : ''}الحالة: ${inv.status}`);
    };
  });
  document.querySelectorAll('.print-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      if (inv.printed && !confirm('الفاتورة مطبوعة من قبل.\nهل تريد إعادة الطباعة؟')) return;
      if (typeof PRINTER !== 'undefined' && PRINTER.isConnected()) {
        try {
          await Promise.all([
            PRINTER.printReceipt(inv),
            PRINTER.printKitchenOrder(inv),
            PRINTER.openDrawer()
          ]);
          if (!inv.printed) await DB.invoices.update(inv.id, { printed: true });
          render();
          return;
        } catch (e) {
          console.warn('[printer] print failed, falling back to browser print:', e);
        }
      }
      const w = window.open('', '_blank', 'width=400,height=600');
      let itemsHtml = '';
      if (inv.items) inv.items.forEach(item => {
        const safeName = escapeHtml(item.name);
        const safeNote = escapeHtml(item.note || '');
        const milkTxt = item.hasMilk ? ' +حليب' : '';
        itemsHtml += `<tr><td>${safeName}${milkTxt}${safeNote ? '<br><small>' + safeNote + '</small>' : ''}</td><td>${item.qty}</td><td>${item.price} ج.م</td><td>${item.qty * item.price} ج.م</td></tr>`;
      });
      const paid = inv.paid ?? inv.total;
      const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
      const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-EG') : '';
      const baseUrl = window.location.origin + '/LagunaDubai-System/';
      const safeId = escapeHtml(inv.id);
      const safeCustomer = escapeHtml(inv.customer || '');
      const safeTable = escapeHtml(inv.table || '');
      w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>فاتورة ${safeId}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;font-size:12px;padding:8px;color:#000}
.header{text-align:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed #000}
.header .logo{font-size:20px;font-weight:700;margin-bottom:4px}
.header h2{font-size:14px;font-weight:700;margin-bottom:2px}
.header p{font-size:11px;color:#555}
.receipt-table{width:100%;border-collapse:collapse;margin:6px 0;font-size:11px}
.receipt-table th,.receipt-table td{padding:3px 2px;text-align:center}
.receipt-table th{border-bottom:1px solid #000}
.receipt-table td{border-bottom:1px dotted #ccc}
.receipt-table .item-name{text-align:right}
.summary{margin:6px 0;padding:4px 0}
.summary .dashed{border-top:1px dashed #000;margin-bottom:4px}
.summary .line{display:flex;justify-content:space-between;font-size:11px;padding:1px 0}
.summary .total{font-size:15px;font-weight:700;border-top:2px solid #000;padding-top:4px;margin-top:4px}
.footer{text-align:center;margin-top:8px;padding-top:6px;border-top:1px dashed #000;font-size:10px;color:#555}
@media print{@page{margin:0;size:58mm 300mm}}
</style></head><body>
<div class="header"><img src="${baseUrl}images/logo.png" style="height:65px;margin-bottom:4px;background:#f0f0f0;padding:6px;border-radius:8px" alt="LagunaDubai" id="logoImg"><div style="font-size:14px;font-weight:700;margin-bottom:4px">LagunaDubai</div><h2>** فاتورة كاشير **</h2><p>${dateStr}</p><p>${safeCustomer}${safeTable ? ' | ' + safeTable : ''}</p><p style="font-size:10px">#${safeId}</p></div>
<table class="receipt-table"><thead><tr><th class="item-name">الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>${itemsHtml}</tbody></table>
<div class="summary"><div class="dashed"></div><div class="line"><span>الإجمالي</span><span>${Number(inv.total).toLocaleString()} ج.م</span></div>
<div class="line"><span>المدفوع</span><span>${Number(paid).toLocaleString()} ج.م</span></div>${inv.change > 0 ? `<div class="line" style="color:#059669"><span>الباقي للعميل</span><span>${Number(inv.change).toLocaleString()} ج.م</span></div>` : ''}${remaining > 0 ? `<div class="line" style="color:#dc2626"><span>المتبقي</span><span>${Number(remaining).toLocaleString()} ج.م</span></div>` : ''}
<div class="line total"><span>${remaining > 0 ? 'معلق' : 'مدفوع'}</span><span>${inv.paymentMethod || 'كاش'}</span></div></div>
<div class="footer">شكراً لزيارتكم<br>☕ LagunaDubai</div>
<script>document.getElementById('logoImg').onload=function(){window.print();window.close()};setTimeout(function(){window.print();window.close()},3000);<\/script></body></html>`);
    };
  });
  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - (inv.paid ?? 0));
      const name = prompt(`المبلغ المتبقي: ${remaining} ج.م\nأدخل المبلغ الذي تم تحصيله:`, remaining);
      if (!name) return;
      const paidNow = Math.min(remaining, Math.max(0, Number(name) || 0));
      const newPaid = (inv.paid ?? 0) + paidNow;
      const newRemaining = (inv.total ?? 0) - newPaid;
      await DB.invoices.update(inv.id, { paid: newPaid, remaining: newRemaining, status: newRemaining <= 0 ? 'paid' : 'pending' });
      render();
    };
  });
  document.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      const isPaid = inv.status === 'paid' || inv.status === 'مدفوعة';
      if (!confirm(isPaid ? 'تحويل الفاتورة إلى مرتجع؟' : 'تحويل الفاتورة إلى مدفوعة؟')) return;
      if (isPaid) {
        if (inv.items && inv.items.length) {
          for (const item of inv.items) {
            await DB.returns.add({
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
              invoice: inv.id,
              product: item.name,
              qty: item.qty,
              amount: item.qty * item.price,
              date: new Date().toISOString(),
              status: 'pending'
            });
          }
        }
        await DB.invoices.update(inv.id, { status: 'returned' });
      } else {
        const existing = (await DB.returns.all() || []).filter(r => r.invoice === inv.id);
        for (const r of existing) await DB.returns.remove(r.id);
        await DB.invoices.update(inv.id, { status: 'paid' });
      }
      render();
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف هذه الفاتورة؟')) return;
      await DB.invoices.remove(btn.dataset.id);
      render();
    };
  });
}

if (searchInput) searchInput.addEventListener('keyup', render);
if (statusSelect) statusSelect.addEventListener('change', render);

render();

FB.onCollection('invoices', (data) => {
  invoices = data;
  renderWithData();
}).catch(e => {
  console.warn('[invoices] onSnapshot error, using fallback:', e);
  setInterval(render, 15000);
});

function renderWithData() {
  const existing = tableBody.querySelectorAll('.invoice-row');
  existing.forEach(r => r.remove());

  const val = searchInput ? searchInput.value.toLowerCase() : '';
  const filterStatus = statusSelect ? statusSelect.value : 'كل الحالات';

  const filtered = invoices.filter(inv => {
    if (!inv || !inv.id || typeof inv.id !== 'string' || !inv.customer) { console.warn('[invoices] skipped malformed:', inv); return false; }
    const matchSearch = inv.id.toLowerCase().includes(val) || inv.customer.toLowerCase().includes(val);
    const st = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const matchStatus = filterStatus === 'كل الحالات' || st === filterStatus;
    return matchSearch && matchStatus;
  });

  filtered.forEach(inv => {
    const row = document.createElement('div');
    row.className = 'invoice-row';
    const stCls = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'paid' : inv.status === 'pending' || inv.status === 'معلقة' ? 'pending' : 'cancelled';
    const stTxt = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const dateStr = inv.date ? new Date(inv.date).toLocaleDateString('ar-EG') : '—';
    const paid = inv.paid ?? inv.total;
    const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
    const safeCustomer = escapeHtml(inv.customer || '');
    const safeTable = escapeHtml(inv.table || '');
    const safeId = escapeHtml(inv.id);
    row.innerHTML = `
      <span>${safeId}</span><span>${safeCustomer}</span><span>${dateStr}</span>
      <span>${safeTable}</span>
      <span>${Number(inv.total).toLocaleString()} ج.م</span>
      <span style="font-size:12px;color:${remaining > 0 ? '#dc2626' : '#059669'}">${remaining > 0 ? 'باقي ' + Number(remaining).toLocaleString() : 'مدفوع كامل'}</span>
      <span class="${stCls}">${stTxt}</span>
      <span style="font-size:11px;color:${inv.printed ? '#059669' : '#a8a29e'}">${inv.printed ? '✓ مطبوعة' : '—'}</span>
      <div class="actions">
        ${remaining > 0 ? `<button class="pay-btn" data-id="${safeId}" title="تسديد الباقي"><i class="fa-solid fa-coins"></i></button>` : ''}
        <button class="toggle-status-btn" data-id="${safeId}" data-status="${inv.status}" title="${stTxt === 'مدفوعة' ? 'تحويل لمرتجع' : 'تحويل لمدفوعة'}"><i class="fa-solid ${stTxt === 'مدفوعة' ? 'fa-arrow-rotate-left' : 'fa-check'}"></i></button>
        <button class="view-btn" data-id="${safeId}"><i class="fa-solid fa-eye"></i></button>
        <button class="print-btn" data-id="${safeId}"><i class="fa-solid fa-print"></i></button>
        <button class="delete-btn" data-id="${safeId}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    tableBody.appendChild(row);
  });

  const active = invoices.filter(i => i.status !== 'returned' && i.status !== 'مرتجعة');
  const cards = document.querySelectorAll('.invoice-stats .stat-card h2');
  if (cards.length >= 5) {
    cards[0].textContent = invoices.length;
    cards[1].textContent = active.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
    cards[2].textContent = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة').length;
    cards[3].textContent = invoices.filter(i => i.status === 'pending' || i.status === 'معلقة').length;
    cards[4].textContent = active.reduce((s, i) => s + (i.paid !== undefined ? Number(i.paid) : (i.status === 'paid' || i.status === 'مدفوعة' ? Number(i.total || 0) : 0)), 0).toLocaleString() + ' ج.م';
  }
  attachActions();
}
