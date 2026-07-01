const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM attendance ORDER BY date DESC').all();
  res.json(rows);
});

router.get('/today', (req, res) => {
  const today = new Date().toDateString();
  const rows = db.prepare('SELECT * FROM attendance WHERE date LIKE ?').all(today + '%');
  res.json(rows);
});

router.post('/checkin', (req, res) => {
  const { employeeId, name, job } = req.body;
  const id = crypto.randomBytes(8).toString('hex');
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  db.prepare('INSERT INTO attendance (id, employeeId, name, job, date, checkIn, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, employeeId || id, name, job, now.toISOString(), timeStr, 'present');
  res.json({ id, checkIn: timeStr });
});

router.put('/checkout/:id', (req, res) => {
  const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  db.prepare('UPDATE attendance SET checkOut = ? WHERE id = ?').run(timeStr, req.params.id);
  res.json({ success: true });
});

router.put('/:id', (req, res) => {
  const { checkIn, status } = req.body;
  db.prepare('UPDATE attendance SET checkIn=?, status=? WHERE id=?').run(checkIn, status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM attendance WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
