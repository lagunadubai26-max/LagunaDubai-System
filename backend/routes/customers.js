const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM customers ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = crypto.randomBytes(8).toString('hex');
  db.prepare('INSERT INTO customers (id, name, phone, totalSpent, visits, lastVisit) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name, phone || '', 0, 1, new Date().toISOString());
  res.json({ id, name, phone });
});

router.put('/:id', (req, res) => {
  const { name, phone } = req.body;
  db.prepare('UPDATE customers SET name=?, phone=? WHERE id=?').run(name, phone, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
