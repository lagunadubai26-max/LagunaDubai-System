const DB_MODE = 'firebase';

function localGet(key, def) {
  try { const d = localStorage.getItem('laguna_' + key); return d ? JSON.parse(d) : def; } catch { return def; }
}
function localSet(key, val) { localStorage.setItem('laguna_' + key, JSON.stringify(val)); }

const DB = {
  mode: DB_MODE,

  invoices: {
    async all() { return await FB.getCollection('invoices'); },
    async add(inv) {
      inv.id = 'INV-' + Date.now().toString(36).toUpperCase();
      return await FB.addDoc('invoices', inv);
    },
    async update(id, data) { await FB.updateDoc('invoices', id, data); },
    async remove(id) { await FB.removeDoc('invoices', id); }
  },

  employees: {
    async all() { return await FB.getCollection('employees'); },
    async add(emp) { emp.id = Date.now().toString(36); return await FB.addDoc('employees', emp); },
    async update(id, data) { await FB.updateDoc('employees', id, data); },
    async remove(id) { await FB.removeDoc('employees', id); }
  },

  attendance: {
    async all() { return await FB.getCollection('attendance'); },
    async today() {
      const all = await FB.getCollection('attendance');
      const today = new Date().toISOString().slice(0, 10);
      return all.filter(a => a.date && a.date.slice(0, 10) === today);
    },
    async add(rec) { rec.id = Date.now().toString(36); return await FB.addDoc('attendance', rec); },
    async update(id, data) { await FB.updateDoc('attendance', id, data); },
    async remove(id) { await FB.removeDoc('attendance', id); },
    async checkIn(employeeId, name, job) {
      return await FB.addDoc('attendance', {
        id: 'att-' + Date.now().toString(36), employeeId, name, job,
        date: new Date().toISOString(), checkIn: new Date().toISOString(), status: 'present'
      });
    },
    async checkOut(id) { await FB.updateDoc('attendance', id, { checkOut: new Date().toISOString() }); }
  },

  returns: {
    async all() { return await FB.getCollection('returns'); },
    async add(r) { r.id = Date.now().toString(36); return await FB.addDoc('returns', r); },
    async update(id, data) { await FB.updateDoc('returns', id, data); },
    async remove(id) { await FB.removeDoc('returns', id); }
  },

  tables: {
    async all() { return await FB.getCollection('tables_'); },
    async add(t) { t.id = Date.now().toString(36); return await FB.addDoc('tables_', t); },
    async update(id, data) { await FB.updateDoc('tables_', id, data); },
    async remove(id) { await FB.removeDoc('tables_', id); }
  },

  expenses: {
    async all() { return await FB.getCollection('expenses'); },
    async add(e) { e.id = Date.now().toString(36); return await FB.addDoc('expenses', e); },
    async remove(id) { await FB.removeDoc('expenses', id); }
  },

  customers: {
    async all() { return await FB.getCollection('customers'); },
    async add(c) { c.id = Date.now().toString(36); return await FB.addDoc('customers', c); },
    async update(id, data) { await FB.updateDoc('customers', id, data); }
  },

  inventory: {
    async all() { return await FB.getCollection('inventory'); },
    async add(item) { item.id = Date.now().toString(36); return await FB.addDoc('inventory', item); },
    async update(id, data) { await FB.updateDoc('inventory', id, data); },
    async remove(id) { await FB.removeDoc('inventory', id); }
  },

  settings: {
    async get() {
      const all = await FB.getCollection('settings');
      const o = {};
      all.forEach(s => o[s.key] = s.value);
      return o;
    },
    async save(data) {
      for (const [key, value] of Object.entries(data)) {
        const existing = await FB.getCollection('settings');
        const found = existing.find(s => s.key === key);
        if (found) await FB.updateDoc('settings', found.id, { value });
        else await FB.addDoc('settings', { key, value });
      }
    }
  },

  users: {
    async all() { return await FB.getCollection('users'); },
    async add(u) { u.id = Date.now().toString(36); return await FB.addDoc('users', u); }
  },

  products: {
    async all() { return await FB.getCollection('products'); },
    async add(p) { p.id = Date.now().toString(36); return await FB.addDoc('products', p); },
    async update(id, data) { await FB.updateDoc('products', id, data); },
    async remove(id) { await FB.removeDoc('products', id); }
  }
};
