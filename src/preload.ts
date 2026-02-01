/**
 * Preload Script for Electron Renderer Process
 * This script provides secure APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Define types for our API
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
  spawnProcess: (
    command: string,
    args: string[],
    options?: any
  ) => Promise<any>;
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
  showContextMenu: (
    template: Electron.MenuItemConstructorOptions[]
  ) => Promise<void>;
  setApplicationMenu: (
    template: Electron.MenuItemConstructorOptions[]
  ) => Promise<void>;
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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    mkdir: (dirPath: string) => ipcRenderer.invoke('fs:mkdir', dirPath),
    readdir: (dirPath: string) => ipcRenderer.invoke('fs:readdir', dirPath),
    deleteFile: (filePath: string) =>
      ipcRenderer.invoke('fs:deleteFile', filePath),
  },

  // Dialog operations
  dialog: {
    showOpenDialog: (options: any) =>
      ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options: any) =>
      ipcRenderer.invoke('dialog:showSaveDialog', options),
    showMessageDialog: (options: any) =>
      ipcRenderer.invoke('dialog:showMessageDialog', options),
  },

  // Window operations
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    focus: () => ipcRenderer.send('window:focus'),
    center: () => ipcRenderer.send('window:center'),
    getBounds: () => ipcRenderer.invoke('window:getBounds'),
    setBounds: (bounds: Electron.Rectangle) =>
      ipcRenderer.invoke('window:setBounds', bounds),
  },

  // Application operations
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
    quit: () => ipcRenderer.send('app:quit'),
    focus: () => ipcRenderer.send('app:focus'),
    setBadgeCount: (count: number) =>
      ipcRenderer.send('app:setBadgeCount', count),
  },

  // System operations
  system: {
    getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
    getArch: () => ipcRenderer.invoke('system:getArch'),
    getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
    showInFolder: (fullPath: string) =>
      ipcRenderer.invoke('system:showInFolder', fullPath),
    openExternal: (url: string) =>
      ipcRenderer.invoke('system:openExternal', url),
  },

  // Process operations
  process: {
    execCommand: (command: string, options?: any) =>
      ipcRenderer.invoke('process:execCommand', command, options),
    spawnProcess: (command: string, args: string[], options?: any) =>
      ipcRenderer.invoke('process:spawnProcess', command, args, options),
    killProcess: (pid: number) =>
      ipcRenderer.invoke('process:killProcess', pid),
  },

  // IPC communication
  ipc: {
    invoke: (channel: string, ...args: any[]) =>
      ipcRenderer.invoke(channel, ...args),
    send: (channel: string, ...args: any[]) =>
      ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (...args: any[]) => void) => {
      const wrappedListener = (
        _event: Electron.IpcRendererEvent,
        ...args: any[]
      ) => listener(...args);
      ipcRenderer.on(channel, wrappedListener);
      return () => ipcRenderer.removeListener(channel, wrappedListener);
    },
    once: (channel: string, listener: (...args: any[]) => void) => {
      const wrappedListener = (
        _event: Electron.IpcRendererEvent,
        ...args: any[]
      ) => listener(...args);
      ipcRenderer.once(channel, wrappedListener);
      return () => ipcRenderer.removeListener(channel, wrappedListener);
    },
    removeAllListeners: (channel: string) =>
      ipcRenderer.removeAllListeners(channel),
  },

  // Clipboard operations
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:readText'),
    writeText: (text: string) =>
      ipcRenderer.invoke('clipboard:writeText', text),
    readImage: () => ipcRenderer.invoke('clipboard:readImage'),
    writeImage: (imageData: any) =>
      ipcRenderer.invoke('clipboard:writeImage', imageData),
  },

  // Notification operations
  notification: {
    show: (options: Electron.NotificationConstructorOptions) =>
      ipcRenderer.invoke('notification:show', options),
    requestPermission: () =>
      ipcRenderer.invoke('notification:requestPermission'),
  },

  // Menu operations
  menu: {
    showContextMenu: (template: Electron.MenuItemConstructorOptions[]) =>
      ipcRenderer.invoke('menu:showContextMenu', template),
    setApplicationMenu: (template: Electron.MenuItemConstructorOptions[]) =>
      ipcRenderer.invoke('menu:setApplicationMenu', template),
  },

  // Shell operations
  shell: {
    openExternal: (url: string) =>
      ipcRenderer.invoke('shell:openExternal', url),
    openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
    showItemInFolder: (fullPath: string) =>
      ipcRenderer.invoke('shell:showItemInFolder', fullPath),
  },
} as ElectronAPI);

// Expose Node.js environment information
contextBridge.exposeInMainWorld('nodeEnv', {
  platform: process.platform,
  arch: process.arch,
  version: process.version,
} as NodeEnv);

// Log preload script initialization
console.log('Preload script loaded successfully');
