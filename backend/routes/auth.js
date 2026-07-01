const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateToken } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

router.post('/employee-login', (req, res) => {
  const { employeeId, pin } = req.body;
  if (!employeeId || !pin) return res.status(400).json({ error: 'Employee ID and PIN required' });
  const emp = db.prepare('SELECT * FROM employees WHERE id = ? AND pin = ?').get(employeeId, pin);
  if (!emp) return res.status(401).json({ error: 'PIN incorrect' });
  const token = generateToken({ id: emp.id, username: emp.name, role: 'Employee' });
  res.json({ token, user: { id: emp.id, username: emp.name, name: emp.name, role: 'Employee' } });
});

module.exports = router;
