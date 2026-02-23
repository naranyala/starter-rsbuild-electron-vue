/**
 * Composable for app information
 */

import { computed } from 'vue';
import { APP_INFO_TOKEN, type AppInfo } from '../di';
import { useInject } from './useInject';

/**
 * Composable for accessing app information
 */
export function useAppInfo() {
  const appInfo = useInject(APP_INFO_TOKEN);

  const version = computed(() => appInfo.version);
  const name = computed(() => appInfo.name);
  const environment = computed(() => appInfo.environment);
  const isDevelopment = computed(() => appInfo.environment === 'development');
  const isProduction = computed(() => appInfo.environment === 'production');

  return {
    appInfo,
    version,
    name,
    environment,
    isDevelopment,
    isProduction,
  };
}
