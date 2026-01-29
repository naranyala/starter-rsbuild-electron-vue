const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  clipboard,
  Menu,
  Notification,
} = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Import utility functions
const {
  createWindow,
  loadUrl,
  setupWindowHandlers,
} = require('./lib/window-utils.cjs');
const {
  fileExists,
  readFile,
  writeFile,
  createDirectory,
  listFiles,
  deletePath,
} = require('./lib/filesystem-utils.cjs');
const { registerHandler, registerAppHandlers } = require('./lib/ipc-utils.cjs');
const { executeCommand } = require('./lib/process-utils.cjs');

// Security settings
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      parsedUrl.origin !== 'http://localhost:3000' &&
      !parsedUrl.protocol.includes('file:')
    ) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup is only needed on Windows for installer shortcuts
  // If it's not available, we can skip it
}

const createMainWindow = () => {
  const mainWindow = createWindow({
    name: 'main',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Determine whether to load from dev server or built files
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devServerUrl =
    process.env.ELECTRON_DEV_SERVER || 'http://localhost:3000';

  loadUrl(mainWindow, 3000, isDevelopment, devServerUrl);

  setupWindowHandlers(mainWindow, isDevelopment, {
    onReady: window => {
      console.log('Main window ready');
      // Dev tools disabled for welcome screen - can be opened manually if needed
      // window.webContents.openDevTools({ mode: 'detach' });
    },
    onClosed: window => {
      console.log('Main window closed');
    },
  });

  return mainWindow;
};

// Register IPC handlers
function registerIpcHandlers() {
  // File system handlers
  registerHandler('fs:readFile', async (event, filePath) => {
    return readFile(filePath);
  });

  registerHandler('fs:writeFile', async (event, filePath, content) => {
    return writeFile(filePath, content);
  });

  registerHandler('fs:exists', async (event, filePath) => {
    return fileExists(filePath);
  });

  registerHandler('fs:mkdir', async (event, dirPath) => {
    return createDirectory(dirPath);
  });

  registerHandler('fs:readdir', async (event, dirPath) => {
    try {
      return fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
    } catch (error) {
      return [];
    }
  });

  registerHandler('fs:deleteFile', async (event, filePath) => {
    return deletePath(filePath);
  });

  // Dialog handlers
  registerHandler('dialog:showOpenDialog', async (event, options) => {
    const focusedWindow = BrowserWindow.fromWebContents(event.sender);
    return await dialog.showOpenDialog(focusedWindow, options);
  });

  registerHandler('dialog:showSaveDialog', async (event, options) => {
    const focusedWindow = BrowserWindow.fromWebContents(event.sender);
    return await dialog.showSaveDialog(focusedWindow, options);
  });

  registerHandler('dialog:showMessageDialog', async (event, options) => {
    const focusedWindow = BrowserWindow.fromWebContents(event.sender);
    return await dialog.showMessageBox(focusedWindow, options);
  });

  // Window handlers
  ipcMain.on('window:minimize', event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) window.minimize();
  });

  ipcMain.on('window:maximize', event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.on('window:close', event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) window.close();
  });

  ipcMain.on('window:focus', event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) window.focus();
  });

  ipcMain.on('window:center', event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) window.center();
  });

  registerHandler('window:getBounds', async event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window ? window.getBounds() : null;
  });

  registerHandler('window:setBounds', async (event, bounds) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window ? (window.setBounds(bounds), true) : false;
  });

  // System handlers
  registerHandler('system:getPlatform', () => process.platform);
  registerHandler('system:getArch', () => process.arch);
  registerHandler('system:getInfo', () => ({
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
  }));

  registerHandler('system:showInFolder', async (event, fullPath) => {
    return shell.showItemInFolder(fullPath);
  });

  registerHandler('system:openExternal', async (event, url) => {
    return shell.openExternal(url);
  });

  // Process handlers
  registerHandler(
    'process:execCommand',
    async (event, command, options = {}) => {
      return executeCommand(command, options);
    }
  );

  registerHandler(
    'process:spawnProcess',
    async (event, command, args = [], options = {}) => {
      return {
        pid: null,
        message: 'Process spawning not implemented in this example',
      };
    }
  );

  registerHandler('process:killProcess', async (event, pid) => {
    try {
      process.kill(pid);
      return true;
    } catch (error) {
      return false;
    }
  });

  // Clipboard handlers
  registerHandler('clipboard:readText', () => clipboard.readText());
  registerHandler('clipboard:writeText', async (event, text) => {
    clipboard.writeText(text);
    return true;
  });

  registerHandler('clipboard:readImage', () => {
    const image = clipboard.readImage();
    return image ? image.toDataURL() : null;
  });

  registerHandler('clipboard:writeImage', async (event, imageData) => {
    // Implementation depends on how images are handled
    return true;
  });

  // Notification handlers
  registerHandler('notification:show', async (event, options) => {
    if (Notification.isSupported()) {
      const notification = new Notification(options);
      notification.show();
      return true;
    }
    return false;
  });

  registerHandler('notification:requestPermission', () => {
    return Notification.requestPermission();
  });

  // Menu handlers
  registerHandler('menu:showContextMenu', async (event, template) => {
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
    return true;
  });

  registerHandler('menu:setApplicationMenu', async (event, template) => {
    const menu = template ? Menu.buildFromTemplate(template) : null;
    Menu.setApplicationMenu(menu);
    return true;
  });

  // Shell handlers
  registerHandler('shell:openExternal', async (event, url) => {
    return shell.openExternal(url);
  });

  registerHandler('shell:openPath', async (event, path) => {
    return shell.openPath(path);
  });

  registerHandler('shell:showItemInFolder', async (event, fullPath) => {
    return shell.showItemInFolder(fullPath);
  });

  // Register common app handlers
  registerAppHandlers();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createMainWindow();
  registerIpcHandlers();

  // On macOS, it's common to re-create a window in the app when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Block navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      parsedUrl.origin !== 'http://localhost:3000' &&
      !parsedUrl.protocol.includes('file:')
    ) {
      event.preventDefault();
    }
  });
});
