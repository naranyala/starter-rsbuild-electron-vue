/**
 * IPC (Inter-Process Communication) Utilities for Electron Main Process
 * These utilities help with communication between main and renderer processes
 */

const { ipcMain, app } = require('electron');

const ipcHandlers = new Map();

/**
 * Register IPC handler with error handling
 * @param {string} channel - IPC channel name
 * @param {Function} handler - Handler function
 * @param {object} options - Handler options
 */
function registerHandler(channel, handler, options = {}) {
  const { once = false, errorHandler = null } = options;

  if (ipcHandlers.has(channel)) {
    console.warn(`IPC handler for channel '${channel}' already exists`);
    return;
  }

  const wrappedHandler = async (event, ...args) => {
    try {
      const result = await handler(event, ...args);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error in IPC handler '${channel}':`, error);

      if (errorHandler) {
        try {
          const handled = errorHandler(error, event, ...args);
          if (handled !== false) {
            return { success: false, error: error.message };
          }
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      }

      return { success: false, error: error.message };
    }
  };

  if (once) {
    ipcMain.handleOnce(channel, wrappedHandler);
    ipcHandlers.set(channel, { handler: wrappedHandler, once: true });
  } else {
    ipcMain.handle(channel, wrappedHandler);
    ipcHandlers.set(channel, { handler: wrappedHandler, once: false });
  }
}

/**
 * Register one-way IPC handler (for messages without response)
 * @param {string} channel - IPC channel name
 * @param {Function} handler - Handler function
 * @param {object} options - Handler options
 */
function registerListener(channel, handler, options = {}) {
  const { errorHandler = null } = options;

  if (ipcHandlers.has(channel)) {
    console.warn(`IPC listener for channel '${channel}' already exists`);
    return;
  }

  const wrappedListener = (event, ...args) => {
    try {
      handler(event, ...args);
    } catch (error) {
      console.error(`Error in IPC listener '${channel}':`, error);

      if (errorHandler) {
        try {
          errorHandler(error, event, ...args);
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      }
    }
  };

  ipcMain.on(channel, wrappedListener);
  ipcHandlers.set(channel, { handler: wrappedListener, once: false });
}

/**
 * Unregister IPC handler
 * @param {string} channel - IPC channel name
 */
function unregisterHandler(channel) {
  if (ipcHandlers.has(channel)) {
    ipcMain.removeHandler(channel);
    ipcHandlers.delete(channel);
  }
}

/**
 * Unregister IPC listener
 * @param {string} channel - IPC channel name
 */
function unregisterListener(channel) {
  if (ipcHandlers.has(channel)) {
    ipcMain.removeListener(channel, ipcHandlers.get(channel).handler);
    ipcHandlers.delete(channel);
  }
}

/**
 * Unregister all IPC handlers
 */
function unregisterAllHandlers() {
  for (const channel of ipcHandlers.keys()) {
    if (channel.startsWith('handle:')) {
      ipcMain.removeHandler(channel);
    } else {
      ipcMain.removeAllListeners(channel);
    }
  }
  ipcHandlers.clear();
}

/**
 * Send message to all renderer processes
 * @param {string} channel - IPC channel name
 * @param {...any} args - Arguments to send
 */
function broadcast(channel, ...args) {
  const windows = require('electron').BrowserWindow.getAllWindows();
  windows.forEach(window => {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, ...args);
    }
  });
}

/**
 * Send message to specific window
 * @param {BrowserWindow} window - Target window
 * @param {string} channel - IPC channel name
 * @param {...any} args - Arguments to send
 */
function sendToWindow(window, channel, ...args) {
  if (!window.isDestroyed()) {
    window.webContents.send(channel, ...args);
  }
}

/**
 * Send message to windows by name
 * @param {string} windowName - Window name identifier
 * @param {string} channel - IPC channel name
 * @param {...any} args - Arguments to send
 */
function sendToWindowByName(windowName, channel, ...args) {
  const windowUtils = require('./window-utils');
  const allWindows = windowUtils.getAllWindows();

  allWindows.forEach(({ window, name }) => {
    if (name === windowName && !window.isDestroyed()) {
      window.webContents.send(channel, ...args);
    }
  });
}

/**
 * Get registered handlers
 * @returns {Map} - Map of registered handlers
 */
function getRegisteredHandlers() {
  return new Map(ipcHandlers);
}

/**
 * Check if handler is registered
 * @param {string} channel - IPC channel name
 * @returns {boolean} - True if handler exists
 */
function hasHandler(channel) {
  return ipcHandlers.has(channel);
}

/**
 * Register common application handlers
 * @param {object} options - Configuration options
 */
function registerAppHandlers(options = {}) {
  const {
    appInfo = {},
    allowQuit = true,
    onBeforeQuit = null,
    onWindowAllClosed = null,
  } = options;

  // Get app information
  registerHandler('app:getInfo', () => ({
    name: app.getName(),
    version: app.getVersion(),
    path: app.getAppPath(),
    platform: process.platform,
    arch: process.arch,
    ...appInfo,
  }));

  // Get app path
  registerHandler('app:getPath', (event, name) => app.getPath(name));

  // Set user model ID (Windows)
  registerHandler('app:setUserModelID', (event, id) => {
    if (process.platform === 'win32') {
      app.setUserModelID(id);
    }
    return true;
  });

  // Set app badge
  registerHandler('app:setBadgeCount', (event, count) => {
    app.setBadgeCount(count);
    return true;
  });

  // Focus app
  registerHandler('app:focus', () => {
    if (process.platform === 'darwin') {
      app.dock.show();
    }
    const windows = require('electron').BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      windows[0].focus();
    }
    return true;
  });

  // Quit app
  registerHandler('app:quit', () => {
    if (allowQuit) {
      if (onBeforeQuit) {
        onBeforeQuit();
      }
      app.quit();
    }
    return allowQuit;
  });

  // Get system info
  registerHandler('system:getInfo', () => {
    const os = require('os');
    return {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      cpus: os.cpus(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      networkInterfaces: os.networkInterfaces(),
    };
  });
}

/**
 * Create secure IPC channel with validation
 * @param {string} channel - IPC channel name
 * @param {Function} handler - Handler function
 * @param {object} schema - Validation schema
 * @param {object} options - Handler options
 */
function createSecureChannel(channel, handler, schema, options = {}) {
  const validateArgs = args => {
    if (!schema || !schema.args) return true;

    if (args.length !== schema.args.length) {
      throw new Error(
        `Expected ${schema.args.length} arguments, got ${args.length}`
      );
    }

    return args.every((arg, index) => {
      const expectedType = schema.args[index];
      return typeof arg === expectedType;
    });
  };

  const validateResponse = response => {
    if (!schema || !schema.response) return true;
    return typeof response === schema.response;
  };

  registerHandler(
    channel,
    async (event, ...args) => {
      if (!validateArgs(args)) {
        throw new Error('Invalid argument types');
      }

      const result = await handler(event, ...args);

      if (!validateResponse(result)) {
        throw new Error('Invalid response type');
      }

      return result;
    },
    options
  );
}

module.exports = {
  registerHandler,
  registerListener,
  unregisterHandler,
  unregisterListener,
  unregisterAllHandlers,
  broadcast,
  sendToWindow,
  sendToWindowByName,
  getRegisteredHandlers,
  hasHandler,
  registerAppHandlers,
  createSecureChannel,
};
