/**
 * Vue Composable for WinBox Navigation
 * Provides easy-to-use navigation functions for Vue components
 */

import { ref, computed, onUnmounted } from 'vue';
import { getRouter, type ViewConfig, type WindowOptions } from '../router';
import type { WinBoxInstance } from '../windows/types';

export interface UseWinBoxNavigationOptions {
  /** Auto-focus window on navigate */
  autoFocus?: boolean;
  /** Close previous window of same type */
  closePrevious?: boolean;
  /** Callback when window is closed */
  onClose?: () => void;
}

export interface UseWinBoxNavigationReturn {
  /** Navigate to a view */
  navigate: (viewName: string, params?: Record<string, unknown>, options?: WindowOptions) => Promise<boolean>;
  /** Close current window */
  close: () => Promise<void>;
  /** Close all windows */
  closeAll: () => Promise<void>;
  /** Go back in history */
  back: () => Promise<boolean>;
  /** Go forward in history */
  forward: () => Promise<boolean>;
  /** Current view name */
  currentView: ReturnType<typeof ref<string | null>>;
  /** Active windows count */
  windowCount: ReturnType<typeof ref<number>>;
  /** Check if can go back */
  canGoBack: import('vue').ComputedRef<boolean>;
  /** Check if can go forward */
  canGoForward: import('vue').ComputedRef<boolean>;
  /** Get all active windows */
  activeWindows: ReturnType<typeof ref<Map<string, any>>>;
  /** Focus a window */
  focusWindow: (windowId: string) => boolean;
  /** Minimize a window */
  minimizeWindow: (windowId: string) => boolean;
}

/**
 * Use WinBox Navigation in Vue components
 * 
 * @example
 * ```typescript
 * export default {
 *   setup() {
 *     const { navigate, close, currentView, windowCount } = useWinBoxNavigation();
 *     
 *     const openIntro = async () => {
 *       await navigate('electron-intro', { section: 'overview' });
 *     };
 *     
 *     return {
 *       openIntro,
 *       close,
 *       currentView,
 *       windowCount,
 *     };
 *   }
 * };
 * ```
 */
export function useWinBoxNavigation(
  options: UseWinBoxNavigationOptions = {}
): UseWinBoxNavigationReturn {
  const {
    autoFocus = true,
    closePrevious = false,
    onClose,
  } = options;

  const router = getRouter();
  const currentView = ref<string | null>(router.getCurrentView());
  const windowCount = ref(router.getWindowCount());
  const activeWindows = ref(router.getActiveWindows());
  
  const canGoBack = computed(() => {
    const history = router.getHistory();
    const index = history.findIndex((_, i) => i < router.getHistory().length - 1);
    return index >= 0;
  });

  const canGoForward = computed(() => {
    const history = router.getHistory();
    return history.length > 0;
  });

  // Update reactive state when windows change
  function updateState() {
    currentView.value = router.getCurrentView();
    windowCount.value = router.getWindowCount();
    activeWindows.value = router.getActiveWindows();
  }

  /**
   * Navigate to a view
   */
  async function navigate(
    viewName: string,
    params?: Record<string, unknown>,
    navOptions?: WindowOptions
  ): Promise<boolean> {
    // Close previous window of same type if configured
    if (closePrevious) {
      const windows = router.getActiveWindows();
      for (const [id, window] of windows.entries()) {
        if (window.viewName === viewName) {
          await router.close(id);
        }
      }
    }

    const result = await router.navigate(viewName, params, navOptions);

    if (result.success) {
      updateState();

      // Auto-focus the new window
      if (autoFocus && result.window) {
        const windowId = Array.from(router.getActiveWindows().keys()).pop();
        if (windowId) {
          router.focus(windowId);
        }
      }
    }

    return result.success;
  }

  /**
   * Close current window
   */
  async function close(): Promise<void> {
    const view = currentView.value;
    if (!view) return;

    const windows = router.getActiveWindows();
    const lastWindow = Array.from(windows.entries()).pop();
    
    if (lastWindow) {
      await router.close(lastWindow[0]);
      updateState();
      
      if (onClose) {
        onClose();
      }
    }
  }

  /**
   * Close all windows
   */
  async function closeAll(): Promise<void> {
    await router.closeAll();
    updateState();
  }

  /**
   * Go back in history
   */
  async function back(): Promise<boolean> {
    const result = await router.back();
    updateState();
    return result;
  }

  /**
   * Go forward in history
   */
  async function forward(): Promise<boolean> {
    const result = await router.forward();
    updateState();
    return result;
  }

  /**
   * Focus a specific window
   */
  function focusWindow(windowId: string): boolean {
    const result = router.focus(windowId);
    updateState();
    return result;
  }

  /**
   * Minimize a specific window
   */
  function minimizeWindow(windowId: string): boolean {
    const result = router.minimize(windowId);
    updateState();
    return result;
  }

  // Set up window event listeners
  const cleanupCallbacks: (() => void)[] = [];

  onUnmounted(() => {
    cleanupCallbacks.forEach(cb => cb());
  });

  return {
    navigate,
    close,
    closeAll,
    back,
    forward,
    currentView,
    windowCount,
    canGoBack,
    canGoForward,
    activeWindows,
    focusWindow,
    minimizeWindow,
  };
}

/**
 * Composable for managing a specific window instance
 */
export function useWindowInstance(windowId: string) {
  const router = getRouter();
  const windowData = ref(router.getActiveWindows().get(windowId));
  const instance = ref<WinBoxInstance | null>(windowData.value?.instance ?? null);

  function updateInstance() {
    const windows = router.getActiveWindows();
    windowData.value = windows.get(windowId);
    instance.value = windowData.value?.instance ?? null;
  }

  async function close(): Promise<boolean> {
    return router.close(windowId);
  }

  function focus(): boolean {
    return router.focus(windowId);
  }

  function minimize(): boolean {
    return router.minimize(windowId);
  }

  function setTitle(title: string): void {
    if (instance.value?.setTitle) {
      instance.value.setTitle(title);
    }
  }

  return {
    windowData,
    instance,
    close,
    focus,
    minimize,
    setTitle,
    updateInstance,
  };
}
