/**
 * Enhanced Window Management Utilities for Electron Main Process
 * These utilities help with managing BrowserWindow instances
 */
import { BrowserWindow, Menu, Tray } from 'electron';
export interface WindowOptions extends Electron.BrowserWindowConstructorOptions {
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
/**
 * Generate unique window ID
 * @returns Unique window ID
 */
export declare function generateWindowId(): number;
/**
 * Register window in registry
 * @param window - Window instance
 * @param name - Window name/identifier
 * @returns Window ID
 */
export declare function registerWindow(window: BrowserWindow, name: string): number;
/**
 * Unregister window from registry
 * @param windowId - Window ID
 */
export declare function unregisterWindow(windowId: number): void;
/**
 * Get window from registry
 * @param windowId - Window ID
 * @returns Window instance or null
 */
export declare function getWindow(windowId: number): BrowserWindow | null;
/**
 * Get all registered windows
 * @returns Map of all windows
 */
export declare function getAllWindows(): Map<number, WindowData>;
/**
 * Create a new browser window with secure default settings
 * @param options - Window options
 * @returns Created window instance
 */
export declare function createWindow(options?: WindowOptions): BrowserWindow;
/**
 * Create a window with secure settings for development
 * @param options - Window options
 * @returns Created window instance
 */
export declare function createDevWindow(options?: WindowOptions): BrowserWindow;
/**
 * Load URL into window with dev/reload handling
 * @param window - Window instance
 * @param port - Development server port (used if devServerUrl is not provided)
 * @param isDev - Whether in development mode
 * @param devServerUrl - Custom dev server URL (takes precedence over port)
 */
export declare function loadUrl(window: BrowserWindow, port?: number, isDev?: boolean, devServerUrl?: string | null): void;
/**
 * Setup window event handlers
 * @param window - Window instance
 * @param isDev - Whether in development mode
 * @param options - Additional options
 */
export declare function setupWindowHandlers(window: BrowserWindow, isDev?: boolean, options?: WindowHandlerCallbacks): void;
/**
 * Show save dialog
 * @param window - Parent window
 * @param options - Dialog options
 * @returns Promise with dialog result
 */
export declare function showSaveDialog(window: BrowserWindow, options?: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
/**
 * Show open dialog
 * @param window - Parent window
 * @param options - Dialog options
 * @returns Promise with dialog result
 */
export declare function showOpenDialog(window: BrowserWindow, options?: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
/**
 * Center window on screen
 * @param window - Window to center
 */
export declare function centerWindow(window: BrowserWindow): void;
/**
 * Maximize window
 * @param window - Window to maximize
 */
export declare function maximizeWindow(window: BrowserWindow): void;
/**
 * Minimize window
 * @param window - Window to minimize
 */
export declare function minimizeWindow(window: BrowserWindow): void;
/**
 * Close window
 * @param window - Window to close
 */
export declare function closeWindow(window: BrowserWindow): void;
/**
 * Get window bounds
 * @param window - Window instance
 * @returns Window bounds {x, y, width, height}
 */
export declare function getWindowBounds(window: BrowserWindow): Electron.Rectangle;
/**
 * Set window bounds
 * @param window - Window instance
 * @param bounds - Window bounds {x, y, width, height}
 */
export declare function setWindowBounds(window: BrowserWindow, bounds: Electron.Rectangle): void;
/**
 * Get all displays information
 * @returns Array of display information
 */
export declare function getAllDisplays(): Electron.Display[];
/**
 * Get primary display information
 * @returns Primary display information
 */
export declare function getPrimaryDisplay(): Electron.Display;
/**
 * Create application menu
 * @param template - Menu template
 */
export declare function createMenu(template?: Electron.MenuItemConstructorOptions[] | null): void;
/**
 * Focus window
 * @param window - Window to focus
 */
export declare function focusWindow(window: BrowserWindow): void;
/**
 * Show window
 * @param window - Window to show
 */
export declare function showWindow(window: BrowserWindow): void;
/**
 * Hide window
 * @param window - Window to hide
 */
export declare function hideWindow(window: BrowserWindow): void;
/**
 * Reload window
 * @param window - Window to reload
 * @param ignoreCache - Whether to ignore cache
 */
export declare function reloadWindow(window: BrowserWindow, ignoreCache?: boolean): void;
/**
 * Flash window frame
 * @param window - Window to flash
 * @param flag - Whether to start or stop flashing
 */
export declare function flashWindow(window: BrowserWindow, flag?: boolean): void;
/**
 * Set window always on top
 * @param window - Window to modify
 * @param flag - Whether to set always on top
 * @param level - Level of priority
 */
export declare function setAlwaysOnTop(window: BrowserWindow, flag?: boolean, level?: 'normal' | 'floating' | 'torn-off-menu' | 'modal-panel' | 'main-menu' | 'status' | 'pop-up-menu' | 'screen-saver'): void;
/**
 * Set window to fullscreen
 * @param window - Window to modify
 * @param flag - Whether to set fullscreen
 */
export declare function setFullscreen(window: BrowserWindow, flag?: boolean): void;
/**
 * Set window to kiosk mode
 * @param window - Window to modify
 * @param flag - Whether to set kiosk mode
 */
export declare function setKiosk(window: BrowserWindow, flag?: boolean): void;
/**
 * Set window title
 * @param window - Window to modify
 * @param title - New title
 */
export declare function setWindowTitle(window: BrowserWindow, title: string): void;
/**
 * Set window icon
 * @param window - Window to modify
 * @param icon - Icon path or native image
 */
export declare function setWindowIcon(window: BrowserWindow, icon: string | Electron.NativeImage): void;
/**
 * Set window background color
 * @param window - Window to modify
 * @param color - Background color
 */
export declare function setWindowBackgroundColor(window: BrowserWindow, color: string): void;
/**
 * Set window opacity
 * @param window - Window to modify
 * @param opacity - Opacity value (0.0 - 1.0)
 */
export declare function setWindowOpacity(window: BrowserWindow, opacity: number): void;
/**
 * Create a system tray icon
 * @param iconPath - Path to the icon
 * @param tooltip - Tooltip text
 * @param menu - Context menu
 * @returns Tray instance
 */
export declare function createTray(iconPath: string, tooltip: string, menu?: Electron.Menu): Tray;
/**
 * Create a native image from path
 * @param imagePath - Path to the image
 * @returns Native image
 */
export declare function createNativeImage(imagePath: string): Electron.NativeImage;
/**
 * Create a native image from buffer
 * @param buffer - Image buffer
 * @returns Native image
 */
export declare function createNativeImageFromBuffer(buffer: Buffer): Electron.NativeImage;
/**
 * Enhanced window management utilities
 */
export declare class WindowManager {
    private static windows;
    /**
     * Create and register a window
     * @param name - Window name
     * @param options - Window options
     * @returns Created window
     */
    static create(name: string, options?: WindowOptions): BrowserWindow;
    /**
     * Get a registered window by name
     * @param name - Window name
     * @returns Window instance or null
     */
    static get(name: string): BrowserWindow | null;
    /**
     * Get all registered windows
     * @returns Map of all windows
     */
    static getAll(): Map<string, BrowserWindow>;
    /**
     * Close a registered window
     * @param name - Window name
     * @returns True if successful
     */
    static close(name: string): boolean;
    /**
     * Close all registered windows
     */
    static closeAll(): void;
    /**
     * Focus a registered window
     * @param name - Window name
     * @returns True if successful
     */
    static focus(name: string): boolean;
    /**
     * Show a registered window
     * @param name - Window name
     * @returns True if successful
     */
    static show(name: string): boolean;
    /**
     * Hide a registered window
     * @param name - Window name
     * @returns True if successful
     */
    static hide(name: string): boolean;
    /**
     * Reload a registered window
     * @param name - Window name
     * @param ignoreCache - Whether to ignore cache
     * @returns True if successful
     */
    static reload(name: string, ignoreCache?: boolean): boolean;
}
/**
 * Enhanced dialog utilities
 */
export declare class DialogManager {
    /**
     * Show a message box with custom options
     * @param options - Message box options
     * @returns Promise with button index
     */
    static showMessage(options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue>;
    /**
     * Show an error message
     * @param title - Dialog title
     * @param message - Error message
     * @returns Promise with button index
     */
    static showError(title: string, message: string): Promise<void>;
    /**
     * Show an information dialog
     * @param message - Information message
     * @param detail - Additional details
     * @returns Promise with button index
     */
    static showInfo(message: string, detail?: string): Promise<Electron.MessageBoxReturnValue>;
    /**
     * Show a confirmation dialog
     * @param message - Confirmation message
     * @param detail - Additional details
     * @returns Promise with confirmation result
     */
    static showConfirmation(message: string, detail?: string): Promise<boolean>;
}
/**
 * Enhanced menu utilities
 */
export declare class MenuManager {
    /**
     * Create a context menu
     * @param template - Menu template
     * @returns Menu instance
     */
    static createContextMenu(template: Electron.MenuItemConstructorOptions[]): Menu;
    /**
     * Show a context menu at specific coordinates
     * @param template - Menu template
     * @param window - Window to show menu in
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    static showContextMenu(template: Electron.MenuItemConstructorOptions[], window: BrowserWindow, x?: number, y?: number): void;
    /**
     * Create a system menu
     * @param template - Menu template
     */
    static setSystemMenu(template: Electron.MenuItemConstructorOptions[] | null): void;
}
//# sourceMappingURL=window-utils.d.ts.map