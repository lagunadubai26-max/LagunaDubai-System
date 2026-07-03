(function () {
  if (!sessionStorage.getItem('laguna_user')) return;

  let lastCount = 0;

  function playSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      osc.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) { /* silent fallback */ }
  }

  function showBadge(invoiceId) {
    const link = document.querySelector('a[href="invoices.html"]');
    if (!link) return;
    link.style.position = 'relative';
    let dot = link.querySelector('.notif-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.className = 'notif-dot';
      dot.style.cssText = 'position:absolute;top:2px;' + (document.dir === 'rtl' ? 'right:2px' : 'left:2px') + ';width:10px;height:10px;background:#dc2626;border-radius:50%;box-shadow:0 0 6px #dc2626';
      link.appendChild(dot);
    }
    clearTimeout(dot._timer);
    dot._timer = setTimeout(() => { if (dot && dot.parentNode) dot.remove(); }, 15000);
  }

  function init() {
    const stored = localStorage.getItem('laguna_inv_count');
    lastCount = stored ? Number(stored) : 0;

    FB.onCollection('invoices', (items) => {
      if (items.length > lastCount && lastCount > 0) {
        const now = Date.now();
        const recent = items.filter(inv => {
          if (!inv.date) return false;
          const t = new Date(inv.date).getTime();
          return t > 0 && now - t < 120000;
        });
        if (recent.length > 0) {
          playSound();
          showBadge(recent[recent.length - 1].id);
        }
      }
      lastCount = items.length;
      localStorage.setItem('laguna_inv_count', lastCount);
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(init, 500);
  else window.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
})();
