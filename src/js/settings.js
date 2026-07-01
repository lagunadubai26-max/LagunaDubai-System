async function load() {
  const settings = await DB.settings.get() || {};
  document.getElementById('cafeName').value = settings.cafeName || 'Laguna Cafe';
  document.getElementById('currency').value = settings.currency || 'ج.م';
  document.getElementById('taxRate').value = settings.taxRate || 14;
  document.getElementById('lowStockAlert').value = settings.lowStockAlert || 5;
}

document.getElementById('saveSettings').onclick = async () => {
  await DB.settings.save({
    cafeName: document.getElementById('cafeName').value,
    currency: document.getElementById('currency').value,
    taxRate: Number(document.getElementById('taxRate').value),
    lowStockAlert: Number(document.getElementById('lowStockAlert').value)
  });
  alert('تم حفظ الإعدادات بنجاح');
};

document.getElementById('resetData').onclick = () => {
  if (!confirm('هل تريد مسح كل البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
  if (!confirm('تأكيد: مسح كل البيانات المخزنة؟')) return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith('laguna_'));
  keys.forEach(k => localStorage.removeItem(k));
  DB.seed();
  alert('تم مسح كل البيانات وإعادة تعيين النظام');
  location.reload();
};

document.getElementById('addUserBtn').onclick = async () => {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const name = document.getElementById('newFullName').value.trim();
  const role = document.getElementById('newRole').value;
  if (!username || !password || !name) return alert('يرجى ملء جميع الحقول');
  const existing = (await DB.users.all() || []).find(u => u.username === username);
  if (existing) return alert('اسم المستخدم موجود بالفعل');
  await DB.users.add({ username, password, name, role });
  alert('تم إضافة الحساب بنجاح');
  document.getElementById('newUsername').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('newFullName').value = '';
};

load();
