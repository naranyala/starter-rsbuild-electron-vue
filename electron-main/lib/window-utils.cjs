/**
 * Window Management Utilities for Electron Main Process
 * These utilities help with managing BrowserWindow instances
 */

const { BrowserWindow, screen, dialog, shell, Menu } = require('electron');
const path = require('path');

const windowRegistry = new Map();
let windowIdCounter = 0;

/**
 * Generate unique window ID
 * @returns {number} - Unique window ID
 */
function generateWindowId() {
  return ++windowIdCounter;
}

/**
 * Register window in registry
 * @param {BrowserWindow} window - Window instance
 * @param {string} name - Window name/identifier
 * @returns {number} - Window ID
 */
function registerWindow(window, name) {
  const windowId = generateWindowId();
  windowRegistry.set(windowId, { window, name, createdAt: new Date() });
  return windowId;
}

/**
 * Unregister window from registry
 * @param {number} windowId - Window ID
 */
function unregisterWindow(windowId) {
  windowRegistry.delete(windowId);
}

/**
 * Get window from registry
 * @param {number} windowId - Window ID
 * @returns {BrowserWindow|null} - Window instance or null
 */
function getWindow(windowId) {
  const windowData = windowRegistry.get(windowId);
  return windowData ? windowData.window : null;
}

/**
 * Get all registered windows
 * @returns {Map} - Map of all windows
 */
function getAllWindows() {
  return new Map(windowRegistry);
}

/**
 * Create a new browser window with secure default settings
 * @param {object} options - Window options
 * @returns {BrowserWindow} - Created window instance
 */
function createWindow(options = {}) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  const defaultOptions = {
    width: Math.min(1200, screenWidth - 100),
    height: Math.min(800, screenHeight - 100),
    minWidth: 800,
    minHeight: 600,
    x: 'center',
    y: 'center',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    frame: true,
    show: false, // Show only when ready
    autoHideMenuBar: false,
    icon: path.join(__dirname, '../src/assets/icons/favicon.ico'),
  };

  const windowOptions = { ...defaultOptions, ...options };
  const window = new BrowserWindow(windowOptions);

  const windowId = registerWindow(window, options.name || 'unnamed');
  window.windowId = windowId;

  return window;
}

/**
 * Create a window with secure settings for development
 * @param {object} options - Window options
 * @returns {BrowserWindow} - Created window instance
 */
function createDevWindow(options = {}) {
  const devOptions = {
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
 * @param {BrowserWindow} window - Window instance
 * @param {string} port - Development server port
 * @param {boolean} isDev - Whether in development mode
 * @param {string} devServerUrl - Custom dev server URL
 */
function loadUrl(window, port = 3000, isDev = false, devServerUrl = null) {
  const url = require('url');

  const startUrl =
    isDev && devServerUrl
      ? devServerUrl
      : isDev
        ? `http://localhost:${port}`
        : url.format({
            pathname: path.join(__dirname, '../../build/index.html'),
            protocol: 'file:',
            slashes: true,
          });

  window.loadURL(startUrl);
}

/**
 * Setup window event handlers
 * @param {BrowserWindow} window - Window instance
 * @param {boolean} isDev - Whether in development mode
 * @param {object} options - Additional options
 */
function setupWindowHandlers(window, isDev = false, options = {}) {
  const { onReady, onClosed, onUnresponsive, onResponsive } = options;

  // Show window when ready to prevent visual flash
  window.once('ready-to-show', () => {
    window.show();
    if (onReady) onReady(window);
  });

  // Open DevTools in development (only if explicitly enabled)
  if (isDev && process.env.OPEN_DEVTOOLS === 'true') {
    window.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle window close event
  window.on('closed', () => {
    unregisterWindow(window.windowId);
    if (onClosed) onClosed(window);
  });

  // Handle unresponsive events
  window.on('unresponsive', () => {
    console.log(`Window ${window.windowId} became unresponsive`);
    if (onUnresponsive) onUnresponsive(window);
  });

  // Handle responsive events
  window.on('responsive', () => {
    console.log(`Window ${window.windowId} became responsive again`);
    if (onResponsive) onResponsive(window);
  });

  // Handle navigation events
  window.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (
      parsedUrl.origin !== 'http://localhost:3000' &&
      !parsedUrl.protocol.includes('file:')
    ) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
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
 * @param {BrowserWindow} window - Parent window
 * @param {object} options - Dialog options
 * @returns {Promise<object>} - Dialog result
 */
async function showSaveDialog(window, options = {}) {
  const defaultOptions = {
    filters: [{ name: 'All Files', extensions: ['*'] }],
    properties: ['createDirectory'],
  };

  return await dialog.showSaveDialog(window, { ...defaultOptions, ...options });
}

/**
 * Show open dialog
 * @param {BrowserWindow} window - Parent window
 * @param {object} options - Dialog options
 * @returns {Promise<object>} - Dialog result
 */
async function showOpenDialog(window, options = {}) {
  const defaultOptions = {
    filters: [{ name: 'All Files', extensions: ['*'] }],
    properties: ['openFile'],
  };

  return await dialog.showOpenDialog(window, { ...defaultOptions, ...options });
}

/**
 * Center window on screen
 * @param {BrowserWindow} window - Window to center
 */
function centerWindow(window) {
  window.center();
}

/**
 * Maximize window
 * @param {BrowserWindow} window - Window to maximize
 */
function maximizeWindow(window) {
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
}

/**
 * Minimize window
 * @param {BrowserWindow} window - Window to minimize
 */
function minimizeWindow(window) {
  window.minimize();
}

/**
 * Close window
 * @param {BrowserWindow} window - Window to close
 */
function closeWindow(window) {
  if (!window.isDestroyed()) {
    window.close();
  }
}

/**
 * Get window bounds
 * @param {BrowserWindow} window - Window instance
 * @returns {object} - Window bounds {x, y, width, height}
 */
function getWindowBounds(window) {
  return window.getBounds();
}

/**
 * Set window bounds
 * @param {BrowserWindow} window - Window instance
 * @param {object} bounds - Window bounds {x, y, width, height}
 */
function setWindowBounds(window, bounds) {
  window.setBounds(bounds);
}

/**
 * Get all displays information
 * @returns {object[]} - Array of display information
 */
function getAllDisplays() {
  return screen.getAllDisplays();
}

/**
 * Get primary display information
 * @returns {object} - Primary display information
 */
function getPrimaryDisplay() {
  return screen.getPrimaryDisplay();
}

/**
 * Create application menu
 * @param {BrowserWindow} window - Window instance
 * @param {object} template - Menu template
 */
function createMenu(window, template = null) {
  if (template) {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    Menu.setApplicationMenu(null);
  }
}

/**
 * Focus window
 * @param {BrowserWindow} window - Window to focus
 */
function focusWindow(window) {
  if (!window.isDestroyed()) {
    window.focus();
  }
}

/**
 * Show window
 * @param {BrowserWindow} window - Window to show
 */
function showWindow(window) {
  if (!window.isDestroyed() && window.isMinimized()) {
    window.restore();
  }
  window.show();
  focusWindow(window);
}

/**
 * Hide window
 * @param {BrowserWindow} window - Window to hide
 */
function hideWindow(window) {
  if (!window.isDestroyed()) {
    window.hide();
  }
}

/**
 * Reload window
 * @param {BrowserWindow} window - Window to reload
 * @param {boolean} ignoreCache - Whether to ignore cache
 */
function reloadWindow(window, ignoreCache = false) {
  if (!window.isDestroyed()) {
    if (ignoreCache) {
      window.webContents.reloadIgnoringCache();
    } else {
      window.webContents.reload();
    }
  }
}

module.exports = {
  generateWindowId,
  registerWindow,
  unregisterWindow,
  getWindow,
  getAllWindows,
  createWindow,
  createDevWindow,
  loadUrl,
  setupWindowHandlers,
  showSaveDialog,
  showOpenDialog,
  centerWindow,
  maximizeWindow,
  minimizeWindow,
  closeWindow,
  getWindowBounds,
  setWindowBounds,
  getAllDisplays,
  getPrimaryDisplay,
  createMenu,
  focusWindow,
  showWindow,
  hideWindow,
  reloadWindow,
};
