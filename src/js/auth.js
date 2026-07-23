;(async () => {
  try {
    await DB.seed();
  } catch (e) {
    console.error('[auth] seed error:', e);
  }

  const stored = sessionStorage.getItem('laguna_user');
  let allUsers;
  try { allUsers = await DB.users.all() || []; } catch(e) { allUsers = []; }
  if (!allUsers.some(u => u.role === 'Owner')) {
    setTimeout(() => {
      console.log('[auth] لم يتم العثور على حساب Owner. سيتم توجيهك إلى صفحة الإعدادات.');
    }, 500);
  }
  if (stored) try { const u = JSON.parse(stored); if (u && u.id) { window.location.href = 'index.html'; return; } } catch {}

  const loginBtn = document.getElementById('loginBtn');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const errorEl = document.getElementById('authError');

  const BLOCK_MULTIPLIERS = [1, 2, 4, 10, 20];
  const BASE_BLOCK_MS = 30000;

  function getLoginState() {
    try {
      const raw = sessionStorage.getItem('laguna_login_attempts');
      if (raw) { const s = JSON.parse(raw); if (s && typeof s.count === 'number' && typeof s.blockedUntil === 'number') return s; }
    } catch {}
    return { count: 0, blockedUntil: 0, level: 0 };
  }

  function saveLoginState(s) { sessionStorage.setItem('laguna_login_attempts', JSON.stringify(s)); }

  function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }
  function hideError(el) { el.textContent = ''; el.style.display = 'none'; }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...' : (btn.dataset.original || btn.innerHTML);
    if (!btn.dataset.original) btn.dataset.original = btn.innerHTML;
  }

  async function auditLogin(username, success, reason) {
    try {
      await FB.getDb().collection('audit_logs').add({
        type: 'login',
        username: username,
        success: success,
        reason: reason || '',
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[auth] audit error:', e);
    }
  }

  loginBtn.onclick = async () => {
    var loginState = getLoginState();
    if (Date.now() < loginState.blockedUntil) {
      var wait = Math.ceil((loginState.blockedUntil - Date.now()) / 1000);
      showError(errorEl, 'حاول مرة أخرى بعد ' + wait + ' ثانية');
      return;
    }
    hideError(errorEl);
    var u = username.value.trim();
    var p = password.value.trim();
    if (!u || !p) { showError(errorEl, 'يرجى إدخال اسم المستخدم وكلمة المرور'); return; }
    setLoading(loginBtn, true);

    var startTime = Date.now();
    loginState.count++;
    var level = Math.min(loginState.level || 0, BLOCK_MULTIPLIERS.length - 1);
    if (loginState.count >= 5) {
      var blockMs = BASE_BLOCK_MS * BLOCK_MULTIPLIERS[level];
      loginState.blockedUntil = Date.now() + blockMs;
      loginState.count = 0;
      loginState.level = level + 1;
    }
    saveLoginState(loginState);

    var users = await DB.users.all() || [];
    var user = users.find(x => x.username === u);
    var passwordOk = false;
    if (user) {
      passwordOk = await PASSWORD_UTILS.verify(p, user.password);
      if (passwordOk && !PASSWORD_UTILS.isHashed(user.password)) {
        var hashed = await PASSWORD_UTILS.hash(p);
        await DB.users.update(user.id, { password: hashed }).catch(function() {});
      }
    }

    var elapsed = Date.now() - startTime;
    if (elapsed < 800) await new Promise(function(r) { setTimeout(r, 800 - elapsed); });

    if (user && passwordOk) {
      saveLoginState({ count: 0, blockedUntil: 0, level: 0 });
      auditLogin(u, true, '');
      var firebaseUid = FB.getUid();
      if (firebaseUid && user.role === 'Employee') {
        FB.getDb().collection('user_mappings').doc(firebaseUid).get().then(function(snap) {
          if (!snap.exists) {
            FB.getDb().collection('user_mappings').doc(firebaseUid).set({
              userId: user.id, role: 'Employee', username: user.username, name: user.name,
              updatedAt: new Date().toISOString()
            }).catch(function(e) { console.warn('[auth] failed to save employee mapping:', e); });
          }
        }).catch(function() {});
      }
      if (firebaseUid && (user.role === 'Administrator' || user.role === 'Owner')) {
        FB.getDb().collection('user_mappings').doc(firebaseUid).get().then(function(snap) {
          if (!snap.exists) {
            console.warn('[auth] No role mapping for ' + user.role + ' "' + user.username + '". UID: ' + firebaseUid + '. Ask an Admin to add it from Settings > Role Mappings.');
          }
        }).catch(function() {});
      }
      sessionStorage.setItem('laguna_token', user.id);
      sessionStorage.setItem('laguna_user', JSON.stringify({ id: user.id, username: user.username, name: user.name, role: user.role }));
      sessionStorage.setItem('laguna_session_start', String(Date.now()));
      sessionStorage.setItem('laguna_last_active', String(Date.now()));
      window.location.href = 'index.html';
    } else {
      auditLogin(u, false, user ? 'كلمة مرور خاطئة' : 'مستخدم غير موجود');
      showError(errorEl, 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    setLoading(loginBtn, false);
  };

  username.addEventListener('keydown', function(e) { if (e.key === 'Enter') password.focus(); });
  password.addEventListener('keydown', function(e) { if (e.key === 'Enter') loginBtn.click(); });
})();
