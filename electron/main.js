const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
}

let win;

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');
  const hasIcon = fs.existsSync(iconPath);

  win = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    icon: hasIcon ? iconPath : undefined,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const url = 'https://lagunadubai26-max.github.io/LagunaDubai-System/';

  win.loadURL(url).then(() => {
    win.show();
  }).catch((err) => {
    dialog.showErrorBox('خطأ',
      'لا يمكن تحميل التطبيق. تحقق من اتصالك بالإنترنت.\n\n' + err.message);
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
