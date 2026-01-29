const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup is only needed on Windows for installer shortcuts
  // If it's not available, we can skip it
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Determine whether to load from dev server or built files
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devServerUrl = process.env.ELECTRON_DEV_SERVER || 'http://localhost:3000';

  if (isDevelopment && devServerUrl) {
    // Load from development server
    mainWindow.loadURL(devServerUrl);

    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Load the built index.html file
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // For development: simple reload on manual refresh (F5 or Cmd+R/Ctrl+R)
  mainWindow.webContents.on('did-finish-load', () => {
    // Enable reload shortcuts in development
    if (isDevelopment) {
      mainWindow.webContents.on('before-input-event', (event, input) => {
        // Reload on CmdOrCtrl+R, F5, or Ctrl+Shift+R
        if ((input.key.toLowerCase() === 'r' && (input.control || input.meta) && !input.shift) ||
            input.key === 'F5') {
          event.preventDefault();
          mainWindow.reload();
        }
        // Hard reload on Ctrl+Shift+R
        if (input.key.toLowerCase() === 'r' && (input.control || input.meta) && input.shift) {
          event.preventDefault();
          mainWindow.webContents.reloadIgnoringCache();
        }
      });
    }
  });
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On macOS, it's common to re-create a window in the app when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers can go here
ipcMain.handle('ping', () => 'pong');