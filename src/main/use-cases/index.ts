// Main process handlers index
export { registerAllUseCaseHandlers as registerAllHandlers } from './use-cases-index';

// Re-export DI tokens for convenience
export {
  WINDOW_SERVICE_TOKEN,
  FILE_SERVICE_TOKEN,
  APP_SERVICE_TOKEN,
  ELECTRON_APP_TOKEN,
  ELECTRON_IPC_MAIN_TOKEN,
} from '../di/tokens';

// Re-export services
export { WindowService, WindowServiceInstance } from './window-service-instance';
export { FileService, FileServiceInstance } from './file-service-instance';
export { AppService, AppServiceInstance } from './app-service-instance';
