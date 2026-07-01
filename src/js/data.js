const DB_MODE = window.location.port === '3000' || window.location.hostname === 'localhost' && window.location.port !== '' ? 'api' : 'local';

const DB = {
  mode: DB_MODE,
  async get(key, defaults) {
    try { const d = localStorage.getItem('laguna_' + key); return d ? JSON.parse(d) : defaults; }
    catch { return defaults; }
  },
  set(key, val) { localStorage.setItem('laguna_' + key, JSON.stringify(val)); },
  employees: {
    async all() { if (DB_MODE === 'api') return await API.employees.all() || DB.employees.local(); return DB.employees.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_employees')) || []; } catch { return []; } },
    async save(list) { DB.set('employees', list); if (DB_MODE === 'api') { /* API handles writes */ } },
    async add(emp) { if (DB_MODE === 'api') return await API.employees.add(emp) || emp; const list = DB.employees.local(); emp.id = Date.now().toString(36); list.push(emp); DB.set('employees', list); return emp; },
    async update(id, data) { if (DB_MODE === 'api') await API.employees.update(id, data); const list = DB.employees.local(); const idx = list.findIndex(e => e.id === id); if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('employees', list); } },
    async remove(id) { if (DB_MODE === 'api') await API.employees.remove(id); DB.set('employees', DB.employees.local().filter(e => e.id !== id)); }
  },
  attendance: {
    async all() { if (DB_MODE === 'api') return await API.attendance.all() || DB.attendance.local(); return DB.attendance.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_attendance')) || []; } catch { return []; } },
    async save(list) { DB.set('attendance', list); },
    async today() { if (DB_MODE === 'api') return await API.attendance.today() || DB.attendance.local().filter(a => new Date(a.date).toDateString() === new Date().toDateString()); return DB.attendance.local().filter(a => new Date(a.date).toDateString() === new Date().toDateString()); },
    async checkIn(employeeId, name, job) { if (DB_MODE === 'api') return await API.attendance.checkIn(employeeId, name, job); const list = DB.attendance.local(); const id = Date.now().toString(36); list.push({ id, employeeId, name, job, date: new Date().toISOString(), checkIn: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), checkOut: null, status: 'present' }); DB.set('attendance', list); },
    async checkOut(id) { if (DB_MODE === 'api') await API.attendance.checkOut(id); const list = DB.attendance.local(); const item = list.find(a => a.id === id); if (item) { item.checkOut = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }); DB.set('attendance', list); } }
  },
  invoices: {
    async all() { if (DB_MODE === 'api') return await API.invoices.all() || DB.invoices.local(); return DB.invoices.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_invoices')) || []; } catch { return []; } },
    async save(list) { DB.set('invoices', list); },
    async add(inv) { if (DB_MODE === 'api') return await API.invoices.add(inv) || inv; const list = DB.invoices.local(); inv.id = 'INV-' + String(list.length + 1).padStart(4, '0'); list.unshift(inv); DB.set('invoices', list); return inv; },
    async remove(id) { if (DB_MODE === 'api') await API.invoices.remove(id); DB.set('invoices', DB.invoices.local().filter(i => i.id !== id)); }
  },
  returns: {
    async all() { if (DB_MODE === 'api') return await API.returns.all() || DB.returns.local(); return DB.returns.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_returns')) || []; } catch { return []; } },
    async save(list) { DB.set('returns', list); },
    async add(r) { if (DB_MODE === 'api') return await API.returns.add(r) || r; const list = DB.returns.local(); r.id = 'RET-' + String(list.length + 1).padStart(3, '0'); list.unshift(r); DB.set('returns', list); return r; },
    async update(id, data) { if (DB_MODE === 'api') await API.returns.update(id, data); const list = DB.returns.local(); const idx = list.findIndex(i => i.id === id); if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('returns', list); } },
    async remove(id) { if (DB_MODE === 'api') await API.returns.remove(id); DB.set('returns', DB.returns.local().filter(i => i.id !== id)); }
  },
  tables: {
    async all() { if (DB_MODE === 'api') return await API.tables.all() || DB.tables.local(); return DB.tables.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_tables')) || []; } catch { return []; } },
    async save(list) { DB.set('tables', list); },
    async add(t) { if (DB_MODE === 'api') return await API.tables.add(t) || t; const list = DB.tables.local(); t.id = Date.now().toString(36); list.push(t); DB.set('tables', list); return t; },
    async update(id, data) { if (DB_MODE === 'api') await API.tables.update(id, data); const list = DB.tables.local(); const idx = list.findIndex(i => i.id === id); if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('tables', list); } },
    async remove(id) { if (DB_MODE === 'api') await API.tables.remove(id); DB.set('tables', DB.tables.local().filter(i => i.id !== id)); }
  },
  expenses: {
    async all() { if (DB_MODE === 'api') return await API.expenses.all() || DB.expenses.local(); return DB.expenses.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_expenses')) || []; } catch { return []; } },
    async save(list) { DB.set('expenses', list); },
    async add(e) { if (DB_MODE === 'api') return await API.expenses.add(e) || e; const list = DB.expenses.local(); e.id = Date.now().toString(36); list.unshift(e); DB.set('expenses', list); return e; },
    async remove(id) { if (DB_MODE === 'api') await API.expenses.remove(id); DB.set('expenses', DB.expenses.local().filter(i => i.id !== id)); }
  },
  customers: {
    async all() { if (DB_MODE === 'api') return await API.customers.all() || DB.customers.local(); return DB.customers.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_customers')) || []; } catch { return []; } },
    async save(list) { DB.set('customers', list); },
    async add(c) { if (DB_MODE === 'api') return await API.customers.add(c) || c; const list = DB.customers.local(); c.id = Date.now().toString(36); list.push(c); DB.set('customers', list); return c; },
    async update(id, data) { if (DB_MODE === 'api') await API.customers.update(id, data); const list = DB.customers.local(); const idx = list.findIndex(i => i.id === id); if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('customers', list); } },
    async remove(id) { if (DB_MODE === 'api') await API.customers.remove(id); DB.set('customers', DB.customers.local().filter(i => i.id !== id)); }
  },
  inventory: {
    async all() { if (DB_MODE === 'api') return await API.inventory.all() || DB.inventory.local(); return DB.inventory.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_inventory')) || []; } catch { return []; } },
    async save(list) { DB.set('inventory', list); },
    async add(item) { if (DB_MODE === 'api') return await API.inventory.add(item) || item; const list = DB.inventory.local(); item.id = Date.now().toString(36); list.push(item); DB.set('inventory', list); return item; },
    async update(id, data) { if (DB_MODE === 'api') await API.inventory.update(id, data); const list = DB.inventory.local(); const idx = list.findIndex(i => i.id === id); if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('inventory', list); } },
    async remove(id) { if (DB_MODE === 'api') await API.inventory.remove(id); DB.set('inventory', DB.inventory.local().filter(i => i.id !== id)); }
  },
  settings: {
    async get() { if (DB_MODE === 'api') return await API.settings.get() || { cafeName: 'Laguna Cafe', currency: 'ج.م', taxRate: 14, lowStockAlert: 5 }; try { return JSON.parse(localStorage.getItem('laguna_settings')) || { cafeName: 'Laguna Cafe', currency: 'ج.م', taxRate: 14, lowStockAlert: 5 }; } catch { return { cafeName: 'Laguna Cafe', currency: 'ج.م', taxRate: 14, lowStockAlert: 5 }; } },
    async save(s) { if (DB_MODE === 'api') await API.settings.save(s); DB.set('settings', s); }
  },
  users: {
    async all() { if (DB_MODE === 'api') return await API.users.all() || DB.users.local(); return DB.users.local(); },
    local() { try { return JSON.parse(localStorage.getItem('laguna_users')) || []; } catch { return []; } },
    async save(list) { DB.set('users', list); },
    async add(u) { if (DB_MODE === 'api') return await API.users.add(u) || u; const list = DB.users.local(); u.id = Date.now().toString(36); list.push(u); DB.set('users', list); return u; },
    auth(username, password) { const list = DB.users.local(); return list.find(u => u.username === username && u.password === password) || null; }
  },
  seed() {
    if (DB.users.local().length === 0) {
      DB.users.save([{ id: 'u1', username: 'admin', password: 'admin123', name: 'أحمد علي', role: 'Administrator' }]);
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
  }
};

DB.seed();
