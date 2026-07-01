const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM returns ORDER BY date DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { invoice, product, qty, amount, status } = req.body;
  const count = db.prepare('SELECT COUNT(*) as c FROM returns').get().c;
  const id = 'RET-' + String(count + 1).padStart(3, '0');
  db.prepare('INSERT INTO returns (id, invoice, product, qty, amount, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, invoice, product, qty || 1, amount || 0, status || 'pending', new Date().toISOString());
  res.json({ id, invoice, product, qty, amount, status });
});

router.put('/:id', (req, res) => {
  const { product, qty, amount, status } = req.body;
  db.prepare('UPDATE returns SET product=?, qty=?, amount=?, status=? WHERE id=?')
    .run(product, qty, amount, status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM returns WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
