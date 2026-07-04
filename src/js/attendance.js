const table = document.querySelector(".attendance-table");

// Details Modal Elements
const detailsModal = document.getElementById("employeeDetailsModal");
const closeDetailsModal = document.getElementById("closeDetailsModal");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");

async function render() {
  const existing = table.querySelectorAll(".attendance-row");
  existing.forEach(r => r.remove());

  const employees = await DB.employees.all() || [];
  const todayRecords = await DB.attendance.today() || [];

  employees.forEach(emp => {
    const record = todayRecords.find(r => r.employeeId === emp.id);
    const row = document.createElement("div");
    row.className = "attendance-row";
    row.dataset.id = emp.id; // employee ID
    row.dataset.recordId = record ? record.id : '';

    const stCls = record ? (record.status === 'present' ? 'present' : record.status === 'late' ? 'late' : 'absent') : 'absent';
    const stTxt = record ? (record.status === 'present' ? 'حاضر' : record.status === 'late' ? 'متأخر' : 'غائب') : 'غائب';
    const checkInTime = record ? (record.checkIn || '—') : '—';
    const checkOutTime = record ? (record.checkOut || '—') : '—';

    row.innerHTML = `
      <span class="emp-name-click" style="cursor:pointer;color:var(--primary);font-weight:600;text-decoration:underline">${escapeHtml(emp.name)}</span>
      <span>${escapeHtml(emp.job || '—')}</span>
      <span class="in-time">${checkInTime}</span>
      <span class="out-time">${checkOutTime}</span>
      <span class="status ${stCls}">${stTxt}</span>
      <div class="actions" style="display:flex;gap:6px">
        <button class="check-btn" title="تسجيل حضور" ${record ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}><i class="fa-solid fa-right-to-bracket"></i></button>
        <button class="leave-btn" title="تسجيل انصراف" ${!record || record.checkOut ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}><i class="fa-solid fa-right-from-bracket"></i></button>
        <button class="delete-btn" title="حذف تسجيل اليوم" ${!record ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}><i class="fa-solid fa-trash"></i></button>
      </div>`;
    table.appendChild(row);
  });

  updateStats(employees, todayRecords);
  attachEvents(employees, todayRecords);
}

function updateStats(employees, todayRecords) {
  const e = document.getElementById("employeesCount");
  const p = document.getElementById("presentCount");
  const l = document.getElementById("lateCount");
  const a = document.getElementById("absentCount");
  if (e) e.textContent = employees.length;
  if (p) p.textContent = todayRecords.filter(x => x.status === 'present').length;
  if (l) l.textContent = todayRecords.filter(x => x.status === 'late').length;
  if (a) a.textContent = employees.length - todayRecords.filter(x => x.status === 'present' || x.status === 'late').length;
}

function attachEvents(employees, todayRecords) {
  document.querySelectorAll(".attendance-row").forEach(row => {
    const empId = row.dataset.id;
    const recordId = row.dataset.recordId;
    const emp = employees.find(x => x.id === empId);

    // Click employee name to view profile and attendance history
    row.querySelector(".emp-name-click").onclick = () => {
      showEmployeeDetails(emp);
    };

    // Check-in click
    const checkBtn = row.querySelector(".check-btn");
    if (checkBtn && !checkBtn.disabled) {
      checkBtn.onclick = async () => {
        await DB.attendance.checkIn(emp.id, emp.name, emp.job || '');
        render();
      };
    }

    // Check-out click
    const leaveBtn = row.querySelector(".leave-btn");
    if (leaveBtn && !leaveBtn.disabled) {
      leaveBtn.onclick = async () => {
        await DB.attendance.checkOut(recordId);
        render();
      };
    }

    // Delete (reset today's record)
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

// Show Employee Detail & History
async function showEmployeeDetails(emp) {
  if (!emp) return;
  document.getElementById("detName").textContent = emp.name;
  document.getElementById("detJob").textContent = emp.job || '—';
  document.getElementById("detPhone").textContent = emp.phone || '—';
  document.getElementById("detSalary").textContent = emp.salary ? (emp.salary + ' ج.م') : '—';
  document.getElementById("detHireDate").textContent = emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('ar-EG') : '—';
  document.getElementById("detStatus").textContent = emp.status === 'active' ? 'نشط' : 'غير نشط';
  document.getElementById("detPin").textContent = emp.pin || '—';

  // Load history list
  const historyList = document.getElementById("detHistoryList");
  historyList.innerHTML = '<tr><td colspan="4" style="padding:20px;color:#888"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل السجل...</td></tr>';

  try {
    const allAtt = await DB.attendance.all() || [];
    const empHistory = allAtt.filter(a => a.employeeId === emp.id);
    
    // Sort history by date descending
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
          <td style="padding:10px;border-bottom:1px solid var(--border)">${escapeHtml(h.checkIn || '—')}</td>
          <td style="padding:10px;border-bottom:1px solid var(--border)">${escapeHtml(h.checkOut || '—')}</td>
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

render();
