/**
 * Enhanced Window Management Utilities for Electron Main Process
 * These utilities help with managing BrowserWindow instances
 */

import {
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  shell,
  Tray,
} from 'electron';
import * as os from 'os';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define types for our utilities
export interface WindowOptions
  extends Electron.BrowserWindowConstructorOptions {
  name?: string;
}

export interface WindowData {
  window: BrowserWindow;
  name: string;
  createdAt: Date;
}

export interface WindowHandlerCallbacks {
  onReady?: (window: BrowserWindow) => void;
  onClosed?: (window: BrowserWindow) => void;
  onUnresponsive?: (window: BrowserWindow) => void;
  onResponsive?: (window: BrowserWindow) => void;
}

// Registry for managing windows
const windowRegistry = new Map<number, WindowData>();
let windowIdCounter = 0;

/**
 * Generate unique window ID
 * @returns Unique window ID
 */
export function generateWindowId(): number {
  return ++windowIdCounter;
}

/**
 * Register window in registry
 * @param window - Window instance
 * @param name - Window name/identifier
 * @returns Window ID
 */
export function registerWindow(window: BrowserWindow, name: string): number {
  const windowId = generateWindowId();
  windowRegistry.set(windowId, { window, name, createdAt: new Date() });
  return windowId;
}

/**
 * Unregister window from registry
 * @param windowId - Window ID
 */
export function unregisterWindow(windowId: number): void {
  windowRegistry.delete(windowId);
}

/**
 * Get window from registry
 * @param windowId - Window ID
 * @returns Window instance or null
 */
export function getWindow(windowId: number): BrowserWindow | null {
  const windowData = windowRegistry.get(windowId);
  return windowData ? windowData.window : null;
}

/**
 * Get all registered windows
 * @returns Map of all windows
 */
export function getAllWindows(): Map<number, WindowData> {
  return new Map(windowRegistry);
}

/**
 * Create a new browser window with secure default settings
 * @param options - Window options
 * @returns Created window instance
 */
export function createWindow(options: WindowOptions = {}): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  const defaultOptions: WindowOptions = {
    width: Math.min(1200, screenWidth - 100),
    height: Math.min(800, screenHeight - 100),
    minWidth: 800,
    minHeight: 600,
    x: Math.floor((screenWidth - Math.min(1200, screenWidth - 100)) / 2),
    y: Math.floor((screenHeight - Math.min(800, screenHeight - 100)) / 2),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, '../preload.js'),
      sandbox: false,
    },
    frame: true,
    show: false, // Show only when ready
    autoHideMenuBar: false,
    icon: path.join(__dirname, '../assets/icons/icon.png'),
  };

  const windowOptions = { ...defaultOptions, ...options };
  const window = new BrowserWindow(windowOptions);

  const windowId = registerWindow(window, options.name || 'unnamed');
  (window as any).windowId = windowId;

  return window;
}

/**
 * Create a window with secure settings for development
 * @param options - Window options
 * @returns Created window instance
 */
export function createDevWindow(options: WindowOptions = {}): BrowserWindow {
  const devOptions: WindowOptions = {
    ...options,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      ...options.webPreferences,
    },
  };

  return createWindow(devOptions);
}

/**
 * Load URL into window with dev/reload handling
 * @param window - Window instance
 * @param port - Development server port (used if devServerUrl is not provided)
 * @param isDev - Whether in development mode
 * @param devServerUrl - Custom dev server URL (takes precedence over port)
 */
export function loadUrl(
  window: BrowserWindow,
  port: number = 3000,
  isDev: boolean = false,
  devServerUrl: string | null = null
): void {
  let startUrl: string;

  if (devServerUrl) {
    startUrl = devServerUrl;
  } else if (isDev) {
    startUrl = `http://localhost:${port}`;
  } else {
    startUrl = `file://${path.join(__dirname, '../../../build/index.html')}`;
  }

  console.log(`Loading URL: ${startUrl}`);
  window
    .loadURL(startUrl)
    .then(() => {
      console.log('URL loaded successfully');
    })
    .catch(err => {
      console.error('Failed to load URL:', err.message);
    });

  window.webContents.on(
    'console-message',
    (_event, _level, message, _line, _sourceId) => {
      console.log(`[Renderer] ${message}`);
    }
  );

  window.webContents.on('render-process-gone', (_event, details) => {
    console.error('Render process gone:', details.reason);
  });

  window.webContents.on('unresponsive', () => {
    console.warn('Window became unresponsive');
  });
}

/**
 * Setup window event handlers
 * @param window - Window instance
 * @param isDev - Whether in development mode
 * @param options - Additional options
 */
export function setupWindowHandlers(
  window: BrowserWindow,
  isDev: boolean = false,
  options: WindowHandlerCallbacks = {}
): void {
  const { onReady, onClosed, onUnresponsive, onResponsive } = options;

  // Show window when ready to prevent visual flash
  window.once('ready-to-show', () => {
    window.show();
    if (onReady) onReady(window);
  });

  // Open DevTools in development (only if explicitly enabled)
  if (
    isDev &&
    (process.env.OPEN_DEVTOOLS === 'true' || process.env.OPEN_DEVTOOLS === '1')
  ) {
    window.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle window close event
  window.on('closed', () => {
    unregisterWindow((window as any).windowId);
    if (onClosed) onClosed(window);
  });

  // Handle unresponsive events
  window.on('unresponsive', () => {
    console.log(`Window ${(window as any).windowId} became unresponsive`);
    if (onUnresponsive) onUnresponsive(window);
  });

  // Handle responsive events
  window.on('responsive', () => {
    console.log(`Window ${(window as any).windowId} became responsive again`);
    if (onResponsive) onResponsive(window);
  });

  // Handle navigation events - allow localhost, file://, devtools:// and chrome://
  window.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    try {
      const parsedUrl = new URL(details.url);
      // Allow all localhost origins (any port), file:// protocol, devtools:// and chrome://
      if (
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.protocol.includes('file:') ||
        parsedUrl.protocol.includes('devtools:') ||
        parsedUrl.protocol.includes('chrome:')
      ) {
        callback({});
      } else {
        callback({ cancel: true });
        shell.openExternal(details.url);
      }
    } catch (error) {
      callback({ cancel: true });
    }
  });

  // Handle new window creation
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

/**
 * Show save dialog
 * @param window - Parent window
 * @param options - Dialog options
 * @returns Promise with dialog result
 */
export async function showSaveDialog(
  window: BrowserWindow,
  options: Electron.SaveDialogOptions = {}
): Promise<Electron.SaveDialogReturnValue> {
  const defaultOptions: Electron.SaveDialogOptions = {
    filters: [{ name: 'All Files', extensions: ['*'] }],
    properties: ['createDirectory'],
  };

  return await dialog.showSaveDialog(window, { ...defaultOptions, ...options });
}

/**
 * Show open dialog
 * @param window - Parent window
 * @param options - Dialog options
 * @returns Promise with dialog result
 */
export async function showOpenDialog(
  window: BrowserWindow,
  options: Electron.OpenDialogOptions = {}
): Promise<Electron.OpenDialogReturnValue> {
  const defaultOptions: Electron.OpenDialogOptions = {
    filters: [{ name: 'All Files', extensions: ['*'] }],
    properties: ['openFile'],
  };

  return await dialog.showOpenDialog(window, { ...defaultOptions, ...options });
}

/**
 * Center window on screen
 * @param window - Window to center
 */
export function centerWindow(window: BrowserWindow): void {
  window.center();
}

/**
 * Maximize window
 * @param window - Window to maximize
 */
export function maximizeWindow(window: BrowserWindow): void {
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
}

/**
 * Minimize window
 * @param window - Window to minimize
 */
export function minimizeWindow(window: BrowserWindow): void {
  window.minimize();
}

/**
 * Close window
 * @param window - Window to close
 */
export function closeWindow(window: BrowserWindow): void {
  if (!window.isDestroyed()) {
    window.close();
  }
}

/**
 * Get window bounds
 * @param window - Window instance
 * @returns Window bounds {x, y, width, height}
 */
export function getWindowBounds(window: BrowserWindow): Electron.Rectangle {
  return window.getBounds();
}

/**
 * Set window bounds
 * @param window - Window instance
 * @param bounds - Window bounds {x, y, width, height}
 */
export function setWindowBounds(
  window: BrowserWindow,
  bounds: Electron.Rectangle
): void {
  window.setBounds(bounds);
}

/**
 * Get all displays information
 * @returns Array of display information
 */
export function getAllDisplays(): Electron.Display[] {
  return screen.getAllDisplays();
}

/**
 * Get primary display information
 * @returns Primary display information
 */
export function getPrimaryDisplay(): Electron.Display {
  return screen.getPrimaryDisplay();
}

/**
 * Create application menu
 * @param template - Menu template
 */
export function createMenu(
  template: Electron.MenuItemConstructorOptions[] | null = null
): void {
  const menu = template ? Menu.buildFromTemplate(template) : null;
  Menu.setApplicationMenu(menu);
}

/**
 * Focus window
 * @param window - Window to focus
 */
export function focusWindow(window: BrowserWindow): void {
  if (!window.isDestroyed()) {
    window.focus();
  }
}

/**
 * Show window
 * @param window - Window to show
 */
export function showWindow(window: BrowserWindow): void {
  if (!window.isDestroyed() && window.isMinimized()) {
    window.restore();
  }
  window.show();
  focusWindow(window);
}

/**
 * Hide window
 * @param window - Window to hide
 */
export function hideWindow(window: BrowserWindow): void {
  if (!window.isDestroyed()) {
    window.hide();
  }
}

/**
 * Reload window
 * @param window - Window to reload
 * @param ignoreCache - Whether to ignore cache
 */
export function reloadWindow(
  window: BrowserWindow,
  ignoreCache: boolean = false
): void {
  if (!window.isDestroyed()) {
    if (ignoreCache) {
      window.webContents.reloadIgnoringCache();
    } else {
      window.webContents.reload();
    }
  }
}

/**
 * Flash window frame
 * @param window - Window to flash
 * @param flag - Whether to start or stop flashing
 */
export function flashWindow(window: BrowserWindow, flag: boolean = true): void {
  window.flashFrame(flag);
}

/**
 * Set window always on top
 * @param window - Window to modify
 * @param flag - Whether to set always on top
 * @param level - Level of priority
 */
export function setAlwaysOnTop(
  window: BrowserWindow,
  flag: boolean = true,
  level?:
    | 'normal'
    | 'floating'
    | 'torn-off-menu'
    | 'modal-panel'
    | 'main-menu'
    | 'status'
    | 'pop-up-menu'
    | 'screen-saver'
): void {
  window.setAlwaysOnTop(flag, level);
}

/**
 * Set window to fullscreen
 * @param window - Window to modify
 * @param flag - Whether to set fullscreen
 */
export function setFullscreen(
  window: BrowserWindow,
  flag: boolean = true
): void {
  window.setFullScreen(flag);
}

/**
 * Set window to kiosk mode
 * @param window - Window to modify
 * @param flag - Whether to set kiosk mode
 */
export function setKiosk(window: BrowserWindow, flag: boolean = true): void {
  window.setKiosk(flag);
}

/**
 * Set window title
 * @param window - Window to modify
 * @param title - New title
 */
export function setWindowTitle(window: BrowserWindow, title: string): void {
  window.setTitle(title);
}

/**
 * Set window icon
 * @param window - Window to modify
 * @param icon - Icon path or native image
 */
export function setWindowIcon(
  window: BrowserWindow,
  icon: string | Electron.NativeImage
): void {
  window.setIcon(icon);
}

/**
 * Set window background color
 * @param window - Window to modify
 * @param color - Background color
 */
export function setWindowBackgroundColor(
  window: BrowserWindow,
  color: string
): void {
  window.setBackgroundColor(color);
}

/**
 * Set window opacity
 * @param window - Window to modify
 * @param opacity - Opacity value (0.0 - 1.0)
 */
export function setWindowOpacity(window: BrowserWindow, opacity: number): void {
  window.setOpacity(opacity);
}

/**
 * Create a system tray icon
 * @param iconPath - Path to the icon
 * @param tooltip - Tooltip text
 * @param menu - Context menu
 * @returns Tray instance
 */
export function createTray(
  iconPath: string,
  tooltip: string,
  menu?: Electron.Menu
): Tray {
  const tray = new Tray(iconPath);
  tray.setToolTip(tooltip);

  if (menu) {
    tray.setContextMenu(menu);
  }

  return tray;
}

/**
 * Create a native image from path
 * @param imagePath - Path to the image
 * @returns Native image
 */
export function createNativeImage(imagePath: string): Electron.NativeImage {
  return nativeImage.createFromPath(imagePath);
}

/**
 * Create a native image from buffer
 * @param buffer - Image buffer
 * @returns Native image
 */
export function createNativeImageFromBuffer(
  buffer: Buffer
): Electron.NativeImage {
  return nativeImage.createFromBuffer(buffer);
}

/**
 * Enhanced window management utilities
 */
export class WindowManager {
  private static windows: Map<string, BrowserWindow> = new Map();

  /**
   * Create and register a window
   * @param name - Window name
   * @param options - Window options
   * @returns Created window
   */
  static create(name: string, options: WindowOptions = {}): BrowserWindow {
    const window = createWindow({ ...options, name });
    WindowManager.windows.set(name, window);

    // Clean up when window is closed
    window.on('closed', () => {
      WindowManager.windows.delete(name);
    });

    return window;
  }

  /**
   * Get a registered window by name
   * @param name - Window name
   * @returns Window instance or null
   */
  static get(name: string): BrowserWindow | null {
    return WindowManager.windows.get(name) || null;
  }

  /**
   * Get all registered windows
   * @returns Map of all windows
   */
  static getAll(): Map<string, BrowserWindow> {
    return new Map(WindowManager.windows);
  }

  /**
   * Close a registered window
   * @param name - Window name
   * @returns True if successful
   */
  static close(name: string): boolean {
    const window = WindowManager.windows.get(name);
    if (window) {
      window.close();
      return true;
    }
    return false;
  }

  /**
   * Close all registered windows
   */
  static closeAll(): void {
    for (const [name, window] of WindowManager.windows) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
    WindowManager.windows.clear();
  }

  /**
   * Focus a registered window
   * @param name - Window name
   * @returns True if successful
   */
  static focus(name: string): boolean {
    const window = WindowManager.windows.get(name);
    if (window && !window.isDestroyed()) {
      window.focus();
      return true;
    }
    return false;
  }

  /**
   * Show a registered window
   * @param name - Window name
   * @returns True if successful
   */
  static show(name: string): boolean {
    const window = WindowManager.windows.get(name);
    if (window && !window.isDestroyed()) {
      showWindow(window);
      return true;
    }
    return false;
  }

  /**
   * Hide a registered window
   * @param name - Window name
   * @returns True if successful
   */
  static hide(name: string): boolean {
    const window = WindowManager.windows.get(name);
    if (window && !window.isDestroyed()) {
      hideWindow(window);
      return true;
    }
    return false;
  }

  /**
   * Reload a registered window
   * @param name - Window name
   * @param ignoreCache - Whether to ignore cache
   * @returns True if successful
   */
  static reload(name: string, ignoreCache: boolean = false): boolean {
    const window = WindowManager.windows.get(name);
    if (window && !window.isDestroyed()) {
      reloadWindow(window, ignoreCache);
      return true;
    }
    return false;
  }
}

/**
 * Enhanced dialog utilities
 */
export class DialogManager {
  /**
   * Show a message box with custom options
   * @param options - Message box options
   * @returns Promise with button index
   */
  static async showMessage(
    options: Electron.MessageBoxOptions
  ): Promise<Electron.MessageBoxReturnValue> {
    return await dialog.showMessageBox(options);
  }

  /**
   * Show an error message
   * @param title - Dialog title
   * @param message - Error message
   * @returns Promise with button index
   */
  static async showError(title: string, message: string): Promise<void> {
    await dialog.showErrorBox(title, message);
  }

  /**
   * Show an information dialog
   * @param message - Information message
   * @param detail - Additional details
   * @returns Promise with button index
   */
  static async showInfo(
    message: string,
    detail?: string
  ): Promise<Electron.MessageBoxReturnValue> {
    return await DialogManager.showMessage({
      type: 'info',
      message,
      detail,
      buttons: ['OK'],
    });
  }

  /**
   * Show a confirmation dialog
   * @param message - Confirmation message
   * @param detail - Additional details
   * @returns Promise with confirmation result
   */
  static async showConfirmation(
    message: string,
    detail?: string
  ): Promise<boolean> {
    const result = await DialogManager.showMessage({
      type: 'question',
      message,
      detail,
      buttons: ['Yes', 'No'],
      defaultId: 0,
    });
    return result.response === 0; // Yes button
  }
}

/**
 * Enhanced menu utilities
 */
export class MenuManager {
  /**
   * Create a context menu
   * @param template - Menu template
   * @returns Menu instance
   */
  static createContextMenu(
    template: Electron.MenuItemConstructorOptions[]
  ): Menu {
    return Menu.buildFromTemplate(template);
  }

  /**
   * Show a context menu at specific coordinates
   * @param template - Menu template
   * @param window - Window to show menu in
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  static showContextMenu(
    template: Electron.MenuItemConstructorOptions[],
    window: BrowserWindow,
    x?: number,
    y?: number
  ): void {
    const menu = MenuManager.createContextMenu(template);
    menu.popup({ window, x, y });
  }

  /**
   * Create a system menu
   * @param template - Menu template
   */
  static setSystemMenu(
    template: Electron.MenuItemConstructorOptions[] | null
  ): void {
    const menu = template ? Menu.buildFromTemplate(template) : null;
    Menu.setApplicationMenu(menu);
  }
}
