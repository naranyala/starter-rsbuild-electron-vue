/**
 * Renderer Process Service Providers
 * Registers all renderer process services with the DI container
 */

import type { DIContainer } from '../../shared/di';
import { ServiceLifetime } from '../../shared/di';
import {
  BrowserIPCServiceInstance,
  IPCServiceInstance,
} from '../services/ipc-service';
import { FrontendWindowServiceInstance } from '../services/window-service';
import {
  APP_INFO_TOKEN,
  type AppInfo,
  FRONTEND_WINDOW_SERVICE_TOKEN,
  IPC_SERVICE_TOKEN,
} from './tokens';

/**
 * Check if running in Electron
 */
function isElectron(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as unknown as { require?: unknown }).require === 'function'
  );
}

/**
 * Register core renderer services
 */
export function registerCoreFrontendServices(container: DIContainer): void {
  const useElectronIPC = isElectron();

  if (useElectronIPC) {
    container.addFactory(IPC_SERVICE_TOKEN, () => new IPCServiceInstance());
  } else {
    container.addFactory(
      IPC_SERVICE_TOKEN,
      () => new BrowserIPCServiceInstance()
    );
  }

  container.addFactory(FRONTEND_WINDOW_SERVICE_TOKEN, () => {
    const ipc = container.get(IPC_SERVICE_TOKEN);
    return new FrontendWindowServiceInstance(ipc);
  });
}

/**
 * Register application configuration
 */
export function registerAppConfig(
  container: DIContainer,
  config?: Partial<AppInfo>
): void {
  const appInfo: AppInfo = {
    version: config?.version ?? '0.1.2',
    name: config?.name ?? 'electron-vue-rsbuild-bun',
    environment: 'development',
  };

  container.addValue(APP_INFO_TOKEN, appInfo);
}

/**
 * Register all renderer process services
 */
export function registerAllRendererServices(
  container: DIContainer,
  config?: Partial<AppInfo>
): void {
  registerCoreFrontendServices(container);
  registerAppConfig(container, config);
}

export {
  IPCServiceInstance,
  BrowserIPCServiceInstance,
  FrontendWindowServiceInstance,
};
