(function () {
  'use strict';
  const button = document.getElementById('loginBtn');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const error = document.getElementById('authError');
  const digits = value => value.replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776));
  button.onclick = async () => {
    if (button.disabled) return;
    error.style.display = 'none';
    const number = digits(username.value.trim()), secret = digits(password.value);
    if (!/^\d{8}$/.test(number) || !/^\d{16}$/.test(secret)) {
      error.textContent = 'اسم الدخول 8 أرقام وكلمة المرور 16 رقمًا'; error.style.display = 'block'; return;
    }
    button.disabled = true;
    try {
      await FB.initializeAuth();
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
      await firebase.auth().signInWithEmailAndPassword(number + '@staff.lagunadubaicafe.invalid', secret);
      FB.clearCache();
      const user = await FB.requireStaff();
      Access.save(user);
      await DB.audit.log('login', { userId: user.uid, role: user.role, shiftType: user.shiftType });
      window.location.replace(Access.isManager(user) ? 'index.html' : 'menu.html');
    } catch (e) {
      await firebase.auth().signOut().catch(() => {});
      Access.clear();
      error.textContent = e.code === 'auth/too-many-requests' ? 'محاولات كثيرة. انتظر ثم أعد المحاولة.' : e.code === 'auth/network-request-failed' ? 'تعذر الاتصال. تحقق من الإنترنت وأعد المحاولة.' : 'بيانات الدخول غير صحيحة أو الحساب غير مفعل';
      error.style.display = 'block';
    } finally { button.disabled = false; password.value = ''; }
  };
  username.onkeydown = e => { if (e.key === 'Enter') password.focus(); };
  password.onkeydown = e => { if (e.key === 'Enter') button.click(); };
})();
