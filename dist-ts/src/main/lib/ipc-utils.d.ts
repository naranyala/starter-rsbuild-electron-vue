/**
 * Enhanced IPC (Inter-Process Communication) Utilities for Electron Main Process
 * These utilities help with communication between main and renderer processes
 */
import { BrowserWindow, IpcMainInvokeEvent } from 'electron';
interface HandlerInfo {
    handler: ((event: IpcMainInvokeEvent, ...args: any[]) => any) | ((event: Electron.IpcMainEvent, ...args: any[]) => void);
    once: boolean;
    type: 'handle' | 'on';
}
interface HandlerOptions {
    once?: boolean;
    errorHandler?: (error: Error, event: IpcMainInvokeEvent | Electron.IpcMainEvent, ...args: any[]) => void | boolean;
}
interface AppHandlerOptions {
    appInfo?: Record<string, any>;
    allowQuit?: boolean;
    onBeforeQuit?: () => void;
    onWindowAllClosed?: () => void;
}
/**
 * Register IPC handler with error handling
 * @param channel - IPC channel name
 * @param handler - Handler function
 * @param options - Handler options
 */
export declare function registerHandler(channel: string, handler: (event: IpcMainInvokeEvent, ...args: any[]) => any, options?: HandlerOptions): void;
/**
 * Register one-way IPC handler (for messages without response)
 * @param channel - IPC channel name
 * @param handler - Handler function
 * @param options - Handler options
 */
export declare function registerListener(channel: string, handler: (event: Electron.IpcMainEvent, ...args: any[]) => void, options?: {
    errorHandler?: (error: Error, event: Electron.IpcMainEvent, ...args: any[]) => void;
}): void;
/**
 * Unregister IPC handler
 * @param channel - IPC channel name
 */
export declare function unregisterHandler(channel: string): void;
/**
 * Unregister IPC listener
 * @param channel - IPC channel name
 */
export declare function unregisterListener(channel: string): void;
/**
 * Unregister all IPC handlers
 */
export declare function unregisterAllHandlers(): void;
/**
 * Send message to all renderer processes
 * @param channel - IPC channel name
 * @param args - Arguments to send
 */
export declare function broadcast(channel: string, ...args: any[]): void;
/**
 * Send message to specific window
 * @param window - Target window
 * @param channel - IPC channel name
 * @param args - Arguments to send
 */
export declare function sendToWindow(window: BrowserWindow, channel: string, ...args: any[]): void;
/**
 * Send message to windows by name
 * @param windowName - Window name identifier
 * @param channel - IPC channel name
 * @param args - Arguments to send
 */
export declare function sendToWindowByName(windowName: string, channel: string, ...args: any[]): void;
/**
 * Get registered handlers
 * @returns Map of registered handlers
 */
export declare function getRegisteredHandlers(): Map<string, HandlerInfo>;
/**
 * Check if handler is registered
 * @param channel - IPC channel name
 * @returns True if handler exists
 */
export declare function hasHandler(channel: string): boolean;
/**
 * Register common application handlers
 * @param options - Configuration options
 */
export declare function registerAppHandlers(options?: AppHandlerOptions): void;
/**
 * Create secure IPC channel with validation
 * @param channel - IPC channel name
 * @param handler - Handler function
 * @param schema - Validation schema
 * @param options - Handler options
 */
export declare function createSecureChannel(channel: string, handler: (event: IpcMainInvokeEvent, ...args: any[]) => any, schema: {
    args?: string[];
    response?: string;
}, options?: HandlerOptions): void;
/**
 * Enhanced IPC utilities
 */
export declare class IpcManager {
    private static channels;
    /**
     * Register a handler with automatic validation
     * @param channel - IPC channel name
     * @param handler - Handler function
     * @param validator - Validation function
     * @returns True if successful
     */
    static registerHandler(channel: string, handler: (event: IpcMainInvokeEvent, ...args: any[]) => any, validator?: (args: any[]) => boolean): boolean;
    /**
     * Register a one-time handler
     * @param channel - IPC channel name
     * @param handler - Handler function
     * @returns True if successful
     */
    static registerOnceHandler(channel: string, handler: (event: IpcMainInvokeEvent, ...args: any[]) => any): boolean;
    /**
     * Unregister a handler
     * @param channel - IPC channel name
     * @returns True if successful
     */
    static unregisterHandler(channel: string): boolean;
    /**
     * Broadcast to all windows
     * @param channel - IPC channel name
     * @param args - Arguments to send
     */
    static broadcast(channel: string, ...args: any[]): void;
    /**
     * Send to specific window
     * @param windowId - Window ID
     * @param channel - IPC channel name
     * @param args - Arguments to send
     */
    static sendToWindow(windowId: number, channel: string, ...args: any[]): void;
    /**
     * Send to window by web contents ID
     * @param webContentsId - Web contents ID
     * @param channel - IPC channel name
     * @param args - Arguments to send
     */
    static sendToWebContents(webContentsId: number, channel: string, ...args: any[]): void;
    /**
     * Invoke handler and get response
     * @param channel - IPC channel name
     * @param args - Arguments to send
     * @returns Promise with response
     */
    static invoke(channel: string, ...args: any[]): Promise<any>;
    /**
     * Clear all registered handlers
     */
    static clear(): void;
}
/**
 * Enhanced event utilities for IPC
 */
export declare class IpcEventManager {
    private static listeners;
    /**
     * Add event listener
     * @param channel - IPC channel name
     * @param listener - Event listener function
     * @returns Unsubscribe function
     */
    static on(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void): () => void;
    /**
     * Add one-time event listener
     * @param channel - IPC channel name
     * @param listener - Event listener function
     */
    static once(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void): void;
    /**
     * Remove event listener
     * @param channel - IPC channel name
     * @param listener - Event listener function
     */
    static removeListener(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void): void;
    /**
     * Remove all listeners for a channel
     * @param channel - IPC channel name
     */
    static removeAllListeners(channel: string): void;
    /**
     * Get listener count for a channel
     * @param channel - IPC channel name
     * @returns Number of listeners
     */
    static listenerCount(channel: string): number;
}
export {};
//# sourceMappingURL=ipc-utils.d.ts.map