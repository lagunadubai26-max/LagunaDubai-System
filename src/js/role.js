(function() {
  let user;
  try { user = JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { return; }
  if (!user) return;
  const isOwner = user.role === 'Owner';

  const page = window.location.pathname.split('/').pop();
  const ownerRestricted = ['menu.html','tables.html','inventory.html','customers.html','qr.html','products.html','settings.html'];
  if (isOwner && ownerRestricted.includes(page)) { window.location.replace('index.html'); return; }

  if (isOwner) {
    document.querySelectorAll('.sidebar nav a').forEach(el => {
      const href = el.getAttribute('href');
      if (href && ownerRestricted.some(p => href.includes(p))) {
        el.style.display = 'none';
      }
    });
  }

  const avatar = document.getElementById('sidebarAvatar');
  const name = document.getElementById('sidebarName');
  const role = document.getElementById('sidebarRole');
  if (avatar) avatar.textContent = user.name.charAt(0);
  if (name) name.textContent = user.name;
  if (role) role.textContent = isOwner ? 'صاحب الكافيه' : 'موظف';

  const uidEl = document.getElementById('sidebarUid');
  if (uidEl) {
    const uid = FB.getUid();
    if (uid) {
      uidEl.textContent = 'UID: ' + uid.slice(0, 8) + '...';
      uidEl.title = uid;
    }
  }
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar && overlay) {
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
    toggle.onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); };
    overlay.onclick = closeSidebar;
    document.querySelectorAll('.sidebar nav a').forEach(a => a.onclick = closeSidebar);
  }
  const h4 = document.querySelector('.profile h4');
  const span = document.querySelector('.profile span');
  if (h4) h4.textContent = user.name;
  if (span) span.textContent = isOwner ? 'صاحب الكافيه' : 'موظف';
})();
