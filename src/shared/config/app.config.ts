/**
 * Application Configuration
 * Centralized app settings
 */

export interface AppConfig {
  version: string;
  name: string;
  description: string;
  author: string;
}

/**
 * Current application configuration
 */
export const appConfig: AppConfig = {
  version: '0.1.2',
  name: 'electron-vue-rsbuild-bun',
  description: 'Modern Electron + Vue boilerplate using Rsbuild and Bun runtime.',
  author: 'naranyala',
};

/**
 * Get full app info
 */
export function getAppInfo(): AppConfig {
  return { ...appConfig };
}
