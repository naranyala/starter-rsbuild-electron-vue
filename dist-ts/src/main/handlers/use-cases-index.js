// Register all use case handlers
import { registerElectronArchitectureHandler } from './electron-architecture.js';
import { registerElectronDevelopmentHandler } from './electron-development.js';
import { registerElectronIntroHandler } from './electron-intro.js';
import { registerElectronNativeAPIsHandler } from './electron-native-apis.js';
import { registerElectronPackagingHandler } from './electron-packaging.js';
import { registerElectronPerformanceHandler } from './electron-performance.js';
import { registerElectronSecurityHandler } from './electron-security.js';
import { registerElectronVersionsHandler } from './electron-versions.js';
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
//# sourceMappingURL=use-cases-index.js.map