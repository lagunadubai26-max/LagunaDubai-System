;(async () => {
  try {
    await DB.seed();
  } catch (e) {
    console.error('[auth] seed error:', e);
  }

  const stored = sessionStorage.getItem('laguna_user');
  if (stored) try { const u = JSON.parse(stored); if (u && u.id) { window.location.href = 'index.html'; return; } } catch {}

  const loginBtn = document.getElementById('loginBtn');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const errorEl = document.getElementById('authError');

  function getLoginState() {
    try {
      const raw = localStorage.getItem('laguna_login_state');
      if (raw) { const s = JSON.parse(raw); if (s && typeof s.attempts === 'number' && typeof s.blockedUntil === 'number') return s; }
    } catch {}
    return { attempts: 0, blockedUntil: 0 };
  }

  function saveLoginState(s) { localStorage.setItem('laguna_login_state', JSON.stringify(s)); }

  function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }
  function hideError(el) { el.textContent = ''; el.style.display = 'none'; }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...' : btn.dataset.original || btn.innerHTML;
    if (!btn.dataset.original) btn.dataset.original = btn.innerHTML;
  }

  loginBtn.onclick = async () => {
    const loginState = getLoginState();
    if (Date.now() < loginState.blockedUntil) {
      const wait = Math.ceil((loginState.blockedUntil - Date.now()) / 1000);
      showError(errorEl, 'حاول مرة أخرى بعد ' + wait + ' ثانية');
      return;
    }
    hideError(errorEl);
    const u = username.value.trim();
    const p = password.value.trim();
    if (!u || !p) { showError(errorEl, 'يرجى إدخال اسم المستخدم وكلمة المرور'); return; }
    setLoading(loginBtn, true);
    loginState.attempts++;
    if (loginState.attempts >= 5) {
      loginState.blockedUntil = Date.now() + 30000;
      loginState.attempts = 0;
    }
    saveLoginState(loginState);
    const users = await DB.users.all() || [];
    const user = users.find(x => x.username === u);
    let passwordOk = false;
    if (user) {
      passwordOk = await PASSWORD_UTILS.verify(p, user.password);
      if (passwordOk && !PASSWORD_UTILS.isHashed(user.password)) {
        const hashed = await PASSWORD_UTILS.hash(p);
        await DB.users.update(user.id, { password: hashed }).catch(() => {});
      }
    }
    if (user && passwordOk) {
      saveLoginState({ attempts: 0, blockedUntil: 0 });
      const firebaseUid = FB.getUid();
      if (firebaseUid && user.role === 'Employee') {
        FB.getDb().collection('user_mappings').doc(firebaseUid).get().then(snap => {
          if (!snap.exists) {
            FB.getDb().collection('user_mappings').doc(firebaseUid).set({
              userId: user.id, role: 'Employee', username: user.username, name: user.name,
              updatedAt: new Date().toISOString()
            }).catch(e => console.warn('[auth] failed to save employee mapping:', e));
          }
        }).catch(() => {});
      }
      if (firebaseUid && (user.role === 'Administrator' || user.role === 'Owner')) {
        FB.getDb().collection('user_mappings').doc(firebaseUid).get().then(snap => {
          if (!snap.exists) {
            console.warn('[auth] No role mapping for ' + user.role + ' "' + user.username + '". UID: ' + firebaseUid + '. Ask an Admin to add it from Settings > Role Mappings.');
          }
        }).catch(() => {});
      }
      sessionStorage.setItem('laguna_token', user.id);
      sessionStorage.setItem('laguna_user', JSON.stringify({ id: user.id, username: user.username, name: user.name, role: user.role }));
      window.location.href = 'index.html';
    } else {
      showError(errorEl, 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    setLoading(loginBtn, false);
  };

  // إذا لم يكن هناك مستخدم Owner بعد، نوجه إلى صفحة الإعدادات لتهيئته
  if (!users || users.length === 0 || !users.some(u => u.role === 'Owner')) {
    setTimeout(() => {
      console.log('[auth] لا يوجد حساب Owner. سيتم توجيهك إلى صفحة الإعدادات لإضافة مالك النظام الأول.');
    }, 500);
  }

  username.addEventListener('keydown', (e) => { if (e.key === 'Enter') password.focus(); });
  password.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
})();
