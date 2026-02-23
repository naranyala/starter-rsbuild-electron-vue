/**
 * Renderer Process Dependency Injection Module
 */

export { provideDIContainer } from '../composables';
export {
  createComponentScope,
  getRendererContainer,
  rendererContainer,
  resetRendererContainer,
} from './renderer-container';
export {
  registerAllRendererServices,
  registerAppConfig,
  registerCoreFrontendServices,
} from './service-providers';
export {
  APP_INFO_TOKEN,
  type AppInfo,
  FRONTEND_WINDOW_SERVICE_TOKEN,
  type FrontendWindowService,
  IPC_SERVICE_TOKEN,
  type IPCService,
} from './tokens';
