const DB_MODE = 'hybrid';

const BASE_URL = window.location.origin;

async function postToBackend(data) {
  try {
    const res = await fetch(BASE_URL + '/api/public/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    console.warn('[data] postToBackend error:', e.message);
    return null;
  }
}

async function getFromBackend() {
  try {
    const res = await fetch(BASE_URL + '/api/public/invoices');
    return await res.json();
  } catch (e) {
    console.warn('[data] getFromBackend error:', e.message);
    return [];
  }
}

const DB = {
  mode: DB_MODE,
  async get(key, defaults) {
    try { const d = localStorage.getItem('laguna_' + key); return d ? JSON.parse(d) : defaults; }
    catch { return defaults; }
  },
  set(key, val) { localStorage.setItem('laguna_' + key, JSON.stringify(val)); },

  async syncFromAPI(table, local, setFn, apiFn) {
    try {
      const data = await apiFn();
      console.log('[sync] ' + table + ' GET:', data ? 'OK count=' + data.length : 'FAILED(null)');
      if (Array.isArray(data)) {
        const parsed = data.map(d => {
          const row = { ...d, items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items };
          if (row.paymentmethod && !row.paymentMethod) row.paymentMethod = row.paymentmethod;
          delete row.paymentmethod;
          return row;
        });
        const existing = JSON.parse(localStorage.getItem('laguna_' + table)) || [];
        const merged = [...existing];
        for (const item of parsed) {
          const idx = merged.findIndex(m => m.id === item.id);
          if (idx === -1) merged.push(item);
        }
        console.log('[sync] ' + table + ' merged:', local.length, 'local +', parsed.length, 'api =', merged.length);
        setFn(merged);
      }
    } catch (e) {
      console.warn('[sync] ' + table + ' error:', e.message);
    }
  },

  employees: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_employees')) || []; } catch { return []; } },
    async all() {
      const local = DB.employees.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('employees', local, d => DB.set('employees', d), () => API.employees.all());
      return local;
    },
    async add(emp) {
      emp.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.employees.add(emp); } catch {}
      const list = DB.employees.local();
      list.push(emp);
      DB.set('employees', list);
      return emp;
    },
    async update(id, data) {
      if (DB_MODE !== 'local') try { await API.employees.update(id, data); } catch {}
      const list = DB.employees.local();
      const idx = list.findIndex(e => e.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('employees', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.employees.remove(id); } catch {}
      DB.set('employees', DB.employees.local().filter(e => e.id !== id));
    }
  },

  attendance: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_attendance')) || []; } catch { return []; } },
    async all() {
      const local = DB.attendance.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('attendance', local, d => DB.set('attendance', d), () => API.attendance.all());
      return local;
    },
    async today() {
      const todayStr = new Date().toDateString();
      const local = DB.attendance.local().filter(a => new Date(a.date).toDateString() === todayStr);
      return local;
    },
    async checkIn(employeeId, name, job) {
      const id = Date.now().toString(36);
      const rec = { id, employeeId, name, job, date: new Date().toISOString(), checkIn: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), checkOut: null, status: 'present' };
      if (DB_MODE !== 'local') try { await API.attendance.checkIn(employeeId, name, job); } catch {}
      const list = DB.attendance.local();
      list.push(rec);
      DB.set('attendance', list);
      return rec;
    },
    async checkOut(id) {
      if (DB_MODE !== 'local') try { await API.attendance.checkOut(id); } catch {}
      const list = DB.attendance.local();
      const item = list.find(a => a.id === id);
      if (item) { item.checkOut = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }); DB.set('attendance', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.attendance.remove(id); } catch {}
      DB.set('attendance', DB.attendance.local().filter(a => a.id !== id));
    }
  },

  invoices: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_invoices')) || []; } catch { return []; } },
    async all() {
      const local = DB.invoices.local();
      if (DB_MODE !== 'local') {
        await DB.syncFromAPI('invoices', local, d => DB.set('invoices', d), () => API.invoices.all());
        try {
          const backendInvs = await getFromBackend();
          if (Array.isArray(backendInvs)) {
            const existing = DB.invoices.local();
            const existingIds = new Set(existing.map(i => i.id));
            let added = 0;
            backendInvs.forEach(bi => {
              if (!existingIds.has(bi.id)) {
                existing.unshift({ ...bi, _synced: true });
                added++;
              }
            });
            if (added > 0) DB.set('invoices', existing);
          }
        } catch (e) {
          console.warn('[data] invoices.all backend fetch error:', e.message);
        }
      }
      return DB.invoices.local();
    },
    async add(inv) {
      inv.id = 'INV-' + Date.now().toString(36).toUpperCase();
      const list = DB.invoices.local();
      let synced = false;
      let errorMsg = '';
      if (DB_MODE !== 'local') {
        try {
          const backendPayload = {
            id: inv.id, customer: inv.customer, date: inv.date,
            items: inv.items, total: inv.total,
            serviceAmount: inv.serviceAmount || 0,
            status: inv.status, paymentMethod: inv.paymentMethod,
            table: inv.table || null
          };
          const result = await postToBackend(backendPayload);
          const syncedObj = Array.isArray(result) ? result[0] : result;
          synced = syncedObj && syncedObj.id === inv.id;
          if (!synced) {
            errorMsg = 'فشل الاتصال بالسيرفر';
            console.warn('[sync] invoices.add backend returned:', result);
          }
        } catch (e) {
          errorMsg = e.message || 'خطأ في الاتصال';
          console.warn('[sync] invoices.add error:', e.message);
        }
      }
      inv._synced = synced;
      inv._syncError = errorMsg;
      list.unshift(inv);
      DB.set('invoices', list);
      return inv;
    },
    async update(id, data) {
      if (DB_MODE !== 'local') {
        const apiData = { 
          date: data.date,
          items: data.items ? (typeof data.items === 'string' ? data.items : JSON.stringify(data.items)) : undefined,
          total: data.total,
          status: data.status
        };
        Object.keys(apiData).forEach(k => apiData[k] === undefined && delete apiData[k]);
        try { await API.invoices.update(id, apiData); } catch {}
      }
      const list = DB.invoices.local();
      const idx = list.findIndex(i => i.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('invoices', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.invoices.remove(id); } catch {}
      DB.set('invoices', DB.invoices.local().filter(i => i.id !== id));
    }
  },

  returns: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_returns')) || []; } catch { return []; } },
    async all() {
      const local = DB.returns.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('returns', local, d => DB.set('returns', d), () => API.returns.all());
      return local;
    },
    async add(r) {
      r.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.returns.add(r); } catch {}
      const list = DB.returns.local();
      list.unshift(r);
      DB.set('returns', list);
      return r;
    },
    async update(id, data) {
      if (DB_MODE !== 'local') try { await API.returns.update(id, data); } catch {}
      const list = DB.returns.local();
      const idx = list.findIndex(i => i.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('returns', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.returns.remove(id); } catch {}
      DB.set('returns', DB.returns.local().filter(i => i.id !== id));
    }
  },

  tables: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_tables')) || []; } catch { return []; } },
    async all() {
      const local = DB.tables.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('tables', local, d => DB.set('tables', d), () => API.tables.all());
      return local;
    },
    async add(t) {
      t.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.tables.add(t); } catch {}
      const list = DB.tables.local();
      list.push(t);
      DB.set('tables', list);
      return t;
    },
    async update(id, data) {
      if (DB_MODE !== 'local') try { await API.tables.update(id, data); } catch {}
      const list = DB.tables.local();
      const idx = list.findIndex(i => i.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('tables', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.tables.remove(id); } catch {}
      DB.set('tables', DB.tables.local().filter(i => i.id !== id));
    }
  },

  expenses: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_expenses')) || []; } catch { return []; } },
    async all() {
      const local = DB.expenses.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('expenses', local, d => DB.set('expenses', d), () => API.expenses.all());
      return local;
    },
    async add(e) {
      e.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.expenses.add(e); } catch {}
      const list = DB.expenses.local();
      list.unshift(e);
      DB.set('expenses', list);
      return e;
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.expenses.remove(id); } catch {}
      DB.set('expenses', DB.expenses.local().filter(i => i.id !== id));
    }
  },

  customers: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_customers')) || []; } catch { return []; } },
    async all() {
      const local = DB.customers.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('customers', local, d => DB.set('customers', d), () => API.customers.all());
      return local;
    },
    async add(c) {
      c.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.customers.add(c); } catch {}
      const list = DB.customers.local();
      list.push(c);
      DB.set('customers', list);
      return c;
    },
    async update(id, data) {
      if (DB_MODE !== 'local') try { await API.customers.update(id, data); } catch {}
      const list = DB.customers.local();
      const idx = list.findIndex(i => i.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('customers', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.customers.remove(id); } catch {}
      DB.set('customers', DB.customers.local().filter(i => i.id !== id));
    }
  },

  inventory: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_inventory')) || []; } catch { return []; } },
    async all() {
      const local = DB.inventory.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('inventory', local, d => DB.set('inventory', d), () => API.inventory.all());
      return local;
    },
    async add(item) {
      item.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.inventory.add(item); } catch {}
      const list = DB.inventory.local();
      list.push(item);
      DB.set('inventory', list);
      return item;
    },
    async update(id, data) {
      if (DB_MODE !== 'local') try { await API.inventory.update(id, data); } catch {}
      const list = DB.inventory.local();
      const idx = list.findIndex(i => i.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('inventory', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.inventory.remove(id); } catch {}
      DB.set('inventory', DB.inventory.local().filter(i => i.id !== id));
    }
  },

  settings: {
    async get() {
      const local = (() => { try { return JSON.parse(localStorage.getItem('laguna_settings')) || {}; } catch { return {}; } })();
      if (Object.keys(local).length === 0 && DB_MODE !== 'local') {
        try { const api = await API.settings.get(); if (api && Object.keys(api).length) { DB.set('settings', api); return api; } } catch {}
      }
      return Object.keys(local).length ? local : { cafeName: 'Laguna Cafe', currency: 'ج.م', taxRate: 14, serviceTax: 10, lowStockAlert: 5 };
    },
    async save(s) {
      if (DB_MODE !== 'local') try { await API.settings.save(s); } catch {}
      DB.set('settings', s);
    }
  },

  users: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_users')) || []; } catch { return []; } },
    async all() {
      const local = DB.users.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('users', local, d => DB.set('users', d), () => API.users.all());
      return local;
    },
    async add(u) {
      u.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.users.add(u); } catch {}
      const list = DB.users.local();
      list.push(u);
      DB.set('users', list);
      return u;
    },
    auth(username, password) { const list = DB.users.local(); return list.find(u => u.username === username && u.password === password) || null; },
    async save(list) { DB.set('users', list); }
  },

  products: {
    local() { try { return JSON.parse(localStorage.getItem('laguna_products')) || []; } catch { return []; } },
    async all() {
      const local = DB.products.local();
      if (DB_MODE !== 'local') DB.syncFromAPI('products', local, d => DB.set('products', d), () => API.products.all());
      return local;
    },
    async add(p) {
      p.id = Date.now().toString(36);
      if (DB_MODE !== 'local') try { await API.products.add(p); } catch {}
      const list = DB.products.local();
      list.push(p);
      DB.set('products', list);
      return p;
    },
    async update(id, data) {
      if (DB_MODE !== 'local') try { await API.products.update(id, data); } catch {}
      const list = DB.products.local();
      const idx = list.findIndex(i => i.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('products', list); }
    },
    async remove(id) {
      if (DB_MODE !== 'local') try { await API.products.remove(id); } catch {}
      DB.set('products', DB.products.local().filter(i => i.id !== id));
    }
  },

  seed() {
    try { const p = localStorage.getItem('laguna_products'); if (p && !p.startsWith('[')) localStorage.removeItem('laguna_products'); } catch {}
    try { const i = localStorage.getItem('laguna_invoices'); if (i && !i.startsWith('[')) localStorage.removeItem('laguna_invoices'); } catch {}
    try { const a = localStorage.getItem('laguna_attendance'); if (a && !a.startsWith('[')) localStorage.removeItem('laguna_attendance'); } catch {}
    try { const r = localStorage.getItem('laguna_returns'); if (r && !r.startsWith('[')) localStorage.removeItem('laguna_returns'); } catch {}
    try { const e = localStorage.getItem('laguna_expenses'); if (e && !e.startsWith('[')) localStorage.removeItem('laguna_expenses'); } catch {}
    try { const c = localStorage.getItem('laguna_customers'); if (c && !c.startsWith('[')) localStorage.removeItem('laguna_customers'); } catch {}
    try { const em = localStorage.getItem('laguna_employees'); if (em && !em.startsWith('[')) localStorage.removeItem('laguna_employees'); } catch {}
    try { const inv = localStorage.getItem('laguna_inventory'); if (inv && !inv.startsWith('[')) localStorage.removeItem('laguna_inventory'); } catch {}
    try { const t = localStorage.getItem('laguna_tables'); if (t && !t.startsWith('[')) localStorage.removeItem('laguna_tables'); } catch {}
    try { const s = localStorage.getItem('laguna_settings'); if (s && !s.startsWith('{')) localStorage.removeItem('laguna_settings'); } catch {}
    try { const u = localStorage.getItem('laguna_users'); if (u && !u.startsWith('[')) localStorage.removeItem('laguna_users'); } catch {}
    if (DB.users.local().length === 0) {
      DB.set('users', [{ id: 'u1', username: 'admin', password: 'admin123', name: 'أحمد علي', role: 'Administrator' }]);
    }
    if (DB.employees.local().length === 0) {
      DB.set('employees', [
        { id: 'e1', name: 'أحمد موظف', job: 'ويتر', phone: '01012345678', salary: '3000', hireDate: '2025-01-15', status: 'active', pin: '1234' },
        { id: 'e2', name: 'محمد موظف', job: 'شيف', phone: '01198765432', salary: '5000', hireDate: '2025-02-01', status: 'active', pin: '5678' }
      ]);
    }
    if (DB.tables.local().length === 0) {
      const list = [];
      for (let i = 1; i <= 12; i++) { list.push({ id: 't' + i, name: 'طاولة ' + i, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6, status: 'available', currentOrder: null, hasService: i > 6 }); }
      DB.set('tables', list);
    }
    if (DB.customers.local().length === 0) {
      DB.set('customers', [
        { id: 'c1', name: 'أحمد محمد', phone: '01012345678', totalSpent: 1200, visits: 15, lastVisit: new Date().toISOString() },
        { id: 'c2', name: 'محمد علي', phone: '01198765432', totalSpent: 850, visits: 8, lastVisit: new Date().toISOString() }
      ]);
    }
    if (DB.inventory.local().length === 0) {
      DB.set('inventory', [
        { id: 'i1', name: 'قهوة تركية', category: 'قهوة', quantity: 50, unit: 'كجم', minQuantity: 10 },
        { id: 'i2', name: 'حليب', category: 'ألبان', quantity: 30, unit: 'لتر', minQuantity: 5 },
        { id: 'i3', name: 'سكر', category: 'مواد جافة', quantity: 100, unit: 'كجم', minQuantity: 20 }
      ]);
    }
    if (DB.products.local().length === 0) {
      const raw = 'p1^سنجل تركي^Single Turkish Coffee^coffee^30^images/menu/سنجل تركي.webp|p2^دبل تركي^Double Turkish Coffee^coffee^35^images/menu/دبل تركي.webp|p3^فرنساوي^French Press^coffee^45^images/menu/فرنساوي.webp|p4^قهوة نكهات^Flavored Coffee^coffee^45^images/menu/قهوة نكهات.webp|p5^نسكافية حليب^Nescafe with Milk^coffee^50^images/menu/نسكافية حليب.png|p6^سنجل اسبرسو^Single Espresso^coffee^40^images/menu/سنجل اسبرسو.webp|p7^دبل اسبرسو^Double Espresso^coffee^55^images/menu/دبل اسبرسو.webp|p8^ميكاتو^Mecato^coffee^50^images/menu/ميكاتو.png|p9^دبل ميكاتو^Double Mecato^coffee^60^images/menu/دبل ميكاتو.png|p10^امريكان كوفي^American Coffee^coffee^50^images/menu/امريكان كوفي.png|p11^لاتيه^Latte^coffee^60^images/menu/لاتيه.webp|p12^كابتشينو^Cappuccino^coffee^60^images/menu/كابتشينو.webp|p13^كابتشينو فليفر^Flavored Cappuccino^coffee^65^images/menu/كابتشينو فليفر.png|p14^دارك موكا^Dark Mocha^coffee^50^images/menu/دارك موكا.webp|p15^وايت موكا^White Mocha^coffee^59^images/menu/وايت موكا.webp|p16^كورتادو^Cortado^coffee^65^images/menu/كورتادو.webp|p17^لاتيه فليفر^Flavored Latte^coffee^65^images/menu/لاتيه فليفر.png|p18^شاي احمر^Red Tea^hot^20^images/menu/شاي احمر.webp|p19^شاي اخضر^Green Tea^hot^25^images/menu/شاي اخضر.webp|p20^شاي فواكة^Fruit Tea^hot^25^images/menu/شاي فواكة.png|p21^شاي بلبن^Tea with Milk^hot^50^images/menu/شاي بلبن.webp|p22^شاي كومبليت^Complete Tea^hot^25^images/menu/شاي كومبليت.png|p23^براد شاي^Tea Pot^hot^60^images/menu/براد شاي.webp|p24^اعشاب^Herbal Tea^hot^25^images/menu/اعشاب.webp|p25^قرفة^Cinnamon^hot^30^images/menu/قرفة.webp|p26^سحلب^Sahlab^hot^50^images/menu/سحلب.webp|p27^جنزبيل^Ginger^hot^30^images/menu/جنزبيل.png|p28^هوت سيدر^Hot Cider^hot^45^images/menu/هوت سيدر.png|p29^هوت شوكلت^Hot Chocolate^hot^50^images/menu/هوت شوكلت.webp|p30^هوت كاراميل^Hot Caramel^hot^55^images/menu/هوت كاراميل.png|p31^هوت نوتيلا^Hot Nutella^hot^55^images/menu/هوت نوتيلا.png|p32^هوت مارشملو^Hot Marshmallow^hot^55^images/menu/هوت مارشملو.png|p33^هوت اوريو^Hot Oreo^hot^55^images/menu/هوت اوريو.png|p34^آيس كوفي^Iced Coffee^ice^65^images/menu/آيس كوفي.webp|p35^آيس موكا^Iced Mocha^ice^75^images/menu/آيس موكا.webp|p36^آيس لاتيه^Iced Latte^ice^65^images/menu/آيس لاتيه.webp|p37^آيس موكا وايت^Iced White Mocha^ice^70^images/menu/آيس موكا وايت.png|p39^آيس لاتيه فليفر^Iced Flavored Latte^ice^70^images/menu/آيس لاتيه فليفر.png|p40^آيس ماتشا^Iced Matcha^matcha^70^images/menu/آيس ماتشا.webp|p41^ماتشا فرابيه^Matcha Frappe^matcha^80^images/menu/ماتشا فرابيه.webp|p42^شوكلت^Chocolate Frappe^frappe^60^images/menu/فرابيه شوكلت.webp|p43^كارميل^Caramel Frappe^frappe^65^images/menu/فرابيه كارميل.webp|p44^فانيليا^Vanilla Frappe^frappe^65^images/menu/فرابيه فانيليا.webp|p45^بندق^Hazelnut Frappe^frappe^65^images/menu/فرابيه بندق.webp|p46^بيستاشيو^Pistachio Frappe^frappe^70^images/menu/فرابيه بيستاشيو.webp|p47^نوتيلا^Nutella Frappe^frappe^65^images/menu/فرابيه نوتيلا.webp|p48^تفاح اخضر^Green Apple Smoothie^smoothie^50^images/menu/اسموزي تفاح اخضر.png|p49^خوخ^Peach Smoothie^smoothie^50^images/menu/اسموزي خوخ.png|p50^اناناس^Pineapple Smoothie^smoothie^50^images/menu/اسموزي اناناس.png|p51^باشن فروت^Passion Fruit Smoothie^smoothie^50^images/menu/اسموزي باشن فروت.webp|p52^مانجو^Mango Smoothie^smoothie^55^images/menu/اسموزي مانجو.webp|p53^بطيخ^Watermelon Smoothie^smoothie^55^images/menu/بطيخ.webp|p54^فراولة^Strawberry Smoothie^smoothie^55^images/menu/فراولة.webp|p55^ميكس بيري^Mixed Berry Smoothie^smoothie^55^images/menu/اسموزي ميكس بيري.webp|p56^كيوي^Kiwi Smoothie^smoothie^60^images/menu/كيوي.webp|p57^شوكلت^Chocolate Milkshake^milkshake^60^images/menu/ميلك شيك شوكلت.webp|p58^كراميل^Caramel Milkshake^milkshake^60^images/menu/ميلك شيك كراميل.webp|p59^فانيليا^Vanilla Milkshake^milkshake^60^images/menu/ميلك شيك فانيليا.webp|p60^فراولة^Strawberry Milkshake^milkshake^65^images/menu/فراولة.webp|p61^خوخ^Peach Milkshake^milkshake^60^images/menu/ميلك شيك خوخ.webp|p62^مانجا^Mango Milkshake^milkshake^65^images/menu/مانجا.webp|p63^بندق^Hazelnut Milkshake^milkshake^65^images/menu/ميلك شيك بندق.png|p64^بلو بيري^Blueberry Milkshake^milkshake^60^images/menu/ميلك شيك بلو بيري.png|p65^مكس بيري^Mixed Berry Milkshake^milkshake^60^images/menu/ميلك شيك مكس بيري.webp|p66^نوتيلا^Nutella Milkshake^milkshake^65^images/menu/ميلك شيك نوتيلا.webp|p67^وايت نوتيلا براوني^White Nutella Brownie Milkshake^milkshake^70^images/menu/ميلك شيك وايت نوتيلا براوني.png|p68^باشون فروت^Passion Fruit Milkshake^milkshake^65^images/menu/ميلك شيك باشون فروت.png|p69^كلاسيك^Classic Yogurt^yogurt^60^images/menu/زبادي كلاسيك.png|p70^مانجو^Mango Yogurt^yogurt^70^images/menu/زبادي مانجو.webp|p71^فراوله^Strawberry Yogurt^yogurt^70^images/menu/زبادي فراوله.png|p72^خوخ^Peach Yogurt^yogurt^70^images/menu/زبادي خوخ.webp|p73^موز^Banana Yogurt^yogurt^70^images/menu/موز.webp|p74^بلو بيري^Blueberry Yogurt^yogurt^70^images/menu/زبادي بلو بيري.webp|p75^باشن فروت^Passion Fruit Yogurt^yogurt^70^images/menu/زبادي باشن فروت.webp|p76^عسل^Honey Yogurt^yogurt^65^images/menu/زبادي عسل.png|p77^مكس فواكه^Mixed Fruit Yogurt^yogurt^80^images/menu/زبادي مكس فواكه.png|p78^ليمون^Lemon Juice^juice^50^images/menu/ليمون.webp|p79^ليمون نعناع^Mint Lemon Juice^juice^55^images/menu/ليمون نعناع.webp|p80^برتقال^Orange Juice^juice^60^images/menu/برتقال.webp|p81^فراولة^Strawberry Juice^juice^60^images/menu/فراولة.webp|p82^مانجا^Mango Juice^juice^70^images/menu/مانجا.webp|p83^جوافه^Guava Juice^juice^70^images/menu/جوافه.webp|p84^موز^Banana Juice^juice^70^images/menu/موز.webp|p85^بطيخ^Watermelon Juice^juice^60^images/menu/بطيخ.webp|p86^بلح^Dates Juice^juice^75^images/menu/بلح.png|p87^افوكادو^Avocado Juice^juice^80^images/menu/افوكادو.webp|p88^ديلايت بانش^Delight Punch^cocktail^65^images/menu/ديلايت بانش.png|p89^تيمارا^Timara^cocktail^65^images/menu/تيمارا.png|p90^فلوريدا^Florida^cocktail^65^images/menu/فلوريدا.webp|p91^دابومبا^Dabumba^cocktail^70^images/menu/دابومبا.png|p92^وايت اوشن^White Ocean^cocktail^70^images/menu/وايت اوشن.webp|p93^شهر زاد^Shahrzad^cocktail^70^images/menu/شهر زاد.png|p94^لاروز^La Rose^cocktail^75^images/menu/لاروز.png|p95^صن رايز^Sunrise Mojito^mojito^50^images/menu/موهيتو صن رايز.webp|p96^صن شاين^Sunshine Mojito^mojito^50^images/menu/موهيتو صن شاين.webp|p97^باشون فروت^Passion Fruit Mojito^mojito^50^images/menu/موهيتو باشون فروت.png|p98^توت^Berry Mojito^mojito^50^images/menu/موهيتو توت.png|p99^شيري كولا^Cherry Cola Mojito^mojito^50^images/menu/موهيتو شيري كولا.png|p100^موهيتو شعير^Barley Mojito^mojito^55^images/menu/موهيتو شعير.png|p101^باور صودا^Power Soda Mojito^mojito^75^images/menu/باور صودا.png|p102^بيبسي^Pepsi^cans^30^images/menu/بيبسي.webp|p103^بيبسي دايت^Diet Pepsi^cans^30^images/menu/بيبسي دايت.webp|p104^اسبرايت^Sprite^cans^30^images/menu/اسبرايت.webp|p105^ميرندا^Miranda^cans^30^images/menu/ميرندا.webp|p106^فانتا^Fanta^cans^30^images/menu/فانتا.webp|p107^سفن اب^7UP^cans^30^images/menu/سفن اب.webp|p108^ماونتن ديو^Mountain Dew^cans^30^images/menu/ماونتن ديو.webp|p109^تويست^Twist^cans^30^images/menu/تويست.webp|p110^شويبس^Schweppes^cans^30^images/menu/شويبس.webp|p111^فيروز^Fayrouz^cans^35^images/menu/فيروز.webp|p112^في كولا^V Cola^cans^35^images/menu/في كولا.webp|p113^فيوري^Fuego^cans^30^images/menu/فيوري.webp|p114^بيريل^Birell^cans^35^images/menu/بيريل.webp|p115^ريد بول^Red Bull^cans^75^images/menu/ريد بول.webp|p116^مونستر^Monster^cans^75^images/menu/مونستر.webp|p117^وافل دارك^Dark Waffle^desserts^65^images/menu/وافل دارك.png|p118^وافل نوتيلا^Nutella Waffle^desserts^70^images/menu/وافل نوتيلا.png|p119^وافل وايت^White Waffle^desserts^70^images/menu/وافل وايت.png|p120^وافل لوتس^Lotus Waffle^desserts^70^images/menu/وافل لوتس.png|p121^وافل اوريو^Oreo Waffle^desserts^75^images/menu/وافل اوريو.png|p122^وافل ايس كريم & موز^Ice Cream & Banana Waffle^desserts^80^images/menu/وافل ايس كريم & موز.png|p123^مولتن كيك^Molten Cake^desserts^65^images/menu/مولتن كيك.png|p124^مولتن ايس كريم^Molten Ice Cream^desserts^70^images/menu/مولتن ايس كريم.png|p125^سينابون^Cinnabon^desserts^55^images/menu/سينابون.png|p126^سينابون نوتيلا^Nutella Cinnabon^desserts^60^images/menu/سينابون نوتيلا.png|p127^براونيز^Brownies^desserts^50^images/menu/براونيز.png|p128^فروت سالط^Fruit Salad^desserts^60^images/menu/فروت سالط.png|p129^ايس كريم^Ice Cream^desserts^70^images/menu/فروت سالط ايس كريم.png|p130^ايس كريم مكسرات^Ice Cream with Nuts^desserts^75^images/menu/فروت سالط ايس كريم مكسرات.png';
      const prods = raw.split('|').map(s => {
        const [id, name, nameEn, category, price, image] = s.split('^');
        return { id, name, nameEn, category, price: Number(price), image: image || '', available: 1 };
      });
      DB.set('products', prods);
    }
    const productDescriptions = {
      'p88': 'برتقال - جوافه - ليمون - عسل',
      'p89': 'كيوي - مانجا',
      'p90': 'مانجو - جوافة - فراولة',
      'p91': 'فراولة - كيوي - موز - برتقال',
      'p92': 'موز - ايس كريم - مكسرات - كريمة',
      'p93': 'اناناس - برتقال - خوخ',
      'p94': 'مانجو - جوافة - فراولة',
      'p95': 'صودا - برتقال',
      'p96': 'صودا - برتقال - رمان سيرم',
      'p97': 'باشون - بلوسيرم',
      'p98': 'صودا - بلوبيري',
      'p99': 'صودا - تفاح اخضر - كولا سيرم',
      'p100': 'بريل - ليمون - نعناع',
      'p101': 'اسبيرسو - رد بول',
    };
    const nameFixes = { 'p97': 'باشون فروت', 'p100': 'موهيتو شعير', 'p129': 'ايس كريم', 'p130': 'ايس كريم مكسرات' };
    const prods = DB.products.local();
    let changed = false;
    prods.forEach(p => {
      if (nameFixes[p.id] && p.name !== nameFixes[p.id]) {
        p.name = nameFixes[p.id];
        changed = true;
      }
      if (productDescriptions[p.id] && p.description !== productDescriptions[p.id]) {
        p.description = productDescriptions[p.id];
        changed = true;
      }
    });
    if (changed) DB.set('products', prods);
  }
};

DB.seed();
