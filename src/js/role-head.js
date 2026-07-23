(function(){
  try {
    var u = JSON.parse(sessionStorage.getItem('laguna_user'));
    if (!u) return;
    var role = u.role;
    if (role === 'Admin') return;
    var s = document.createElement('style');
    var rules = [];
    if (role === 'Owner') {
      rules.push('.sidebar nav a.no-owner{display:none!important}');
    } else if (role === 'Employee') {
      rules.push('.sidebar nav a.admin-only{display:none!important}');
      rules.push('.sidebar nav a.no-employee{display:none!important}');
    }
    rules.push('#dashDayCloseBtn{display:none!important}');
    s.textContent = rules.join('');
    document.head.appendChild(s);
  } catch(e){}
})();
