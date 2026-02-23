/**
 * Configuration Module
 * Centralized configuration management
 */

export { type AppConfig, appConfig, getAppInfo } from './app.config';
export {
  type EnvConfig,
  env,
  getEnvironmentName,
  isDevelopment,
  isProduction,
  isTest,
} from './env.config';
