const SUPABASE_URL = 'https://szkmzvtsplinzrxxwpbu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6a216dnRzcGxpbnpyeHh3cGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzQ5MzQsImV4cCI6MjA5ODUxMDkzNH0.OIf-aqZLYxDCK9pkmBiEyMSv610U7tuEflQFmDSdyMk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  if (req.method === 'GET') {
    try {
      const supRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices?select=*&order=date.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      });
      const data = supRes.ok ? await supRes.json() : [];
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS_HEADERS });
      return res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json', ...CORS_HEADERS });
      return res.end(JSON.stringify([]));
    }
  }

  if (req.method === 'POST') {
    const { id, customer, items, total, serviceAmount, status, paymentMethod, table, date } = req.body;
    const invoice = {
      id: id || 'INV-' + Date.now().toString(36).toUpperCase(),
      customer: customer || (table ? 'طاولة ' + (table || '') : 'نقدي'),
      date: date || new Date().toISOString(),
      items: typeof items === 'string' ? items : JSON.stringify(items || []),
      total: total || 0,
      serviceAmount: serviceAmount || 0,
      status: status || 'paid',
      paymentmethod: paymentMethod || 'Cash'
    };

    try {
      const supRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(invoice)
      });
      if (!supRes.ok) {
        const text = await supRes.text();
        console.error('Supabase POST failed:', supRes.status, text.slice(0, 300));
      }
      const data = supRes.ok ? await supRes.json() : null;
      res.writeHead(supRes.ok ? 200 : 502, { 'Content-Type': 'application/json', ...CORS_HEADERS });
      return res.end(JSON.stringify(data || { id: invoice.id, customer: invoice.customer, total, status: invoice.status }));
    } catch (e) {
      console.error('Proxy error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json', ...CORS_HEADERS });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  res.writeHead(405, CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Method not allowed' }));
};
