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
  const all = await SUPABASE.get('employees', { params: { select: 'id,name,job', order: 'name.asc' } }) || [];
  all.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = emp.name + ' (' + emp.job + ')';
    employeeSelect.appendChild(opt);
  });
}
loadEmployees();

loginBtn.onclick = async () => {
  const u = username.value.trim();
  const p = password.value.trim();
  if (!u || !p) { errorEl.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور'; return; }
  const users = await SUPABASE.get('users', { params: { username: `eq.${u}`, password: `eq.${p}`, select: '*' } });
  if (!users || !users.length) { errorEl.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة'; return; }
  const user = users[0];
  const token = btoa(JSON.stringify(user));
  sessionStorage.setItem('laguna_token', token);
  sessionStorage.setItem('laguna_user', JSON.stringify({ id: user.id, username: user.username, name: user.name, role: user.role }));
  window.location.href = 'index.html';
};

empLoginBtn.onclick = async () => {
  const empId = employeeSelect.value;
  const pin = employeePin.value.trim();
  if (!empId || !pin) { empErrorEl.textContent = 'يرجى اختيار اسمك وإدخال الرقم السري'; return; }
  const rows = await SUPABASE.get('employees', { params: { id: `eq.${empId}`, pin: `eq.${pin}`, select: '*' } });
  if (!rows || !rows.length) { empErrorEl.textContent = 'الرقم السري خطأ'; return; }
  const emp = rows[0];
  const token = btoa(JSON.stringify({ id: emp.id, username: emp.name, role: 'Employee' }));
  sessionStorage.setItem('laguna_token', token);
  sessionStorage.setItem('laguna_user', JSON.stringify({ id: emp.id, username: emp.name, name: emp.name, role: 'Employee' }));
  window.location.href = 'index.html';
};

username.addEventListener('keydown', (e) => { if (e.key === 'Enter') password.focus(); });
password.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
employeePin.addEventListener('keydown', (e) => { if (e.key === 'Enter') empLoginBtn.click(); });
