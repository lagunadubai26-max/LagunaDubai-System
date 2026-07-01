const SUPABASE = (() => {
  const URL = 'https://szkmzvtsplinzrxxwpbu.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6a216dnRzcGxpbnpyeHh3cGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzQ5MzQsImV4cCI6MjA5ODUxMDkzNH0.OIf-aqZLYxDCK9pkmBiEyMSv610U7tuEflQFmDSdyMk';

  async function query(method, table, opts = {}) {
    const { body, params, single } = opts;
    let url = `${URL}/rest/v1/${table}`;
    if (params) url += '?' + new URLSearchParams(params);
    const headers = {
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY,
      'Content-Type': 'application/json',
      'Prefer': single ? 'return=representation' : 'return=representation'
    };
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch { return null; }
  }

  return {
    get(table, opts) { return query('GET', table, opts); },
    post(table, body, opts) { return query('POST', table, { ...opts, body }); },
    put(table, body, opts) { return query('PATCH', table, { ...opts, body }); },
    delete(table, opts) { return query('DELETE', table, opts); }
  };
})();
