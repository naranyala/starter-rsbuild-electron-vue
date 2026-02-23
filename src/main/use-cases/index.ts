// Main process handlers index

// Re-export DI tokens for convenience
export {
  APP_SERVICE_TOKEN,
  ELECTRON_APP_TOKEN,
  ELECTRON_IPC_MAIN_TOKEN,
  FILE_SERVICE_TOKEN,
  WINDOW_SERVICE_TOKEN,
} from '../di/tokens';
export { AppService, AppServiceInstance } from './app-service-instance';
export { FileService, FileServiceInstance } from './file-service-instance';
export { registerAllUseCaseHandlers as registerAllHandlers } from './use-cases-index';
// Re-export services
export { WindowService, WindowServiceStatic } from './window.service';
