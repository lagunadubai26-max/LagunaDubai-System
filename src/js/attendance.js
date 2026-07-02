const table = document.querySelector(".attendance-table");
const addBtn = document.querySelector(".add-employee-btn");
const modal = document.getElementById("employeeModal");
const employeeName = document.getElementById("employeeName");
const employeeJob = document.getElementById("employeeJob");
const employeeCancel = document.getElementById("cancelEmployee");
const employeeSave = document.getElementById("saveEmployee");
const closeBtn = document.getElementById("closeEmployeeModal");
let editRow = null;

async function render() {
  const existing = table.querySelectorAll(".attendance-row");
  existing.forEach(r => r.remove());

  let today = await DB.attendance.today() || [];

  if (today.length === 0) {
    const employees = await DB.employees.all() || [];
    for (const emp of employees) {
      await DB.attendance.checkIn(emp.id, emp.name, emp.job);
    }
    today = await DB.attendance.today() || [];
  }

  today.forEach(a => {
    const row = document.createElement("div");
    row.className = "attendance-row";
    row.dataset.id = a.id;
    const stCls = a.status === 'present' ? 'present' : a.status === 'late' ? 'late' : 'absent';
    const stTxt = a.status === 'present' ? 'حاضر' : a.status === 'late' ? 'متأخر' : 'غائب';
    row.innerHTML = `
      <span>${a.name}</span><span>${a.job}</span>
      <span class="in-time">${a.checkIn || '—'}</span>
      <span class="out-time">${a.checkOut || '—'}</span>
      <span class="status ${stCls}">${stTxt}</span>
      <div class="actions">
        <button class="check-btn"><i class="fa-solid fa-right-to-bracket"></i></button>
        <button class="leave-btn"><i class="fa-solid fa-right-from-bracket"></i></button>
        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    table.appendChild(row);
  });

  updateStats();
  attachEvents();
}

async function updateStats() {
  const today = await DB.attendance.today() || [];
  const all = await DB.employees.all() || [];
  const e = document.getElementById("employeesCount");
  const p = document.getElementById("presentCount");
  const l = document.getElementById("lateCount");
  const a = document.getElementById("absentCount");
  if (e) e.textContent = all.length;
  if (p) p.textContent = today.filter(x => x.status === 'present').length;
  if (l) l.textContent = today.filter(x => x.status === 'late').length;
  if (a) a.textContent = today.filter(x => x.status === 'absent').length;
}

function attachEvents() {
  document.querySelectorAll(".attendance-row").forEach(row => {
    row.querySelector(".check-btn").onclick = async function () {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
      row.querySelector(".in-time").innerText = timeStr;
      const statusEl = row.querySelector(".status");
      statusEl.className = "status present";
      statusEl.innerText = "حاضر";
      await DB.attendance.checkIn(row.dataset.id, row.children[0].innerText, row.children[1].innerText);
      updateStats();
    };
    row.querySelector(".leave-btn").onclick = async function () {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
      row.querySelector(".out-time").innerText = timeStr;
      await DB.attendance.checkOut(row.dataset.id);
    };
    row.querySelector(".edit-btn").onclick = function () {
      editRow = row;
      employeeName.value = row.children[0].innerText;
      employeeJob.value = row.children[1].innerText;
      openModal();
    };
    row.querySelector(".delete-btn").onclick = async function () {
      if (!confirm("هل تريد حذف الموظف من الحضور؟")) return;
      await DB.attendance.remove(row.dataset.id);
      row.remove();
      updateStats();
    };
  });
}

function openModal() { modal.classList.add("show"); }
function closeModal() { modal.classList.remove("show"); }
if (employeeCancel) employeeCancel.addEventListener("click", closeModal);
if (closeBtn) closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

employeeSave.onclick = async function () {
  const name = employeeName.value.trim();
  const job = employeeJob.value.trim();
  if (!name || !job) return;
  if (editRow) {
    editRow.children[0].innerText = name;
    editRow.children[1].innerText = job;
  } else {
    const emp = await DB.employees.add({ name, job, phone: '', salary: '', hireDate: '', status: 'active' }) || { id: Date.now().toString(36) };
    await DB.attendance.checkIn(emp.id, name, job);
  }
  closeModal();
  render();
};

if (addBtn) {
  addBtn.onclick = () => {
    editRow = null;
    employeeName.value = "";
    employeeJob.value = "";
    openModal();
  };
}

render();
