async function load() {
  const settings = await DB.settings.get() || {};
  document.getElementById('cafeName').value = settings.cafeName || 'Laguna Cafe';
  document.getElementById('currency').value = settings.currency || 'ج.م';
  document.getElementById('enableTax').checked = settings.enableTax !== false;
  document.getElementById('taxRate').value = settings.taxRate || 14;
  document.getElementById('enableService').checked = settings.enableService !== false;
  document.getElementById('serviceTax').value = settings.serviceTax || 10;
  document.getElementById('autoPrintReceipt').checked = settings.autoPrintReceipt !== false;
  document.getElementById('autoPrintKitchen').checked = settings.autoPrintKitchen !== false;
  document.getElementById('printCopies').value = settings.printCopies || 1;
  document.getElementById('wsProxyUrl').value = settings.wsProxyUrl || 'ws://localhost:9090';
  if (settings.wsProxyUrl) localStorage.setItem('laguna_printer_proxy', settings.wsProxyUrl);
  document.getElementById('enablePrintAgent').checked = settings.enablePrintAgent !== false;
  document.getElementById('printAgentUrl').value = settings.printAgentUrl || 'http://localhost:4321';
  if (settings.printAgentUrl) localStorage.setItem('laguna_print_agent_url', settings.printAgentUrl);
  localStorage.setItem('laguna_print_agent_enabled', settings.enablePrintAgent !== false);
}

document.getElementById('saveSettings').onclick = async () => {
  await DB.settings.save({
    cafeName: document.getElementById('cafeName').value,
    currency: document.getElementById('currency').value,
    enableTax: document.getElementById('enableTax').checked,
    taxRate: Number(document.getElementById('taxRate').value),
    enableService: document.getElementById('enableService').checked,
    serviceTax: Number(document.getElementById('serviceTax').value),
    autoPrintReceipt: document.getElementById('autoPrintReceipt').checked,
    autoPrintKitchen: document.getElementById('autoPrintKitchen').checked,
    printCopies: Number(document.getElementById('printCopies').value) || 1,
    wsProxyUrl: document.getElementById('wsProxyUrl').value || 'ws://localhost:9090',
    enablePrintAgent: document.getElementById('enablePrintAgent').checked,
    printAgentUrl: document.getElementById('printAgentUrl').value || 'http://localhost:4321'
  });
  const proxyUrl = document.getElementById('wsProxyUrl').value || 'ws://localhost:9090';
  localStorage.setItem('laguna_printer_proxy', proxyUrl);
  const agentUrl = document.getElementById('printAgentUrl').value || 'http://localhost:4321';
  localStorage.setItem('laguna_print_agent_url', agentUrl);
  localStorage.setItem('laguna_print_agent_enabled', document.getElementById('enablePrintAgent').checked);
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

// --- Printers ---
function renderPrinterList() {
  const list = document.getElementById('printerList');
  list.innerHTML = '';
  const printers = PRINTER.getPrinters();
  if (printers.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;padding:16px">لا توجد طابعات متصلة</p>';
    return;
  }
  printers.forEach(p => {
    const types = { usb: '<i class="fa-solid fa-usb"></i> USB', wifi: '<i class="fa-solid fa-wifi"></i> WiFi', bluetooth: '<i class="fa-solid fa-bluetooth-b"></i> Bluetooth' };
    const badge = p.forKitchen ? '<span style="background:#d97706;color:#fff;font-size:11px;padding:2px 10px;border-radius:20px;margin-right:8px">مطبخ</span>' : '<span style="background:#059669;color:#fff;font-size:11px;padding:2px 10px;border-radius:20px;margin-right:8px">فاتورة</span>';
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f5f5f4;border-radius:10px;margin-bottom:8px';
    div.innerHTML = `
      <div>
        <strong style="font-size:14px">${escapeHtml(p.name)}</strong> ${badge}<br>
        <span style="font-size:12px;color:#888">${types[p.type] || p.type}</span>
      </div>
      <div style="display:flex;gap:6px">
        <button class="test-prn" data-id="${p.id}" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px"><i class="fa-solid fa-flask"></i></button>
        <button class="drawer-prn" data-id="${p.id}" style="background:#d97706;color:#fff;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px"><i class="fa-solid fa-cash-register"></i></button>
        <button class="remove-prn" data-id="${p.id}" style="background:#dc2626;color:#fff;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    list.appendChild(div);
  });
  // Attach events
  list.querySelectorAll('.test-prn').forEach(btn => {
    btn.onclick = async () => {
      try {
        const d = PRINTER.buildReceiptData({ id: 'TEST', date: new Date().toISOString(), customer: 'اختبار', items: [{ name: 'اختبار طباعة', qty: 1, price: 10 }], total: 10, paid: 10, paymentMethod: 'كاش' });
        await PRINTER.printTo(btn.dataset.id, d);
        alert('✓ تمت طباعة الاختبار');
      } catch (e) { alert('خطأ: ' + e.message); }
    };
  });
  list.querySelectorAll('.drawer-prn').forEach(btn => {
    btn.onclick = async () => {
      try {
        await PRINTER.openDrawer(btn.dataset.id);
        alert('✓ تم فتح الدرج');
      } catch (e) { alert('خطأ: ' + e.message); }
    };
  });
  list.querySelectorAll('.remove-prn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('حذف هذه الطابعة؟')) return;
      await PRINTER.removePrinter(btn.dataset.id);
      renderPrinterList();
    };
  });
}

// USB
document.getElementById('addUsbPrinterBtn').onclick = async () => {
  try {
    const forKitchen = confirm('هل هذه طابعة مطبخ؟\nاضغط OK لو طابعة المطبخ، أو Cancel لو طابعة الفواتير');
    const p = await PRINTER.addPrinter('usb', { name: forKitchen ? 'طابعة المطبخ' : 'طابعة الفواتير', forKitchen });
    renderPrinterList();
    alert('✓ تم توصيل ' + (forKitchen ? 'طابعة المطبخ' : 'طابعة الفواتير'));
  } catch (e) {
    if (e.name === 'NotFoundError') return;
    alert('خطأ: ' + e.message);
  }
};

// WiFi form toggle
document.getElementById('addWifiPrinterBtn').onclick = () => {
  document.getElementById('wifiForm').style.display = 'block';
};
document.getElementById('cancelWifiBtn').onclick = () => {
  document.getElementById('wifiForm').style.display = 'none';
};
document.getElementById('saveWifiBtn').onclick = async () => {
  const name = document.getElementById('wifiName').value.trim() || 'WiFi Printer';
  const host = document.getElementById('wifiHost').value.trim();
  const port = parseInt(document.getElementById('wifiPort').value) || 9100;
  const forKitchen = document.getElementById('wifiForKitchen').checked;
  if (!host) return alert('يرجى إدخال عنوان IP الطابعة');
  try {
    await PRINTER.addPrinter('wifi', { name, host, port, forKitchen });
    renderPrinterList();
    document.getElementById('wifiForm').style.display = 'none';
    document.getElementById('wifiName').value = '';
    document.getElementById('wifiHost').value = '';
    document.getElementById('wifiPort').value = '9100';
    document.getElementById('wifiForKitchen').checked = false;
    alert('✓ تم توصيل طابعة WiFi');
  } catch (e) {
    alert('خطأ في توصيل الطابعة: ' + e.message + '\n\nتأكد من تشغيل proxy server: node printer-proxy-server.js');
  }
};

// Bluetooth
document.getElementById('addBtPrinterBtn').onclick = async () => {
  try {
    const forKitchen = confirm('هل هذه طابعة مطبخ؟\nاضغط OK لو طابعة المطبخ، أو Cancel لو طابعة الفواتير');
    const p = await PRINTER.addPrinter('bluetooth', { name: forKitchen ? 'طابعة المطبخ' : 'طابعة Bluetooth', forKitchen });
    renderPrinterList();
    alert('✓ تم توصيل ' + (forKitchen ? 'طابعة المطبخ' : 'طابعة Bluetooth'));
  } catch (e) {
    if (e.name === 'NotFoundError') return;
    alert('خطأ: ' + e.message);
  }
};

// Restore saved printers on load
PRINTER.restorePrinters().then(() => renderPrinterList());
