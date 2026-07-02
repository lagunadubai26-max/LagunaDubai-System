;(() => {
  const stored = sessionStorage.getItem('laguna_user');
  if (stored) try { const u = JSON.parse(stored); if (u && u.id) { window.location.href = 'index.html'; return; } } catch {}

  const loginBtn = document.getElementById('loginBtn');
  const empLoginBtn = document.getElementById('empLoginBtn');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const employeeSelect = document.getElementById('employeeSelect');
  const employeePin = document.getElementById('employeePin');
  const errorEl = document.getElementById('authError');
  const empErrorEl = document.getElementById('empAuthError');

  function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }
  function hideError(el) { el.textContent = ''; el.style.display = 'none'; }

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('adminForm').style.display = tab.dataset.tab === 'admin' ? 'block' : 'none';
      document.getElementById('employeeForm').style.display = tab.dataset.tab === 'employee' ? 'block' : 'none';
      hideError(errorEl);
      hideError(empErrorEl);
    });
  });

  async function loadEmployees() {
    const all = await DB.employees.all() || [];
    all.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = emp.name + (emp.job ? ' (' + emp.job + ')' : '');
      employeeSelect.appendChild(opt);
    });
  }
  loadEmployees();

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...' : btn.dataset.original || btn.innerHTML;
    if (!btn.dataset.original) btn.dataset.original = btn.innerHTML;
  }

  loginBtn.onclick = async () => {
    hideError(errorEl);
    const u = username.value.trim();
    const p = password.value.trim();
    if (!u || !p) { showError(errorEl, 'يرجى إدخال اسم المستخدم وكلمة المرور'); return; }
    setLoading(loginBtn, true);
    const users = DB.users.local() || [];
    const user = users.find(x => x.username === u && x.password === p);
    if (user) {
      sessionStorage.setItem('laguna_token', user.id);
      sessionStorage.setItem('laguna_user', JSON.stringify({ id: user.id, username: user.username, name: user.name, role: user.role }));
      window.location.href = 'index.html';
      return;
    }
    const apiUsers = await DB.users.all() || [];
    const apiUser = apiUsers.find(x => x.username === u && x.password === p);
    if (apiUser) {
      sessionStorage.setItem('laguna_token', apiUser.id);
      sessionStorage.setItem('laguna_user', JSON.stringify({ id: apiUser.id, username: apiUser.username, name: apiUser.name, role: apiUser.role }));
      window.location.href = 'index.html';
    } else {
      showError(errorEl, 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    setLoading(loginBtn, false);
  };

  empLoginBtn.onclick = async () => {
    hideError(empErrorEl);
    const empId = employeeSelect.value;
    const pin = employeePin.value.trim();
    if (!empId || !pin) { showError(empErrorEl, 'يرجى اختيار اسمك وإدخال الرقم السري'); return; }
    setLoading(empLoginBtn, true);
    const employees = DB.employees.local() || [];
    const emp = employees.find(x => x.id === empId && String(x.pin) === pin);
    if (emp) {
      sessionStorage.setItem('laguna_token', emp.id);
      sessionStorage.setItem('laguna_user', JSON.stringify({ id: emp.id, username: emp.name, name: emp.name, role: 'Employee' }));
      window.location.href = 'index.html';
      return;
    }
    const apiEmps = await DB.employees.all() || [];
    const apiEmp = apiEmps.find(x => x.id === empId && String(x.pin) === pin);
    if (apiEmp) {
      sessionStorage.setItem('laguna_token', apiEmp.id);
      sessionStorage.setItem('laguna_user', JSON.stringify({ id: apiEmp.id, username: apiEmp.name, name: apiEmp.name, role: 'Employee' }));
      window.location.href = 'index.html';
    } else {
      showError(empErrorEl, 'الرقم السري خطأ');
    }
    setLoading(empLoginBtn, false);
  };

  username.addEventListener('keydown', (e) => { if (e.key === 'Enter') password.focus(); });
  password.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
  employeePin.addEventListener('keydown', (e) => { if (e.key === 'Enter') empLoginBtn.click(); });
})();
