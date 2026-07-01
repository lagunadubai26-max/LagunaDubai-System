const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;
let server;

function startServer() {
  const express = require('express');
  const cors = require('cors');
  const db = require('./db');
  const { authenticate, adminOnly } = require('./middleware/auth');

  const srv = express();
  const PORT = 3456;

  srv.use(cors());
  srv.use(express.json());
  srv.use(express.static(path.join(__dirname, '..', 'src')));

  srv.use('/api/auth', require('./routes/auth'));
  srv.use('/api/employees', authenticate, adminOnly, require('./routes/employees'));
  srv.use('/api/attendance', authenticate, require('./routes/attendance'));
  srv.use('/api/invoices', authenticate, require('./routes/invoices'));
  srv.use('/api/returns', authenticate, require('./routes/returns'));
  srv.use('/api/tables', authenticate, require('./routes/tables'));
  srv.use('/api/expenses', authenticate, adminOnly, require('./routes/expenses'));
  srv.use('/api/customers', authenticate, adminOnly, require('./routes/customers'));
  srv.use('/api/inventory', authenticate, adminOnly, require('./routes/inventory'));
  srv.use('/api/settings', authenticate, adminOnly, require('./routes/settings'));
  srv.use('/api/users', authenticate, adminOnly, require('./routes/users'));

  srv.get('/api/export', (req, res) => {
    const tables = ['employees', 'attendance', 'invoices', 'returns', 'tables_', 'expenses', 'customers', 'inventory', 'settings', 'users'];
    const data = {};
    tables.forEach(t => { try { data[t] = db.prepare(`SELECT * FROM ${t}`).all(); } catch {} });
    res.json(data);
  });

  srv.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
  });

  server = srv.listen(PORT, () => console.log(`Server on ${PORT}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366, height: 900,
    minWidth: 1024, minHeight: 700,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    title: 'Laguna Cafe Management',
    show: false
  });

  mainWindow.loadURL('http://localhost:3456');
  mainWindow.once('ready-to-show', () => mainWindow.show());

  const menu = Menu.buildFromTemplate([
    {
      label: 'Laguna Cafe',
      submenu: [
        { label: 'Dashboard', click: () => mainWindow.loadURL('http://localhost:3456/index.html') },
        { type: 'separator' },
        {
          label: 'تصدير البيانات',
          click: () => {
            const fs = require('fs');
            const http = require('http');
            const fp = dialog.showSaveDialogSync(mainWindow, { defaultPath: 'laguna-backup.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
            if (!fp) return;
            http.get('http://localhost:3456/api/export', (res) => {
              let d = '';
              res.on('data', c => d += c);
              res.on('end', () => { fs.writeFileSync(fp, d); dialog.showMessageBox(mainWindow, { message: 'تم تصدير البيانات بنجاح' }); });
            });
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'خروج' }
      ]
    },
    { role: 'editMenu', label: 'تعديل' },
    { role: 'viewMenu', label: 'عرض' },
    { label: 'مساعدة', submenu: [{ label: 'حول', click: () => dialog.showMessageBox(mainWindow, { title: 'حول', message: 'Laguna Cafe Management System v1.0\n\nنظام إدارة المطاعم والكافيهات' }) }] }
  ]);

  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => { if (server) server.close(); app.quit(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });
