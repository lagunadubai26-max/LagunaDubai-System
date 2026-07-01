const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT id, username, name, role FROM users').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'All fields required' });
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(400).json({ error: 'Username exists' });
  const id = crypto.randomBytes(8).toString('hex');
  db.prepare('INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, username, password, name, role || 'Employee');
  res.json({ id, username, name, role });
});

module.exports = router;
