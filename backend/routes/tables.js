const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM tables_ ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, capacity, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = crypto.randomBytes(8).toString('hex');
  db.prepare('INSERT INTO tables_ (id, name, capacity, status) VALUES (?, ?, ?, ?)')
    .run(id, name, capacity || 4, status || 'available');
  res.json({ id, name, capacity, status });
});

router.put('/:id', (req, res) => {
  const { name, capacity, status } = req.body;
  db.prepare('UPDATE tables_ SET name=?, capacity=?, status=? WHERE id=?')
    .run(name, capacity, status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tables_ WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
