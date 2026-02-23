import { app, type IpcMainInvokeEvent, ipcMain } from 'electron';

/**
 * IPC Handler registration function type
 */
export type IpcHandler = () => void;

/**
 * Service for application-level operations and IPC handler registration
 */
export class AppServiceInstance {
  private handlers = new Map<string, IpcHandler>();

  constructor(private ipcMain: Electron.IpcMain) {}

  /**
   * Register the default app handlers
   */
  registerHandlers(): void {
    // App version handler
    this.ipcMain.handle('app:getVersion', () => {
      return process.env.npm_package_version || '1.0.0';
    });

    // App name handler
    this.ipcMain.handle('app:getName', () => {
      return process.env.npm_package_name || 'Electron App';
    });

    // App path handler
    this.ipcMain.handle(
      'app:getPath',
      async (
        event: IpcMainInvokeEvent,
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
        return app.getPath(name);
      }
    );

    // App locale handler
    this.ipcMain.handle('app:getLocale', () => {
      return app.getLocale();
    });

    // App quit handler
    this.ipcMain.handle('app:quit', () => {
      app.quit();
      return true;
    });

    // App relaunch handler
    this.ipcMain.handle('app:relaunch', () => {
      app.relaunch();
      app.exit(0);
      return true;
    });
  }

  /**
   * Register a custom IPC handler
   */
  registerHandler(
    channel: string,
    handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown
  ): void {
    this.ipcMain.handle(channel, handler);
    this.handlers.set(channel, () => {
      this.ipcMain.handle(channel, handler);
    });
  }

  /**
   * Remove an IPC handler
   */
  removeHandler(channel: string): void {
    this.ipcMain.removeHandler(channel);
    this.handlers.delete(channel);
  }

  /**
   * Remove all registered handlers
   */
  removeAllHandlers(): void {
    for (const channel of this.handlers.keys()) {
      this.ipcMain.removeHandler(channel);
    }
    this.handlers.clear();
  }

  /**
   * Get all registered handler channels
   */
  getRegisteredChannels(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Keep static class for backward compatibility
export const AppService = {
  registerHandlers: function registerHandlers(): void {
    const service = new AppServiceInstance(ipcMain);
    service.registerHandlers();
  },
};
