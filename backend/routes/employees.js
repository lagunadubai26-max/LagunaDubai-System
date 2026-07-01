const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, job, phone, salary, hireDate, status, pin } = req.body;
  if (!name || !job) return res.status(400).json({ error: 'Name and job required' });
  const id = crypto.randomBytes(8).toString('hex');
  db.prepare('INSERT INTO employees (id, name, job, phone, salary, hireDate, status, pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, job, phone || '', salary || '', hireDate || '', status || 'active', pin || null);
  res.json({ id, name, job, phone, salary, hireDate, status, pin });
});

router.put('/:id', (req, res) => {
  const { name, job, phone, salary, hireDate, status, pin } = req.body;
  db.prepare('UPDATE employees SET name=?, job=?, phone=?, salary=?, hireDate=?, status=?, pin=? WHERE id=?')
    .run(name, job, phone, salary, hireDate, status, pin, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
