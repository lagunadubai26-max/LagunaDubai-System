let employees = [];
let editId = null;

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

async function render() {
  employees = await DB.employees.all() || [];
  const existing = tableBody.querySelectorAll('.table-row:not(.table-header)');
  existing.forEach(r => r.remove());

  const val = searchInput ? searchInput.value.toLowerCase() : '';
  const jobVal = jobFilter ? jobFilter.value : 'كل الوظائف';
  const filtered = employees.filter(e => {
    return e.name.toLowerCase().includes(val) && (jobVal === 'كل الوظائف' || e.job === jobVal);
  });

  filtered.forEach(emp => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.dataset.id = emp.id;
    const stCls = emp.status === 'active' ? 'active' : emp.status === 'vacation' ? 'vacation' : 'stopped';
    const stTxt = emp.status === 'active' ? 'يعمل' : emp.status === 'vacation' ? 'إجازة' : 'موقوف';
    row.innerHTML = `
      <span>${escapeHtml(emp.name)}</span><span>${escapeHtml(emp.job)}</span><span>${escapeHtml(emp.phone || '—')}</span>
      <span style="display:none">${emp.salary ? Number(emp.salary).toLocaleString() + ' ج.م' : '—'}</span>
      <span>${escapeHtml(emp.hireDate || '—')}</span>
      <span class="status ${stCls}">${stTxt}</span>
      <div class="actions">
        <button class="edit-btn" data-id="${emp.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn" data-id="${emp.id}"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    tableBody.appendChild(row);
  });

  const cards = document.querySelectorAll('.employee-stats .stat-card h2');
  if (cards.length >= 4) {
    cards[0].textContent = employees.length;
    cards[1].textContent = employees.filter(e => e.status === 'active').length;
    cards[2].textContent = employees.filter(e => e.status === 'vacation').length;
    cards[3].textContent = employees.filter(e => e.status === 'stopped').length;
  }
  attachActions();
}

function attachActions() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const emp = employees.find(e => e.id === btn.dataset.id);
      if (!emp) return;
      editId = emp.id;
      modalTitle.textContent = 'تعديل موظف';
      nameInput.value = emp.name;
      jobInput.value = emp.job;
      phoneInput.value = emp.phone || '';
      hireDateInput.value = emp.hireDate || '';
      statusSelect.value = emp.status || 'active';
      pinInput.value = '';
      modal.classList.add('show');
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف الموظف؟')) return;
      await DB.employees.remove(btn.dataset.id);
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
    salary: '',
    hireDate: hireDateInput.value,
    status: statusSelect.value,
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
  if (editId) {
    await DB.employees.update(editId, data);
  } else {
    await DB.employees.add(data);
  }
  modal.classList.remove('show');
  render();
};

document.getElementById('cancelEmp').onclick = () => modal.classList.remove('show');
document.getElementById('closeEmpModal').onclick = () => modal.classList.remove('show');
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

if (searchInput) searchInput.addEventListener('keyup', render);
if (jobFilter) jobFilter.addEventListener('change', render);

render();
