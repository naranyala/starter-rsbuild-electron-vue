/**
 * Main Process Dependency Injection Module
 */

export {
  getMainContainer,
  initializeMainContainer,
  mainContainer,
  resetMainContainer,
} from './main-container';

export {
  registerAllMainServices,
  registerAppServices,
  registerElectronServices,
} from './service-providers';
export {
  APP_SERVICE_TOKEN,
  ELECTRON_APP_TOKEN,
  ELECTRON_IPC_MAIN_TOKEN,
  FILE_SERVICE_TOKEN,
  WINDOW_SERVICE_TOKEN,
} from './tokens';
