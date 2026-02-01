/**
 * Preload Script for Electron Renderer Process
 * This script provides secure APIs to the renderer process
 */
export interface FileSystemAPI {
    readFile: (filePath: string) => Promise<string>;
    writeFile: (filePath: string, content: string) => Promise<void>;
    exists: (filePath: string) => Promise<boolean>;
    mkdir: (dirPath: string) => Promise<void>;
    readdir: (dirPath: string) => Promise<string[]>;
    deleteFile: (filePath: string) => Promise<void>;
}
export interface DialogAPI {
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
    showMessageDialog: (options: any) => Promise<any>;
}
export interface WindowAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    focus: () => void;
    center: () => void;
    getBounds: () => Promise<Electron.Rectangle>;
    setBounds: (bounds: Electron.Rectangle) => Promise<void>;
}
export interface AppAPI {
    getVersion: () => Promise<string>;
    getName: () => Promise<string>;
    getPath: (name: string) => Promise<string>;
    quit: () => void;
    focus: () => void;
    setBadgeCount: (count: number) => void;
}
export interface SystemAPI {
    getPlatform: () => Promise<NodeJS.Platform>;
    getArch: () => Promise<string>;
    getSystemInfo: () => Promise<any>;
    showInFolder: (fullPath: string) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
}
export interface ProcessAPI {
    execCommand: (command: string, options?: any) => Promise<any>;
    spawnProcess: (command: string, args: string[], options?: any) => Promise<any>;
    killProcess: (pid: number) => Promise<void>;
}
export interface IPCAPI {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    send: (channel: string, ...args: any[]) => void;
    on: (channel: string, listener: (...args: any[]) => void) => () => void;
    once: (channel: string, listener: (...args: any[]) => void) => () => void;
    removeAllListeners: (channel: string) => void;
}
export interface ClipboardAPI {
    readText: () => Promise<string>;
    writeText: (text: string) => Promise<void>;
    readImage: () => Promise<Electron.NativeImage>;
    writeImage: (imageData: any) => Promise<void>;
}
export interface NotificationAPI {
    show: (options: Electron.NotificationConstructorOptions) => Promise<void>;
    requestPermission: () => Promise<'granted' | 'denied'>;
}
export interface MenuAPI {
    showContextMenu: (template: Electron.MenuItemConstructorOptions[]) => Promise<void>;
    setApplicationMenu: (template: Electron.MenuItemConstructorOptions[]) => Promise<void>;
}
export interface ShellAPI {
    openExternal: (url: string) => Promise<void>;
    openPath: (path: string) => Promise<string>;
    showItemInFolder: (fullPath: string) => Promise<void>;
}
export interface ElectronAPI {
    fs: FileSystemAPI;
    dialog: DialogAPI;
    window: WindowAPI;
    app: AppAPI;
    system: SystemAPI;
    process: ProcessAPI;
    ipc: IPCAPI;
    clipboard: ClipboardAPI;
    notification: NotificationAPI;
    menu: MenuAPI;
    shell: ShellAPI;
}
export interface NodeEnv {
    platform: NodeJS.Platform;
    arch: string;
    version: string;
}
//# sourceMappingURL=preload.d.ts.map