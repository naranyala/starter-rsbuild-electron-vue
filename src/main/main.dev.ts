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
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  createDirectory,
  fileExists,
  readFile,
  writeFile,
} from './lib/filesystem-utils';
import {
  killProcess,
  executeCommand as ProcessService_executeCommand,
  spawnProcess,
} from './lib/process-utils';
import { AppService } from './use-cases/app-service';
import { FileService } from './use-cases/file-service';
import { registerAllHandlers } from './use-cases/index';
import { WindowService, WindowServiceStatic } from './use-cases/window.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-setuid-sandbox');
}

app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      const devServerOrigin = new URL(
        process.env.ELECTRON_DEV_SERVER || 'http://localhost:3000'
      ).origin;

      if (
        parsedUrl.origin !== devServerOrigin &&
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

try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {}

const createMainWindow = () => {
  const mainWindow = WindowServiceStatic.create({
    name: 'main',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  const devServerUrl =
    process.env.ELECTRON_DEV_SERVER || 'http://localhost:3000';

  WindowServiceStatic.loadUrl(mainWindow, 3000, isDevelopment, devServerUrl);

  WindowServiceStatic.setupHandlers(mainWindow, isDevelopment, {
    onReady: (window: BrowserWindow) => {
      console.log('Main window ready');
      if (
        process.env.OPEN_DEVTOOLS === 'true' ||
        process.env.OPEN_DEVTOOLS === '1'
      ) {
        window.webContents.openDevTools({ mode: 'detach' });
      }

      window.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown') {
          const isMac = process.platform === 'darwin';
          const shortcutPressed =
            input.code === 'KeyI' &&
            ((input.control && input.shift) ||
              (isMac && input.meta && input.alt));

          if (shortcutPressed) {
            if (window.webContents.isDevToolsOpened()) {
              window.webContents.closeDevTools();
            } else {
              window.webContents.openDevTools({ mode: 'detach' });
            }
            event.preventDefault();
          }
        }
      });
    },
    onClosed: (window: BrowserWindow) => {
      console.log('Main window closed');
    },
  });

  return mainWindow;
};

function registerIpcHandlers() {
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

  ipcMain.handle('system:getPlatform', () => process.platform);
  ipcMain.handle('system:getArch', () => process.arch);

  ipcMain.handle('system:showInFolder', async (event, fullPath: string) => {
    return shell.showItemInFolder(fullPath);
  });

  ipcMain.handle('system:openExternal', async (event, url: string) => {
    return shell.openExternal(url);
  });

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
    return true;
  });

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
    return Promise.resolve('granted');
  });

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

  const defaultMenu = Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools', accelerator: 'CommandOrControl+Shift+I' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      role: 'windowMenu',
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: async () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About',
              message: 'Electron + Vue App',
              detail: 'Built with Rsbuild',
            });
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(defaultMenu);

  ipcMain.handle('shell:openExternal', async (event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle('shell:openPath', async (event, pathStr: string) => {
    return shell.openPath(pathStr);
  });

  ipcMain.handle('shell:showItemInFolder', async (event, fullPath: string) => {
    return shell.showItemInFolder(fullPath);
  });

  // DevTools IPC handlers
  ipcMain.handle('devtools:get-process-info', () => {
    return {
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
    };
  });

  ipcMain.handle('devtools:get-memory-info', async () => {
    const memory = await process.getProcessMemoryInfo?.() || {};
    return {
      private: memory.private || 0,
      shared: memory.shared || 0,
      residentSetSize: memory.residentSet || 0,
    };
  });

  ipcMain.handle('devtools:get-windows', () => {
    const windows = BrowserWindow.getAllWindows();
    return windows.map(win => ({
      id: win.id,
      title: win.getTitle(),
      isMinimized: win.isMinimized(),
      isMaximized: win.isMaximized(),
      isFocused: win.isFocused(),
      bounds: win.getBounds(),
    }));
  });

  AppService.registerHandlers();
  registerAllHandlers();
}

app.whenReady().then(() => {
  createMainWindow();
  registerIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      const devServerOrigin = new URL(
        process.env.ELECTRON_DEV_SERVER || 'http://localhost:3000'
      ).origin;

      if (
        parsedUrl.origin !== devServerOrigin &&
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
