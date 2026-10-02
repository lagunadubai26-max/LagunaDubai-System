(async function () {
  try {
    const user = await FB.requireStaff();
    const page = location.pathname.split('/').pop() || 'index.html';
    if (!Access.allowed(page, user)) { location.replace('menu.html'); return; }
    sessionStorage.setItem('laguna_user', JSON.stringify(user));
    const role = user.role === 'Owner' ? 'صاحب الكافيه' : user.role === 'Administrator' ? 'المدير العام' : user.shiftType === 'morning' ? 'الكاشير الصباحي' : 'الكاشير المسائي';
    ['sidebarName', 'profileName'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = user.name; });
    ['sidebarRole', 'profileRole'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = role; });
    const avatar = document.getElementById('sidebarAvatar'); if (avatar) avatar.textContent = user.name.charAt(0);
    if (!Access.isManager(user)) document.querySelectorAll('.sidebar nav a').forEach(a => { if (!['menu.html', 'invoices.html'].includes(a.getAttribute('href'))) a.remove(); });
    const logout = document.getElementById('logoutBtn') || document.getElementById('logout');
    const signOut = async () => { await firebase.auth().signOut(); FB.clearCache(); Access.clear(); location.replace('auth.html'); };
    if (logout) logout.onclick = signOut;
    else {
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'تسجيل الخروج'; btn.className = 'cancel-btn'; btn.onclick = signOut;
      const side = document.querySelector('.sidebar'); if (side) side.appendChild(btn);
    }
    ['click', 'keydown', 'touchstart'].forEach(event => document.addEventListener(event, () => sessionStorage.setItem('laguna_last_active', String(Date.now())), { passive: true }));
    setInterval(() => {
      if (Date.now() - Number(sessionStorage.getItem('laguna_last_active')) > 2 * 3600000 || Date.now() - Number(sessionStorage.getItem('laguna_session_start')) > 12 * 3600000) signOut();
    }, 60000);
    const sidebar = document.querySelector('.sidebar'), toggle = document.getElementById('sidebarToggle'), overlay = document.getElementById('sidebarOverlay');
    if (sidebar && toggle && overlay) { toggle.onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); }; overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); }; }
  } catch (e) { Access.clear(); location.replace('auth.html'); }
})();
