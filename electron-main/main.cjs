// Basic init
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
const url = require('url');
const args = process.argv.slice(1);
const serve = args.some(val => val === '--start-dev');

// Extract port from command line arguments if provided
let port = 1234; // default fallback
const portArg = args.find(arg => arg.startsWith('--port='))?.split('=')[1];
if (portArg) {
  port = parseInt(portArg);
}

// Let electron reloads by itself when webpack watches changes in ./app/
if (serve) {
  try {
    require('electron-reload')(__dirname, {
      electron: `${__dirname}/node_modules/.bin/electron`,
      hardResetMethod: 'exit',
    });
  } catch (err) {
    console.warn('Electron reload not available:', err.message);
  }
}

// To avoid being garbage collected
let mainWindow;

app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function createWindow() {
  // Create the browser window with better defaults for Electron apps
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      // Enable devtools in development
      devTools: serve,
    },
    // Add native window decorations
    frame: true,
    // Add icon for the window
    icon: path.join(__dirname, '../src/assets/icons/favicon.ico'),
  });

  // Load the index.html of the app
  const startUrl = serve
    ? `http://localhost:${port}`
    : url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (serve) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle window close event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle unresponsive events
  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  // Handle responsive events
  mainWindow.on('responsive', () => {
    console.log('Window became responsive again');
  });
}
