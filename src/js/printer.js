window.PRINTER = (() => {
  let device = null;
  let endpoint = null;

  function escposText(text) {
    const encoder = new TextEncoder();
    return encoder.encode(text + '\n');
  }

  function escposCmd(...bytes) {
    return new Uint8Array(bytes);
  }

  function escposInit() {
    const parts = [];
    parts.push(escposCmd(0x1B, 0x40));
    parts.push(escposCmd(0x1B, 0x61, 0x01));
    return concatenate(parts);
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
    arrays.forEach(a => {
      result.set(a, offset);
      offset += a.length;
    });
    return result;
  }

  async function connect() {
    try {
      const filters = [
        { vendorId: 0x04b8 },
        { vendorId: 0x04b9 },
        { vendorId: 0x0416 },
        { vendorId: 0x067b },
        { vendorId: 0x0fe6 },
        { vendorId: 0x0525 },
        { vendorId: 0x1fc9 },
        { vendorId: 0x0456 },
        { vendorId: 0x1504 },
        { vendorId: 0x0dd4 },
      ];
      const dev = await navigator.usb.requestDevice({ filters });
      device = dev;
      await device.open();
      if (device.configuration === null) await device.selectConfiguration(1);
      await device.claimInterface(0);
      const iface = device.configuration.interfaces[0];
      endpoint = null;
      for (const ep of iface.alternate.endpoints) {
        if (ep.direction === 'out') { endpoint = ep.endpointNumber; break; }
      }
      if (!endpoint) throw new Error('لم يتم العثور على منفذ USB للطباعة');
      return true;
    } catch (e) {
      if (e.name === 'NotFoundError') return false;
      throw e;
    }
  }

  async function disconnect() {
    if (device) {
      try { await device.close(); } catch {}
      device = null;
      endpoint = null;
    }
  }

  function isConnected() { return !!device; }

  async function print(data) {
    if (!device || !endpoint) throw new Error('الطابعة غير متصلة');
    await device.transferOut(endpoint, data);
  }

  async function printReceipt(inv) {
    const parts = [];
    parts.push(escposInit());
    parts.push(escposBold(true));
    parts.push(escposText('      Laguna Cafe'));
    parts.push(escposBold(false));
    parts.push(escposText(''));
    const dateStr = inv.date ? new Date(inv.date).toLocaleString('ar-SA') : '';
    parts.push(escposText(dateStr));
    parts.push(escposText('#' + (inv.id || '')));
    if (inv.customer) parts.push(escposText(inv.customer));
    if (inv.table) parts.push(escposText(inv.table));
    parts.push(escposText(''));
    parts.push(escposText('------------------------------'));
    if (inv.items) inv.items.forEach(item => {
      const milkTxt = item.hasMilk ? ' +حليب' : '';
      const noteTxt = item.note ? ' (' + item.note + ')' : '';
      const line = (item.name + milkTxt).substring(0, 22).padEnd(22) + item.qty + 'x' + (item.qty * item.price);
      parts.push(escposText(line));
      if (item.note) parts.push(escposText('  ' + item.note));
    });
    parts.push(escposText('------------------------------'));
    const paid = inv.paid ?? inv.total;
    const remaining = inv.remaining ?? Math.max(0, (inv.total ?? 0) - paid);
    parts.push(escposText('الإجمالي:  ' + (inv.total ?? 0) + ' ج.م'));
    parts.push(escposText('المدفوع:   ' + paid + ' ج.م'));
    if (remaining > 0) parts.push(escposText('الباقي:    ' + remaining + ' ج.م'));
    parts.push(escposText(inv.paymentMethod || 'كاش'));
    parts.push(escposText(''));
    parts.push(escposText('شكراً لزيارتكم'));
    parts.push(escposText(''));
    parts.push(escposCut());
    await print(concatenate(parts));
  }

  async function openDrawer() {
    await print(escposOpenDrawer());
  }

  return { connect, disconnect, isConnected, print, printReceipt, openDrawer, escposInit, escposBold, escposText, escposCut };
})();
