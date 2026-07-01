const API = (() => {
  const BASE = '';
  let token = null;
  let authenticated = false;

  function setToken(t) { token = t; sessionStorage.setItem('laguna_token', t); authenticated = true; }
  function getToken() { if (!token) token = sessionStorage.getItem('laguna_token'); return token; }
  function isAuthenticated() { return !!getToken(); }
  function logout() { token = null; authenticated = false; sessionStorage.removeItem('laguna_token'); sessionStorage.removeItem('laguna_user'); }

  async function request(method, url, body) {
    const headers = { 'Content-Type': 'application/json' };
    const t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(BASE + '/api' + url, opts);
      if (res.status === 401) { logout(); window.location.href = 'auth.html'; return null; }
      return await res.json();
    } catch {
      return null;
    }
  }

  async function login(username, password) {
    const res = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) return null;
    const data = await res.json();
    setToken(data.token);
    sessionStorage.setItem('laguna_user', JSON.stringify(data.user));
    return data.user;
  }

  return {
    login, logout, isAuthenticated, request, setToken,
    employees: {
      all() { return request('GET', '/employees'); },
      add(d) { return request('POST', '/employees', d); },
      update(id, d) { return request('PUT', '/employees/' + id, d); },
      remove(id) { return request('DELETE', '/employees/' + id); }
    },
    attendance: {
      all() { return request('GET', '/attendance'); },
      today() { return request('GET', '/attendance/today'); },
      checkIn(employeeId, name, job) { return request('POST', '/attendance/checkin', { employeeId, name, job }); },
      checkOut(id) { return request('PUT', '/attendance/checkout/' + id); },
      update(id, d) { return request('PUT', '/attendance/' + id, d); },
      remove(id) { return request('DELETE', '/attendance/' + id); }
    },
    invoices: {
      all() { return request('GET', '/invoices'); },
      add(d) { return request('POST', '/invoices', d); },
      update(id, d) { return request('PUT', '/invoices/' + id, d); },
      remove(id) { return request('DELETE', '/invoices/' + id); }
    },
    returns: {
      all() { return request('GET', '/returns'); },
      add(d) { return request('POST', '/returns', d); },
      update(id, d) { return request('PUT', '/returns/' + id, d); },
      remove(id) { return request('DELETE', '/returns/' + id); }
    },
    tables: {
      all() { return request('GET', '/tables'); },
      add(d) { return request('POST', '/tables', d); },
      update(id, d) { return request('PUT', '/tables/' + id, d); },
      remove(id) { return request('DELETE', '/tables/' + id); }
    },
    expenses: {
      all() { return request('GET', '/expenses'); },
      add(d) { return request('POST', '/expenses', d); },
      remove(id) { return request('DELETE', '/expenses/' + id); }
    },
    customers: {
      all() { return request('GET', '/customers'); },
      add(d) { return request('POST', '/customers', d); },
      update(id, d) { return request('PUT', '/customers/' + id, d); },
      remove(id) { return request('DELETE', '/customers/' + id); }
    },
    inventory: {
      all() { return request('GET', '/inventory'); },
      add(d) { return request('POST', '/inventory', d); },
      update(id, d) { return request('PUT', '/inventory/' + id, d); },
      remove(id) { return request('DELETE', '/inventory/' + id); }
    },
    settings: {
      get() { return request('GET', '/settings'); },
      save(d) { return request('PUT', '/settings', d); }
    },
    users: {
      all() { return request('GET', '/users'); },
      add(d) { return request('POST', '/users', d); }
    }
  };
})();
