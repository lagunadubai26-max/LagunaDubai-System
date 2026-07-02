const DB_MODE = 'hybrid';

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
      if (Array.isArray(data) && data.length) {
        setFn(data);
      }
    } catch {}
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
      if (DB_MODE !== 'local') DB.syncFromAPI('invoices', local, d => DB.set('invoices', d), () => API.invoices.all());
      return local;
    },
    async add(inv) {
      const list = DB.invoices.local();
      inv.id = 'INV-' + String(list.length + 1).padStart(4, '0');
      if (DB_MODE !== 'local') try { await API.invoices.add(inv); } catch {}
      list.unshift(inv);
      DB.set('invoices', list);
      return inv;
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
      return Object.keys(local).length ? local : { cafeName: 'Laguna Cafe', currency: 'ج.م', taxRate: 14, lowStockAlert: 5 };
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
      for (let i = 1; i <= 12; i++) { list.push({ id: 't' + i, name: 'طاولة ' + i, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6, status: 'available', currentOrder: null }); }
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
      const raw = 'p1^سنجل تركي^Single Turkish Coffee^coffee^30^images/menu/سنجل تركي.webp|p2^دبل تركي^Double Turkish Coffee^coffee^35^images/menu/دبل تركي.webp|p3^فرنساوي^French Press^coffee^45^images/menu/فرنساوي.webp|p4^قهوة نكهات^Flavored Coffee^coffee^45^images/menu/قهوة نكهات.webp|p5^نسكافية حليب^Nescafe with Milk^coffee^50^images/menu/نسكافية حليب.png|p6^سنجل اسبرسو^Single Espresso^coffee^40^images/menu/سنجل اسبرسو.webp|p7^دبل اسبرسو^Double Espresso^coffee^55^images/menu/دبل اسبرسو.webp|p8^ميكاتو^Mecato^coffee^50^images/menu/ميكاتو.png|p9^دبل ميكاتو^Double Mecato^coffee^60^images/menu/دبل ميكاتو.png|p10^امريكان كوفي^American Coffee^coffee^50^images/menu/امريكان كوفي.png|p11^لاتيه^Latte^coffee^60^images/menu/لاتيه.webp|p12^كابتشينو^Cappuccino^coffee^60^images/menu/كابتشينو.webp|p13^كابتشينو فليفر^Flavored Cappuccino^coffee^65^images/menu/كابتشينو فليفر.png|p14^دارك موكا^Dark Mocha^coffee^50^images/menu/دارك موكا.webp|p15^وايت موكا^White Mocha^coffee^59^images/menu/وايت موكا.webp|p16^كورتادو^Cortado^coffee^65^images/menu/كورتادو.webp|p17^لاتيه فليفر^Flavored Latte^coffee^65^images/menu/لاتيه فليفر.png|p18^شاي احمر^Red Tea^hot^20^images/menu/شاي احمر.webp|p19^شاي اخضر^Green Tea^hot^25^images/menu/شاي اخضر.webp|p20^شاي فواكة^Fruit Tea^hot^25^images/menu/شاي فواكة.png|p21^شاي بلبن^Tea with Milk^hot^50^images/menu/شاي بلبن.webp|p22^شاي كومبليت^Complete Tea^hot^25^images/menu/شاي كومبليت.png|p23^براد شاي^Tea Pot^hot^60^images/menu/براد شاي.webp|p24^اعشاب^Herbal Tea^hot^25^images/menu/اعشاب.webp|p25^قرفة^Cinnamon^hot^30^images/menu/قرفة.webp|p26^سحلب^Sahlab^hot^50^images/menu/سحلب.webp|p27^جنزبيل^Ginger^hot^30^images/menu/جنزبيل.png|p28^هوت سيدر^Hot Cider^hot^45^images/menu/هوت سيدر.png|p29^هوت شوكلت^Hot Chocolate^hot^50^images/menu/هوت شوكلت.webp|p30^هوت كاراميل^Hot Caramel^hot^55^images/menu/هوت كاراميل.png|p31^هوت نوتيلا^Hot Nutella^hot^55^images/menu/هوت نوتيلا.png|p32^هوت مارشملو^Hot Marshmallow^hot^55^images/menu/هوت مارشملو.png|p33^هوت اوريو^Hot Oreo^hot^55^im...';
      const prods = raw.split('|').map(s => {
        const [id, name, nameEn, category, price, image] = s.split('^');
        return { id, name, nameEn, category, price: Number(price), image: image || '', available: 1 };
      });
      DB.set('products', prods);
    }
  }
};

DB.seed();
