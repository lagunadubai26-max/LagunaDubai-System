function shiftTime12h(val) {
  if (!val) return '—';
  const parts = val.split(':');
  if (parts.length < 2) return val;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return h.toString().padStart(2,'0') + ':' + m + ' ' + ampm;
}

function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  let h = d.getHours();
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return h.toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0') + ' ' + ampm;
}

function nowTime12h() {
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return h.toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ' ' + ampm;
}

function parseTime12h(str) {
  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(ص|م)?$/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3];
  if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) return null;
  if (ampm === 'م' && h < 12) h += 12;
  if (ampm === 'ص' && h === 12) h = 0;
  return { h, m };
}

const table = document.querySelector(".attendance-table");
const searchInput = document.querySelector('.filter-box input');
const dateFilter = document.querySelector('.filter-box input[type="date"]');

const detailsModal = document.getElementById("employeeDetailsModal");
const closeDetailsModal = document.getElementById("closeDetailsModal");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");

let cachedEmployees = [];
let cachedRecords = [];

async function render() {
  const existing = table.querySelectorAll(".table-row:not(.table-header)");
  existing.forEach(r => r.remove());

  cachedEmployees = await DB.employees.all() || [];
  cachedRecords = await DB.attendance.today() || [];

  const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

  let filtered = cachedEmployees;
  if (searchVal) {
    filtered = filtered.filter(e => (e.name && e.name.toLowerCase().includes(searchVal)) || (e.job && e.job.toLowerCase().includes(searchVal)));
  }

  filtered.forEach(emp => {
    const record = cachedRecords.find(r => r.employeeId === emp.id);
    const row = document.createElement("div");
    row.className = "table-row";
    row.dataset.id = emp.id;
    row.dataset.recordId = record ? record.id : '';

    const stCls = record ? (record.status === 'present' ? 'present' : record.status === 'late' ? 'late' : 'absent') : 'absent';
    const stTxt = record ? (record.status === 'present' ? 'حاضر' : record.status === 'late' ? 'متأخر' : 'غائب') : 'غائب';
    const checkInTime = record && record.checkIn ? formatTime(record.checkIn) : '—';
    const checkOutTime = record && record.checkOut ? formatTime(record.checkOut) : '—';
    const expectedTime = shiftTime12h(emp.shiftTime);

    row.innerHTML = `
      <span class="emp-name-click">${escapeHtml(emp.name)}</span>
      <span>${escapeHtml(emp.job || '—')}</span>
      <span style="font-size:12px;color:var(--muted)">${expectedTime}</span>
      <span>${escapeHtml(checkInTime)}</span>
      <span>${escapeHtml(checkOutTime)}</span>
      <span class="status ${stCls}">${stTxt}</span>
      <div class="actions">
        <button class="check-btn" title="تسجيل حضور" ${record ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}><i class="fa-solid fa-right-to-bracket"></i></button>
        <button class="leave-btn" title="تسجيل انصراف" ${!record || record.checkOut ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}><i class="fa-solid fa-right-from-bracket"></i></button>
        <button class="delete-btn" title="حذف تسجيل اليوم" ${!record ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}><i class="fa-solid fa-trash"></i></button>
      </div>`;
    table.appendChild(row);
  });

  updateStats(cachedEmployees, cachedRecords);
  attachEvents(cachedEmployees, cachedRecords);
}

function updateStats(employees, records) {
  const e = document.getElementById("employeesCount");
  const p = document.getElementById("presentCount");
  const l = document.getElementById("lateCount");
  const a = document.getElementById("absentCount");
  if (e) e.textContent = employees.length;
  if (p) p.textContent = records.filter(x => x.status === 'present').length;
  if (l) l.textContent = records.filter(x => x.status === 'late').length;
  if (a) a.textContent = employees.length - records.filter(x => x.status === 'present' || x.status === 'late').length;
}

function attachEvents(employees, records) {
  document.querySelectorAll(".attendance-table .table-row:not(.table-header)").forEach(row => {
    const empId = row.dataset.id;
    const recordId = row.dataset.recordId;
    const emp = employees.find(x => x.id === empId);

    row.querySelector(".emp-name-click").onclick = () => { showEmployeeDetails(emp); };

    const checkBtn = row.querySelector(".check-btn");
    if (checkBtn && !checkBtn.disabled) {
      checkBtn.onclick = async () => {
        const now = new Date();
        let def;
        if (emp.shiftTime) {
          const parts = emp.shiftTime.split(':');
          if (parts.length >= 2) {
            let h = parseInt(parts[0], 10);
            const m = parts[1];
            const ampm = h >= 12 ? 'م' : 'ص';
            h = h % 12 || 12;
            def = h.toString().padStart(2,'0') + ':' + m + ' ' + ampm;
          } else { def = nowTime12h(); }
        } else { def = nowTime12h(); }
        const input = prompt('وقت الحضور (مثال: 09:30 ص أو 05:45 م)', def);
        if (input === null) return;
        const parsed = parseTime12h(input);
        if (parsed) now.setHours(parsed.h, parsed.m, 0, 0);
        await DB.attendance.checkIn(emp.id, emp.name, emp.job || '', now.toISOString());
        render();
      };
    }

    const leaveBtn = row.querySelector(".leave-btn");
    if (leaveBtn && !leaveBtn.disabled) {
      leaveBtn.onclick = async () => {
        const now = new Date();
        const def = nowTime12h();
        const input = prompt('وقت الانصراف (مثال: 05:30 م أو 11:00 ص)', def);
        if (input === null) return;
        const parsed = parseTime12h(input);
        if (parsed) now.setHours(parsed.h, parsed.m, 0, 0);
        await DB.attendance.checkOut(recordId, now.toISOString());
        render();
      };
    }

    const delBtn = row.querySelector(".delete-btn");
    if (delBtn && !delBtn.disabled) {
      delBtn.onclick = async () => {
        if (!confirm("هل تريد حذف تسجيل حضور الموظف لهذا اليوم؟")) return;
        await DB.attendance.remove(recordId);
        render();
      };
    }
  });
}

async function showEmployeeDetails(emp) {
  if (!emp) return;
  document.getElementById("detName").textContent = emp.name;
  document.getElementById("detJob").textContent = emp.job || '—';
  document.getElementById("detPhone").textContent = emp.phone || '—';
  document.getElementById("detSalary").textContent = emp.salary ? (emp.salary + ' ج.م') : '—';
  document.getElementById("detHireDate").textContent = emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('ar-EG') : '—';
  document.getElementById("detStatus").textContent = emp.status === 'active' ? 'نشط' : 'غير نشط';
  document.getElementById("detPin").textContent = emp.pin || '—';

  const historyList = document.getElementById("detHistoryList");
  historyList.innerHTML = '<tr><td colspan="4" style="padding:20px;color:#888"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل السجل...</td></tr>';

  try {
    const allAtt = await DB.attendance.all() || [];
    const empHistory = allAtt.filter(a => a.employeeId === emp.id);
    empHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = '';
    if (empHistory.length === 0) {
      historyList.innerHTML = '<tr><td colspan="4" style="padding:20px;color:#888">لا يوجد سجلات حضور سابقة لهذا الموظف</td></tr>';
    } else {
      empHistory.forEach(h => {
        const dateStr = h.date ? new Date(h.date).toLocaleDateString('ar-EG') : '—';
        const stCls = h.status === 'present' ? 'present' : h.status === 'late' ? 'late' : 'absent';
        const stTxt = h.status === 'present' ? 'حاضر' : h.status === 'late' ? 'متأخر' : 'غائب';
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="padding:10px;border-bottom:1px solid var(--border)">${dateStr}</td>
          <td style="padding:10px;border-bottom:1px solid var(--border)">${escapeHtml(formatTime(h.checkIn))}</td>
          <td style="padding:10px;border-bottom:1px solid var(--border)">${escapeHtml(formatTime(h.checkOut))}</td>
          <td style="padding:10px;border-bottom:1px solid var(--border)"><span class="status ${stCls}" style="padding:2px 8px;font-size:11px">${stTxt}</span></td>`;
        historyList.appendChild(tr);
      });
    }
  } catch (e) {
    console.error('Error fetching history:', e);
    historyList.innerHTML = '<tr><td colspan="4" style="padding:20px;color:#dc2626">حدث خطأ أثناء تحميل السجل</td></tr>';
  }

  detailsModal.classList.add("show");
}

function closeDetails() { detailsModal.classList.remove("show"); }

if (closeDetailsModal) closeDetailsModal.addEventListener("click", closeDetails);
if (closeDetailsBtn) closeDetailsBtn.addEventListener("click", closeDetails);
window.addEventListener("click", function (e) {
  if (e.target === detailsModal) closeDetails();
});

if (searchInput) searchInput.addEventListener('keyup', render);

render();
