// Basic init
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');

// Import utility functions
const {
  createWindow,
  loadUrl,
  setupWindowHandlers,
} = require('./lib/window-utils.cjs');
const { registerAppHandlers } = require('./lib/ipc-utils.cjs');

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

function createMainWindow() {
  // Create the browser window with secure defaults
  mainWindow = createWindow({
    name: 'main',
    webPreferences: serve
      ? {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          devTools: true,
        }
      : {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          webSecurity: true,
          allowRunningInsecureContent: false,
          experimentalFeatures: false,
          preload: path.join(__dirname, 'preload.cjs'),
        },
  });

  // Load the appropriate URL
  loadUrl(mainWindow, port, serve);

  setupWindowHandlers(mainWindow, serve, {
    onReady: window => {
      console.log('Production window ready');
    },
    onClosed: window => {
      mainWindow = null;
    },
  });

  return mainWindow;
}

// Register IPC handlers
function registerIpcHandlers() {
  // Register common app handlers
  registerAppHandlers();

  // Basic ping handler
  ipcMain.handle('ping', () => 'pong');
}

// Security: Handle external links
function setupSecurityHandlers() {
  app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    });

    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);

      if (serve) {
        // In development, allow localhost and file://
        if (
          !parsedUrl.hostname?.includes('localhost') &&
          !parsedUrl.protocol.includes('file:')
        ) {
          event.preventDefault();
          shell.openExternal(navigationUrl);
        }
      } else {
        // In production, only allow file://
        if (!parsedUrl.protocol.includes('file:')) {
          event.preventDefault();
          shell.openExternal(navigationUrl);
        }
      }
    });
  });
}

app.on('ready', () => {
  setupSecurityHandlers();
  registerIpcHandlers();
  createMainWindow();
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
    createMainWindow();
  }
});
