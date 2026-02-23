import type { BrowserWindow, BrowserWindowConstructorOptions, Menu } from 'electron';
import {
  centerWindow,
  closeWindow,
  createMenu,
  createWindow as createWindowUtil,
  focusWindow,
  generateWindowId,
  getAllDisplays,
  getAllWindows,
  getPrimaryDisplay,
  getWindow,
  getWindowBounds,
  hideWindow,
  loadUrl as loadUrlUtil,
  maximizeWindow,
  minimizeWindow,
  registerWindow,
  reloadWindow,
  setupWindowHandlers as setupWindowHandlersUtil,
  setWindowBounds,
  showOpenDialog,
  showSaveDialog,
  showWindow,
  unregisterWindow,
} from '../lib/window-utils';

/**
 * Window configuration options
 */
export interface WindowConfig {
  name: string;
  webPreferences?: BrowserWindowConstructorOptions['webPreferences'];
}

/**
 * Window handler callbacks
 */
export interface WindowHandlerCallbacks {
  onReady?: (window: BrowserWindow) => void;
  onClosed?: (window: BrowserWindow) => void;
}

/**
 * Service for managing Electron windows
 * No decorators - plain TypeScript class
 */
export class WindowServiceInstance {
  private windows = new Map<string, BrowserWindow>();

  /**
   * Create a new window
   */
  create(options: WindowConfig): BrowserWindow {
    return createWindowUtil(options);
  }

  /**
   * Load URL into a window
   */
  loadUrl(window: BrowserWindow, port: number, serve: boolean): void {
    loadUrlUtil(window, port, serve);
  }

  /**
   * Setup window handlers
   */
  setupHandlers(
    window: BrowserWindow,
    serve: boolean,
    callbacks?: WindowHandlerCallbacks
  ): void {
    setupWindowHandlersUtil(window, serve, callbacks);
  }

  /**
   * Center a window on screen
   */
  center(window: BrowserWindow): void {
    centerWindow(window);
  }

  /**
   * Maximize a window
   */
  maximize(window: BrowserWindow): void {
    maximizeWindow(window);
  }

  /**
   * Minimize a window
   */
  minimize(window: BrowserWindow): void {
    minimizeWindow(window);
  }

  /**
   * Close a window
   */
  close(window: BrowserWindow): void {
    closeWindow(window);
  }

  /**
   * Show a window
   */
  show(window: BrowserWindow): void {
    showWindow(window);
  }

  /**
   * Hide a window
   */
  hide(window: BrowserWindow): void {
    hideWindow(window);
  }

  /**
   * Focus a window
   */
  focus(window: BrowserWindow): void {
    focusWindow(window);
  }

  /**
   * Reload a window
   */
  reload(window: BrowserWindow): void {
    reloadWindow(window);
  }

  /**
   * Get window bounds
   */
  getBounds(window: BrowserWindow): Electron.Rectangle {
    return getWindowBounds(window);
  }

  /**
   * Set window bounds
   */
  setBounds(window: BrowserWindow, bounds: Electron.Rectangle): void {
    setWindowBounds(window, bounds);
  }

  /**
   * Get all displays
   */
  getAllDisplays(): Electron.Display[] {
    return getAllDisplays();
  }

  /**
   * Get primary display
   */
  getPrimaryDisplay(): Electron.Display {
    return getPrimaryDisplay();
  }

  /**
   * Create menu
   */
  createMenu(): Menu {
    return createMenu([]);
  }

  /**
   * Show open dialog
   */
  showOpenDialog(window: BrowserWindow, options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
    return showOpenDialog(window, options);
  }

  /**
   * Show save dialog
   */
  showSaveDialog(window: BrowserWindow, options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> {
    return showSaveDialog(window, options);
  }

  /**
   * Get all windows
   */
  getAll(): BrowserWindow[] {
    return getAllWindows();
  }

  /**
   * Get window by id
   */
  get(id: number): BrowserWindow | undefined {
    return getWindow(id) ?? undefined;
  }

  /**
   * Register a window
   */
  register(name: string, window: BrowserWindow): void {
    registerWindow(name, window);
    this.windows.set(name, window);
  }

  /**
   * Unregister a window
   */
  unregister(name: string): void {
    unregisterWindow(name);
    this.windows.delete(name);
  }

  /**
   * Generate a unique window ID
   */
  generateId(): string {
    return generateWindowId();
  }

  /**
   * Get a tracked window by name
   */
  getTracked(name: string): BrowserWindow | null {
    return this.windows.get(name) ?? null;
  }

  /**
   * Get all tracked windows
   */
  getTrackedWindows(): Map<string, BrowserWindow> {
    return new Map(this.windows);
  }
}

// Keep static class for backward compatibility
export const WindowService = {
  create: createWindowUtil,
  loadUrl: loadUrlUtil,
  setupHandlers: setupWindowHandlersUtil,
  center: centerWindow,
  maximize: maximizeWindow,
  minimize: minimizeWindow,
  close: closeWindow,
  show: showWindow,
  hide: hideWindow,
  focus: focusWindow,
  reload: reloadWindow,
  getBounds: getWindowBounds,
  setBounds: setWindowBounds,
  getAllDisplays: getAllDisplays,
  getPrimaryDisplay: getPrimaryDisplay,
  createMenu: createMenu,
  showOpenDialog: showOpenDialog,
  showSaveDialog: showSaveDialog,
  getAll: getAllWindows,
  get: getWindow,
  register: registerWindow,
  unregister: unregisterWindow,
  generateId: generateWindowId,
};
