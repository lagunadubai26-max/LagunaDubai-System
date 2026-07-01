const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { description, amount, category } = req.body;
  if (!description || !amount) return res.status(400).json({ error: 'Description and amount required' });
  const id = crypto.randomBytes(8).toString('hex');
  db.prepare('INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)')
    .run(id, description, amount, category || 'أخرى', new Date().toISOString());
  res.json({ id, description, amount, category });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
