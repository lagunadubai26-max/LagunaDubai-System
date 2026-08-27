(function () {
  if (!sessionStorage.getItem('laguna_user')) return;
  var lastCount = 0;
  function playSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      osc.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {/* silent fallback */}
  }
  function ensureToastContainer() {
    var c = document.getElementById('lagunaToastContainer');
    if (c) return c;
    c = document.createElement('div');
    c.id = 'lagunaToastContainer';
    c.style.cssText = 'position:fixed;top:20px;left:20px;z-index:999999;display:flex;flex-direction:column;gap:10px;max-width:340px;width:calc(100% - 40px)';
    document.body.appendChild(c);
    return c;
  }
  function showToast(inv) {
    var container = ensureToastContainer();
    var toast = document.createElement('div');
    toast.style.cssText = 'background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.18);padding:14px 16px;display:flex;align-items:flex-start;gap:12px;border-right:4px solid var(--accent,#d97706);animation:lagunaToastIn .25s ease;direction:rtl';
    var icon = document.createElement('div');
    icon.style.cssText = 'width:42px;height:42px;border-radius:12px;background:var(--accent,#d97706);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0';
    icon.innerHTML = '<i class="fa-solid fa-utensils"></i>';
    var body = document.createElement('div');
    body.style.cssText = 'flex:1;min-width:0';
    var title = document.createElement('div');
    title.style.cssText = 'font-weight:800;font-size:14px;color:var(--primary,#0c0a09);margin-bottom:2px';
    var tableName = inv && inv.table ? String(inv.table) : '';
    title.textContent = tableName ? '📣 طلب جديد من ' + tableName : '📣 طلب جديد';
    var sub = document.createElement('div');
    sub.style.cssText = 'font-size:12px;color:var(--muted,#78716c);line-height:1.6';
    var itemsTxt = inv && inv.items && inv.items.length ? inv.items.map(function (it) {
      return it.name + ' ×' + (it.qty || 1);
    }).join('، ') : 'فاتورة جديدة';
    var totalTxt = inv && inv.total ? 'الإجمالي: ' + Number(inv.total).toLocaleString() + ' ج.م' : '';
    sub.textContent = itemsTxt + (totalTxt ? ' | ' + totalTxt : '');
    body.appendChild(title);
    body.appendChild(sub);
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex-shrink:0';
    var viewBtn = document.createElement('button');
    viewBtn.style.cssText = 'border:none;background:var(--accent,#d97706);color:#fff;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit';
    viewBtn.innerHTML = '<i class="fa-solid fa-eye"></i> عرض';
    viewBtn.onclick = function () {
      window.location.href = 'invoices.html';
    };
    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'border:none;background:#f5f5f4;color:var(--primary,#0c0a09);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit';
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.onclick = function () {
      return toast.remove();
    };
    actions.appendChild(viewBtn);
    actions.appendChild(closeBtn);
    toast.appendChild(icon);
    toast.appendChild(body);
    toast.appendChild(actions);
    container.appendChild(toast);
    toast._timer = setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, 20000);
  }
  function showBadge(invoiceId) {
    var link = document.querySelector('a[href="invoices.html"]');
    if (!link) return;
    link.style.position = 'relative';
    var dot = link.querySelector('.notif-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.className = 'notif-dot';
      dot.style.cssText = 'position:absolute;top:2px;' + (document.dir === 'rtl' ? 'right:2px' : 'left:2px') + ';width:10px;height:10px;background:#dc2626;border-radius:50%;box-shadow:0 0 6px #dc2626';
      link.appendChild(dot);
    }
    clearTimeout(dot._timer);
    dot._timer = setTimeout(function () {
      if (dot && dot.parentNode) dot.remove();
    }, 15000);
  }
  var initDone = false;
  function init() {
    if (initDone) return;
    initDone = true;
    var stored = localStorage.getItem('laguna_inv_count');
    lastCount = stored ? Number(stored) : 0;
    FB.onCollection('invoices', function (items) {
      if (items.length > lastCount && lastCount > 0) {
        var now = Date.now();
        var recent = items.filter(function (inv) {
          if (!inv.date) return false;
          var t = new Date(inv.date).getTime();
          return t > 0 && now - t < 120000;
        });
        if (recent.length > 0) {
          var newest = recent[recent.length - 1];
          var isQrOrder = newest.table && (newest.status === 'pending' || newest.status === 'معلقة');
          playSound();
          showBadge(newest.id);
          if (isQrOrder) showToast(newest);
        }
      }
      lastCount = items.length;
      localStorage.setItem('laguna_inv_count', lastCount);
    });
  }
  var styleEl = document.createElement('style');
  styleEl.textContent = '@keyframes lagunaToastIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}';
  document.head.appendChild(styleEl);
  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(init, 500);else window.addEventListener('DOMContentLoaded', function () {
    return setTimeout(init, 500);
  });
})();

