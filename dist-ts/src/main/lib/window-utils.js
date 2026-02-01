/**
 * Enhanced Window Management Utilities for Electron Main Process
 * These utilities help with managing BrowserWindow instances
 */
import { BrowserWindow, screen, dialog, shell, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Registry for managing windows
const windowRegistry = new Map();
let windowIdCounter = 0;
/**
 * Generate unique window ID
 * @returns Unique window ID
 */
export function generateWindowId() {
    return ++windowIdCounter;
}
/**
 * Register window in registry
 * @param window - Window instance
 * @param name - Window name/identifier
 * @returns Window ID
 */
export function registerWindow(window, name) {
    const windowId = generateWindowId();
    windowRegistry.set(windowId, { window, name, createdAt: new Date() });
    return windowId;
}
/**
 * Unregister window from registry
 * @param windowId - Window ID
 */
export function unregisterWindow(windowId) {
    windowRegistry.delete(windowId);
}
/**
 * Get window from registry
 * @param windowId - Window ID
 * @returns Window instance or null
 */
export function getWindow(windowId) {
    const windowData = windowRegistry.get(windowId);
    return windowData ? windowData.window : null;
}
/**
 * Get all registered windows
 * @returns Map of all windows
 */
export function getAllWindows() {
    return new Map(windowRegistry);
}
/**
 * Create a new browser window with secure default settings
 * @param options - Window options
 * @returns Created window instance
 */
export function createWindow(options = {}) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const defaultOptions = {
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
            preload: path.join(__dirname, '../dist-ts/preload.js'),
        },
        frame: true,
        show: false, // Show only when ready
        autoHideMenuBar: false,
        icon: path.join(__dirname, '../assets/icons/icon.png'),
    };
    const windowOptions = { ...defaultOptions, ...options };
    const window = new BrowserWindow(windowOptions);
    const windowId = registerWindow(window, options.name || 'unnamed');
    window.windowId = windowId;
    return window;
}
/**
 * Create a window with secure settings for development
 * @param options - Window options
 * @returns Created window instance
 */
export function createDevWindow(options = {}) {
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
 * @param window - Window instance
 * @param port - Development server port
 * @param isDev - Whether in development mode
 * @param devServerUrl - Custom dev server URL
 */
export function loadUrl(window, port = 3000, isDev = false, devServerUrl = null) {
    const startUrl = devServerUrl || (isDev ? `http://localhost:${port}` : `file://${path.join(__dirname, '../../../build/index.html')}`);
    window.loadURL(startUrl);
}
/**
 * Setup window event handlers
 * @param window - Window instance
 * @param isDev - Whether in development mode
 * @param options - Additional options
 */
export function setupWindowHandlers(window, isDev = false, options = {}) {
    const { onReady, onClosed, onUnresponsive, onResponsive } = options;
    // Show window when ready to prevent visual flash
    window.once('ready-to-show', () => {
        window.show();
        if (onReady)
            onReady(window);
    });
    // Open DevTools in development (only if explicitly enabled)
    if (isDev && process.env.OPEN_DEVTOOLS === 'true') {
        window.webContents.openDevTools({ mode: 'detach' });
    }
    // Handle window close event
    window.on('closed', () => {
        unregisterWindow(window.windowId);
        if (onClosed)
            onClosed(window);
    });
    // Handle unresponsive events
    window.on('unresponsive', () => {
        console.log(`Window ${window.windowId} became unresponsive`);
        if (onUnresponsive)
            onUnresponsive(window);
    });
    // Handle responsive events
    window.on('responsive', () => {
        console.log(`Window ${window.windowId} became responsive again`);
        if (onResponsive)
            onResponsive(window);
    });
    // Handle navigation events
    window.webContents.session.webRequest.onBeforeRequest((details, callback) => {
        try {
            const parsedUrl = new URL(details.url);
            if (parsedUrl.origin !== 'http://localhost:3000' &&
                !parsedUrl.protocol.includes('file:')) {
                callback({ cancel: true });
                shell.openExternal(details.url);
            }
            else {
                callback({});
            }
        }
        catch (error) {
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
export async function showSaveDialog(window, options = {}) {
    const defaultOptions = {
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
export async function showOpenDialog(window, options = {}) {
    const defaultOptions = {
        filters: [{ name: 'All Files', extensions: ['*'] }],
        properties: ['openFile'],
    };
    return await dialog.showOpenDialog(window, { ...defaultOptions, ...options });
}
/**
 * Center window on screen
 * @param window - Window to center
 */
export function centerWindow(window) {
    window.center();
}
/**
 * Maximize window
 * @param window - Window to maximize
 */
export function maximizeWindow(window) {
    if (window.isMaximized()) {
        window.unmaximize();
    }
    else {
        window.maximize();
    }
}
/**
 * Minimize window
 * @param window - Window to minimize
 */
export function minimizeWindow(window) {
    window.minimize();
}
/**
 * Close window
 * @param window - Window to close
 */
export function closeWindow(window) {
    if (!window.isDestroyed()) {
        window.close();
    }
}
/**
 * Get window bounds
 * @param window - Window instance
 * @returns Window bounds {x, y, width, height}
 */
export function getWindowBounds(window) {
    return window.getBounds();
}
/**
 * Set window bounds
 * @param window - Window instance
 * @param bounds - Window bounds {x, y, width, height}
 */
export function setWindowBounds(window, bounds) {
    window.setBounds(bounds);
}
/**
 * Get all displays information
 * @returns Array of display information
 */
export function getAllDisplays() {
    return screen.getAllDisplays();
}
/**
 * Get primary display information
 * @returns Primary display information
 */
export function getPrimaryDisplay() {
    return screen.getPrimaryDisplay();
}
/**
 * Create application menu
 * @param template - Menu template
 */
export function createMenu(template = null) {
    const menu = template ? Menu.buildFromTemplate(template) : null;
    Menu.setApplicationMenu(menu);
}
/**
 * Focus window
 * @param window - Window to focus
 */
export function focusWindow(window) {
    if (!window.isDestroyed()) {
        window.focus();
    }
}
/**
 * Show window
 * @param window - Window to show
 */
export function showWindow(window) {
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
export function hideWindow(window) {
    if (!window.isDestroyed()) {
        window.hide();
    }
}
/**
 * Reload window
 * @param window - Window to reload
 * @param ignoreCache - Whether to ignore cache
 */
export function reloadWindow(window, ignoreCache = false) {
    if (!window.isDestroyed()) {
        if (ignoreCache) {
            window.webContents.reloadIgnoringCache();
        }
        else {
            window.webContents.reload();
        }
    }
}
/**
 * Flash window frame
 * @param window - Window to flash
 * @param flag - Whether to start or stop flashing
 */
export function flashWindow(window, flag = true) {
    window.flashFrame(flag);
}
/**
 * Set window always on top
 * @param window - Window to modify
 * @param flag - Whether to set always on top
 * @param level - Level of priority
 */
export function setAlwaysOnTop(window, flag = true, level) {
    window.setAlwaysOnTop(flag, level);
}
/**
 * Set window to fullscreen
 * @param window - Window to modify
 * @param flag - Whether to set fullscreen
 */
export function setFullscreen(window, flag = true) {
    window.setFullScreen(flag);
}
/**
 * Set window to kiosk mode
 * @param window - Window to modify
 * @param flag - Whether to set kiosk mode
 */
export function setKiosk(window, flag = true) {
    window.setKiosk(flag);
}
/**
 * Set window title
 * @param window - Window to modify
 * @param title - New title
 */
export function setWindowTitle(window, title) {
    window.setTitle(title);
}
/**
 * Set window icon
 * @param window - Window to modify
 * @param icon - Icon path or native image
 */
export function setWindowIcon(window, icon) {
    window.setIcon(icon);
}
/**
 * Set window background color
 * @param window - Window to modify
 * @param color - Background color
 */
export function setWindowBackgroundColor(window, color) {
    window.setBackgroundColor(color);
}
/**
 * Set window opacity
 * @param window - Window to modify
 * @param opacity - Opacity value (0.0 - 1.0)
 */
export function setWindowOpacity(window, opacity) {
    window.setOpacity(opacity);
}
/**
 * Create a system tray icon
 * @param iconPath - Path to the icon
 * @param tooltip - Tooltip text
 * @param menu - Context menu
 * @returns Tray instance
 */
export function createTray(iconPath, tooltip, menu) {
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
export function createNativeImage(imagePath) {
    return nativeImage.createFromPath(imagePath);
}
/**
 * Create a native image from buffer
 * @param buffer - Image buffer
 * @returns Native image
 */
export function createNativeImageFromBuffer(buffer) {
    return nativeImage.createFromBuffer(buffer);
}
/**
 * Enhanced window management utilities
 */
export class WindowManager {
    /**
     * Create and register a window
     * @param name - Window name
     * @param options - Window options
     * @returns Created window
     */
    static create(name, options = {}) {
        const window = createWindow({ ...options, name });
        this.windows.set(name, window);
        // Clean up when window is closed
        window.on('closed', () => {
            this.windows.delete(name);
        });
        return window;
    }
    /**
     * Get a registered window by name
     * @param name - Window name
     * @returns Window instance or null
     */
    static get(name) {
        return this.windows.get(name) || null;
    }
    /**
     * Get all registered windows
     * @returns Map of all windows
     */
    static getAll() {
        return new Map(this.windows);
    }
    /**
     * Close a registered window
     * @param name - Window name
     * @returns True if successful
     */
    static close(name) {
        const window = this.windows.get(name);
        if (window) {
            window.close();
            return true;
        }
        return false;
    }
    /**
     * Close all registered windows
     */
    static closeAll() {
        for (const [name, window] of this.windows) {
            if (!window.isDestroyed()) {
                window.close();
            }
        }
        this.windows.clear();
    }
    /**
     * Focus a registered window
     * @param name - Window name
     * @returns True if successful
     */
    static focus(name) {
        const window = this.windows.get(name);
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
    static show(name) {
        const window = this.windows.get(name);
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
    static hide(name) {
        const window = this.windows.get(name);
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
    static reload(name, ignoreCache = false) {
        const window = this.windows.get(name);
        if (window && !window.isDestroyed()) {
            reloadWindow(window, ignoreCache);
            return true;
        }
        return false;
    }
}
WindowManager.windows = new Map();
/**
 * Enhanced dialog utilities
 */
export class DialogManager {
    /**
     * Show a message box with custom options
     * @param options - Message box options
     * @returns Promise with button index
     */
    static async showMessage(options) {
        return await dialog.showMessageBox(options);
    }
    /**
     * Show an error message
     * @param title - Dialog title
     * @param message - Error message
     * @returns Promise with button index
     */
    static async showError(title, message) {
        await dialog.showErrorBox(title, message);
    }
    /**
     * Show an information dialog
     * @param message - Information message
     * @param detail - Additional details
     * @returns Promise with button index
     */
    static async showInfo(message, detail) {
        return await this.showMessage({
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
    static async showConfirmation(message, detail) {
        const result = await this.showMessage({
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
    static createContextMenu(template) {
        return Menu.buildFromTemplate(template);
    }
    /**
     * Show a context menu at specific coordinates
     * @param template - Menu template
     * @param window - Window to show menu in
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    static showContextMenu(template, window, x, y) {
        const menu = this.createContextMenu(template);
        menu.popup({ window, x, y });
    }
    /**
     * Create a system menu
     * @param template - Menu template
     */
    static setSystemMenu(template) {
        const menu = template ? Menu.buildFromTemplate(template) : null;
        Menu.setApplicationMenu(menu);
    }
}
//# sourceMappingURL=window-utils.js.map