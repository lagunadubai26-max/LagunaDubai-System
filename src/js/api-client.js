const API = (() => {
  let authenticated = false;

  function isAuthenticated() { return !!sessionStorage.getItem('laguna_token'); }
  function logout() { sessionStorage.removeItem('laguna_token'); sessionStorage.removeItem('laguna_user'); authenticated = false; }

  async function login(username, password) {
    const users = await SUPABASE.get('users', { params: { username: `eq.${username}`, password: `eq.${password}`, select: '*' } });
    if (!users || !users.length) return null;
    const user = users[0];
    sessionStorage.setItem('laguna_token', user.id);
    sessionStorage.setItem('laguna_user', JSON.stringify({ id: user.id, username: user.username, name: user.name, role: user.role }));
    authenticated = true;
    return user;
  }

  function crud(table) {
    return {
      async all() { return await SUPABASE.get(table, { params: { select: '*', order: 'id.asc' } }); },
      async add(data) { const r = await SUPABASE.post(table, data); return r ? r[0] : data; },
      async update(id, data) { await SUPABASE.put(table, data, { params: { id: `eq.${id}` } }); },
      async remove(id) { await SUPABASE.del(table, { params: { id: `eq.${id}` } }); }
    };
  }

  return {
    login, logout, isAuthenticated,
    employees: {
      ...crud('employees'),
      async all() { return await SUPABASE.get('employees', { params: { select: 'id,name,job,phone,salary,hireDate,status,pin', order: 'name.asc' } }); }
    },
    attendance: {
      ...crud('attendance'),
      async today() { return await SUPABASE.get('attendance', { params: { date: `eq.${new Date().toISOString().slice(0,10)}`, select: '*' } }); },
      async checkIn(employeeId, name, job) {
        const today = new Date().toISOString().slice(0,10);
        const id = Date.now().toString(36);
        const now = new Date().toISOString();
        return await SUPABASE.post('attendance', { id, employeeId, name, job, date: today, checkIn: now, status: 'present' });
      },
      async checkOut(id) {
        const now = new Date().toISOString();
        await SUPABASE.put('attendance', { checkOut: now }, { params: { id: `eq.${id}` } });
      }
    },
    invoices: crud('invoices'),
    returns: crud('returns'),
    tables: crud('cafe_tables'),
    expenses: crud('expenses'),
    customers: crud('customers'),
    inventory: crud('inventory'),
    settings: {
      async get() { const r = await SUPABASE.get('settings', { params: { select: 'key,value' } }); if (!r) return {}; const o = {}; r.forEach(s => o[s.key] = s.value); return o; },
      async save(data) { for (const [key, value] of Object.entries(data)) await SUPABASE.put('settings', { value }, { params: { key: `eq.${key}` } }); }
    },
    users: {
      async all() { return await SUPABASE.get('users', { params: { select: 'id,username,name,role' } }); },
      async add(d) { const r = await SUPABASE.post('users', d); return r ? r[0] : d; }
    },
    products: crud('products')
  };
})();
