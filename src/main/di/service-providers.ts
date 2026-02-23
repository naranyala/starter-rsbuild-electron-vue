/**
 * Main Process Service Providers
 * Registers all main process services with the DI container
 */

import type { DIContainer } from '../../shared/di';
import { ServiceLifetime } from '../../shared/di';
import { AppServiceInstance } from '../use-cases/app-service-instance';
import { FileService } from '../use-cases/file-service-instance';
import { WindowService } from '../use-cases/window.service';
import {
  APP_SERVICE_TOKEN,
  ELECTRON_APP_TOKEN,
  ELECTRON_IPC_MAIN_TOKEN,
  FILE_SERVICE_TOKEN,
  WINDOW_SERVICE_TOKEN,
} from './tokens';

/**
 * Register core Electron services
 */
export function registerElectronServices(container: DIContainer): void {
  container.addFactory(
    ELECTRON_APP_TOKEN,
    () => {
      const { app } = require('electron');
      return app;
    },
    ServiceLifetime.Singleton
  );

  container.addFactory(
    ELECTRON_IPC_MAIN_TOKEN,
    () => {
      const { ipcMain } = require('electron');
      return ipcMain;
    },
    ServiceLifetime.Singleton
  );
}

/**
 * Register application services
 */
export function registerAppServices(container: DIContainer): void {
  container.addValue(WINDOW_SERVICE_TOKEN, WindowService);
  container.addValue(FILE_SERVICE_TOKEN, FileService);

  container.addFactory(
    APP_SERVICE_TOKEN,
    () => {
      const ipcMain = container.get(ELECTRON_IPC_MAIN_TOKEN);
      return new AppServiceInstance(ipcMain);
    },
    ServiceLifetime.Singleton
  );
}

/**
 * Register all main process services
 */
export function registerAllMainServices(container: DIContainer): void {
  registerElectronServices(container);
  registerAppServices(container);
}

export { WindowService, FileService, AppServiceInstance };
