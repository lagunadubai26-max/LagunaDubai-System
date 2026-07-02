(function() {
  const user = JSON.parse(sessionStorage.getItem('laguna_user'));
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
  // Legacy profile section
  const h4 = document.querySelector('.profile h4');
  const span = document.querySelector('.profile span');
  if (h4) h4.textContent = user.name;
  if (span) span.textContent = user.role === 'Administrator' ? 'مدير' : 'موظف';
})();
