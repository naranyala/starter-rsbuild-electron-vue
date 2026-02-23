/**
 * Renderer Process Dependency Injection Module
 */

export {
  IPC_SERVICE_TOKEN,
  FRONTEND_WINDOW_SERVICE_TOKEN,
  APP_INFO_TOKEN,
  type AppInfo,
  type IPCService,
  type FrontendWindowService,
} from './tokens';

export {
  registerCoreFrontendServices,
  registerAppConfig,
  registerAllRendererServices,
} from './service-providers';

export {
  getRendererContainer,
  resetRendererContainer,
  createComponentScope,
  rendererContainer,
} from './renderer-container';

export { provideDIContainer } from '../composables';
