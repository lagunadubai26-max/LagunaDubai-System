-- Seed Data for Laguna Cafe
-- Run AFTER the schema SQL

-- Admin user
INSERT INTO users (id, username, password, name, role) VALUES ('u1', 'admin', 'admin123', 'أحمد علي', 'Administrator');

-- Employees (with PINs for login)
INSERT INTO employees (id, name, job, phone, salary, hireDate, status, pin) VALUES ('emp1', 'أحمد موظف', 'كافيه', '01011111111', '3000', '2026-01-01', 'active', '1234');
INSERT INTO employees (id, name, job, phone, salary, hireDate, status, pin) VALUES ('emp2', 'محمد موظف', 'شيف', '01022222222', '4000', '2026-01-01', 'active', '5678');

-- Cafe tables
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t1', 'طاولة 1', 2, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t2', 'طاولة 2', 2, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t3', 'طاولة 3', 2, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t4', 'طاولة 4', 2, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t5', 'طاولة 5', 4, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t6', 'طاولة 6', 4, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t7', 'طاولة 7', 4, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t8', 'طاولة 8', 4, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t9', 'طاولة 9', 6, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t10', 'طاولة 10', 6, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t11', 'طاولة 11', 6, 'available');
INSERT INTO cafe_tables (id, name, capacity, status) VALUES ('t12', 'طاولة 12', 6, 'available');

-- Customers
INSERT INTO customers (id, name, phone, totalSpent, visits, lastVisit) VALUES ('c1', 'أحمد محمد', '01012345678', 1200, 15, '2026-07-01');
INSERT INTO customers (id, name, phone, totalSpent, visits, lastVisit) VALUES ('c2', 'محمد علي', '01198765432', 850, 8, '2026-07-01');

-- Inventory
INSERT INTO inventory (id, name, category, quantity, unit, minQuantity) VALUES ('i1', 'قهوة تركية', 'قهوة', 50, 'كجم', 10);
INSERT INTO inventory (id, name, category, quantity, unit, minQuantity) VALUES ('i2', 'حليب', 'ألبان', 30, 'لتر', 5);
INSERT INTO inventory (id, name, category, quantity, unit, minQuantity) VALUES ('i3', 'سكر', 'مواد جافة', 100, 'كجم', 20);

-- Settings
INSERT INTO settings (key, value) VALUES ('cafeName', 'Laguna Cafe');
INSERT INTO settings (key, value) VALUES ('currency', 'ج.م');
INSERT INTO settings (key, value) VALUES ('taxRate', '14');
INSERT INTO settings (key, value) VALUES ('lowStockAlert', '5');
