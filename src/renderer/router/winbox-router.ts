/**
 * WinBox Router
 * A router-like solution using WinBox windows instead of traditional routing
 * 
 * Features:
 * - View registry with lazy loading
 * - Window-based navigation
 * - History management
 * - Named views
 * - Query parameters
 * - Window stacking and focus management
 */

import type { WinBoxInstance } from '../windows/types';

/**
 * View configuration
 */
export interface ViewConfig {
  /** Unique view name */
  name: string;
  /** View title */
  title: string;
  /** Vue component to render */
  component?: any;
  /** Custom content HTML */
  content?: string;
  /** Window options */
  windowOptions?: WindowOptions;
  /** Called before view opens */
  beforeEnter?: (params?: Record<string, unknown>) => boolean | Promise<boolean>;
  /** Called when view is opened */
  onEnter?: (params?: Record<string, unknown>) => void;
  /** Called when view is closed */
  onLeave?: () => void;
}

/**
 * Window options for WinBox
 */
export interface WindowOptions {
  width?: string | number;
  height?: string | number;
  x?: string | number;
  y?: string | number;
  min?: boolean;
  max?: boolean;
  background?: string;
  class?: string[];
  [key: string]: unknown;
}

/**
 * Active window record
 */
export interface ActiveWindow {
  viewName: string;
  instance: WinBoxInstance | null;
  params?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Navigation result
 */
export interface NavigationResult {
  success: boolean;
  error?: string;
  window?: ActiveWindow;
}

/**
 * WinBox Router Configuration
 */
export interface WinBoxRouterConfig {
  /** Default window options */
  defaultWindowOptions?: WindowOptions;
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum number of windows */
  maxWindows?: number;
  /** Stack windows or allow overlap */
  stackWindows?: boolean;
}

/**
 * WinBox Router Class
 * 
 * Manages navigation using WinBox windows instead of traditional routing
 */
export class WinBoxRouter {
  private views = new Map<string, ViewConfig>();
  private activeWindows = new Map<string, ActiveWindow>();
  private history: string[] = [];
  private historyIndex = -1;
  private config: Required<WinBoxRouterConfig>;
  private currentView: string | null = null;
  private windowCounter = 0;

  constructor(config: WinBoxRouterConfig = {}) {
    this.config = {
      defaultWindowOptions: config.defaultWindowOptions ?? {},
      debug: config.debug ?? false,
      maxWindows: config.maxWindows ?? 10,
      stackWindows: config.stackWindows ?? false,
    };
  }

  /**
   * Register a view
   */
  registerView(viewConfig: ViewConfig): void {
    this.views.set(viewConfig.name, viewConfig);
    this.log('register', `View registered: ${viewConfig.name}`);
  }

  /**
   * Register multiple views
   */
  registerViews(viewConfigs: ViewConfig[]): void {
    viewConfigs.forEach(view => this.registerView(view));
  }

  /**
   * Navigate to a view (opens window)
   */
  async navigate(
    viewName: string,
    params?: Record<string, unknown>,
    options?: WindowOptions
  ): Promise<NavigationResult> {
    const view = this.views.get(viewName);

    if (!view) {
      return {
        success: false,
        error: `View "${viewName}" not found`,
      };
    }

    // Check beforeEnter guard
    if (view.beforeEnter) {
      try {
        const result = await view.beforeEnter(params);
        if (!result) {
          return {
            success: false,
            error: 'Navigation blocked by beforeEnter guard',
          };
        }
      } catch (error) {
        return {
          success: false,
          error: `beforeEnter error: ${error instanceof Error ? error.message : 'Unknown'}`,
        };
      }
    }

    // Check max windows limit
    if (this.activeWindows.size >= this.config.maxWindows) {
      this.log('warn', 'Max windows reached, closing oldest');
      const oldest = Array.from(this.activeWindows.entries())[0];
      await this.close(oldest[0]);
    }

    // Create window instance
    const windowId = this.createWindowId(viewName);
    const windowOptions = this.mergeWindowOptions(
      view.windowOptions,
      this.config.defaultWindowOptions,
      options
    );

    this.log('navigate', `Opening view: ${viewName}`, { windowId, params });

    // Store active window
    const activeWindow: ActiveWindow = {
      viewName,
      instance: null, // Will be set by window factory
      params,
      createdAt: new Date(),
    };

    this.activeWindows.set(windowId, activeWindow);
    this.currentView = viewName;

    // Update history
    this.addToHistory(viewName);

    // Call onEnter callback
    if (view.onEnter) {
      view.onEnter(params);
    }

    return {
      success: true,
      window: activeWindow,
    };
  }

  /**
   * Close a view/window
   */
  async close(windowId: string): Promise<boolean> {
    const activeWindow = this.activeWindows.get(windowId);

    if (!activeWindow) {
      this.log('warn', `Window not found: ${windowId}`);
      return false;
    }

    const view = this.views.get(activeWindow.viewName);

    // Call onLeave callback
    if (view?.onLeave) {
      view.onLeave();
    }

    // Close actual window instance
    if (activeWindow.instance) {
      const winInstance = activeWindow.instance as any;
      if (typeof winInstance.close === 'function') {
        winInstance.close();
      }
    }

    this.activeWindows.delete(windowId);
    this.log('close', `Window closed: ${windowId}`);

    return true;
  }

  /**
   * Close all windows
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.activeWindows.keys()).map(id => this.close(id));
    await Promise.all(promises);
    this.history = [];
    this.historyIndex = -1;
    this.currentView = null;
  }

  /**
   * Go back in history
   */
  async back(): Promise<boolean> {
    if (this.historyIndex <= 0) {
      this.log('back', 'Already at beginning of history');
      return false;
    }

    this.historyIndex--;
    const viewName = this.history[this.historyIndex];
    await this.navigate(viewName);
    return true;
  }

  /**
   * Go forward in history
   */
  async forward(): Promise<boolean> {
    if (this.historyIndex >= this.history.length - 1) {
      this.log('forward', 'Already at end of history');
      return false;
    }

    this.historyIndex++;
    const viewName = this.history[this.historyIndex];
    await this.navigate(viewName);
    return true;
  }

  /**
   * Get current view name
   */
  getCurrentView(): string | null {
    return this.currentView;
  }

  /**
   * Get all active windows
   */
  getActiveWindows(): Map<string, ActiveWindow> {
    return new Map(this.activeWindows);
  }

  /**
   * Get all registered views
   */
  getRegisteredViews(): Map<string, ViewConfig> {
    return new Map(this.views);
  }

  /**
   * Check if a view is registered
   */
  hasView(viewName: string): boolean {
    return this.views.has(viewName);
  }

  /**
   * Focus a specific window
   */
  focus(windowId: string): boolean {
    const activeWindow = this.activeWindows.get(windowId);

    if (!activeWindow?.instance) {
      return false;
    }

    const winInstance = activeWindow.instance as any;
    if (typeof winInstance.focus === 'function') {
      winInstance.focus();
      return true;
    }

    return false;
  }

  /**
   * Minimize a window
   */
  minimize(windowId: string): boolean {
    const activeWindow = this.activeWindows.get(windowId);

    if (!activeWindow?.instance) {
      return false;
    }

    const winInstance = activeWindow.instance as any;
    if (typeof winInstance.minimize === 'function') {
      winInstance.minimize();
      return true;
    }

    return false;
  }

  /**
   * Update window instance for an active window
   */
  setWindowInstance(windowId: string, instance: WinBoxInstance): void {
    const activeWindow = this.activeWindows.get(windowId);
    if (activeWindow) {
      activeWindow.instance = instance;
      this.log('setInstance', `Window instance set: ${windowId}`);
    }
  }

  /**
   * Get window count
   */
  getWindowCount(): number {
    return this.activeWindows.size;
  }

  /**
   * Get history
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  private createWindowId(viewName: string): string {
    this.windowCounter++;
    return `${viewName}-${this.windowCounter}`;
  }

  private mergeWindowOptions(...options: (WindowOptions | undefined)[]): WindowOptions {
    return Object.assign({}, ...options.filter(Boolean));
  }

  private addToHistory(viewName: string): void {
    // Remove forward history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(viewName);
    this.historyIndex++;
  }

  private log(action: string, message: string, data?: unknown): void {
    if (!this.config.debug) return;
    console.log(`[WinBoxRouter] ${action}: ${message}`, data ?? '');
  }
}

/**
 * Global router instance
 */
let globalRouter: WinBoxRouter | null = null;

export function getRouter(config?: WinBoxRouterConfig): WinBoxRouter {
  if (!globalRouter) {
    globalRouter = new WinBoxRouter(config);
  }
  return globalRouter;
}

export function resetRouter(): void {
  if (globalRouter) {
    void globalRouter.closeAll();
    globalRouter = null;
  }
}

/**
 * Composable for using the router in Vue components
 */
export function useWinBoxRouter() {
  const router = getRouter();

  return {
    router,
    navigate: router.navigate.bind(router),
    close: router.close.bind(router),
    closeAll: router.closeAll.bind(router),
    back: router.back.bind(router),
    forward: router.forward.bind(router),
    getCurrentView: router.getCurrentView.bind(router),
    getActiveWindows: router.getActiveWindows.bind(router),
    getWindowCount: router.getWindowCount.bind(router),
    focus: router.focus.bind(router),
    minimize: router.minimize.bind(router),
  };
}
