/* Navigation hints are never the security boundary: Firestore verifies the UID. */
(function (root) {
  var page = location.pathname.split('/').pop() || 'index.html';
  function user() { try { return JSON.parse(sessionStorage.getItem('laguna_user')) || {}; } catch (_) { return {}; } }
  function isManager(u) { u = u || user(); return u.role === 'Administrator' || u.role === 'Owner'; }
  function clear() {
    ['laguna_user', 'laguna_token', 'laguna_session_start', 'laguna_last_active'].forEach(function (k) { sessionStorage.removeItem(k); });
    sessionStorage.removeItem('laguna_report_snapshot_v1');
    Object.keys(localStorage).forEach(function (k) { if (k.indexOf('laguna_cache_') === 0 || k === 'laguna_inv_count') localStorage.removeItem(k); });
  }
  function save(u) {
    clear(); sessionStorage.setItem('laguna_user', JSON.stringify(u));
    sessionStorage.setItem('laguna_session_start', String(Date.now()));
    sessionStorage.setItem('laguna_last_active', String(Date.now()));
  }
  function allowed(p, u) { return isManager(u) || (u.role === 'Cashier' && ['menu.html', 'invoices.html'].indexOf(p) !== -1); }
  root.Access = { user: user, isManager: isManager, save: save, clear: clear, allowed: allowed };
  if (page === 'ipad.html' || page === 'auth.html') return;
  if (page === 'menu.html' && /[?&]table=\d+/.test(location.search)) { location.replace('ipad.html' + location.search); return; }
  var current = user(), last = Number(sessionStorage.getItem('laguna_last_active')), start = Number(sessionStorage.getItem('laguna_session_start'));
  if (!current.id || ['Administrator', 'Owner', 'Cashier'].indexOf(current.role) === -1 || !start || Date.now() - start > 12 * 3600000 || Date.now() - last > 2 * 3600000) {
    clear(); location.replace('auth.html'); return;
  }
  if (!allowed(page, current)) { location.replace(isManager(current) ? 'index.html' : 'menu.html'); return; }
  sessionStorage.setItem('laguna_last_active', String(Date.now()));
  if (!isManager(current)) {
    var style = document.createElement('style');
    style.textContent = '.sidebar nav a:not([href="menu.html"]):not([href="invoices.html"]){display:none!important}.delete-btn,.del-btn,.delete-invoice-btn{display:none!important}';
    document.head.appendChild(style);
  }
})(window);
