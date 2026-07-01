const SUPABASE = (() => {
  const URL = 'https://szkmzvtsplinzrxxwpbu.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6a216dnRzcGxpbnpyeHh3cGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzQ5MzQsImV4cCI6MjA5ODUxMDkzNH0.OIf-aqZLYxDCK9pkmBiEyMSv610U7tuEflQFmDSdyMk';

  async function get(table, opts = {}) {
    const { params } = opts;
    let url = `${URL}/rest/v1/${table}`;
    if (params) url += '?' + new URLSearchParams(params);
    try {
      const res = await fetch(url, { headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY } });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  async function post(table, body) {
    try {
      const res = await fetch(`${URL}/rest/v1/${table}`, {
        method: 'POST', headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  async function put(table, body, opts = {}) {
    const { params } = opts;
    let url = `${URL}/rest/v1/${table}`;
    if (params) url += '?' + new URLSearchParams(params);
    try {
      const res = await fetch(url, {
        method: 'PATCH', headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  async function del(table, opts = {}) {
    const { params } = opts;
    let url = `${URL}/rest/v1/${table}`;
    if (params) url += '?' + new URLSearchParams(params);
    try {
      const res = await fetch(url, { method: 'DELETE', headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY } });
      return res.ok;
    } catch { return null; }
  }

  return { get, post, put, del };
})();
