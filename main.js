const path = require('path');
const { app, BrowserWindow } = require('electron');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'development';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000: 500,
    height: 600
  })

  // Boilerplate: Open devtools if in dev environment

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}


app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
});

// Boilerplate: Quit when all windows are closed, needed to close program on Windows
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
});