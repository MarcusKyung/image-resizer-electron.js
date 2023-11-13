const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
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
    height: 300,
    title: 'About Image Resizer',
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  })

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}


app.whenReady().then(() => {
  createMainWindow();

  // Implements Menu:
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //Remove main window from memory on close
  mainWindow.on('closed', () => mainWindow = null);
  
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

// Respond to ipcRender resize:
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer');
  resizeImage(options);
})

async function resizeImage({imgPath, width, height, dest}) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height
    })

    const filename = path.basename(imgPath);

    // Create dest folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //Write file to dest
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send success message to renderer
    mainWindow.webContents.send('image:done');
    // Open Dest Folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

// Boilerplate: Quit when all windows are closed, needed to close program on Windows
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
});