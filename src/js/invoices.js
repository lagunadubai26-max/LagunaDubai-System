let invoices = [];
const searchInput = document.querySelector('.filter-box input');
const statusSelect = document.querySelector('.filter-box select');
const tableBody = document.querySelector('.invoice-table');

async function render() {
  invoices = await DB.invoices.all() || [];
  console.log('[invoices] loaded:', invoices.length, 'invoices', invoices.map(i => ({ id: i.id, customer: i.customer, total: i.total, paid: i.paid })));
  const existing = tableBody.querySelectorAll('.invoice-row');
  existing.forEach(r => r.remove());

  const val = searchInput ? searchInput.value.toLowerCase() : '';
  const filterStatus = statusSelect ? statusSelect.value : 'كل الحالات';

  console.log('[invoices] filter input:', val, filterStatus);
  const filtered = invoices.filter(inv => {
    if (!inv || !inv.id || typeof inv.id !== 'string' || !inv.customer) { console.warn('[invoices] skipped malformed:', inv); return false; }
    const matchSearch = inv.id.toLowerCase().includes(val) || inv.customer.toLowerCase().includes(val);
    const st = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const matchStatus = filterStatus === 'كل الحالات' || st === filterStatus;
    return matchSearch && matchStatus;
  });

  console.log('[invoices] filtered count:', filtered.length);
  filtered.forEach(inv => {
    const row = document.createElement('div');
    row.className = 'invoice-row';
    const stCls = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'paid' : inv.status === 'pending' || inv.status === 'معلقة' ? 'pending' : 'cancelled';
    const stTxt = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const dateStr = inv.date ? new Date(inv.date).toLocaleDateString('ar-EG') : '—';
    const paid = inv.paid ?? inv.total;
    const remaining = inv.remaining ?? 0;
    row.innerHTML = `
      <span>${inv.id}</span><span>${inv.customer}</span><span>${dateStr}</span>
      <span>${Number(inv.total).toLocaleString()} ج.م</span>
      <span style="font-size:12px;color:${remaining > 0 ? '#dc2626' : '#059669'}">${remaining > 0 ? 'باقي ' + Number(remaining).toLocaleString() : 'مدفوع كامل'}</span>
      <span class="${stCls}">${stTxt}</span>
      <div class="actions">
        ${remaining > 0 ? `<button class="pay-btn" data-id="${inv.id}" title="تسديد الباقي"><i class="fa-solid fa-coins"></i></button>` : ''}
        <button class="toggle-status-btn" data-id="${inv.id}" data-status="${inv.status}" title="${stTxt === 'مدفوعة' ? 'تحويل لمرتجع' : 'تحويل لمدفوعة'}"><i class="fa-solid ${stTxt === 'مدفوعة' ? 'fa-arrow-rotate-left' : 'fa-check'}"></i></button>
        <button class="view-btn" data-id="${inv.id}"><i class="fa-solid fa-eye"></i></button>
        <button class="print-btn" data-id="${inv.id}"><i class="fa-solid fa-print"></i></button>
        <button class="delete-btn" data-id="${inv.id}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    tableBody.appendChild(row);
  });

  const cards = document.querySelectorAll('.invoice-stats .stat-card h2');
  if (cards.length >= 5) {
    cards[0].textContent = invoices.length;
    cards[1].textContent = invoices.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
    cards[2].textContent = invoices.reduce((s, i) => s + Number(i.paid ?? i.total ?? 0), 0).toLocaleString() + ' ج.م';
    cards[3].textContent = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة').length;
    cards[4].textContent = invoices.filter(i => i.status === 'pending' || i.status === 'معلقة').length;
  }
  attachActions();
}

function attachActions() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      let items = '';
      if (inv.items) inv.items.forEach(item => { items += `\n• ${item.name} x${item.qty} = ${item.qty * item.price} ج.م${item.note ? ' (' + item.note + ')' : ''}`; });
      const paid = inv.paid ?? inv.total;
      const remaining = inv.remaining ?? 0;
      alert(`رقم الفاتورة: ${inv.id}\nالعميل: ${inv.customer}\nالتاريخ: ${new Date(inv.date).toLocaleDateString('ar-EG')}\nطريقة الدفع: ${inv.paymentMethod || 'كاش'}${items ? '\n\nالمنتجات:' + items : ''}\n\nالإجمالي: ${Number(inv.total).toLocaleString()} ج.م\nالمدفوع: ${Number(paid).toLocaleString()} ج.م\nالباقي: ${Number(remaining).toLocaleString()} ج.م\nالحالة: ${inv.status}`);
    };
  });
  document.querySelectorAll('.print-btn').forEach(btn => {
    btn.onclick = () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      const w = window.open('', '_blank');
      let itemsHtml = '';
      if (inv.items) inv.items.forEach(item => { itemsHtml += `<tr><td>${item.name}${item.note ? '<br><small style="color:#888">' + item.note + '</small>' : ''}</td><td>${item.qty}</td><td>${item.price} ج.م</td><td>${item.qty * item.price} ج.م</td></tr>`; });
      const paid = inv.paid ?? inv.total;
      const remaining = inv.remaining ?? 0;
      w.document.write(`<html dir="rtl"><head><meta charset="UTF-8"><title>فاتورة ${inv.id}</title><style>body{font-family: 'Cairo', sans-serif;padding:40px;}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:12px;border:1px solid #ddd;text-align:center}th{background:#1c1917;color:#fff}h1{color:#1c1917;text-align:center}.total{text-align:left;font-size:20px;font-weight:bold;color:#d97706;margin-top:20px}</style></head><body><h1>Laguna Cafe</h1><h3 style="text-align:center;color:#777">${inv.id}</h3><p><strong>العميل:</strong> ${inv.customer}</p><p><strong>التاريخ:</strong> ${new Date(inv.date).toLocaleDateString('ar-EG')}</p><p><strong>طريقة الدفع:</strong> ${inv.paymentMethod || 'كاش'}</p><table><thead><tr><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${itemsHtml}</tbody></table><p class="total">الإجمالي: ${Number(inv.total).toLocaleString()} ج.م</p><p style="text-align:left;font-size:16px;color:#059669"><strong>المدفوع:</strong> ${Number(paid).toLocaleString()} ج.م</p>${remaining > 0 ? `<p style="text-align:left;font-size:16px;color:#dc2626"><strong>الباقي:</strong> ${Number(remaining).toLocaleString()} ج.م</p>` : ''}<p style="text-align:center;color:#888;margin-top:40px;border-top:1px solid #eee;padding-top:20px;">شكراً لزيارتكم Laguna Cafe</p><script>window.print();window.close();<\/script></body></html>`);
      w.document.close();
    };
  });
  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      const remaining = inv.remaining || 0;
      const name = prompt(`المبلغ المتبقي: ${remaining} ج.م\nأدخل المبلغ الذي تم تحصيله:`, remaining);
      if (!name) return;
      const paidNow = Math.min(remaining, Math.max(0, Number(name) || 0));
      const newPaid = (inv.paid || 0) + paidNow;
      const newRemaining = (inv.total || 0) - newPaid;
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
