let employees = [];
let editId = null;

const tableBody = document.querySelector('.employees-table');
const searchInput = document.querySelector('.filter-box input');
const jobFilter = document.querySelector('.filter-box select');
const addBtn = document.querySelector('.add-btn');

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
      <span>${emp.name}</span><span>${emp.job}</span><span>${emp.phone || '—'}</span>
      <span>${emp.salary ? Number(emp.salary).toLocaleString() + ' ج.م' : '—'}</span>
      <span>${emp.hireDate || '—'}</span>
      <span class="status ${stCls}">${stTxt}</span>
      <div class="actions">
        <button class="view-btn" data-id="${emp.id}"><i class="fa-solid fa-eye"></i></button>
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
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = () => {
      const emp = employees.find(e => e.id === btn.dataset.id);
      if (emp) alert(`الاسم: ${emp.name}\nالوظيفة: ${emp.job}\nالهاتف: ${emp.phone || '—'}\nالراتب: ${emp.salary || '—'}\nتاريخ التعيين: ${emp.hireDate || '—'}\nالرقم السري: ${emp.pin || 'بدون'}`);
    };
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async () => {
      const emp = employees.find(e => e.id === btn.dataset.id);
      if (!emp) return;
      const name = prompt('اسم الموظف', emp.name);
      if (!name) return;
      const job = prompt('الوظيفة', emp.job);
      if (!job) return;
      const phone = prompt('رقم الهاتف', emp.phone || '');
      const salary = prompt('الراتب', emp.salary || '');
      const hireDate = prompt('تاريخ التعيين', emp.hireDate || '');
      const status = prompt('الحالة (active/vacation/stopped)', emp.status || 'active');
      const pin = prompt('الرقم السري (4 أرقام)', emp.pin || '');
      await DB.employees.update(emp.id, { name, job, phone, salary, hireDate, status, pin });
      render();
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
  addBtn.onclick = async () => {
    const name = prompt('اسم الموظف');
    if (!name) return;
    const job = prompt('الوظيفة');
    if (!job) return;
    const phone = prompt('رقم الهاتف');
    const salary = prompt('الراتب');
    const hireDate = prompt('تاريخ التعيين');
    const pin = prompt('الرقم السري (4 أرقام للدخول)');
    await DB.employees.add({ name, job, phone: phone || '', salary: salary || '', hireDate: hireDate || '', status: 'active', pin: pin || null });
    render();
  };
}
if (searchInput) searchInput.addEventListener('keyup', render);
if (jobFilter) jobFilter.addEventListener('change', render);

render();
