import { ipcMain } from 'electron';

export function registerAppHandlers(): void {
  // Register handlers for app-related IPC events
  ipcMain.handle('app:getVersion', () => {
    // Return app version
    return process.env.npm_package_version || '1.0.0';
  });

  ipcMain.handle('app:getName', () => {
    // Return app name
    return process.env.npm_package_name || 'Electron App';
  });

  ipcMain.handle(
    'app:getPath',
    async (
      event,
      name:
        | 'home'
        | 'appData'
        | 'assets'
        | 'userData'
        | 'sessionData'
        | 'temp'
        | 'exe'
        | 'module'
        | 'desktop'
        | 'documents'
        | 'downloads'
        | 'music'
        | 'pictures'
        | 'videos'
        | 'recent'
        | 'logs'
        | 'crashDumps'
    ) => {
      // Return path for the specified name
      const { app } = await import('electron');
      return app.getPath(name);
    }
  );

  ipcMain.handle('app:getLocale', () => {
    // Return app locale
    const { app } = require('electron');
    return app.getLocale();
  });

  ipcMain.handle('app:quit', () => {
    const { app } = require('electron');
    app.quit();
    return true;
  });

  ipcMain.handle('app:relaunch', () => {
    const { app } = require('electron');
    app.relaunch();
    app.exit(0);
    return true;
  });
}

export function registerFileHandlers(): void {
  // Register handlers for file-related IPC events
  // These would typically be handled by the FileService
}

export function registerWindowHandlers(): void {
  // Register handlers for window-related IPC events
  // These would typically be handled by the WindowService
}

export function registerSystemHandlers(): void {
  // Register handlers for system-related IPC events
  // These would typically be handled by system services
}
