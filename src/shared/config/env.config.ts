/**
 * Environment Configuration
 * Manages environment-specific settings
 */

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_ENV: 'development' | 'staging' | 'production';
  DEBUG: boolean;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

/**
 * Current environment configuration
 */
export const env: EnvConfig = {
  NODE_ENV: getEnv('NODE_ENV', 'development') as EnvConfig['NODE_ENV'],
  APP_ENV: getEnv('APP_ENV', 'development') as EnvConfig['APP_ENV'],
  DEBUG: getBooleanEnv('DEBUG', false),
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info') as EnvConfig['LOG_LEVEL'],
};

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get current environment name
 */
export function getEnvironmentName(): string {
  return `${env.NODE_ENV} (${env.APP_ENV})`;
}
