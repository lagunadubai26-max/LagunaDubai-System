async function load() {
  const settings = await DB.settings.get() || {};
  document.getElementById('cafeName').value = settings.cafeName || 'Laguna Cafe';
  document.getElementById('currency').value = settings.currency || 'ج.م';
  document.getElementById('taxRate').value = settings.taxRate || 14;
  document.getElementById('serviceTax').value = settings.serviceTax || 10;
  document.getElementById('lowStockAlert').value = settings.lowStockAlert || 5;
}

document.getElementById('saveSettings').onclick = async () => {
  await DB.settings.save({
    cafeName: document.getElementById('cafeName').value,
    currency: document.getElementById('currency').value,
    taxRate: Number(document.getElementById('taxRate').value),
    serviceTax: Number(document.getElementById('serviceTax').value),
    lowStockAlert: Number(document.getElementById('lowStockAlert').value)
  });
  alert('تم حفظ الإعدادات بنجاح');
};

document.getElementById('resetData').onclick = async () => {
  if (!confirm('هل تريد مسح كل البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
  if (!confirm('تأكيد: مسح كل البيانات من Firebase؟')) return;
  if (!confirm('مسح نهائي؟ سيتم حذف كل الفواتير والطلبات والموظفين!')) return;
  const tables = ['invoices', 'returns', 'attendance', 'expenses', 'customers', 'inventory', 'settings', 'employees', 'users', 'products', 'tables_'];
  for (const t of tables) {
    const all = await FB.getCollection(t) || [];
    for (const row of all) {
      await FB.removeDoc(t, row.id);
    }
  }
  alert('تم مسح كل البيانات من Firebase');
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

// --- Printer ---
function updatePrinterUI() {
  const connected = PRINTER.isConnected();
  document.getElementById('printerIcon').innerHTML = connected ? '<i class="fa-solid fa-check-circle" style="color:#059669"></i>' : '<i class="fa-solid fa-plug" style="color:#aaa"></i>';
  document.getElementById('printerText').textContent = connected ? '✓ الطابعة متصلة' : 'الطابعة غير متصلة';
  document.getElementById('printerText').style.color = connected ? '#059669' : '#888';
  document.getElementById('connectPrinterBtn').textContent = connected ? 'تغيير الطابعة' : 'توصيل الطابعة';
  document.getElementById('testPrinterBtn').disabled = !connected;
  document.getElementById('openDrawerBtn').disabled = !connected;
  document.getElementById('disconnectPrinterBtn').style.display = connected ? 'inline-flex' : 'none';
}

document.getElementById('connectPrinterBtn').onclick = async () => {
  try {
    const result = await PRINTER.connect();
    if (result === false) {
      alert('لم يتم العثور على طابعة. تأكد من توصيل الطابعة بالUSB وحاول مرة أخرى.');
      return;
    }
    updatePrinterUI();
    alert('✓ تم توصيل الطابعة بنجاح');
  } catch (e) {
    if (e.name === 'NotFoundError') return;
    alert('خطأ في توصيل الطابعة: ' + e.message);
  }
};

document.getElementById('disconnectPrinterBtn').onclick = async () => {
  await PRINTER.disconnect();
  updatePrinterUI();
};

document.getElementById('testPrinterBtn').onclick = async () => {
  try {
    await PRINTER.print(PRINTER.escposInit());
    await PRINTER.print(PRINTER.escposBold(true));
    await PRINTER.print(PRINTER.escposText('      Laguna Cafe'));
    await PRINTER.print(PRINTER.escposBold(false));
    await PRINTER.print(PRINTER.escposText(''));
    await PRINTER.print(PRINTER.escposText('اختبار الطباعة'));
    await PRINTER.print(PRINTER.escposText('Print Test'));
    await PRINTER.print(PRINTER.escposText(''));
    await PRINTER.print(PRINTER.escposText(new Date().toLocaleString('ar-EG')));
    await PRINTER.print(PRINTER.escposText(''));
    await PRINTER.print(PRINTER.escposText('✓ تم بنجاح'));
    await PRINTER.print(PRINTER.escposCut());
    alert('✓ تمت طباعة الاختبار بنجاح');
  } catch (e) {
    alert('خطأ في الطباعة: ' + e.message);
  }
};

document.getElementById('openDrawerBtn').onclick = async () => {
  try {
    await PRINTER.openDrawer();
    alert('✓ تم فتح درج الكاشير');
  } catch (e) {
    alert('خطأ في فتح الدرج: ' + e.message);
  }
};

updatePrinterUI();
