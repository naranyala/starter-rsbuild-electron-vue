/**
 * Composable for window operations
 */

import { useInject } from './useInject';
import { FRONTEND_WINDOW_SERVICE_TOKEN } from '../di';

/**
 * Composable for window management
 */
export function useWindow() {
  const windowService = useInject(FRONTEND_WINDOW_SERVICE_TOKEN);

  /**
   * Minimize the window
   */
  const minimize = async (): Promise<void> => {
    await windowService.minimize();
  };

  /**
   * Maximize/unmaximize the window
   */
  const maximize = async (): Promise<void> => {
    await windowService.maximize();
  };

  /**
   * Close the window
   */
  const close = async (): Promise<void> => {
    await windowService.close();
  };

  /**
   * Check if window is maximized
   */
  const isMaximized = async (): Promise<boolean> => {
    return windowService.isMaximized();
  };

  return {
    minimize,
    maximize,
    close,
    isMaximized,
  };
}
