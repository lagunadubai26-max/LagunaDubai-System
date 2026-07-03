const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM invoices ORDER BY date DESC').all();
  const parsed = rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') }));
  res.json(parsed);
});

router.post('/', (req, res) => {
  const { customer, items, total, serviceAmount, status, paymentMethod, table } = req.body;
  const count = db.prepare('SELECT COUNT(*) as c FROM invoices').get().c;
  const id = 'INV-' + String(count + 1).padStart(4, '0');
  db.prepare('INSERT INTO invoices (id, customer, date, items, total, serviceAmount, status, paymentMethod, "table") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, customer || 'نقدي', new Date().toISOString(), JSON.stringify(items || []), total || 0, serviceAmount || 0, status || 'paid', paymentMethod || 'Cash', table || null);
  res.json({ id, customer, total, serviceAmount, status, paymentMethod, table });
});

router.put('/:id', (req, res) => {
  const { customer, status, total, serviceAmount, paymentMethod, table } = req.body;
  db.prepare('UPDATE invoices SET customer=?, status=?, total=?, serviceAmount=?, paymentMethod=?, "table"=? WHERE id=?')
    .run(customer, status, total, serviceAmount, paymentMethod, table, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
