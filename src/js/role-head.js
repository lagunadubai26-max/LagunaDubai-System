(function(){
  try {
    var u = JSON.parse(sessionStorage.getItem('laguna_user'));
    if (u && u.role === 'Owner') {
      var s = document.createElement('style');
      s.textContent = '.sidebar nav a[href="menu.html"],.sidebar nav a[href="tables.html"],.sidebar nav a[href="inventory.html"],.sidebar nav a[href="customers.html"],.sidebar nav a[href="qr.html"],.sidebar nav a[href="products.html"],.sidebar nav a[href="settings.html"],.sidebar nav a[href="reports.html"]{display:none!important}#dashDayCloseBtn{display:none!important}';
      document.head.appendChild(s);
    }
  } catch(e){}
})();
