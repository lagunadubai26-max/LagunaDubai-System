;(async function checkDailyInventory() {
  try {
    let user;
    try { user = JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { return; }
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const doneKey = 'laguna_inv_done_' + today;
    const remindKey = 'laguna_inv_remind_' + today;

    if (localStorage.getItem(remindKey)) return;

    const counts = await DB.inventory_counts.all() || [];
    const todayCount = counts.filter(c => c.date && c.date.slice(0, 10) === today);
    if (todayCount.length > 0) {
      localStorage.setItem(doneKey, '1');
      return;
    }

    localStorage.setItem(remindKey, '1');

    var modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.zIndex = '999999';
    modal.innerHTML =
      '<div class="modal-box" style="max-width:420px;text-align:center">' +
        '<div class="modal-body" style="padding:30px 25px">' +
          '<div style="font-size:56px;margin-bottom:12px">📋</div>' +
          '<h3 style="font-size:20px;color:var(--primary);margin-bottom:8px">تذكير الجرد اليومي</h3>' +
          '<p style="color:var(--muted);font-size:14px;line-height:1.7">لم يتم تسجيل جرد المخزون اليوم بعد.<br>يرجى عمل الجرد لضمان دقة المخزون.</p>' +
        '</div>' +
        '<div class="modal-footer" style="justify-content:center;gap:12px;padding:20px 25px">' +
          '<button class="cancel-btn" id="invRemindLater" style="padding:12px 24px;font-size:15px">تذكيري لاحقًا</button>' +
          '<button class="confirm-btn" id="invRemindGo" style="padding:12px 24px;font-size:15px">فتح الجرد</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    document.getElementById('invRemindGo').onclick = function() {
      modal.remove();
      window.location.href = 'inventory.html';
    };
    document.getElementById('invRemindLater').onclick = function() {
      modal.remove();
    };
  } catch (e) {
    console.warn('[daily-inventory] error:', e);
  }
})();
