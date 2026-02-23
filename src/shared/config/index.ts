/**
 * Configuration Module
 * Centralized configuration management
 */

export { env, isDevelopment, isProduction, isTest, getEnvironmentName, type EnvConfig } from './env.config';
export { appConfig, getAppInfo, type AppConfig } from './app.config';
