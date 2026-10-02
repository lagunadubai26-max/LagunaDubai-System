(async function () {
  const container = document.getElementById('menuShift');
  if (!container) return;
  let user;
  try { user = await FB.requireStaff(); } catch (_) { return; }
  container.innerHTML = '<div id="menuShiftDetails" class="shift-details"></div><label for="menuShiftType">الشيفت</label><select id="menuShiftType"><option value="morning">الصباحي</option><option value="evening">المسائي</option></select> <button type="button" id="menuShiftButton" class="confirm-btn">جاري التحقق…</button>';
  const button = document.getElementById('menuShiftButton'), select = document.getElementById('menuShiftType');
  if (user.role === 'Cashier') { select.value = user.shiftType; select.disabled = true; }
  async function refresh() {
    button.disabled = true;
    try {
      const shift = await DB.shifts.getOpen();
      ShiftDisplay.set(shift, 'menuShiftDetails');
      button.textContent = shift ? 'غلق الشيفت المفتوح' : 'فتح الشيفت';
      button.dataset.retry = '';
    } catch (e) { ShiftDisplay.unavailable('menuShiftDetails'); button.textContent = 'إعادة المحاولة'; button.dataset.retry = 'true'; }
    finally { button.disabled = false; }
  }
  button.onclick = async () => {
    if (button.disabled) return;
    if (button.dataset.retry) return refresh();
    button.disabled = true;
    try {
      const shift = await DB.shifts.getOpen();
      if (shift) {
        const snapshot = await ShiftOps.fresh(shift.id), data = snapshot.data;
        const type = shift.shiftType === 'morning' ? 'الصباحي' : 'المسائي';
        if (!confirm('إغلاق الشيفت ' + type + ' الذي فتحه ' + shift.openedBy + '؟\nالمبيعات: ' + data.totalSales + '\nالكاش: ' + data.cashAmount + '\nفيزا: ' + data.cardAmount + '\nمحفظة: ' + data.otherAmount + '\nالمعلق: ' + data.pendingAmount + '\nالفواتير: ' + data.numInvoices)) return;
        await DB.shifts.closeDay(shift.id, { ...data, closedAt: FB.nowISO(), closedBy: user.name }, snapshot.shift.invoiceVersion);
        await DB.audit.log('shift_close', { shiftId: shift.id, shiftType: shift.shiftType, summary: data });
        alert('تم حفظ ملخص الشيفت وإغلاقه');
      } else {
        const opened = await DB.shifts.open(user.name, select.value);
        await DB.audit.log('shift_open', { shiftId: opened.id, shiftType: opened.shiftType });
      }
    } catch (e) { alert(e.message || e); }
    finally { await refresh(); }
  };
  await refresh();
})();
