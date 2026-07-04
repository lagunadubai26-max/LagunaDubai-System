(function() {
  let user;
  try { user = JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { return; }
  if (!user) return;
  const isEmployee = user.role === 'Employee';
  const adminLinks = document.querySelectorAll('.admin-only');
  adminLinks.forEach(el => {
    if (isEmployee) el.style.display = 'none';
  });
  // Profile section in sidebar
  const avatar = document.getElementById('sidebarAvatar');
  const name = document.getElementById('sidebarName');
  const role = document.getElementById('sidebarRole');
  if (avatar) avatar.textContent = user.name.charAt(0);
  if (name) name.textContent = user.name;
  if (role) role.textContent = user.role === 'Administrator' ? 'مدير' : 'موظف';
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
  if (span) span.textContent = user.role === 'Administrator' ? 'مدير' : 'موظف';
})();
