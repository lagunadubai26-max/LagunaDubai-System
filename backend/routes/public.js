const express = require('express');
const router = express.Router();
const db = require('../db');

const SUPABASE_URL = 'https://szkmzvtsplinzrxxwpbu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6a216dnRzcGxpbnpyeHh3cGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzQ5MzQsImV4cCI6MjA5ODUxMDkzNH0.OIf-aqZLYxDCK9pkmBiEyMSv610U7tuEflQFmDSdyMk';

function getNextId() {
  const count = db.prepare('SELECT COUNT(*) as c FROM invoices').get().c;
  return 'INV-' + String(count + 1).padStart(4, '0');
}

async function syncToSupabase(invoice) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: invoice.id,
        customer: invoice.customer,
        date: invoice.date,
        items: invoice.items,
        total: invoice.total,
        serviceAmount: invoice.serviceAmount || 0,
        status: invoice.status,
        paymentmethod: invoice.paymentMethod
      })
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn('[public] Supabase sync failed:', res.status, text.slice(0, 200));
    } else {
      console.log('[public] Supabase synced:', invoice.id);
    }
  } catch (e) {
    console.warn('[public] Supabase sync error:', e.message);
  }
}

router.post('/', async (req, res) => {
  try {
    const { id: clientId, customer, items, total, serviceAmount, status, paymentMethod, table, date } = req.body;
    const id = clientId || getNextId();
    const itemsJson = JSON.stringify(items || []);
    const now = date || new Date().toISOString();
    const customerName = customer || (table ? 'طاولة ' + table.replace('طاولة ', '') : 'نقدي');

    db.prepare(`INSERT OR REPLACE INTO invoices (id, customer, date, items, total, serviceAmount, status, paymentMethod, "table")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, customerName, now, itemsJson, total || 0, serviceAmount || 0, status || 'paid', paymentMethod || 'Cash', table || null);

    const invoice = { id, customer: customerName, date: now, items, total, serviceAmount, status, paymentMethod, table };
    res.json(invoice);

    syncToSupabase({ ...invoice, items: itemsJson });
  } catch (e) {
    console.error('[public] POST error:', e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM invoices ORDER BY date DESC').all();
    const parsed = rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') }));
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
