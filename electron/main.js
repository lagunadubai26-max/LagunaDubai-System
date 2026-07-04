const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const url = 'https://adhamkhaled1510.github.io/LagunaDubai-System/';
  win.loadURL(url).catch(() => {
    dialog.showErrorBox('خطأ في الاتصال',
      'لا يمكن الاتصال بالإنترنت أو تحميل الصفحة.\nتأكد من اتصالك بالإنترنت وحاول مرة أخرى.\n\n' + url);
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'allow' }));

  win.on('closed', () => { win = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
