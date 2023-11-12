const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'development';


function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000: 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Boilerplate: Open devtools if in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

// Create About Window:
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'About Window',
    width: 300,
    height: 300
  })

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}


app.whenReady().then(() => {
  createMainWindow();

  // Implements Menu:
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
});


//Boilerplate (option): Menu template for Mac
const menu = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      {
        label: 'About',
        click: createAboutWindow
      }
    ]
  }] : []),
  {
    role: 'fileMenu'
  }, 
  ...(!isMac ? [{
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: createAboutWindow
      }
    ]
  }] : [])
];

// Boilerplate: Quit when all windows are closed, needed to close program on Windows
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
});