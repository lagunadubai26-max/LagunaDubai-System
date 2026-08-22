let invoices = [];
let rangeStart = null;
let shiftDateLabel = null;
let viewMode = 'shift';
const searchInput = document.querySelector('.filter-box input');
const statusSelect = document.querySelector('.filter-box select');
const tableBody = document.querySelector('#invTableBody');
const _invUser = (() => { try { return JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { return {}; } })();

function invIsPending(i) {
  const st = i.status === 'paid' || i.status === 'مدفوعة' ? 'paid' : i.status === 'pending' || i.status === 'معلقة' ? 'pending' : 'other';
  return st === 'pending';
}

async function resolveShiftRange() {
  rangeStart = null;
  shiftDateLabel = null;
  try {
    const openShift = await DB.shifts.getOpen();
    if (openShift && openShift.openDate) {
      rangeStart = new Date(openShift.openedAt);
      shiftDateLabel = new Date(openShift.openDate + 'T12:00:00Z').toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' });
    }
  } catch(e) { console.warn('[invoices] shift check failed:', e); }
}

function getFiltered() {
  const val = searchInput ? searchInput.value.toLowerCase() : '';
  const filterStatus = statusSelect ? statusSelect.value : 'كل الحالات';

  const todayKey = localDateKey(FB.clockNow());
  const now = new Date(Math.max(FB.clockNow().getTime(), (invoices || []).reduce((m, i) => i.date ? Math.max(m, new Date(i.date).getTime()) : m, 0)));

  let filtered = invoices.filter(inv => {
    if (!inv || !inv.id || typeof inv.id !== 'string' || !inv.customer) { console.warn('[invoices] skipped malformed:', inv); return false; }
    if (!inv.date) return false;

    if (viewMode === 'pending') {
      if (!invIsPending(inv)) return false;
    } else {
      const d = new Date(inv.date);
      if (rangeStart) {
        if (!(d >= rangeStart && d <= now)) return false;
      } else if (localDateKey(inv.date) !== todayKey) {
        return false;
      }
      const st = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
      const matchStatus = filterStatus === 'كل الحالات' || st === filterStatus;
      if (!matchStatus) return false;
    }

    const matchSearch = inv.id.toLowerCase().includes(val) || inv.customer.toLowerCase().includes(val);
    return matchSearch;
  });
  filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  return filtered;
}

function updateStats(filtered) {
  const paid = filtered.filter(i => i.status === 'paid' || i.status === 'مدفوعة');
  const cards = document.querySelectorAll('.invoice-stats .stat-card h2');
  if (cards.length >= 5) {
    cards[0].textContent = filtered.length;
    cards[1].textContent = paid.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
    cards[2].textContent = paid.length;
    cards[3].textContent = filtered.filter(i => i.status === 'pending' || i.status === 'معلقة').length;
    cards[4].textContent = paid.reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString() + ' ج.م';
  }
}

async function draw() {
  const filtered = getFiltered();
  updatePendingBadge();

  tableBody.innerHTML = '';
  filtered.forEach(inv => {
    const frag = buildInvoiceRow(inv, shiftDateLabel);
    tableBody.appendChild(frag);
  });

  updateStats(filtered);
  attachActions();
  updateMergeBtn();
}

function updatePendingBadge() {
  const badge = document.getElementById('pendingCount');
  if (!badge) return;
  const pend = (invoices || []).filter(invIsPending);
  const amt = pend.reduce((s, i) => s + Math.max(0, Number(i.remaining ?? ((Number(i.total || 0) - Number(i.paid || 0))))), 0);
  badge.textContent = pend.length;
  document.getElementById('tabPending').title = 'إجمالي المتأخرات: ' + amt.toLocaleString() + ' ج.م';
}

function focusRow(id) {
  const row = tableBody.querySelector('tr[data-invoice-id="' + id + '"]') || tableBody.querySelector('.edit-btn[data-id="' + id + '"]');
  if (!row) return;
  const tr = row.closest('tr');
  if (!tr) return;
  tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
  tr.classList.remove('flash-update');
  void tr.offsetWidth;
  tr.classList.add('flash-update');
}

async function render() {
  invoices = await DB.invoices.all() || [];
  await resolveShiftRange();
  draw();
}

function flashRow(id) {
  const row = tableBody.querySelector('tr[data-invoice-id="' + id + '"]');
  if (!row) return;
  row.classList.remove('flash-update');
  void row.offsetWidth;
  row.classList.add('flash-update');
}

// تحديث صف الفاتورة في مكانه دون إعادة رسم الجدول كله (لا يقفز مكانه)
async function refreshSingle(id) {
  invoices = await DB.invoices.all() || [];
  await resolveShiftRange();

  const tr = tableBody.querySelector('tr[data-invoice-id="' + id + '"]');
  if (!tr) { draw(); return; }
  const oldItems = tr.nextElementSibling && tr.nextElementSibling.classList.contains('inv-items-row') ? tr.nextElementSibling : null;

  const inv = invoices.find(i => i.id === id);
  if (!inv) {
    tr.remove();
    if (oldItems) oldItems.remove();
  } else {
    const frag = buildInvoiceRow(inv, shiftDateLabel);
    tr.replaceWith(frag);
    if (oldItems) oldItems.remove();
  }

  updateStats(getFiltered());
  attachActions();
  updateMergeBtn();
  flashRow(id);
}

function buildInvoiceRow(inv, shiftDateLabel) {
  const frag = document.createDocumentFragment();
  const row = document.createElement('tr');
  row.setAttribute('data-invoice-id', inv.id);
  const stCls = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'paid' : inv.status === 'pending' || inv.status === 'معلقة' ? 'pending' : 'cancelled';
  const stTxt = inv.status === 'paid' || inv.status === 'مدفوعة' ? 'مدفوعة' : inv.status === 'pending' || inv.status === 'معلقة' ? 'معلقة' : 'ملغية';
  const isOld = localDateKey(inv.date) !== localDateKey(FB.clockNow());
  if (invIsPending(inv) && isOld) row.classList.add('old-pending');
  if (viewMode === 'pending') row.classList.add('in-pending-view');
  let dateStr;
  if (inv.date) {
    if (!isOld && shiftDateLabel) {
      dateStr = shiftDateLabel + ' ' + new Date(inv.date).toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
    } else {
      dateStr = new Date(inv.date).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' - ' + new Date(inv.date).toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
    }
  } else {
    dateStr = '—';
  }
  const paid = inv.paid ?? inv.total;
  const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
  const safeCustomer = escapeHtml(inv.customer || '');
  const safeTable = escapeHtml(inv.table || '');
  const safeId = escapeHtml(inv.id);
  const remainingHtml = remaining > 0 ? '<span style="color:#dc2626;font-size:12px">باقي ' + Number(remaining).toLocaleString() + '</span>' : '<span style="color:#059669;font-size:12px">مدفوع كامل</span>';
  const printHtml = inv.pendingPrint ? '<span style="color:#dc2626;font-size:11px">⏳ طباعة معلقة</span>' : inv.printed ? '<span style="color:#059669;font-size:11px">✓ مطبوعة</span>' : '<span style="color:#a8a29e;font-size:11px">—</span>';
  const btns = '<button class="edit-btn" data-id="' + safeId + '" title="تعديل الفاتورة"><i class="fa-solid fa-pen"></i></button><button class="add-items-btn" data-id="' + safeId + '" title="إضافة منتجات لهذه الفاتورة"><i class="fa-solid fa-cart-plus"></i></button><button class="print-btn" data-id="' + safeId + '" title="طباعة الكاشير"><i class="fa-solid fa-receipt"></i></button><button class="kitchen-print-btn" data-id="' + safeId + '" title="طباعة المطبخ"><i class="fa-solid fa-utensils"></i></button>';
  const adminBtns = (remaining > 0 ? '<button class="pay-btn" data-id="' + safeId + '" title="تسديد الباقي"><i class="fa-solid fa-coins"></i></button>' : '') + '<button class="toggle-status-btn" data-id="' + safeId + '" data-status="' + inv.status + '" title="' + (stTxt === 'مدفوعة' ? 'تحويل لمرتجع' : 'تحويل لمدفوعة') + '"><i class="fa-solid ' + (stTxt === 'مدفوعة' ? 'fa-arrow-rotate-left' : 'fa-check') + '"></i></button><button class="delete-btn" data-id="' + safeId + '"><i class="fa-solid fa-trash"></i></button>';
  row.innerHTML = '<td><input type="checkbox" class="inv-checkbox" data-id="' + safeId + '"></td><td>' + safeId + '</td><td>' + safeCustomer + '</td><td>' + dateStr + '</td><td>' + safeTable + '</td><td>' + Number(inv.total).toLocaleString() + ' ج.م</td><td>' + remainingHtml + '</td><td><span class="' + stCls + '">' + stTxt + '</span></td><td>' + printHtml + '</td><td><div class="actions">' + btns + adminBtns + '</div></td>';
  frag.appendChild(row);

  if (inv.items && inv.items.length > 0) {
    const itemsRow = document.createElement('tr');
    itemsRow.className = 'inv-items-row';
    let itemsHtml = '';
    inv.items.forEach((item, i) => {
      const qty = Number(item.qty || 1);
      const itemAmount = qty * Number(item.price || 0);
      itemsHtml += '<span class="inv-item-chip">' + escapeHtml(item.name) + ' × ' + qty + ' = ' + Number(itemAmount).toLocaleString() + ' ج.م' + (item.hasMilk ? ' (+لبن)' : '') + (item.note ? ' <em>(' + escapeHtml(item.note) + ')</em>' : '') + ' <button class="item-remove-btn" data-id="' + safeId + '" data-index="' + i + '" title="حذف الصنف من الفاتورة"><i class="fa-solid fa-xmark"></i></button></span>';
    });
    itemsRow.innerHTML = '<td></td><td colspan="9" class="inv-items-cell"><div class="inv-items-wrap">' + itemsHtml + '</div></td>';
    frag.appendChild(itemsRow);
  }
  return frag;
}

function attachActions() {
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
      } else {        await DB.invoices.update(inv.id, { pendingPrint: true });
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
      refreshSingle(inv.id);
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
    btn.onclick = () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      openSettleModal(inv);
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
              date: FB.nowISO(),
              status: 'pending'
            });
          }
        }
        await DB.invoices.update(inv.id, { status: 'returned' });
      } else {
        const existing = (await DB.returns.all() || []).filter(r => r.invoice === inv.id);
        for (const r of existing) await DB.returns.remove(r.id);
        const settleAmt = Math.max(0, Number(inv.remaining ?? ((Number(inv.total || 0) - Number(inv.paid || 0)))));
        await DB.invoices.update(inv.id, { status: 'paid', paidAt: FB.nowISO() });
        if (settleAmt > 0 || localDateKey(inv.date) !== localDateKey(FB.clockNow())) {
          await DB.audit.log('invoice_payment', { id: inv.id, customer: inv.customer, invDate: inv.date, amount: settleAmt, method: 'Cash', fullySettled: true, viaToggle: true });
        }
      }
      refreshSingle(inv.id);
    };
  });
  document.querySelectorAll('.item-remove-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      const idx = Number(btn.dataset.index);
      if (!inv || !Array.isArray(inv.items) || !inv.items[idx]) return;
      const item = inv.items[idx];
      const qty = Number(item.qty || 1);
      const itemAmount = qty * Number(item.price || 0);
      if (!confirm('حذف «' + item.name + ' × ' + qty + '» بقيمة ' + Number(itemAmount).toLocaleString() + ' ج.م من الفاتورة؟')) return;

      const newItems = inv.items.filter((_, i) => i !== idx);

      if (!newItems.length) {
        if (!confirm('الفاتورة أصبحت فارغة.\nهل تريد حذف الفاتورة بالكامل؟')) return;
        await DB.invoices.remove(inv.id);
        await DB.audit.log('invoice_deleted', { id: inv.id, customer: inv.customer, total: inv.total || 0, date: inv.date, reason: 'empty_after_item_removal' });
        refreshSingle(inv.id);
        return;
      }

      const newTotal = Math.max(0, Number(inv.total || 0) - itemAmount);
      const newPaid = Math.min(Number(inv.paid != null ? inv.paid : inv.total || 0), newTotal);
      const newRemaining = Math.max(0, newTotal - newPaid);
      const wasReturned = inv.status === 'returned' || inv.status === 'مرتجعة' || inv.status === 'cancelled' || inv.status === 'ملغية';
      await DB.invoices.update(inv.id, {
        items: newItems,
        total: newTotal,
        paid: newPaid,
        remaining: newRemaining,
        status: wasReturned ? inv.status : (newRemaining <= 0 ? 'paid' : 'pending')
      });
      refreshSingle(inv.id);
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!confirm('هل تريد حذف هذه الفاتورة؟')) return;
      await DB.invoices.remove(btn.dataset.id);
      await DB.audit.log('invoice_deleted', { id: btn.dataset.id, customer: inv ? inv.customer : '', total: inv ? (inv.total || 0) : 0, date: inv ? inv.date : '' });
      refreshSingle(btn.dataset.id);
    };
  });
  document.querySelectorAll('.add-items-btn').forEach(btn => {
    btn.onclick = () => {
      const inv = invoices.find(i => i.id === btn.dataset.id);
      if (!inv) return;
      openAddItemsModal(inv);
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
      refreshSingle(inv.id);
    };
  });
}

// ── تبويبات العرض: الشيفت الحالي / المعلقة ──
const tabShift = document.getElementById('tabShift');
const tabPending = document.getElementById('tabPending');
function setViewMode(mode) {
  viewMode = mode;
  if (tabShift) tabShift.classList.toggle('active', mode === 'shift');
  if (tabPending) tabPending.classList.toggle('active', mode === 'pending');
  draw();
}
if (tabShift) tabShift.onclick = () => setViewMode('shift');
if (tabPending) tabPending.onclick = () => setViewMode('pending');

// ── مودال التسديد: مبلغ + طريقة دفع ──
let settleInvId = null;
const settleModal = document.getElementById('settleModal');
const settleAmount = document.getElementById('settleAmount');
const settleMethod = document.getElementById('settleMethod');

function invRemaining(inv) {
  return Math.max(0, Number(inv.remaining != null ? inv.remaining : ((Number(inv.total || 0) - Number(inv.paid || 0)))));
}

function updateSettleLabel() {
  const lbl = document.getElementById('settleRemainingLabel');
  const inv = invoices.find(i => i.id === settleInvId);
  if (!lbl || !inv) return;
  const paidNow = Math.min(invRemaining(inv), Math.max(0, Number(settleAmount.value) || 0));
  const after = invRemaining(inv) - paidNow;
  if (after <= 0) {
    lbl.innerHTML = '<span style="color:#059669;font-weight:700"><i class="fa-solid fa-circle-check"></i> الفاتورة هتتسدد بالكامل</span>';
  } else {
    lbl.innerHTML = '<span style="color:#d97706;font-weight:700">هيفضل متأخر: ' + after.toLocaleString() + ' ج.م</span>';
  }
}

function openSettleModal(inv) {
  settleInvId = inv.id;
  document.getElementById('settleInfo').innerHTML =
    '<b>' + escapeHtml(inv.id) + '</b> — ' + escapeHtml(inv.customer || '') +
    ' <span style="color:#888">| إجمالي ' + Number(inv.total || 0).toLocaleString() + ' ج.م | متأخر ' + invRemaining(inv).toLocaleString() + ' ج.م</span>';
  settleAmount.value = invRemaining(inv);
  settleMethod.value = 'Cash';
  updateSettleLabel();
  settleModal.classList.add('show');
}

function closeSettleModal() { settleModal.classList.remove('show'); }

if (settleModal) {
  document.getElementById('closeSettle').onclick = closeSettleModal;
  document.getElementById('cancelSettle').onclick = closeSettleModal;
  settleAmount.addEventListener('input', updateSettleLabel);
  document.getElementById('confirmSettle').onclick = async () => {
    const btn = document.getElementById('confirmSettle');
    const inv = invoices.find(i => i.id === settleInvId);
    if (!inv) { closeSettleModal(); return; }
    const remaining = invRemaining(inv);
    const paidNow = Math.min(remaining, Math.max(0, Number(settleAmount.value) || 0));
    if (paidNow <= 0) { alert('أدخل مبلغًا صحيحًا'); return; }
    const newPaid = Number(inv.paid || 0) + paidNow;
    const newRemaining = Math.max(0, Number(inv.total || 0) - newPaid);
    const fullySettled = newRemaining <= 0;
    btn.disabled = true;
    try {
      const upd = { paid: newPaid, remaining: newRemaining, status: fullySettled ? 'paid' : 'pending', paidAt: FB.nowISO() };
      if (fullySettled && !inv.paymentMethod) upd.paymentMethod = settleMethod.value;
      await DB.invoices.update(inv.id, upd);
      await DB.audit.log('invoice_payment', { id: inv.id, customer: inv.customer, invDate: inv.date, amount: paidNow, method: settleMethod.value, fullySettled });
      closeSettleModal();
      await refreshSingle(inv.id);
    } catch (e) {
      console.error('[settle]', e);
      alert('حدث خطأ أثناء التسديد: ' + (e.message || e));
    }
    btn.disabled = false;
  };
  window.addEventListener('click', e => { if (e.target === settleModal) closeSettleModal(); });
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
    // تاريخ أقدم فاتورة مدموجة (عشان الفاتورة الجديدة م تقفزش لأول الجدول)
    const earliestDate = toMerge.reduce((min, i) => (i.date && new Date(i.date) < min ? new Date(i.date) : min), new Date(toMerge[0].date || FB.nowISO()));
    // أول ترابيزة موجودة من كل المدموجين
    const mergedTable = (toMerge.map(i => i.table || '').find(t => t.trim()) || '');
    const itemsValue = toMerge.reduce((s, i) => s + Number(i.itemsValue != null ? i.itemsValue : Number(i.total || 0)), 0);
    const customerType = toMerge[0].customerType || '';
    await DB.invoices.add({
      id: newId,
      customer: toMerge[0].customer,
      date: earliestDate.toISOString(),
      items: mergedItems,
      total: total,
      paid: paid,
      remaining: remaining,
      status: remaining <= 0 ? 'paid' : 'pending',
      table: mergedTable,
      mergedFrom: ids.join(', '),
      paymentMethod: toMerge[0].paymentMethod || 'كاش',
      customerType,
      itemsValue,
      createdBy: _invUser?.name || ''
    });
    for (const id of ids) await DB.invoices.remove(id);
    await DB.audit.log('invoice_merged', { id: newId, mergedFrom: ids, total, customer: toMerge[0].customer, date: earliestDate.toISOString(), table: mergedTable });
    invoices = await DB.invoices.all() || [];
    await resolveShiftRange();
    // استبدال صف أول فاتورة مدموجة في مكانه وحذف الباقي — بدون render كامل
    const firstId = ids[0];
    const firstTr = tableBody.querySelector('tr[data-invoice-id="' + firstId + '"]');
    const newInv = invoices.find(i => i.id === newId);
    let replaced = false;
    if (firstTr && newInv) {
      const oldItems = firstTr.nextElementSibling && firstTr.nextElementSibling.classList.contains('inv-items-row') ? firstTr.nextElementSibling : null;
      firstTr.replaceWith(buildInvoiceRow(newInv, shiftDateLabel));
      if (oldItems) oldItems.remove();
      replaced = true;
    }
    for (const id of ids) {
      const tr = tableBody.querySelector('tr[data-invoice-id="' + id + '"]');
      if (tr) {
        const it = tr.nextElementSibling && tr.nextElementSibling.classList.contains('inv-items-row') ? tr.nextElementSibling : null;
        tr.remove();
        if (it) it.remove();
      }
    }
    if (!replaced) { draw(); } else {
      updateStats(getFiltered());
      attachActions();
      updateMergeBtn();
      flashRow(newId);
    }
  } catch (e) {
    console.error('[merge] error:', e);
    alert('حدث خطأ أثناء دمج الفواتير');
  }
};

// ── إضافة منتجات لفاتورة موجودة ──
const addItemsModal = document.getElementById('addItemsModal');
let addInvId = null;
let _addProducts = null;
let _addSelected = [];

function addSelKey(name, hasMilk, note) { return (name || '') + '|' + (hasMilk ? '1' : '0') + '|' + (note || ''); }

function openAddItemsModal(inv) {
  if (inv.status === 'returned' || inv.status === 'مرتجعة' || inv.status === 'cancelled' || inv.status === 'ملغية') {
    alert('لا يمكن الإضافة لفاتورة مرتجعة/ملغية');
    return;
  }
  addInvId = inv.id;
  _addSelected = [];
  document.getElementById('addItemsInfo').innerHTML = '<b>' + escapeHtml(inv.id) + '</b> — ' + escapeHtml(inv.customer || '') +
    ' <span style="color:#888">| الحالي: <b id="addCurTotal">' + Number(inv.total || 0).toLocaleString() + '</b> ج.م ← بعد الإضافة: <b id="addNewTotal" style="color:#d97706">' + Number(inv.total || 0).toLocaleString() + '</b> ج.م</span>';
  document.getElementById('addSearch').value = '';
  renderAddGrid('');
  renderAddSelected();
  addItemsModal.classList.add('show');
}

function closeAddItemsModal() { addItemsModal.classList.remove('show'); }

function calcAddTotals() {
  const inv = invoices.find(i => i.id === addInvId);
  if (!inv) return;
  const cnt = document.getElementById('addSelCount');
  if (cnt) cnt.textContent = _addSelected.reduce((s, it) => s + it.qty, 0);
  const base = Number(_addSelected.reduce((s, it) => s + it.qty * it.price, 0));
  const existingBase = Number(inv.itemsValue != null ? inv.itemsValue : ((inv.items || []).reduce((s, it) => s + Number(it.qty || 1) * Number(it.price || 0), 0)));
  const ratio = existingBase > 0 && Number(inv.total || 0) > 0 ? (Number(inv.total) / existingBase) : 1;
  const newTotal = Math.round((existingBase + base) * ratio);
  const curEl = document.getElementById('addCurTotal');
  const newEl = document.getElementById('addNewTotal');
  if (curEl) curEl.textContent = Number(inv.total || 0).toLocaleString();
  if (newEl) newEl.textContent = newTotal.toLocaleString();
}

async function ensureProducts() {
  if (_addProducts) return _addProducts;
  try { _addProducts = await DB.products.all() || []; } catch (e) { console.warn('[additems] products:', e); _addProducts = []; }
  return _addProducts;
}

async function renderAddGrid(q) {
  const grid = document.getElementById('addProductsGrid');
  if (!grid) return;
  const prods = await ensureProducts();
  const val = (q || '').trim().toLowerCase();
  const list = prods.filter(p => !val || (p.name || '').toLowerCase().includes(val));
  grid.innerHTML = list.length ? '' : '<div style="grid-column:1/-1;text-align:center;color:#888;padding:14px">لا توجد منتجات مطابقة</div>';
  list.forEach(p => {
    const price = Number(p.price || 0);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'add-prod-card';
    b.innerHTML = '<span class="ap-name">' + escapeHtml(p.name) + '</span><span class="ap-price">' + price.toLocaleString() + ' ج.م</span>';
    b.onclick = () => {
      const key = addSelKey(p.name, false, '');
      const ex = _addSelected.find(it => it._key === key);
      if (ex) ex.qty += 1;
      else _addSelected.push({ _key: key, name: p.name, qty: 1, price: price, hasMilk: false, note: '' });
      renderAddSelected();
    };
    grid.appendChild(b);
  });
}

function renderAddSelected() {
  const box = document.getElementById('addSelectedList');
  if (!box) return;
  if (!_addSelected.length) {
    box.innerHTML = '<div style="text-align:center;color:#a8a29e;font-size:12px;padding:10px">اضغط على المنتجات لإضافتها</div>';
    calcAddTotals();
    return;
  }
  let html = '';
  _addSelected.forEach((it, idx) => {
    html += '<div class="add-sel-item">' +
      '<span class="as-name">' + escapeHtml(it.name) + '</span>' +
      '<span class="as-qty"><button type="button" data-act="minus" data-i="' + idx + '">−</button><b>' + it.qty + '</b><button type="button" data-act="plus" data-i="' + idx + '">+</button></span>' +
      '<label class="as-milk"><input type="checkbox" data-act="milk" data-i="' + idx + '"' + (it.hasMilk ? ' checked' : '') + '> لبن +15ج</label>' +
      '<input type="text" class="as-note" placeholder="ملاحظة" data-act="note" data-i="' + idx + '" value="' + escapeHtml(it.note || '') + '">' +
      '<button type="button" class="as-del" data-act="del" data-i="' + idx + '" title="إزالة"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>';
  });
  box.innerHTML = html;
  box.querySelectorAll('button[data-act], input[data-act]').forEach(el => {
    const act = el.dataset.act;
    const i = Number(el.dataset.i);
    if (act === 'plus') el.onclick = () => { _addSelected[i].qty += 1; renderAddSelected(); };
    if (act === 'minus') el.onclick = () => { _addSelected[i].qty -= 1; if (_addSelected[i].qty <= 0) _addSelected.splice(i, 1); renderAddSelected(); };
    if (act === 'del') el.onclick = () => { _addSelected.splice(i, 1); renderAddSelected(); };
    if (act === 'milk') el.onchange = () => {
      const it = _addSelected[i];
      it.hasMilk = el.checked;
      it.price += el.checked ? 15 : -15;
      rekeyItem(it);
      renderAddSelected();
    };
    if (act === 'note') {
      el.onchange = () => {
        const it = _addSelected[i];
        it.note = el.value.trim();
        rekeyItem(it);
        mergeDuplicates();
        renderAddSelected();
      };
    }
  });
  calcAddTotals();
}

function rekeyItem(it) { it._key = addSelKey(it.name, it.hasMilk, it.note); }

function mergeDuplicates() {
  const seen = {};
  const out = [];
  _addSelected.forEach(it => {
    if (seen[it._key]) { seen[it._key].qty += it.qty; }
    else { seen[it._key] = it; out.push(it); }
  });
  _addSelected.length = 0;
  out.forEach(it => _addSelected.push(it));
}

if (addItemsModal) {
  document.getElementById('closeAddItems').onclick = closeAddItemsModal;
  document.getElementById('cancelAddItems').onclick = closeAddItemsModal;
  document.getElementById('addSearch').addEventListener('input', function () { renderAddGrid(this.value); });
  window.addEventListener('click', e => { if (e.target === addItemsModal) closeAddItemsModal(); });
  document.getElementById('confirmAddItems').onclick = async () => {
    const btn = document.getElementById('confirmAddItems');
    const inv = invoices.find(i => i.id === addInvId);
    if (!inv) { closeAddItemsModal(); return; }
    const items = _addSelected.filter(it => it.qty > 0).map(it => ({ name: it.name, qty: it.qty, price: it.price, note: it.note, hasMilk: it.hasMilk }));
    if (!items.length) { alert('لم تضف أي منتجات'); return; }
    btn.disabled = true;
    try {
      // دمج الأصناف الجديدة مع القديمة (تكرار الاسم يزود الكمية)
      const merged = [];
      const map = {};
      (inv.items || []).forEach(it => {
        const k = addSelKey(it.name, it.hasMilk, it.note);
        if (map[k]) map[k].qty += Number(it.qty || 1);
        else { const c = Object.assign({}, it); map[k] = c; merged.push(c); }
      });
      items.forEach(it => {
        const k = addSelKey(it.name, it.hasMilk, it.note);
        if (map[k]) map[k].qty += it.qty;
        else { map[k] = Object.assign({}, it); merged.push(map[k]); }
      });

      // تسعير حسب نوع العميل عبر نسبة الفاتورة الحالية
      const oldTotal = Number(inv.total || 0);
      const addedBase = items.reduce((s, it) => s + it.qty * it.price, 0);
      const existingBase = Number(inv.itemsValue != null ? inv.itemsValue : (inv.items || []).reduce((s, x) => s + Number(x.qty || 1) * Number(x.price || 0), 0));
      const newBase = existingBase + addedBase;
      const ratio = existingBase > 0 && oldTotal > 0 ? (oldTotal / existingBase) : 1;
      const newTotal = Math.round(newBase * ratio);

      const paid = Number(inv.paid != null ? inv.paid : 0);
      const newPaid = Math.min(paid, newTotal);
      const newRemaining = Math.max(0, newTotal - newPaid);
      const scale = oldTotal > 0 ? (newTotal / oldTotal) : 1;
      const upd = {
        items: merged,
        total: newTotal,
        paid: newPaid,
        remaining: newRemaining,
        status: newRemaining <= 0 ? 'paid' : (invIsPending(inv) ? 'pending' : inv.status),
        itemsValue: Math.round(newBase),
        serviceAmount: Math.round(Number(inv.serviceAmount || 0) * scale),
        taxAmount: Math.round(Number(inv.taxAmount || 0) * scale)
      };
      await DB.invoices.update(inv.id, upd);
      await DB.audit.log('invoice_items_added', { id: inv.id, customer: inv.customer, added: items.map(it => it.name + ' ×' + it.qty), addedValue: addedBase, oldTotal, newTotal });
      closeAddItemsModal();
      await refreshSingle(inv.id);
    } catch (e) {
      console.error('[additems]', e);
      alert('حدث خطأ أثناء إضافة المنتجات: ' + (e.message || e));
    }
    btn.disabled = false;
  };
}

FB.onCollection('invoices', async (data) => {
  invoices = data;
  await resolveShiftRange();
  draw();
}).catch(e => {
  console.warn('[invoices] onSnapshot error, using fallback:', e);
  setInterval(render, 15000);
});

