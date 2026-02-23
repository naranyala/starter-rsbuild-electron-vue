/**
 * Main Process Dependency Injection Tokens
 */

import { InjectionToken } from '../../shared/di';
import { WindowService } from '../use-cases/window-service-instance';
import { FileService } from '../use-cases/file-service-instance';
import { AppServiceInstance } from '../use-cases/app-service-instance';

// Service tokens
export const WINDOW_SERVICE_TOKEN = new InjectionToken<typeof WindowService>(
  'WindowService',
  'Service for window management operations'
);

export const FILE_SERVICE_TOKEN = new InjectionToken<typeof FileService>(
  'FileService',
  'Service for file system operations'
);

export const APP_SERVICE_TOKEN = new InjectionToken<AppServiceInstance>(
  'AppService',
  'Service for application-level operations'
);

// Electron tokens
export const ELECTRON_APP_TOKEN = new InjectionToken<typeof import('electron').app>(
  'ElectronApp',
  'Electron app instance'
);

export const ELECTRON_IPC_MAIN_TOKEN = new InjectionToken<typeof import('electron').ipcMain>(
  'IpcMain',
  'Electron IPC Main instance'
);
