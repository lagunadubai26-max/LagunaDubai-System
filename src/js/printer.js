window.PRINTER = (() => {
  let printers = [];
  let wsProxy = null;
  let nextId = 1;

  function escposText(text) {
    const encoder = new TextEncoder();
    return encoder.encode(text + '\n');
  }

  function escposCmd(...bytes) {
    return new Uint8Array(bytes);
  }

  function escposInit() {
    return concatenate([escposCmd(0x1B, 0x40), escposCmd(0x1B, 0x61, 0x01)]);
  }

  function escposBold(on) {
    return escposCmd(0x1B, 0x45, on ? 1 : 0);
  }

  function escposCut() {
    return escposCmd(0x1D, 0x56, 0x00);
  }

  function escposOpenDrawer() {
    return escposCmd(0x1B, 0x70, 0x00, 0x19, 0xFA);
  }

  function concatenate(arrays) {
    let totalLen = 0;
    arrays.forEach(a => totalLen += a.length);
    const result = new Uint8Array(totalLen);
    let offset = 0;
    arrays.forEach(a => { result.set(a, offset); offset += a.length; });
    return result;
  }

  async function buildReceiptData(inv) {
    try {
      const tpl = await TEMPLATE.getEscposTemplate('cashier');
      return TEMPLATE.renderEscpos(inv, tpl, 'cashier');
    } catch { }
    // fallback
    return TEMPLATE.renderEscpos(inv, null, 'cashier');
  }

  async function buildKitchenOrderData(inv) {
    try {
      const tpl = await TEMPLATE.getEscposTemplate('kitchen');
      return TEMPLATE.renderEscpos(inv, tpl, 'kitchen');
    } catch { }
    return TEMPLATE.renderEscpos(inv, null, 'kitchen');
  }

  // ---------- USB (WebUSB) ----------
  function connectUSB() {
    return {
      type: 'usb',
      device: null,
      endpoint: null,
      async connect() {
        const filters = [
          { vendorId: 0x04b8 }, { vendorId: 0x04b9 }, { vendorId: 0x0416 },
          { vendorId: 0x067b }, { vendorId: 0x0fe6 }, { vendorId: 0x0525 },
          { vendorId: 0x1fc9 }, { vendorId: 0x0456 }, { vendorId: 0x1504 },
          { vendorId: 0x0dd4 }, { vendorId: 0x0483 },
        ];
        const dev = await navigator.usb.requestDevice({ filters });
        this.device = dev;
        await dev.open();
        if (dev.configuration === null) await dev.selectConfiguration(1);
        await dev.claimInterface(0);
        const iface = dev.configuration.interfaces[0];
        for (const ep of iface.alternate.endpoints) {
          if (ep.direction === 'out') { this.endpoint = ep.endpointNumber; break; }
        }
        if (!this.endpoint) throw new Error('لم يتم العثور على منفذ USB للطباعة');
      },
      async disconnect() {
        if (this.device) { try { await this.device.close(); } catch {} }
      },
      async send(data) {
        if (!this.device || !this.endpoint) throw new Error('الطابعة غير متصلة');
        await this.device.transferOut(this.endpoint, data);
      }
    };
  }

  // ---------- WiFi (via WebSocket proxy) ----------
  function connectWiFi(host, port) {
    return {
      type: 'wifi',
      host, port,
      ws: null,
      async connect() {
        const proxyUrl = localStorage.getItem('laguna_printer_proxy') || 'ws://localhost:9090';
        this.ws = new WebSocket(proxyUrl);
        await new Promise((resolve, reject) => {
          this.ws.onopen = () => {
            this.ws.send(JSON.stringify({ action: 'connect', host: this.host, port: this.port }));
            resolve();
          };
          this.ws.onerror = () => reject(new Error('فشل الاتصال بالوكيل'));
          this.ws.onclose = () => { if (this.ws) this.ws = null; };
          setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 5000);
        });
      },
      async disconnect() {
        if (this.ws) { try { this.ws.close(); } catch {} this.ws = null; }
      },
      async send(data) {
        if (!this.ws) throw new Error('الطابعة غير متصلة');
        this.ws.send(data);
      }
    };
  }

  // ---------- Bluetooth (Web Bluetooth) ----------
  function connectBluetooth() {
    return {
      type: 'bluetooth',
      device: null,
      service: null,
      char: null,
      async connect() {
        const dev = await navigator.bluetooth.requestDevice({
          filters: [{ services: [0x1812] }],
          optionalServices: ['00001812-0000-1000-8000-00805f9b34fb', '000018f0-0000-1000-8000-00805f9b34fb']
        });
        this.device = dev;
        const server = await dev.gatt.connect();
        let svc;
        try { svc = await server.getPrimaryService(0x1812); }
        catch { svc = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb'); }
        this.service = svc;
        const chars = await svc.getCharacteristics();
        for (const c of chars) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            this.char = c;
            break;
          }
        }
        if (!this.char) throw new Error('لم يتم العثور على خاصية الكتابة');
      },
      async disconnect() {
        if (this.device) { try { this.device.gatt.disconnect(); } catch {} }
      },
      async send(data) {
        if (!this.char) throw new Error('الطابعة غير متصلة');
        await this.char.writeValue(data);
      }
    };
  }

  // ---------- Public API ----------
  async function addPrinter(type, config = {}) {
    let driver;
    if (type === 'usb') driver = connectUSB();
    else if (type === 'wifi') {
      if (!config.host) throw new Error('يرجى إدخال عنوان IP الطابعة');
      driver = connectWiFi(config.host, config.port || 9100);
    } else if (type === 'bluetooth') driver = connectBluetooth();
    else throw new Error('نوع طابعة غير معروف: ' + type);

    await driver.connect();
    const printer = {
      id: 'prn_' + (nextId++),
      name: config.name || (type === 'usb' ? 'USB' : type === 'wifi' ? 'WiFi' : 'Bluetooth'),
      type,
      driver,
      connected: true,
      active: true,
      forKitchen: config.forKitchen || false
    };
    printers.push(printer);
    savePrinters();
    return printer;
  }

  async function removePrinter(id) {
    const idx = printers.findIndex(p => p.id === id);
    if (idx === -1) return;
    const p = printers[idx];
    try { await p.driver.disconnect(); } catch {}
    printers.splice(idx, 1);
    savePrinters();
  }

  async function disconnectAll() {
    for (const p of printers) {
      try { await p.driver.disconnect(); } catch {}
      p.connected = false;
    }
    printers = [];
    savePrinters();
  }

  function getPrinters() { return printers; }
  function isConnected() { return printers.some(p => p.connected); }

  function getReceiptPrinters() { return printers.filter(p => p.active && !p.forKitchen); }
  function getKitchenPrinters() { return printers.filter(p => p.active && p.forKitchen); }

  function savePrinters() {
    const data = printers.map(p => ({
      id: p.id, name: p.name, type: p.type, forKitchen: p.forKitchen, active: true,
      host: p.driver.host, port: p.driver.port
    }));
    localStorage.setItem('laguna_printers', JSON.stringify(data));
  }

  async function restorePrinters() {
    const raw = localStorage.getItem('laguna_printers');
    let data;
    if (raw) { try { data = JSON.parse(raw); } catch { data = []; } } else { data = []; }
    for (const cfg of data) {
      try {
        if (cfg.type === 'usb') continue;
        await addPrinter(cfg.type, { name: cfg.name, host: cfg.host, port: cfg.port, forKitchen: cfg.forKitchen });
      } catch {}
    }
    try {
      if (!navigator.usb) return;
      const devices = await navigator.usb.getDevices();
      for (const dev of devices) {
        const already = printers.some(p => p.driver.device === dev);
        if (already) continue;
        await dev.open();
        if (dev.configuration === null) await dev.selectConfiguration(1);
        await dev.claimInterface(0);
        const iface = dev.configuration.interfaces[0];
        let ep = null;
        for (const e of iface.alternate.endpoints) {
          if (e.direction === 'out') { ep = e.endpointNumber; break; }
        }
        if (!ep) continue;
        const driver = { type: 'usb', device: dev, endpoint: ep, connected: true };
        driver.connect = async () => {};
        driver.disconnect = async () => { try { await dev.close(); } catch {} };
        driver.send = async (data) => { await dev.transferOut(ep, data); };
        const p = { id: 'prn_usb_' + (nextId++), name: 'XP-80', type: 'usb', driver, connected: true, active: true, forKitchen: false };
        printers.push(p);
      }
    } catch {}
  }

  async function printTo(printerId, data) {
    const p = printers.find(x => x.id === printerId);
    if (!p) throw new Error('الطابعة غير موجودة');
    if (!p.connected) throw new Error('الطابعة غير متصلة');
    await p.driver.send(data);
  }

  async function printReceipt(inv, printerId) {
    const data = await buildReceiptData(inv);
    if (printerId) {
      await printTo(printerId, data);
    } else {
      for (const p of getReceiptPrinters()) {
        try { await p.driver.send(data); } catch (e) { console.warn('[printer] ' + p.name + ': ' + e.message); }
      }
    }
  }

  async function printKitchenOrder(inv, printerId) {
    const data = await buildKitchenOrderData(inv);
    if (printerId) {
      await printTo(printerId, data);
    } else {
      for (const p of getKitchenPrinters()) {
        try { await p.driver.send(data); } catch (e) { console.warn('[printer] ' + p.name + ': ' + e.message); }
      }
    }
  }

  async function openDrawer(printerId) {
    const data = escposOpenDrawer();
    if (printerId) {
      await printTo(printerId, data);
    } else {
      for (const p of printers) {
        if (p.connected) { try { await p.driver.send(data); } catch {} }
      }
    }
  }

  async function printViaAgent(invoice) {
    let url = localStorage.getItem('laguna_print_agent_url');
    if (!url) return { ok: false, skipped: true };
    try {
      const resp = await fetch(url.replace(/\/+$/, '') + '/print-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });
      return await resp.json();
    } catch (err) {
      console.warn('[print-agent] لا يمكن الوصول:', err.message);
      return { ok: false, error: err.message };
    }
  }

  return {
    addPrinter, removePrinter, disconnectAll, getPrinters, isConnected,
    getReceiptPrinters, getKitchenPrinters, restorePrinters,
    printTo, printReceipt, printKitchenOrder, openDrawer,
    printViaAgent,
    escposInit, escposBold, escposText, escposCut,
    buildReceiptData, buildKitchenOrderData
  };
})();
