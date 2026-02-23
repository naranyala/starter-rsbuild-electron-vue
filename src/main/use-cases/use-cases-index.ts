// Register all use case handlers

import { registerElectronArchitectureHandler } from './electron-architecture';
import { registerElectronDevelopmentHandler } from './electron-development';
import { registerElectronIntroHandler } from './electron-intro';
import { registerElectronNativeAPIsHandler } from './electron-native-apis';
import { registerElectronPackagingHandler } from './electron-packaging';
import { registerElectronPerformanceHandler } from './electron-performance';
import { registerElectronSecurityHandler } from './electron-security';
import { registerElectronVersionsHandler } from './electron-versions';

export function registerAllUseCaseHandlers() {
  registerElectronIntroHandler();
  registerElectronArchitectureHandler();
  registerElectronSecurityHandler();
  registerElectronPackagingHandler();
  registerElectronNativeAPIsHandler();
  registerElectronPerformanceHandler();
  registerElectronDevelopmentHandler();
  registerElectronVersionsHandler();
}
