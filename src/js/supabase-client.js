const SUPABASE = (() => {
  const URL = 'https://szkmzvtsplinzrxxwpbu.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6a216dnRzcGxpbnpyeHh3cGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzQ5MzQsImV4cCI6MjA5ODUxMDkzNH0.OIf-aqZLYxDCK9pkmBiEyMSv610U7tuEflQFmDSdyMk';
  const TIMEOUT = 4000;

  function load(url, opts) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
  }

  async function get(table, opts = {}) {
    const p = new URLSearchParams(opts.params || {});
    try {
      const res = await load(`${URL}/rest/v1/${table}?${p}`, {
        headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  async function post(table, body) {
    try {
      const res = await load(`${URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  async function put(table, body, opts = {}) {
    const p = new URLSearchParams(opts.params || {});
    try {
      const res = await load(`${URL}/rest/v1/${table}?${p}`, {
        method: 'PATCH',
        headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
      return res.ok;
    } catch { return null; }
  }

  async function del(table, opts = {}) {
    const p = new URLSearchParams(opts.params || {});
    try {
      const res = await load(`${URL}/rest/v1/${table}?${p}`, {
        method: 'DELETE',
        headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
      });
      return res.ok;
    } catch { return null; }
  }

  return { get, post, put, del };
})();
