const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'laguna.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Employee'
  );

  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    job TEXT NOT NULL,
    phone TEXT DEFAULT '',
    salary TEXT DEFAULT '',
    hireDate TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    pin TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    name TEXT NOT NULL,
    job TEXT NOT NULL,
    date TEXT NOT NULL,
    checkIn TEXT,
    checkOut TEXT,
    status TEXT DEFAULT 'absent'
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    date TEXT NOT NULL,
    items TEXT DEFAULT '[]',
    total REAL DEFAULT 0,
    status TEXT DEFAULT 'paid',
    paymentMethod TEXT DEFAULT 'Cash'
  );

  CREATE TABLE IF NOT EXISTS returns (
    id TEXT PRIMARY KEY,
    invoice TEXT NOT NULL,
    product TEXT NOT NULL,
    qty INTEGER DEFAULT 1,
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tables_ (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available',
    currentOrder TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL DEFAULT 0,
    category TEXT DEFAULT 'أخرى',
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    totalSpent REAL DEFAULT 0,
    visits INTEGER DEFAULT 0,
    lastVisit TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'قهوة',
    quantity REAL DEFAULT 0,
    unit TEXT DEFAULT 'كجم',
    minQuantity REAL DEFAULT 5
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    const insert = db.prepare('INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)');
    insert.run('u1', 'admin', 'admin123', 'أحمد علي', 'Administrator');
  }

  const empCount = db.prepare('SELECT COUNT(*) as c FROM employees').get().c;
  if (empCount === 0) {
    const insert = db.prepare('INSERT INTO employees (id, name, job, phone, salary, hireDate, status, pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insert.run('emp1', 'أحمد موظف', 'كافيه', '01011111111', '3000', new Date().toISOString(), 'active', '1234');
    insert.run('emp2', 'محمد موظف', 'شيف', '01022222222', '4000', new Date().toISOString(), 'active', '5678');
  }

  const tableCount = db.prepare('SELECT COUNT(*) as c FROM tables_').get().c;
  if (tableCount === 0) {
    const insert = db.prepare('INSERT INTO tables_ (id, name, capacity, status) VALUES (?, ?, ?, ?)');
    for (let i = 1; i <= 12; i++) {
      const cap = i <= 4 ? 2 : i <= 8 ? 4 : 6;
      insert.run('t' + i, 'طاولة ' + i, cap, 'available');
    }
  }

  const custCount = db.prepare('SELECT COUNT(*) as c FROM customers').get().c;
  if (custCount === 0) {
    const insert = db.prepare('INSERT INTO customers (id, name, phone, totalSpent, visits, lastVisit) VALUES (?, ?, ?, ?, ?, ?)');
    insert.run('c1', 'أحمد محمد', '01012345678', 1200, 15, new Date().toISOString());
    insert.run('c2', 'محمد علي', '01198765432', 850, 8, new Date().toISOString());
  }

  const invCount = db.prepare('SELECT COUNT(*) as c FROM inventory').get().c;
  if (invCount === 0) {
    const insert = db.prepare('INSERT INTO inventory (id, name, category, quantity, unit, minQuantity) VALUES (?, ?, ?, ?, ?, ?)');
    insert.run('i1', 'قهوة تركية', 'قهوة', 50, 'كجم', 10);
    insert.run('i2', 'حليب', 'ألبان', 30, 'لتر', 5);
    insert.run('i3', 'سكر', 'مواد جافة', 100, 'كجم', 20);
  }

  const settingCount = db.prepare('SELECT COUNT(*) as c FROM settings').get().c;
  if (settingCount === 0) {
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insert.run('cafeName', 'Laguna Cafe');
    insert.run('currency', 'ج.م');
    insert.run('taxRate', '14');
    insert.run('lowStockAlert', '5');
  }
}

seed();

module.exports = db;
