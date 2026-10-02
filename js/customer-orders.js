(async function () {
  const box = document.getElementById('customerOrderInbox'); if (!box) return;
  let user; try { user = await FB.requireStaff(); } catch (_) { return; }
  const db = FB.getDb();
  const catalog = await DB.products.all();
  async function accept(id) {
    const settings = await DB.settings.get();
    const tables = await DB.tables.all();
    const invoiceId = 'ORDER-' + id;
    await FB.runTransaction(async tx => {
      const orderRef = db.collection('customer_orders').doc(id);
      const order = await tx.get(orderRef);
      if (!order.exists) throw new Error('الطلب غير موجود');
      if (order.data().status === 'accepted') return;
      if (order.data().status !== 'new') throw new Error('تم التعامل مع الطلب بالفعل');
      const state = await tx.get(db.collection('shift_state').doc('current'));
      if (!state.exists || !state.data().openShiftId) throw new Error('افتح الشيفت أولًا');
      const shiftRef = db.collection('shifts').doc(state.data().openShiftId), shiftSnap = await tx.get(shiftRef);
      if (!shiftSnap.exists || shiftSnap.data().closedAt != null) throw new Error('الشيفت مغلق');
      const shift = shiftSnap.data(); DB.shifts.assertCanSell(shift, user);
      const rawItems = order.data().items;
      if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > 50) throw new Error('أصناف الطلب غير صالحة');
      const productSnaps = await Promise.all(rawItems.map(it => {
        if (!it || typeof it.productId !== 'string' || !it.productId || it.productId.includes('/')) throw new Error('منتج غير صالح');
        return tx.get(db.collection('products').doc(it.productId));
      }));
      const items = rawItems.map((it, i) => {
        const snap = productSnaps[i];
        if (!snap.exists || !Number.isInteger(it.qty) || it.qty < 1 || it.qty > 99) throw new Error('كمية أو منتج غير صالح');
        const product = { ...snap.data(), id: snap.id };
        const line = Catalog.line(product, it.variantKey || '', it.menuType);
        line.qty = it.qty; line.note = typeof it.note === 'string' ? it.note.slice(0, 200) : '';
        line.hasMilk = line.menuType === 'cafe' && it.hasMilk === true;
        if (line.hasMilk) line.price += 15;
        return line;
      });
      const base = items.reduce((sum, it) => sum + it.qty * it.price, 0);
      const serviceOn = !!document.getElementById('serviceToggle')?.checked;
      const serviceAmount = serviceOn ? Math.round(base * Number(settings.serviceTax || 10) / 100) : 0;
      const taxAmount = serviceOn ? Math.round((base + serviceAmount) * Number(settings.taxRate || 14) / 100) : 0;
      const total = base + serviceAmount + taxAmount, date = FB.nowISO();
      tx.set(db.collection('invoices').doc(invoiceId), { id: invoiceId, customer: 'طلب عميل', table: order.data().table || '', date, items,
        total, paid: 0, tendered: 0, change: 0, remaining: total, serviceAmount, taxAmount, paymentMethod: 'Cash', status: 'pending', customerType: 'regular', itemsValue: base,
        shiftId: shiftSnap.id, shiftType: shift.shiftType, createdByUid: user.uid, createdBy: user.name, customerOrderId: id });
      tx.update(shiftRef, { invoiceVersion: Number(shift.invoiceVersion || 0) + 1, lastActivityAt: date });
      const table = tables.find(t => t.name === order.data().table);
      if (table) tx.update(db.collection('tables_').doc(table.id), { status: 'occupied', currentOrder: invoiceId });
      tx.update(orderRef, { status: 'accepted', invoiceId, acceptedByUid: user.uid, acceptedAt: date });
    });
    await FB.invalidate('invoices');
    await DB.audit.log('customer_order_accepted', { orderId: id, invoiceId });
  }
  db.collection('customer_orders').where('status', '==', 'new').onSnapshot(snapshot => {
    box.innerHTML = '<h3>طلبات العملاء الجديدة (' + snapshot.size + ')</h3>';
    snapshot.docs.forEach(doc => {
      const order = doc.data(), card = document.createElement('article');
      card.style.cssText = 'padding:12px;margin:8px 0;border:1px solid var(--border);border-radius:10px';
      const text = document.createElement('p'); text.textContent = (order.table || 'بدون طاولة') + ' · ' + (Array.isArray(order.items) ? order.items.length : 0) + ' صنف · ' + (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('ar-EG') : ''); card.appendChild(text);
      const detail = document.createElement('pre'); detail.style.cssText = 'white-space:pre-wrap;font:inherit;font-size:13px';
      detail.textContent = (order.items || []).map(it => {
        if (!it || typeof it !== 'object') return 'صنف غير صالح — ارفض الطلب';
        const name = catalog.find(p => p.id === it.productId)?.name || String(it.productId || 'منتج غير معروف').slice(0, 60);
        return name + ' ' + String(it.variantKey || '').slice(0, 20) + ' ×' + String(it.qty || '').slice(0, 5) + (typeof it.note === 'string' ? ' — ' + it.note.slice(0, 200) : '');
      }).join('\n'); card.appendChild(detail);
      const acceptBtn = document.createElement('button'); acceptBtn.textContent = 'قبول وإنشاء فاتورة معلقة'; acceptBtn.className = 'confirm-btn';
      acceptBtn.onclick = async () => { acceptBtn.disabled = true; try { await accept(doc.id); alert('تم قبول الطلب. الدفع من قسم الفواتير'); } catch (e) { alert(e.message || e); acceptBtn.disabled = false; } };
      card.appendChild(acceptBtn);
      const reject = document.createElement('button'); reject.className = 'cancel-btn'; reject.textContent = 'رفض الطلب';
      reject.onclick = async () => { reject.disabled = true; try { await doc.ref.update({ status: 'rejected', rejectedByUid: user.uid, rejectedAt: FB.nowISO() }); } catch (e) { alert(e.message); reject.disabled = false; } };
      card.appendChild(reject); box.appendChild(card);
    });
  }, error => { box.textContent = 'تعذر تحميل طلبات العملاء: ' + error.message; });
})();
