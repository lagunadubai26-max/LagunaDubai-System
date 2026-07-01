const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM inventory ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, category, quantity, unit, minQuantity } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = crypto.randomBytes(8).toString('hex');
  db.prepare('INSERT INTO inventory (id, name, category, quantity, unit, minQuantity) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name, category || 'قهوة', quantity || 0, unit || 'كجم', minQuantity || 5);
  res.json({ id, name, category, quantity, unit, minQuantity });
});

router.put('/:id', (req, res) => {
  const { name, category, quantity, unit, minQuantity } = req.body;
  db.prepare('UPDATE inventory SET name=?, category=?, quantity=?, unit=?, minQuantity=? WHERE id=?')
    .run(name, category, quantity, unit, minQuantity, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
