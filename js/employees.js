let employees = [];
let editId = null;
let renderBusy = false;
let renderPending = false;
let loadedOnce = false;

const tableBody = document.querySelector('.employees-table');
const searchInput = document.querySelector('.filter-box input');
const jobFilter = document.querySelector('.filter-box select');
const addBtn = document.querySelector('.add-btn');
const modal = document.getElementById('empModal');
const modalTitle = document.getElementById('empModalTitle');
const nameInput = document.getElementById('empName');
const jobInput = document.getElementById('empJob');
const phoneInput = document.getElementById('empPhone');
const salaryInput = document.getElementById('empSalary');
const hireDateInput = document.getElementById('empHireDate');
const statusSelect = document.getElementById('empStatus');
const pinInput = document.getElementById('empPin');
const shiftTimeInput = document.getElementById('empShiftTime');

// ── السلف والمرتبات ──
let advances = [];
let salaryPayments = [];
let advEmpId = null;
let _advPendingByEmp = {};

const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function monthKeyOf(d) { const x = d || FB.clockNow(); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'); }
function monthAr(mk) { const p = safeStr(mk).split('-'); const m = AR_MONTHS[Number(p[1]) - 1] || p[1]; return m + ' ' + (p[0] || ''); }

function pendingAdvancesFor(empId) {
  return (advances || []).filter(a => a && a.employeeId === empId && a.status !== 'settled');
}
function pendingAdvTotal(empId) {
  return pendingAdvancesFor(empId).reduce((s, a) => s + Number(a.amount || 0), 0);
}

async function loadAdvData() {
  try { advances = await DB.advances.all() || []; } catch (e) { console.warn('[employees] advances:', e); advances = []; }
  try { salaryPayments = await DB.salaryPayments.all() || []; } catch (e) { console.warn('[employees] salaries:', e); salaryPayments = []; }
}

function safeStr(v) { return v == null ? '' : String(v); }

function shiftTime12h(val) {
  const s = safeStr(val);
  if (!s || s === '—') return '—';
  const parts = s.split(':');
  if (parts.length < 2) return s;
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return s;
  const m = parts[1];
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return h.toString().padStart(2,'0') + ':' + m + ' ' + ampm;
}

function buildRow(emp) {
  const row = document.createElement('div');
  row.className = 'table-row';
  row.dataset.id = emp.id;
  const stCls = emp.status === 'active' ? 'active' : emp.status === 'vacation' ? 'vacation' : 'stopped';
  const stTxt = emp.status === 'active' ? 'يعمل' : emp.status === 'vacation' ? 'إجازة' : 'موقوف';
  const salary = !isNaN(Number(emp.salary)) && emp.salary !== '' && emp.salary != null
    ? Number(emp.salary).toLocaleString() + ' ج.م'
    : '—';
  const advTotal = _advPendingByEmp[emp.id] || 0;
  row.innerHTML = `
    <span>${escapeHtml(safeStr(emp.name))}${advTotal > 0 ? ' <span class="adv-badge" title="سلف مستحقة تخصم من المرتب">سلف: ' + advTotal.toLocaleString() + ' ج.م</span>' : ''}</span><span>${escapeHtml(safeStr(emp.job))}</span><span>${escapeHtml(safeStr(emp.phone) || '—')}</span>
    <span style="display:none">${salary}</span>
    <span>${escapeHtml(safeStr(emp.hireDate) || '—')}</span>
    <span>${shiftTime12h(emp.shiftTime)}</span>
    <span class="status ${stCls}">${stTxt}</span>
    <div class="actions">
      <button class="advance-btn" data-id="${escapeHtml(safeStr(emp.id))}" title="سلفة"><i class="fa-solid fa-hand-holding-dollar"></i></button>
      <button class="edit-btn" data-id="${escapeHtml(safeStr(emp.id))}"><i class="fa-solid fa-pen"></i></button>
      <button class="delete-btn" data-id="${escapeHtml(safeStr(emp.id))}"><i class="fa-solid fa-trash"></i></button>
    </div>`;
  return row;
}

async function render(force) {
  if (renderBusy) { renderPending = true; return; }
  renderBusy = true;
  try {
    let data;
    try {
      data = await DB.employees.all();
    } catch (e) {
      console.error('[employees] fetch error:', e);
      showEmptyState('حدث خطأ أثناء تحميل الموظفين. اضغط "بحث" للمحاولة مرة أخرى.');
      return;
    }
    if (!data || !Array.isArray(data) || data.length === 0) {
      if (loadedOnce && !force) return;
      employees = [];
    } else {
      employees = data;
      loadedOnce = true;
    }
    await loadAdvData();
    _advPendingByEmp = {};
    employees.forEach(e => { const t = pendingAdvTotal(e.id); if (t > 0) _advPendingByEmp[e.id] = t; });

    const val = searchInput ? searchInput.value.toLowerCase() : '';
    const jobVal = jobFilter ? jobFilter.value : 'كل الوظائف';
    const filtered = [];
    for (const e of employees) {
      try {
        if (e && e.name && safeStr(e.name).toLowerCase().includes(val) && (jobVal === 'كل الوظائف' || safeStr(e.job) === jobVal)) {
          filtered.push(e);
        }
      } catch (_) {}
    }

    const existing = tableBody.querySelectorAll('.table-row:not(.table-header)');
    existing.forEach(r => r.remove());

    if (filtered.length === 0) {
      showEmptyState('لا يوجد موظفون مطابقون للبحث');
    } else {
      hideEmptyState();
      for (const emp of filtered) {
        try {
          tableBody.appendChild(buildRow(emp));
        } catch (e) {
          console.error('[employees] row build error:', e);
        }
      }
    }

    const cards = document.querySelectorAll('.employee-stats .stat-card h2');
    if (cards.length >= 4) {
      cards[0].textContent = employees.length;
      cards[1].textContent = employees.filter(e => e.status === 'active').length;
      cards[2].textContent = employees.filter(e => e.status === 'vacation').length;
      cards[3].textContent = employees.filter(e => e.status === 'stopped').length;
    }
    attachActions();
    checkSalaryReminder();
  } catch (e) {
    console.error('[employees] render error:', e);
  } finally {
    renderBusy = false;
    if (renderPending) {
      renderPending = false;
      render();
    }
  }
}

function showEmptyState(msg) {
  hideEmptyState();
  const div = document.createElement('div');
  div.id = 'empEmptyState';
  div.style.cssText = 'padding:40px;text-align:center;color:#888;font-size:15px';
  div.textContent = msg;
  tableBody.appendChild(div);
}

function hideEmptyState() {
  const el = document.getElementById('empEmptyState');
  if (el) el.remove();
}

function attachActions() {
  document.querySelectorAll('.advance-btn').forEach(btn => {
    btn.onclick = () => {
      const emp = employees.find(e => e.id === btn.dataset.id);
      if (!emp) return;
      openAdvanceModal(emp);
    };
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const emp = employees.find(e => e.id === btn.dataset.id);
      if (!emp) return;
      editId = emp.id;
      modalTitle.textContent = 'تعديل موظف';
      nameInput.value = safeStr(emp.name);
      jobInput.value = safeStr(emp.job);
      phoneInput.value = safeStr(emp.phone);
      salaryInput.value = safeStr(emp.salary);
      hireDateInput.value = safeStr(emp.hireDate);
      statusSelect.value = safeStr(emp.status) || 'active';
      pinInput.value = '';
      shiftTimeInput.value = safeStr(emp.shiftTime);
      modal.classList.add('show');
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف الموظف؟')) return;
      try {
        await DB.employees.remove(btn.dataset.id);
      } catch (e) {
        console.error('[employees] delete error:', e);
        alert('حدث خطأ أثناء الحذف');
        return;
      }
      render();
    };
  });
}

if (addBtn) {
  addBtn.onclick = () => {
    editId = null;
    modalTitle.textContent = 'إضافة موظف';
    nameInput.value = '';
    jobInput.value = '';
    phoneInput.value = '';
    hireDateInput.value = '';
    statusSelect.value = 'active';
    pinInput.value = '';
    shiftTimeInput.value = '';
    modal.classList.add('show');
  };
}

document.getElementById('saveEmp').onclick = async () => {
  const name = nameInput.value.trim();
  const job = jobInput.value.trim();
  if (!name || !job) return alert('يرجى إدخال الاسم والوظيفة');
  let pin = pinInput.value.trim() || null;
  const data = {
    name,
    job,
    phone: phoneInput.value.trim(),
    salary: salaryInput.value.trim() || '',
    hireDate: hireDateInput.value,
    status: statusSelect.value,
    shiftTime: shiftTimeInput.value || '',
    pin: null
  };
  if (pin) {
    try {
      const hashedPin = await PASSWORD_UTILS.hash(pin);
      data.pin = hashedPin;
    } catch (e) {
      console.error('[employees] failed to hash PIN:', e);
      data.pin = pin;
    }
  } else if (editId) {
    delete data.pin;
  }
  try {
    if (editId) {
      await DB.employees.update(editId, data);
    } else {
      await DB.employees.add(data);
    }
    modal.classList.remove('show');
    render();
  } catch (e) {
    console.error('[employees] save error:', e);
    alert('حدث خطأ أثناء الحفظ');
  }
};

document.getElementById('cancelEmp').onclick = () => modal.classList.remove('show');
document.getElementById('closeEmpModal').onclick = () => modal.classList.remove('show');
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

if (searchInput) searchInput.addEventListener('keyup', render);
if (jobFilter) jobFilter.addEventListener('change', render);
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) searchBtn.addEventListener('click', () => render(true));

// ══════════ السلف وصرف المرتبات ══════════
const advanceModal = document.getElementById('advanceModal');
const payrollModal = document.getElementById('payrollModal');

function openAdvanceModal(emp) {
  advEmpId = emp.id;
  document.getElementById('advEmpName').textContent = safeStr(emp.name);
  document.getElementById('advAmount').value = '';
  document.getElementById('advNote').value = '';
  const n = FB.clockNow();
  document.getElementById('advDate').value = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  advanceModal.classList.add('show');
}

function closeAdvanceModal() { advanceModal.classList.remove('show'); }

document.getElementById('closeAdvModal').onclick = closeAdvanceModal;
document.getElementById('cancelAdv').onclick = closeAdvanceModal;
window.addEventListener('click', e => { if (e.target === advanceModal) closeAdvanceModal(); });

document.getElementById('saveAdv').onclick = async () => {
  const emp = employees.find(e => e.id === advEmpId);
  if (!emp) { closeAdvanceModal(); return; }
  const amount = Number(document.getElementById('advAmount').value);
  if (!amount || amount <= 0) return alert('أدخل مبلغ صحيح');
  const note = document.getElementById('advNote').value.trim();
  const dateStr = document.getElementById('advDate').value;
  try {
    await DB.advances.add({
      employeeId: emp.id,
      employeeName: safeStr(emp.name),
      amount: Math.round(amount),
      note,
      date: dateStr ? new Date(dateStr + 'T12:00:00').toISOString() : FB.nowISO(),
      monthKey: monthKeyOf(dateStr ? new Date(dateStr + 'T12:00:00') : FB.clockNow()),
      status: 'pending'
    });
    DB.audit.log('employee_advance', { id: emp.id, name: safeStr(emp.name), amount: Math.round(amount), note }).catch(() => {});
    closeAdvanceModal();
    render();
  } catch (e) {
    console.error('[employees] advance save error:', e);
    alert('حدث خطأ أثناء حفظ السلفة');
  }
};

// ── نافذة صرف المرتبات ──
async function openPayrollModal() {
  await loadAdvData();
  const mk = monthKeyOf();
  document.getElementById('payrollMonth').textContent = monthAr(mk);
  payrollModal.classList.add('show');
  renderPayrollList();
}

function renderPayrollList() {
  const box = document.getElementById('payrollList');
  if (!box) return;
  const mk = monthKeyOf();
  const actives = employees.filter(e => e.status === 'active' && Number(e.salary) > 0);
  if (!actives.length) {
    box.innerHTML = '<div style="text-align:center;color:#a8a29e;padding:20px;font-size:14px">لا يوجد موظفين نشطين بمرتب محدد</div>';
    return;
  }
  let html = '';
  actives.forEach(emp => {
    const salary = Math.round(Number(emp.salary));
    const pend = pendingAdvancesFor(emp.id);
    const advTotal = pend.reduce((s, a) => s + Number(a.amount || 0), 0);
    const net = Math.max(0, salary - advTotal);
    const paid = (salaryPayments || []).some(p => p && p.employeeId === emp.id && p.monthKey === mk);
    let advLines = '';
    pend.forEach(a => {
      advLines += '<div class="pr-adv-line"><span>' + escapeHtml(safeStr(a.date).slice(0, 10)) + (a.note ? ' — ' + escapeHtml(safeStr(a.note)) : '') + '</span><span style="display:flex;align-items:center;gap:6px"><b>' + Number(a.amount || 0).toLocaleString() + ' ج.م</b><button type="button" class="pr-adv-del" data-aid="' + escapeHtml(safeStr(a.id)) + '" title="حذف السلفة"><i class="fa-solid fa-trash"></i></button></span></div>';
    });
    html += '<div class="pr-row' + (paid ? ' pr-paid' : '') + '">' +
      '<div class="pr-head">' +
      '<span class="pr-name">' + escapeHtml(safeStr(emp.name)) + '</span>' +
      '<span class="pr-net">' + net.toLocaleString() + ' ج.م</span>' +
      (paid
        ? '<span class="pr-done"><i class="fa-solid fa-circle-check"></i> تم الصرف</span>'
        : '<button type="button" class="pr-pay" data-id="' + escapeHtml(safeStr(emp.id)) + '"><i class="fa-solid fa-money-bill-wave"></i> صرف</button>') +
      '</div>' +
      '<div class="pr-calc">المرتب: <b>' + salary.toLocaleString() + '</b>' + (advTotal > 0 ? ' − سلف: <b style="color:#dc2626">' + advTotal.toLocaleString() + '</b> = الصافي: <b style="color:#16a34a">' + net.toLocaleString() + '</b>' : '') + '</div>' +
      (advLines ? '<div class="pr-advs">' + advLines + '</div>' : '') +
      '</div>';
  });
  box.innerHTML = html;

  box.querySelectorAll('.pr-pay').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('تأكيد صرف المرتب وتسجيله كمصروف "مرتبات"؟')) return;
      btn.disabled = true;
      try {
        const emp = employees.find(e => e.id === btn.dataset.id);
        if (!emp) return;
        const salary = Math.round(Number(emp.salary));
        const pend = pendingAdvancesFor(emp.id);
        const advTotal = pend.reduce((s, a) => s + Number(a.amount || 0), 0);
        const net = Math.max(0, salary - advTotal);
        await DB.salaryPayments.add({
          employeeId: emp.id,
          employeeName: safeStr(emp.name),
          monthKey: mk,
          gross: salary,
          advancesDeducted: advTotal,
          net,
          date: FB.nowISO()
        });
        for (const a of pend) {
          try { await DB.advances.update(a.id, { status: 'settled', settledAt: FB.nowISO(), settledMonthKey: mk }); } catch (e) {}
        }
        await DB.expenses.add({
          description: 'راتب ' + safeStr(emp.name) + ' — ' + monthAr(mk) + (advTotal > 0 ? ' (بعد خصم سلف ' + advTotal.toLocaleString() + ')' : ''),
          amount: net,
          category: 'مرتبات',
          date: FB.nowISO()
        });
        DB.audit.log('salary_paid', { id: emp.id, name: safeStr(emp.name), monthKey: mk, gross: salary, advancesDeducted: advTotal, net }).catch(() => {});
        await loadAdvData();
        renderPayrollList();
        checkSalaryReminder();
      } catch (e) {
        console.error('[employees] salary pay error:', e);
        alert('حدث خطأ أثناء الصرف');
        btn.disabled = false;
      }
    };
  });

  box.querySelectorAll('.pr-adv-del').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('حذف هذه السلفة؟ (لن تخصم من المرتب)')) return;
      try {
        await DB.advances.remove(btn.dataset.aid);
        await loadAdvData();
        renderPayrollList();
      } catch (e) {
        alert('حدث خطأ أثناء الحذف');
      }
    };
  });
}

document.getElementById('payrollBtn')?.addEventListener('click', openPayrollModal);
document.getElementById('reminderPayBtn').addEventListener('click', openPayrollModal);
document.getElementById('closePayrollModal').onclick = () => payrollModal.classList.remove('show');
document.getElementById('cancelPayroll').onclick = () => payrollModal.classList.remove('show');
window.addEventListener('click', e => { if (e.target === payrollModal) payrollModal.classList.remove('show'); });

// ── تذكير توريد المرتبات أول كل شهر ──
function checkSalaryReminder() {
  const el = document.getElementById('salaryReminder');
  if (!el) return;
  const now = FB.clockNow();
  const day = now.getDate();
  const mk = monthKeyOf(now);
  const actives = employees.filter(e => e.status === 'active' && Number(e.salary) > 0);
  if (!actives.length) { el.style.display = 'none'; return; }
  const paidIds = new Set((salaryPayments || []).filter(p => p && p.monthKey === mk).map(p => p.employeeId));
  const unpaid = actives.filter(e => !paidIds.has(e.id));
  if (day <= 10 && unpaid.length > 0) {
    el.style.display = 'flex';
    document.getElementById('reminderTxt').innerHTML =
      '⏰ تذكير: <b>توريد مرتبات ' + monthAr(mk) + '</b> — متبقي <b>' + unpaid.length + '</b> من ' + actives.length + ' موظف لم يتم صرفهم';
  } else {
    el.style.display = 'none';
  }
}

render();
