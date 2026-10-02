(function () {
  'use strict';
  const user = JSON.parse(sessionStorage.getItem('laguna_user') || '{}');
  if (!['Administrator', 'Owner'].includes(user.role)) return;
  const key = 'laguna_backup_download_' + FIREBASE_CONFIG.projectId;
  const getLast = () => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const card = document.getElementById('backupCard');
  const last = getLast();
  if (!card) {
    if (BackupCore.due(last)) {
      const reminder = document.createElement('aside');
      reminder.className = 'backup-reminder'; reminder.setAttribute('role', 'status');
      reminder.innerHTML = '<b>حان موعد النسخة الاحتياطية الأسبوعية</b> <a href="settings.html#backupCard">تنزيل النسخة من الإعدادات</a><small>التذكير يعتمد على آخر تنزيل من هذا المتصفح.</small>';
      document.querySelector('.main').prepend(reminder);
    }
    return;
  }
  card.hidden = false;
  const status = document.getElementById('backupStatus');
  function showLast() {
    const value = getLast();
    document.getElementById('backupLast').textContent = value ? 'آخر طلب تنزيل من هذا المتصفح: ' + new Date(value).toLocaleString('ar-EG') : 'لم تُنزّل نسخة من هذا المتصفح بعد.';
  }
  showLast();
  document.getElementById('downloadBackup').onclick = async function () {
    if (this.disabled) return;
    this.disabled = true; const links = document.getElementById('backupDownloadLinks'); links.innerHTML = '';
    let url;
    try {
      await FB.ensure();
      const startedAt = new Date().toISOString(), collections = Object.create(null), db = FB.getDb();
      for (const name of BackupCore.COLLECTIONS) {
        status.textContent = 'جاري قراءة ' + name + '…';
        const docs = []; let cursor = null;
        do {
          let query = db.collection(name).orderBy(firebase.firestore.FieldPath.documentId()).limit(300);
          if (cursor) query = query.startAfter(cursor);
          const page = await query.get({ source: 'server' });
          page.docs.forEach(doc => docs.push({ id: doc.id, fields: BackupCore.fields(doc.data()) }));
          cursor = page.docs.length === 300 ? page.docs[page.docs.length - 1] : null;
        } while (cursor);
        collections[name] = docs;
      }
      const backup = await BackupCore.create({ projectId: FIREBASE_CONFIG.projectId, startedAt, completedAt: new Date().toISOString(), collections });
      const info = await BackupCore.validate(backup);
      url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url;
      link.download = 'laguna-backup-' + backup.payload.completedAt.replace(/[:.]/g, '-') + '.json';
      link.textContent = 'تحميل نسخة JSON — ' + info.total + ' مستند'; link.className = 'backup-download';
      link.onclick = () => { try { localStorage.setItem(key, new Date().toISOString()); } catch (_) {} showLast(); };
      links.appendChild(link); link.click();
      status.textContent = 'تم تجهيز وفحص النسخة. احتفظ بالملف خارج الجهاز أيضًا؛ رابط التحميل متاح أدناه.';
      const captured = url; setTimeout(() => URL.revokeObjectURL(captured), 30 * 60 * 1000);
    } catch (e) {
      if (url) URL.revokeObjectURL(url);
      status.textContent = 'لم تُنشأ نسخة مكتملة: ' + (e.message || e) + '. تحقق من الاتصال وصلاحية المدير ثم أعد المحاولة.';
    } finally { this.disabled = false; }
  };
  document.getElementById('validateBackup').onchange = async function () {
    const file = this.files[0]; if (!file) return;
    try {
      if (file.size > 100 * 1024 * 1024) throw new Error('حجم الملف يتجاوز 100 ميجابايت');
      const info = await BackupCore.validate(JSON.parse(await file.text()));
      status.textContent = 'الملف سليم: ' + info.total + ' مستند في ' + info.collections + ' مجموعة، بتاريخ ' + new Date(info.completedAt).toLocaleString('ar-EG') + '. المشروع: ' + info.projectId + '. هذا فحص للملف؛ تجربة الاستعادة الفعلية عبر أداة الاختبار الموضحة أدناه.';
    } catch (e) { status.textContent = 'فشل فحص النسخة: ' + (e.message || e); }
  };
})();
