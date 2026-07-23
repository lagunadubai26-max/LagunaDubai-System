let _templateType = 'cashier';
let _templateFormat = 'html';

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
  if (settings.printAgentKey) localStorage.setItem('laguna_print_agent_key', settings.printAgentKey);
  localStorage.setItem('laguna_print_agent_enabled', settings.enablePrintAgent !== false);
  loadTemplateEditor(settings);
}

function getTemplateKey(type, format) {
  if (format === 'escpos') return type === 'cashier' ? 'escposTemplateCashier' : 'escposTemplateKitchen';
  return type === 'cashier' ? 'invoiceTemplateCashier' : 'invoiceTemplateKitchen';
}

function getDefaultTemplate(type, format) {
  if (format === 'escpos') return TEMPLATE['defaultEscpos' + (type === 'cashier' ? 'Cashier' : 'Kitchen')];
  return TEMPLATE['default' + (type === 'cashier' ? 'Cashier' : 'Kitchen') + 'Template'];
}

function getPlaceholders(type, format) {
  if (format === 'escpos') return ['init','center','left','bold','bold=off','size=normal','size=double','cut','drawer','items:name:qty:total','---','date','id','customer','table','total','paid','change','remaining','serviceAmount','taxAmount','subtotal','paymentMethod','footer'];
  return TEMPLATE.PLACEHOLDERS[type] || [];
}

function loadTemplateEditor(settings) {
  if (!window._savedTemplates) window._savedTemplates = {};
  ['cashier', 'kitchen'].forEach(type => {
    ['html', 'escpos'].forEach(fmt => {
      const key = getTemplateKey(type, fmt);
      window._savedTemplates[key] = settings[key] || getDefaultTemplate(type, fmt);
    });
  });
  switchTemplateEditor();
}

function switchTemplateEditor() {
  const key = getTemplateKey(_templateType, _templateFormat);
  const saved = window._savedTemplates || {};
  document.getElementById('templateEditor').value = saved[key] || getDefaultTemplate(_templateType, _templateFormat);
  document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.type === _templateType));
  document.querySelectorAll('.fmt-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.fmt === _templateFormat));
  const placeholders = getPlaceholders(_templateType, _templateFormat);
  const prefix = _templateFormat === 'escpos' ? '' : '{{';
  const suffix = _templateFormat === 'escpos' ? '' : '}}';
  document.getElementById('placeholderList').textContent = placeholders.map(p => prefix + p + suffix).join('  ');
}

// Type tabs: cashier / kitchen
document.querySelectorAll('.type-tab-btn').forEach(btn => {
  btn.onclick = () => { _templateType = btn.dataset.type; switchTemplateEditor(); };
});

// Format tabs: html / escpos
document.querySelectorAll('.fmt-tab-btn').forEach(btn => {
  btn.onclick = () => { _templateFormat = btn.dataset.fmt; switchTemplateEditor(); };
});

document.getElementById('resetTemplateBtn').onclick = () => {
  const label = (_templateType === 'cashier' ? 'فاتورة الكاشير' : 'أمر المطبخ') + ' - ' + (_templateFormat === 'html' ? 'HTML' : 'ESCPOS');
  if (!confirm('استعادة القالب الافتراضي لـ ' + label + '؟')) return;
  const def = getDefaultTemplate(_templateType, _templateFormat);
  document.getElementById('templateEditor').value = def;
  const key = getTemplateKey(_templateType, _templateFormat);
  window._savedTemplates[key] = def;
};

document.getElementById('previewTemplateBtn').onclick = () => {
  const text = document.getElementById('templateEditor').value;
  const previewData = {
    id: 'PREVIEW',
    date: new Date().toISOString(),
    customer: 'عميل تجريبي',
    table: 'طاولة 5',
    items: [
      { name: 'قهوة سادة', qty: 2, price: 25, note: '', hasMilk: false },
      { name: 'كابتشينو', qty: 1, price: 35, note: 'بدون سكر', hasMilk: true }
    ],
    total: 85,
    paid: 85,
    serviceAmount: 10,
    taxAmount: 12,
    change: 0,
    remaining: 0,
    paymentMethod: 'كاش'
  };
  if (_templateFormat === 'escpos') {
    alert('معاينة ESCPOS غير متاحة في المتصفح.\nحفظ القالب واختبر الطباعة.');
    return;
  }
  const fn = _templateType === 'cashier' ? TEMPLATE.renderCashier : TEMPLATE.renderKitchen;
  const rendered = fn(previewData, text);
  const w = window.open('', '_blank', 'width=400,height=700');
  w.document.write(rendered);
  w.document.close();
};

document.getElementById('saveSettings').onclick = async () => {
  const templateEditor = document.getElementById('templateEditor');
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
    printAgentUrl: document.getElementById('printAgentUrl').value || 'http://localhost:4321',
    printAgentKey: document.getElementById('printAgentKey').value || '',
    invoiceTemplateCashier: window._savedTemplates ? (window._savedTemplates.invoiceTemplateCashier || TEMPLATE.defaultCashierTemplate) : TEMPLATE.defaultCashierTemplate,
    invoiceTemplateKitchen: window._savedTemplates ? (window._savedTemplates.invoiceTemplateKitchen || TEMPLATE.defaultKitchenTemplate) : TEMPLATE.defaultKitchenTemplate,
    escposTemplateCashier: window._savedTemplates ? (window._savedTemplates.escposTemplateCashier || TEMPLATE.defaultEscposCashier) : TEMPLATE.defaultEscposCashier,
    escposTemplateKitchen: window._savedTemplates ? (window._savedTemplates.escposTemplateKitchen || TEMPLATE.defaultEscposKitchen) : TEMPLATE.defaultEscposKitchen
  });
  const proxyUrl = document.getElementById('wsProxyUrl').value || 'ws://localhost:9090';
  localStorage.setItem('laguna_printer_proxy', proxyUrl);
  const agentUrl = document.getElementById('printAgentUrl').value || 'http://localhost:4321';
  localStorage.setItem('laguna_print_agent_url', agentUrl);
  const agentKey = document.getElementById('printAgentKey').value || '';
  localStorage.setItem('laguna_print_agent_key', agentKey);
  localStorage.setItem('laguna_print_agent_enabled', document.getElementById('enablePrintAgent').checked);
  alert('تم حفظ الإعدادات بنجاح');
};

// Auto-save template when editor changes
document.getElementById('templateEditor').addEventListener('input', function() {
  if (!window._savedTemplates) window._savedTemplates = {};
  const key = getTemplateKey(_templateType, _templateFormat);
  window._savedTemplates[key] = this.value;
});

document.getElementById('resetData').onclick = () => {
  document.getElementById('resetConfirmWord').value = '';
  document.getElementById('confirmResetBtn').disabled = true;
  document.getElementById('resetConfirmModal').classList.add('show');
};

document.getElementById('resetConfirmWord').oninput = function() {
  document.getElementById('confirmResetBtn').disabled = this.value.trim() !== 'تأكيد';
};

document.getElementById('resetConfirmWord').onkeydown = function(e) {
  if (e.key === 'Enter' && this.value.trim() === 'تأكيد') {
    document.getElementById('confirmResetBtn').click();
  }
};

document.getElementById('confirmResetBtn').onclick = async () => {
  document.getElementById('resetConfirmModal').classList.remove('show');
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

document.getElementById('cancelResetConfirm').onclick = () => {
  document.getElementById('resetConfirmModal').classList.remove('show');
};
document.getElementById('closeResetConfirm').onclick = () => {
  document.getElementById('resetConfirmModal').classList.remove('show');
};

async function renderUserMappings() {
  const list = document.getElementById('userMappingList');
  if (!list) return;
  try {
    const snap = await FB.getDb().collection('user_mappings').get();
    const mappings = [];
    snap.forEach(d => mappings.push({ uid: d.id, ...d.data() }));
    if (mappings.length === 0) {
      list.innerHTML = '<p style="color:#888;font-size:13px;text-align:center;padding:12px">لا توجد صلاحيات مسجلة</p>';
      return;
    }
    list.innerHTML = mappings.map(m =>
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f5f5f4;border-radius:8px;margin-bottom:6px;font-size:13px">
        <span><strong>${escapeHtml(m.name || m.username || m.uid)}</strong> — ${m.role === 'Administrator' ? 'مدير' : m.role === 'Owner' ? 'م/محمد الجوهري' : 'موظف'}</span>
        <span style="color:#888;font-size:11px;direction:ltr;text-align:left" title="${m.uid}">${m.uid.slice(0, 12)}...</span>
      </div>`
    ).join('');
  } catch (e) {
    list.innerHTML = '<p style="color:#dc2626;font-size:13px">خطأ في تحميل الصلاحيات</p>';
  }
}

document.getElementById('addUserMappingBtn').onclick = async () => {
  const uid = document.getElementById('mappingUid').value.trim();
  const userId = document.getElementById('mappingUserId').value;
  const role = document.getElementById('mappingRole').value;
  if (!uid || !userId) return alert('يرجى إدخال UID واختيار مستخدم');
  try {
    const users = await DB.users.all() || [];
    const user = users.find(u => u.id === userId);
    if (!user) return alert('المستخدم غير موجود');
    await FB.getDb().collection('user_mappings').doc(uid).set({
      userId: user.id, role, username: user.username, name: user.name,
      updatedAt: new Date().toISOString()
    });
    alert('تم إضافة الصلاحية بنجاح');
    document.getElementById('mappingUid').value = '';
    renderUserMappings();
  } catch (e) {
    alert('خطأ: ' + e.message);
  }
};

document.getElementById('addUserBtn').onclick = async () => {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const name = document.getElementById('newFullName').value.trim();
  const role = document.getElementById('newRole').value;
  if (!username || !password || !name) return alert('يرجى ملء جميع الحقول');
  const existing = (await DB.users.all() || []).find(u => u.username === username);
  if (existing) return alert('اسم المستخدم موجود بالفعل');
  const hashedPw = await PASSWORD_UTILS.hash(password);
  await DB.users.add({ username, password: hashedPw, name, role });
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
        const d = await PRINTER.buildReceiptData({ id: 'TEST', date: new Date().toISOString(), customer: 'اختبار', items: [{ name: 'اختبار طباعة', qty: 1, price: 10 }], total: 10, paid: 10, paymentMethod: 'كاش' });
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

// ── User Mappings ──
async function initUserMappings() {
  const select = document.getElementById('mappingUserId');
  if (!select) return;
  try {
    const users = await DB.users.all() || [];
    select.innerHTML = users.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (${u.username})</option>`).join('');
  } catch (e) {
    console.warn('[settings] failed to load users:', e);
  }
  renderUserMappings();
}
initUserMappings();
