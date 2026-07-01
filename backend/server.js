const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { authenticate, adminOnly } = require('./middleware/auth');

const app = express();

function findStaticDir() {
  const candidates = [
    path.join(__dirname, '..', 'src'),
    path.join(__dirname, 'src'),
    path.join(process.cwd(), 'src'),
    path.join(__dirname, 'public'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return path.join(__dirname, '..', 'src');
}
const STATIC_DIR = findStaticDir();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(STATIC_DIR));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', authenticate, adminOnly, require('./routes/employees'));
app.use('/api/attendance', authenticate, require('./routes/attendance'));
app.use('/api/invoices', authenticate, require('./routes/invoices'));
app.use('/api/returns', authenticate, require('./routes/returns'));
app.use('/api/tables', authenticate, require('./routes/tables'));
app.use('/api/expenses', authenticate, adminOnly, require('./routes/expenses'));
app.use('/api/customers', authenticate, adminOnly, require('./routes/customers'));
app.use('/api/inventory', authenticate, adminOnly, require('./routes/inventory'));
app.use('/api/settings', authenticate, adminOnly, require('./routes/settings'));
app.use('/api/users', authenticate, adminOnly, require('./routes/users'));

app.get('/api/export', (req, res) => {
  const tables = ['employees', 'attendance', 'invoices', 'returns', 'tables_', 'expenses', 'customers', 'inventory', 'settings', 'users'];
  const data = {};
  tables.forEach(t => {
    try { data[t] = db.prepare(`SELECT * FROM ${t}`).all(); } catch {}
  });
  res.json(data);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Laguna Cafe backend running on http://localhost:${PORT}`);
  if (process.send) process.send('ready');
});
