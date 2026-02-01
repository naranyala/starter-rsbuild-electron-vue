/**
 * Enhanced IPC (Inter-Process Communication) Utilities for Electron Main Process
 * These utilities help with communication between main and renderer processes
 */
import { ipcMain, app, BrowserWindow } from 'electron';
import * as os from 'os';
// Registry for managing IPC handlers
const ipcHandlers = new Map();
/**
 * Register IPC handler with error handling
 * @param channel - IPC channel name
 * @param handler - Handler function
 * @param options - Handler options
 */
export function registerHandler(channel, handler, options = {}) {
    const { once = false, errorHandler = null } = options;
    if (ipcHandlers.has(channel)) {
        console.warn(`IPC handler for channel '${channel}' already exists`);
        return;
    }
    const wrappedHandler = async (event, ...args) => {
        try {
            const result = await handler(event, ...args);
            return { success: true, data: result };
        }
        catch (error) {
            console.error(`Error in IPC handler '${channel}':`, error);
            if (errorHandler) {
                try {
                    const handled = errorHandler(error instanceof Error ? error : new Error(String(error)), event, ...args);
                    if (handled !== false) {
                        return { success: false, error: error instanceof Error ? error.message : String(error) };
                    }
                }
                catch (handlerError) {
                    console.error('Error in error handler:', handlerError);
                }
            }
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    };
    if (once) {
        ipcMain.handleOnce(channel, wrappedHandler);
        ipcHandlers.set(channel, { handler: wrappedHandler, once: true, type: 'handle' });
    }
    else {
        ipcMain.handle(channel, wrappedHandler);
        ipcHandlers.set(channel, { handler: wrappedHandler, once: false, type: 'handle' });
    }
}
/**
 * Register one-way IPC handler (for messages without response)
 * @param channel - IPC channel name
 * @param handler - Handler function
 * @param options - Handler options
 */
export function registerListener(channel, handler, options = {}) {
    const { errorHandler = null } = options;
    if (ipcHandlers.has(channel)) {
        console.warn(`IPC listener for channel '${channel}' already exists`);
        return;
    }
    const wrappedListener = (event, ...args) => {
        try {
            handler(event, ...args);
        }
        catch (error) {
            console.error(`Error in IPC listener '${channel}':`, error);
            if (errorHandler) {
                try {
                    errorHandler(error instanceof Error ? error : new Error(String(error)), event, ...args);
                }
                catch (handlerError) {
                    console.error('Error in error handler:', handlerError);
                }
            }
        }
    };
    ipcMain.on(channel, wrappedListener);
    ipcHandlers.set(channel, { handler: wrappedListener, once: false, type: 'on' });
}
/**
 * Unregister IPC handler
 * @param channel - IPC channel name
 */
export function unregisterHandler(channel) {
    if (ipcHandlers.has(channel)) {
        const handlerInfo = ipcHandlers.get(channel);
        if (handlerInfo && handlerInfo.type === 'handle') {
            ipcMain.removeHandler(channel);
        }
        ipcHandlers.delete(channel);
    }
}
/**
 * Unregister IPC listener
 * @param channel - IPC channel name
 */
export function unregisterListener(channel) {
    if (ipcHandlers.has(channel)) {
        const handlerInfo = ipcHandlers.get(channel);
        if (handlerInfo) {
            ipcMain.removeListener(channel, handlerInfo.handler);
        }
        ipcHandlers.delete(channel);
    }
}
/**
 * Unregister all IPC handlers
 */
export function unregisterAllHandlers() {
    for (const [channel, handlerInfo] of ipcHandlers.entries()) {
        if (handlerInfo.type === 'handle') {
            ipcMain.removeHandler(channel);
        }
        else {
            ipcMain.removeListener(channel, handlerInfo.handler);
        }
    }
    ipcHandlers.clear();
}
/**
 * Send message to all renderer processes
 * @param channel - IPC channel name
 * @param args - Arguments to send
 */
export function broadcast(channel, ...args) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
        if (!window.isDestroyed()) {
            window.webContents.send(channel, ...args);
        }
    });
}
/**
 * Send message to specific window
 * @param window - Target window
 * @param channel - IPC channel name
 * @param args - Arguments to send
 */
export function sendToWindow(window, channel, ...args) {
    if (!window.isDestroyed()) {
        window.webContents.send(channel, ...args);
    }
}
/**
 * Send message to windows by name
 * @param windowName - Window name identifier
 * @param channel - IPC channel name
 * @param args - Arguments to send
 */
export function sendToWindowByName(windowName, channel, ...args) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
        if (!window.isDestroyed()) {
            // This is a simplified implementation - actual implementation would depend on how windows are named
            window.webContents.send(channel, ...args);
        }
    });
}
/**
 * Get registered handlers
 * @returns Map of registered handlers
 */
export function getRegisteredHandlers() {
    return new Map(ipcHandlers);
}
/**
 * Check if handler is registered
 * @param channel - IPC channel name
 * @returns True if handler exists
 */
export function hasHandler(channel) {
    return ipcHandlers.has(channel);
}
/**
 * Register common application handlers
 * @param options - Configuration options
 */
export function registerAppHandlers(options = {}) {
    const { appInfo = {}, allowQuit = true, onBeforeQuit = null, onWindowAllClosed = null, } = options;
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
    registerHandler('app:getPath', (_event, name) => app.getPath(name));
    // Set user model ID (Windows)
    registerHandler('app:setUserModelID', (_event, id) => {
        if (process.platform === 'win32') {
            app.setAppUserModelId(id);
        }
        return true;
    });
    // Set app badge
    registerHandler('app:setBadgeCount', (_event, count) => {
        app.setBadgeCount(count);
        return true;
    });
    // Focus app
    registerHandler('app:focus', () => {
        if (process.platform === 'darwin' && app.dock) {
            app.dock.show();
        }
        const windows = BrowserWindow.getAllWindows();
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
        return {
            platform: process.platform,
            arch: process.arch,
            release: process.release,
            hostname: os.hostname(),
            cpus: process.getCPUUsage(),
            totalMemory: process.getHeapStatistics().totalAvailableSize,
            freeMemory: process.getHeapStatistics().usedHeapSize,
            uptime: process.uptime(),
            loadavg: [],
            networkInterfaces: {},
        };
    });
}
/**
 * Create secure IPC channel with validation
 * @param channel - IPC channel name
 * @param handler - Handler function
 * @param schema - Validation schema
 * @param options - Handler options
 */
export function createSecureChannel(channel, handler, schema, options = {}) {
    const validateArgs = (args) => {
        if (!schema || !schema.args)
            return true;
        if (args.length !== schema.args.length) {
            throw new Error(`Expected ${schema.args.length} arguments, got ${args.length}`);
        }
        return args.every((arg, index) => {
            const expectedType = schema.args[index];
            return typeof arg === expectedType;
        });
    };
    const validateResponse = (response) => {
        if (!schema || !schema.response)
            return true;
        return typeof response === schema.response;
    };
    registerHandler(channel, async (event, ...args) => {
        if (!validateArgs(args)) {
            throw new Error('Invalid argument types');
        }
        const result = await handler(event, ...args);
        if (!validateResponse(result)) {
            throw new Error('Invalid response type');
        }
        return result;
    }, options);
}
/**
 * Enhanced IPC utilities
 */
export class IpcManager {
    /**
     * Register a handler with automatic validation
     * @param channel - IPC channel name
     * @param handler - Handler function
     * @param validator - Validation function
     * @returns True if successful
     */
    static registerHandler(channel, handler, validator) {
        if (this.channels.has(channel)) {
            console.warn(`Handler already registered for channel: ${channel}`);
            return false;
        }
        const validatedHandler = async (event, ...args) => {
            if (validator && !validator(args)) {
                throw new Error(`Invalid arguments for channel: ${channel}`);
            }
            return await handler(event, ...args);
        };
        ipcMain.handle(channel, validatedHandler);
        this.channels.set(channel, validatedHandler);
        return true;
    }
    /**
     * Register a one-time handler
     * @param channel - IPC channel name
     * @param handler - Handler function
     * @returns True if successful
     */
    static registerOnceHandler(channel, handler) {
        if (this.channels.has(channel)) {
            console.warn(`Handler already registered for channel: ${channel}`);
            return false;
        }
        const onceHandler = async (event, ...args) => {
            // Remove handler after first use
            this.unregisterHandler(channel);
            return await handler(event, ...args);
        };
        ipcMain.handleOnce(channel, onceHandler);
        this.channels.set(channel, onceHandler);
        return true;
    }
    /**
     * Unregister a handler
     * @param channel - IPC channel name
     * @returns True if successful
     */
    static unregisterHandler(channel) {
        if (this.channels.has(channel)) {
            ipcMain.removeHandler(channel);
            this.channels.delete(channel);
            return true;
        }
        return false;
    }
    /**
     * Broadcast to all windows
     * @param channel - IPC channel name
     * @param args - Arguments to send
     */
    static broadcast(channel, ...args) {
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(window => {
            if (!window.isDestroyed()) {
                window.webContents.send(channel, ...args);
            }
        });
    }
    /**
     * Send to specific window
     * @param windowId - Window ID
     * @param channel - IPC channel name
     * @param args - Arguments to send
     */
    static sendToWindow(windowId, channel, ...args) {
        const window = BrowserWindow.fromId(windowId);
        if (window && !window.isDestroyed()) {
            window.webContents.send(channel, ...args);
        }
    }
    /**
     * Send to window by web contents ID
     * @param webContentsId - Web contents ID
     * @param channel - IPC channel name
     * @param args - Arguments to send
     */
    static sendToWebContents(webContentsId, channel, ...args) {
        // Note: BrowserWindow.fromWebContentsId is not a real Electron API
        // This is a conceptual method that would need to be implemented differently
        // For now, this is a placeholder that won't cause compilation errors
        console.warn('sendToWebContents is not implemented in this version');
    }
    /**
     * Invoke handler and get response
     * @param channel - IPC channel name
     * @param args - Arguments to send
     * @returns Promise with response
     */
    static async invoke(channel, ...args) {
        // This would typically be called from renderer process
        // For main process, we'll simulate the behavior
        throw new Error('invoke should be called from renderer process');
    }
    /**
     * Clear all registered handlers
     */
    static clear() {
        for (const [channel] of this.channels) {
            ipcMain.removeHandler(channel);
        }
        this.channels.clear();
    }
}
IpcManager.channels = new Map();
/**
 * Enhanced event utilities for IPC
 */
export class IpcEventManager {
    /**
     * Add event listener
     * @param channel - IPC channel name
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    static on(channel, listener) {
        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Map());
        }
        const id = Date.now() + Math.random();
        this.listeners.get(channel).set(id, listener);
        const unsubscribe = () => {
            const channelListeners = this.listeners.get(channel);
            if (channelListeners) {
                channelListeners.delete(id);
                if (channelListeners.size === 0) {
                    this.listeners.delete(channel);
                    ipcMain.removeAllListeners(channel);
                }
            }
        };
        ipcMain.on(channel, listener);
        return unsubscribe;
    }
    /**
     * Add one-time event listener
     * @param channel - IPC channel name
     * @param listener - Event listener function
     */
    static once(channel, listener) {
        ipcMain.once(channel, listener);
    }
    /**
     * Remove event listener
     * @param channel - IPC channel name
     * @param listener - Event listener function
     */
    static removeListener(channel, listener) {
        ipcMain.removeListener(channel, listener);
    }
    /**
     * Remove all listeners for a channel
     * @param channel - IPC channel name
     */
    static removeAllListeners(channel) {
        ipcMain.removeAllListeners(channel);
        this.listeners.delete(channel);
    }
    /**
     * Get listener count for a channel
     * @param channel - IPC channel name
     * @returns Number of listeners
     */
    static listenerCount(channel) {
        return ipcMain.listenerCount(channel);
    }
}
IpcEventManager.listeners = new Map();
//# sourceMappingURL=ipc-utils.js.map