/**
 * Main Process Dependency Injection Module
 */

export {
  WINDOW_SERVICE_TOKEN,
  FILE_SERVICE_TOKEN,
  APP_SERVICE_TOKEN,
  ELECTRON_APP_TOKEN,
  ELECTRON_IPC_MAIN_TOKEN,
} from './tokens';

export {
  registerElectronServices,
  registerAppServices,
  registerAllMainServices,
} from './service-providers';

export {
  getMainContainer,
  resetMainContainer,
  initializeMainContainer,
  mainContainer,
} from './main-container';
