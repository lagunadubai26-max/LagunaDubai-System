-- Supabase Schema for Laguna Cafe
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/szkmzvtsplinzrxxwpbu/sql/new)

-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Employee'
);

-- Employees
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  job TEXT NOT NULL,
  phone TEXT DEFAULT '',
  salary TEXT DEFAULT '',
  hireDate TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  pin TEXT
);

-- Attendance
CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  name TEXT NOT NULL,
  job TEXT NOT NULL,
  date TEXT NOT NULL,
  checkIn TEXT,
  checkOut TEXT,
  status TEXT DEFAULT 'absent'
);

-- Invoices
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  table TEXT,
  date TEXT NOT NULL,
  items TEXT DEFAULT '[]',
  total REAL DEFAULT 0,
  serviceAmount REAL DEFAULT 0,
  status TEXT DEFAULT 'paid',
  paymentMethod TEXT DEFAULT 'Cash'
);

-- Returns
CREATE TABLE returns (
  id TEXT PRIMARY KEY,
  invoice TEXT NOT NULL,
  product TEXT NOT NULL,
  qty INTEGER DEFAULT 1,
  amount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  date TEXT NOT NULL
);

-- Cafe Tables
CREATE TABLE cafe_tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available',
  currentOrder TEXT
);

-- Expenses
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount REAL DEFAULT 0,
  category TEXT DEFAULT 'أخرى',
  date TEXT NOT NULL
);

-- Customers
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  totalSpent REAL DEFAULT 0,
  visits INTEGER DEFAULT 0,
  lastVisit TEXT
);

-- Inventory
CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'قهوة',
  quantity REAL DEFAULT 0,
  unit TEXT DEFAULT 'كجم',
  minQuantity REAL DEFAULT 5
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Products (Menu Items)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameEn TEXT DEFAULT '',
  category TEXT NOT NULL,
  price REAL DEFAULT 0,
  image TEXT DEFAULT '',
  available INTEGER DEFAULT 1
);
