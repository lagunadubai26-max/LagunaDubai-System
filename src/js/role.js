(function() {
  let user;
  try { user = JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { return; }
  if (!user) return;
  const isAdmin = user.role === 'Administrator';
  const isOwner = user.role === 'Owner';
  const isEmployee = user.role === 'Employee';

  const page = window.location.pathname.split('/').pop();
  const ownerRestricted = ['menu.html','employees.html','attendance.html','tables.html','inventory.html','customers.html','qr.html','settings.html','products.html'];
  const employeeRestricted = ['employees.html','customers.html','settings.html','products.html','expenses.html','reports.html'];
  if (isOwner && ownerRestricted.includes(page)) { window.location.replace('index.html'); return; }
  if (isEmployee && employeeRestricted.includes(page)) { window.location.replace('index.html'); return; }

  // admin-only: hidden for Employee and Owner (Admin only)
  document.querySelectorAll('.admin-only').forEach(el => {
    if (!isAdmin) el.style.display = 'none';
  });
  // no-owner: hidden for Owner only (Admin + Employee)
  document.querySelectorAll('.no-owner').forEach(el => {
    if (isOwner) el.style.display = 'none';
  });
  // no-employee: hidden for Employee only (Admin + Owner)
  document.querySelectorAll('.no-employee').forEach(el => {
    if (isEmployee) el.style.display = 'none';
  });
  // Profile section in sidebar
  const avatar = document.getElementById('sidebarAvatar');
  const name = document.getElementById('sidebarName');
  const role = document.getElementById('sidebarRole');
  if (avatar) avatar.textContent = user.name.charAt(0);
  if (name) name.textContent = user.name;
  if (role) role.textContent = isAdmin ? 'مدير' : isOwner ? 'صاحب الكافيه' : 'موظف';

  // Show anonymous UID for user mapping (visible in sidebar footer)
  const uidEl = document.getElementById('sidebarUid');
  if (uidEl) {
    const uid = FB.getUid();
    if (uid) {
      uidEl.textContent = 'UID: ' + uid.slice(0, 8) + '...';
      uidEl.title = uid;
    }
  }
  // Mobile sidebar toggle
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar && overlay) {
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
    toggle.onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); };
    overlay.onclick = closeSidebar;
    document.querySelectorAll('.sidebar nav a').forEach(a => a.onclick = closeSidebar);
  }
  // Legacy profile section
  const h4 = document.querySelector('.profile h4');
  const span = document.querySelector('.profile span');
  if (h4) h4.textContent = user.name;
  if (span) span.textContent = isAdmin ? 'مدير' : isOwner ? 'صاحب الكافيه' : 'موظف';
})();
