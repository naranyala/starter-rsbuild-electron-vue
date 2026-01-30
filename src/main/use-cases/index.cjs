// Register all use case handlers
const { registerElectronIntroHandler } = require('./electron-intro.cjs');
const {
  registerElectronArchitectureHandler,
} = require('./electron-architecture.cjs');
const { registerElectronSecurityHandler } = require('./electron-security.cjs');
const { registerElectronPackagingHandler } = require('./electron-packaging.cjs');
const { registerElectronNativeAPIsHandler } = require('./electron-native-apis.cjs');
const {
  registerElectronPerformanceHandler,
} = require('./electron-performance.cjs');
const {
  registerElectronDevelopmentHandler,
} = require('./electron-development.cjs');
const { registerElectronVersionsHandler } = require('./electron-versions.cjs');

function registerAllUseCaseHandlers() {
  registerElectronIntroHandler();
  registerElectronArchitectureHandler();
  registerElectronSecurityHandler();
  registerElectronPackagingHandler();
  registerElectronNativeAPIsHandler();
  registerElectronPerformanceHandler();
  registerElectronDevelopmentHandler();
  registerElectronVersionsHandler();
}

module.exports = { registerAllUseCaseHandlers };
