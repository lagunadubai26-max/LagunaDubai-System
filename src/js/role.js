(function() {
  const user = JSON.parse(sessionStorage.getItem('laguna_user'));
  if (!user) return;
  const isEmployee = user.role === 'Employee';
  const adminLinks = document.querySelectorAll('.admin-only');
  adminLinks.forEach(el => {
    if (isEmployee) el.style.display = 'none';
  });
  if (isEmployee) {
    const h4 = document.querySelector('.profile h4');
    const span = document.querySelector('.profile span');
    if (h4) h4.textContent = user.name;
    if (span) span.textContent = 'موظف';
  }
})();
