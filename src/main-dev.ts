import {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
  Menu,
  Notification,
  shell,
} from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerAllHandlers } from './main/handlers/index.js';
import { AppService } from './main/services/app-service.js';
import { FileService } from './main/services/file-service.js';
// Import utility functions
import { WindowService } from './main/services/window-service.js';
// ProcessService is not a class in process-utils, using the functions directly
import {
  executeCommand as ProcessService_executeCommand,
  spawnProcess as ProcessService_spawnProcess,
  killProcess as ProcessService_killProcess,
} from './main/lib/process-utils.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security settings
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);

      if (
        parsedUrl.origin !== 'http://localhost:3000' &&
        !parsedUrl.protocol.includes('file:')
      ) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
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
  const mainWindow = WindowService.create({
    name: 'main',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, '../dist-ts/preload.js'),
    },
  });

  // Determine whether to load from dev server or built files
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devServerUrl =
    process.env.ELECTRON_DEV_SERVER || 'http://localhost:3000';

  WindowService.loadUrl(mainWindow, 3000, isDevelopment, devServerUrl);

  WindowService.setupHandlers(mainWindow, isDevelopment, {
    onReady: (window: BrowserWindow) => {
      console.log('Main window ready');
      // Dev tools disabled for welcome screen - can be opened manually if needed
      // window.webContents.openDevTools({ mode: 'detach' });
    },
    onClosed: (window: BrowserWindow) => {
      console.log('Main window closed');
    },
  });

  return mainWindow;
};

// Register IPC handlers
function registerIpcHandlers() {
  // File system handlers
  ipcMain.handle('fs:readFile', async (event, filePath: string) => {
    return FileService.read(filePath);
  });

  ipcMain.handle(
    'fs:writeFile',
    async (event, filePath: string, content: string) => {
      return FileService.write(filePath, content);
    }
  );

  ipcMain.handle('fs:exists', async (event, filePath: string) => {
    return FileService.exists(filePath);
  });

  ipcMain.handle('fs:mkdir', async (event, dirPath: string) => {
    return FileService.createDirectory(dirPath);
  });

  ipcMain.handle('fs:readdir', async (event, dirPath: string) => {
    try {
      return fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  });

  ipcMain.handle('fs:deleteFile', async (event, filePath: string) => {
    return FileService.delete(filePath);
  });

  // Dialog handlers
  ipcMain.handle(
    'dialog:showOpenDialog',
    async (event, options: Electron.OpenDialogOptions) => {
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      const targetWindow = focusedWindow || BrowserWindow.getFocusedWindow();
      if (!targetWindow) {
        throw new Error('No available window for dialog');
      }
      return await dialog.showOpenDialog(targetWindow, options);
    }
  );

  ipcMain.handle(
    'dialog:showSaveDialog',
    async (event, options: Electron.SaveDialogOptions) => {
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      const targetWindow = focusedWindow || BrowserWindow.getFocusedWindow();
      if (!targetWindow) {
        throw new Error('No available window for dialog');
      }
      return await dialog.showSaveDialog(targetWindow, options);
    }
  );

  ipcMain.handle(
    'dialog:showMessageDialog',
    async (event, options: Electron.MessageBoxOptions) => {
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      const targetWindow = focusedWindow || BrowserWindow.getFocusedWindow();
      if (!targetWindow) {
        throw new Error('No available window for dialog');
      }
      return await dialog.showMessageBox(targetWindow, options);
    }
  );

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

  ipcMain.handle('window:getBounds', async event => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window ? window.getBounds() : null;
  });

  ipcMain.handle('window:setBounds', async (event, bounds) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setBounds(bounds);
    }
    return true;
  });

  // System handlers
  ipcMain.handle('system:getPlatform', () => process.platform);
  ipcMain.handle('system:getArch', () => process.arch);

  ipcMain.handle('system:showInFolder', async (event, fullPath: string) => {
    return shell.showItemInFolder(fullPath);
  });

  ipcMain.handle('system:openExternal', async (event, url: string) => {
    return shell.openExternal(url);
  });

  // Process handlers
  ipcMain.handle(
    'process:execCommand',
    async (event, command: string, options: any = {}) => {
      return ProcessService_executeCommand(command, options);
    }
  );

  ipcMain.handle(
    'process:spawnProcess',
    async (event, command: string, args: string[] = [], options: any = {}) => {
      return {
        pid: null,
        message: 'Process spawning not implemented in this example',
      };
    }
  );

  ipcMain.handle('process:killProcess', async (event, pid: number) => {
    try {
      process.kill(pid);
      return true;
    } catch (error) {
      console.error('Error killing process:', error);
      return false;
    }
  });

  // Clipboard handlers
  ipcMain.handle('clipboard:readText', () => clipboard.readText());
  ipcMain.handle('clipboard:writeText', async (event, text: string) => {
    clipboard.writeText(text);
    return true;
  });

  ipcMain.handle('clipboard:readImage', () => {
    const image = clipboard.readImage();
    return image ? image.toDataURL() : null;
  });

  ipcMain.handle('clipboard:writeImage', async (event, imageData: any) => {
    // Implementation depends on how images are handled
    return true;
  });

  // Notification handlers
  ipcMain.handle(
    'notification:show',
    async (event, options: Electron.NotificationConstructorOptions) => {
      if (Notification.isSupported()) {
        const notification = new Notification(options);
        notification.show();
        return true;
      }
      return false;
    }
  );

  ipcMain.handle('notification:requestPermission', () => {
    // Note: Notification.requestPermission() is not available in Electron
    // This is just a placeholder for compatibility
    return Promise.resolve('granted');
  });

  // Menu handlers
  ipcMain.handle(
    'menu:showContextMenu',
    async (event, template: Electron.MenuItemConstructorOptions[]) => {
      const menu = Menu.buildFromTemplate(template);
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      if (focusedWindow) {
        menu.popup({ window: focusedWindow });
      } else {
        menu.popup();
      }
      return true;
    }
  );

  ipcMain.handle(
    'menu:setApplicationMenu',
    async (event, template: Electron.MenuItemConstructorOptions[]) => {
      const menu = template ? Menu.buildFromTemplate(template) : null;
      Menu.setApplicationMenu(menu);
      return true;
    }
  );

  // Shell handlers
  ipcMain.handle('shell:openExternal', async (event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle('shell:openPath', async (event, pathStr: string) => {
    return shell.openPath(pathStr);
  });

  ipcMain.handle('shell:showItemInFolder', async (event, fullPath: string) => {
    return shell.showItemInFolder(fullPath);
  });

  // Register common app handlers
  AppService.registerHandlers();

  // Register use case handlers
  registerAllHandlers();
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
    try {
      const parsedUrl = new URL(navigationUrl);

      if (
        parsedUrl.origin !== 'http://localhost:3000' &&
        !parsedUrl.protocol.includes('file:')
      ) {
        event.preventDefault();
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      event.preventDefault();
    }
  });
});
