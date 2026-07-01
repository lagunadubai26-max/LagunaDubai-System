const currentUser = JSON.parse(sessionStorage.getItem('laguna_user'));
if (currentUser) window.location.href = 'index.html';

const loginBtn = document.getElementById('loginBtn');
const empLoginBtn = document.getElementById('empLoginBtn');
const username = document.getElementById('username');
const password = document.getElementById('password');
const employeeSelect = document.getElementById('employeeSelect');
const employeePin = document.getElementById('employeePin');
const errorEl = document.getElementById('authError');
const empErrorEl = document.getElementById('empAuthError');

let employees = [];

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('adminForm').style.display = tab.dataset.tab === 'admin' ? 'block' : 'none';
    document.getElementById('employeeForm').style.display = tab.dataset.tab === 'employee' ? 'block' : 'none';
    errorEl.textContent = '';
    empErrorEl.textContent = '';
  });
});

async function loadEmployees() {
  try {
    employees = await API.employees.all();
    employees.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = emp.name + ' (' + emp.job + ')';
      employeeSelect.appendChild(opt);
    });
  } catch {
    const localEmps = DB.employees.local();
    employees = localEmps;
    localEmps.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = emp.name;
      employeeSelect.appendChild(opt);
    });
  }
}
loadEmployees();

loginBtn.onclick = async () => {
  const u = username.value.trim();
  const p = password.value.trim();
  if (!u || !p) { errorEl.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور'; return; }
  try {
    const user = await API.login(u, p);
    if (!user) {
      const localUser = DB.users.auth(u, p);
      if (localUser) {
        sessionStorage.setItem('laguna_user', JSON.stringify(localUser));
        window.location.href = 'index.html';
        return;
      }
      errorEl.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
      return;
    }
    window.location.href = 'index.html';
  } catch {
    errorEl.textContent = 'حدث خطأ في الاتصال';
  }
};

empLoginBtn.onclick = async () => {
  const empId = employeeSelect.value;
  const pin = employeePin.value.trim();
  if (!empId || !pin) { empErrorEl.textContent = 'يرجى اختيار اسمك وإدخال الرقم السري'; return; }
  try {
    const res = await fetch('/api/auth/employee-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: empId, pin })
    });
    if (!res.ok) { empErrorEl.textContent = 'الرقم السري خطأ'; return; }
    const data = await res.json();
    API.setToken(data.token);
    sessionStorage.setItem('laguna_user', JSON.stringify(data.user));
    window.location.href = 'index.html';
  } catch {
    empErrorEl.textContent = 'حدث خطأ في الاتصال';
  }
};

username.addEventListener('keydown', (e) => { if (e.key === 'Enter') password.focus(); });
password.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
employeePin.addEventListener('keydown', (e) => { if (e.key === 'Enter') empLoginBtn.click(); });
