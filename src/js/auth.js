;(async () => {
  await DB.seed();

  const stored = sessionStorage.getItem('laguna_user');
  if (stored) try { const u = JSON.parse(stored); if (u && u.id) { window.location.href = 'index.html'; return; } } catch {}

  const loginBtn = document.getElementById('loginBtn');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const errorEl = document.getElementById('authError');

  function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }
  function hideError(el) { el.textContent = ''; el.style.display = 'none'; }

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
    const users = await DB.users.all() || [];
    const user = users.find(x => x.username === u && x.password === p);
    if (user) {
      sessionStorage.setItem('laguna_token', user.id);
      sessionStorage.setItem('laguna_user', JSON.stringify({ id: user.id, username: user.username, name: user.name, role: user.role }));
      window.location.href = 'index.html';
    } else {
      showError(errorEl, 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    setLoading(loginBtn, false);
  };

  username.addEventListener('keydown', (e) => { if (e.key === 'Enter') password.focus(); });
  password.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
})();
