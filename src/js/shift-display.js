(function (root) {
  'use strict';
  function describe(shift, now) {
    if (!shift) return { text: 'لا يوجد شيفت مفتوح حاليًا', overdue: false };
    const start = new Date(shift.openedAt || (shift.openDate + 'T00:00:00'));
    if (!Number.isFinite(start.getTime())) return { text: 'شيفت مفتوح — تاريخ البداية غير متاح', overdue: false };
    const minutes = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
    const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60), remainder = minutes % 60;
    const duration = (days ? days + ' يوم · ' : '') + hours + ' ساعة · ' + remainder + ' دقيقة';
    const overdue = start.getFullYear() !== now.getFullYear() || start.getMonth() !== now.getMonth() || start.getDate() !== now.getDate();
    return { text: 'بداية الشيفت: ' + start.toLocaleString('ar-EG') + ' | المدة: ' + duration + (overdue ? ' — ممتد من يوم سابق' : ''), overdue };
  }
  const timers = new Map();
  function set(shift, id) {
    const element = document.getElementById(id); if (!element) return;
    clearInterval(timers.get(id));
    function refresh() {
      const info = describe(shift, FB.clockNow());
      element.textContent = info.text;
      element.className = 'shift-details' + (info.overdue ? ' shift-overdue' : '');
    }
    refresh();
    if (shift) timers.set(id, setInterval(refresh, 60000));
  }
  function unavailable(id) {
    clearInterval(timers.get(id));
    const element = document.getElementById(id); if (!element) return;
    element.className = 'shift-details'; element.textContent = 'تعذر التحقق من الشيفت. اضغط إعادة المحاولة.';
  }
  const api = { describe, set, unavailable };
  root.ShiftDisplay = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
