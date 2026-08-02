let invoices = [];
const searchInput = document.querySelector('.filter-box input');
const statusSelect = document.querySelector('.filter-box select');
const tableBody = document.querySelector('#invTableBody');
const _invUser = (() => { try { return JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { return {}; } })();

async function render() {
  invoices = await DB.invoices.all() || [];

  tableBody.innerHTML = '';

  const val = searchInput ? searchInput.value.toLowerCase() : '';
  const filterStatus = statusSelect ? statusSelect.value : 'كل الحالات';

  const filtered = invoices.filter(inv => {
    if (!inv || !inv.id || typeof inv.id !== 'string' || !inv.customer) { console.warn('[invoices] skipped malformed:', inv); return false; }
    const matchSearch = inv.id.toLowerCase().includes(val) || inv.customer.toLowerCase().includes(val);
    const st = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const matchStatus = filterStatus === 'كل الحالات' || st === filterStatus;
    return matchSearch && matchStatus;
  });
  filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  filtered.forEach(inv => {
    const frag = buildInvoiceRow(inv);
    tableBody.appendChild(frag);
  });

  const paid = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const cards = document.querySelectorAll('.invoice-stats .stat-card h2');
  if (cards.length >= 5) {
    cards[0].textContent = invoices.length;
    cards[1].textContent = paid.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
    cards[2].textContent = paid.length;
    cards[3].textContent = invoices.filter(i => i.status === 'pending' || i.status === 'معلقة').length;
    cards[4].textContent = paid.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
  }
  attachActions();
  updateMergeBtn();
}

function buildInvoiceRow(inv) {
  const frag = document.createDocumentFragment();
  const row = document.createElement('tr');
  const stCls = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'paid' : inv.status === 'pending' || inv.status === 'معلقة' ? 'pending' : 'cancelled';
  const stTxt = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
  const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-EG') : '—';
  const paid = inv.paid ?? inv.total;
  const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
  const safeCustomer = escapeHtml(inv.customer || '');
  const safeTable = escapeHtml(inv.table || '');
  const safeId = escapeHtml(inv.id);
  const remainingHtml = remaining > 0 ? '<span style="color:#dc2626;font-size:12px">باقي ' + Number(remaining).toLocaleString() + '</span>' : '<span style="color:#059669;font-size:12px">مدفوع كامل</span>';
  const printHtml = inv.pendingPrint ? '<span style="color:#dc2626;font-size:11px">⏳ طباعة معلقة</span>' : inv.printed ? '<span style="color:#059669;font-size:11px">✓ مطبوعة</span>' : '<span style="color:#a8a29e;font-size:11px">—</span>';
  const btns = '<button class="view-btn" data-id="' + safeId + '"><i class="fa-solid fa-eye"></i></button><button class="edit-btn" data-id="' + safeId + '" title="تعديل الفاتورة"><i class="fa-solid fa-pen"></i></button><button class="print-btn" data-id="' + safeId + '" title="طباعة الكاشير"><i class="fa-solid fa-receipt"></i></button><button class="kitchen-print-btn" data-id="' + safeId + '" title="طباعة المطبخ"><i class="fa-solid fa-utensils"></i></button>';
  const adminBtns = _invUser.role !== 'Owner' ? (remaining > 0 ? '<button class="pay-btn" data-id="' + safeId + '" title="تسديد الباقي"><i class="fa-solid fa-coins"></i></button>' : '') + '<button class="toggle-status-btn" data-id="' + safeId + '" data-status="' + inv.status + '" title="' + (stTxt === 'مدفوعة' ? 'تحويل لمرتجع' : 'تحويل لمدفوعة') + '"><i class="fa-solid ' + (stTxt === 'مدفوعة' ? 'fa-arrow-rotate-left' : 'fa-check') + '"></i></button><button class="delete-btn" data-id="' + safeId + '"><i class="fa-solid fa-trash"></i></button>' : '';
  row.innerHTML = '<td><input type="checkbox" class="inv-checkbox" data-id="' + safeId + '"></td><td>' + safeId + '</td><td>' + safeCustomer + '</td><td>' + dateStr + '</td><td>' + safeTable + '</td><td>' + Number(inv.total).toLocaleString() + ' ج.م</td><td>' + remainingHtml + '</td><td><span class="' + stCls + '">' + stTxt + '</span></td><td>' + printHtml + '</td><td><div class="actions">' + btns + adminBtns + '</div></td>';
  frag.appendChild(row);

  if (inv.items && inv.items.length > 0) {
    const itemsRow = document.createElement('tr');
    itemsRow.className = 'inv-items-row';
    let itemsHtml = '';
    inv.items.forEach(item => {
      itemsHtml += '<span class="inv-item-chip">' + escapeHtml(item.name) + ' × ' + item.qty + ' = ' + Number(item.qty * item.price).toLocaleString() + ' ج.م' + (item.hasMilk ? ' (+حليب)' : '') + (item.note ? ' <em>(' + escapeHtml(item.note) + ')</em>' : '') + '</span>';
    });
    itemsRow.innerHTML = '<td></td><td colspan="9" class="inv-items-cell"><div class="inv-items-wrap">' + itemsHtml + '</div></td>';
    frag.appendChild(itemsRow);
  }
  return frag;
}

function attachActions() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      let items = '';
      if (inv.items) inv.items.forEach(item => { items += `\n• ${escapeHtml(item.name)} x${item.qty} = ${item.qty * item.price} ج.م${item.hasMilk ? ' +حليب' : ''}${item.note ? ' (' + escapeHtml(item.note) + ')' : ''}`; });
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

      let printed = false;
      if (localStorage.getItem('laguna_print_agent_enabled') === 'true') {
        try {
          const result = await PRINTER.printViaAgent(inv, 'invoice');
          if (result && result.ok) printed = true;
        } catch (e) { console.warn('[printer] agent failed:', e); }
      }

      if (!printed && typeof PRINTER !== 'undefined' && PRINTER.isConnected()) {
        try {
          const result = await PRINTER.printReceipt(inv);
          if (result && result.ok) { printed = true; await PRINTER.openDrawer(); }
        } catch (e) { console.warn('[printer] usb failed:', e); }
      }

      if (printed) {
        await DB.invoices.update(inv.id, { printed: true, pendingPrint: false });
      } else {
        await DB.invoices.update(inv.id, { pendingPrint: true });
        TEMPLATE.getTemplate('cashier').then(cashierTpl => {
          if (!cashierTpl) cashierTpl = TEMPLATE.defaultCashierTemplate;
          const w = window.open('', '_blank', 'width=400,height=600');
          w.document.write(TEMPLATE.renderCashier(inv, cashierTpl));
          w.document.close();
        }).catch(() => {
          const w = window.open('', '_blank', 'width=400,height=600');
          w.document.write(TEMPLATE.renderCashier(inv));
          w.document.close();
        });
      }
      render();
    };
  });
  document.querySelectorAll('.kitchen-print-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;

      let printed = false;
      if (localStorage.getItem('laguna_print_agent_enabled') === 'true') {
        try {
          const result = await PRINTER.printViaAgent(inv, 'kitchen');
          if (result && result.ok) printed = true;
        } catch (e) { console.warn('[printer] agent failed:', e); }
      }

      if (!printed && typeof PRINTER !== 'undefined' && PRINTER.isConnected()) {
        try { await PRINTER.printKitchenOrder(inv); printed = true; } catch (e) { console.warn('[printer] usb failed:', e); }
      }

      if (!printed) {
        TEMPLATE.getTemplate('kitchen').then(kitchenTpl => {
          if (!kitchenTpl) kitchenTpl = TEMPLATE.defaultKitchenTemplate;
          const w = window.open('', '_blank', 'width=400,height=600');
          w.document.write(TEMPLATE.renderKitchen(inv, kitchenTpl));
          w.document.close();
        }).catch(() => {
          const w = window.open('', '_blank', 'width=400,height=600');
          w.document.write(TEMPLATE.renderKitchen(inv));
          w.document.close();
        });
      }
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
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      const currentTable = inv.table || '';
      const newTable = prompt('رقم الطاولة الحالي: ' + currentTable + '\nأدخل رقم الطاولة الجديد:', currentTable.replace('طاولة ', ''));
      if (newTable === null) return;
      const tableVal = newTable.trim() ? 'طاولة ' + newTable.trim() : '';
      await DB.invoices.update(inv.id, { table: tableVal });
      render();
    };
  });
}

if (searchInput) searchInput.addEventListener('keyup', render);
if (statusSelect) statusSelect.addEventListener('change', render);

render();

// Merge invoices
document.getElementById('selectAllInvoices').addEventListener('change', function () {
  document.querySelectorAll('.inv-checkbox').forEach(cb => cb.checked = this.checked);
  updateMergeBtn();
});

document.addEventListener('change', function (e) {
  if (e.target.classList.contains('inv-checkbox')) updateMergeBtn();
});

function updateMergeBtn() {
  const checked = document.querySelectorAll('.inv-checkbox:checked');
  const btn = document.getElementById('mergeInvoicesBtn');
  if (btn) btn.style.display = checked.length >= 2 ? 'inline-flex' : 'none';
}

document.getElementById('mergeInvoicesBtn').onclick = async function () {
  const checked = document.querySelectorAll('.inv-checkbox:checked');
  if (checked.length < 2) return;
  const ids = Array.from(checked).map(cb => cb.dataset.id);
  const toMerge = ids.map(id => invoices.find(i => i.id === id)).filter(Boolean);
  if (toMerge.length < 2) { alert('لم يتم العثور على الفواتير'); return; }

  const mergedItems = [];
  const itemMap = {};
  let total = 0;
  let paid = 0;

  for (const inv of toMerge) {
    total += Number(inv.total || 0);
    paid += Number(inv.paid ?? inv.total ?? 0);
    if (inv.items) {
      for (const item of inv.items) {
        const key = (item.name || '') + (item.hasMilk ? '|milk' : '') + (item.note ? '|' + item.note : '');
        if (itemMap[key]) {
          itemMap[key].qty += item.qty;
          itemMap[key].qty = Number(itemMap[key].qty);
        } else {
          const clone = {};
          for (const k in item) clone[k] = item[k];
          itemMap[key] = clone;
          mergedItems.push(clone);
        }
      }
    }
  }

  if (!confirm('دمج ' + toMerge.length + ' فاتورة في فاتورة واحدة؟\n' +
    'الإجمالي: ' + total.toLocaleString() + ' ج.م\n' +
    'العميل: ' + toMerge[0].customer)) return;

  try {
    const newId = Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
    const remaining = Math.max(0, total - paid);
    await DB.invoices.add({
      id: newId,
      customer: toMerge[0].customer,
      date: new Date().toISOString(),
      items: mergedItems,
      total: total,
      paid: paid,
      remaining: remaining,
      status: remaining <= 0 ? 'paid' : 'pending',
      table: toMerge[0].table || '',
      mergedFrom: ids.join(', '),
      paymentMethod: toMerge[0].paymentMethod || 'كاش',
      createdBy: _invUser?.name || ''
    });
    for (const id of ids) await DB.invoices.remove(id);
    render();
  } catch (e) {
    console.error('[merge] error:', e);
    alert('حدث خطأ أثناء دمج الفواتير');
  }
};

FB.onCollection('invoices', (data) => {
  invoices = data;
  renderWithData();
}).catch(e => {
  console.warn('[invoices] onSnapshot error, using fallback:', e);
  setInterval(render, 15000);
});

function renderWithData() {
  tableBody.innerHTML = '';

  const val = searchInput ? searchInput.value.toLowerCase() : '';
  const filterStatus = statusSelect ? statusSelect.value : 'كل الحالات';

  const filtered = invoices.filter(inv => {
    if (!inv || !inv.id || typeof inv.id !== 'string' || !inv.customer) { console.warn('[invoices] skipped malformed:', inv); return false; }
    const matchSearch = inv.id.toLowerCase().includes(val) || inv.customer.toLowerCase().includes(val);
    const st = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
    const matchStatus = filterStatus === 'كل الحالات' || st === filterStatus;
    return matchSearch && matchStatus;
  });
  filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  filtered.forEach(inv => {
    const frag = buildInvoiceRow(inv);
    tableBody.appendChild(frag);
  });

  const paid = invoices.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const cards = document.querySelectorAll('.invoice-stats .stat-card h2');
  if (cards.length >= 5) {
    cards[0].textContent = invoices.length;
    cards[1].textContent = paid.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
    cards[2].textContent = paid.length;
    cards[3].textContent = invoices.filter(i => i.status === 'pending' || i.status === 'معلقة').length;
    cards[4].textContent = paid.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
  }
  attachActions();
  updateMergeBtn();
}

