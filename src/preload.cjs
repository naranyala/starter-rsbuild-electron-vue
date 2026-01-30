/**
 * Preload Script for Electron Renderer Process
 * This script provides secure APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  fs: {
    readFile: filePath => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, content) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    exists: filePath => ipcRenderer.invoke('fs:exists', filePath),
    mkdir: dirPath => ipcRenderer.invoke('fs:mkdir', dirPath),
    readdir: dirPath => ipcRenderer.invoke('fs:readdir', dirPath),
    deleteFile: filePath => ipcRenderer.invoke('fs:deleteFile', filePath),
  },

  // Dialog operations
  dialog: {
    showOpenDialog: options =>
      ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: options =>
      ipcRenderer.invoke('dialog:showSaveDialog', options),
    showMessageDialog: options =>
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
    setBounds: bounds => ipcRenderer.invoke('window:setBounds', bounds),
  },

  // Application operations
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
    getPath: name => ipcRenderer.invoke('app:getPath', name),
    quit: () => ipcRenderer.send('app:quit'),
    focus: () => ipcRenderer.send('app:focus'),
    setBadgeCount: count => ipcRenderer.send('app:setBadgeCount', count),
  },

  // System operations
  system: {
    getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
    getArch: () => ipcRenderer.invoke('system:getArch'),
    getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
    showInFolder: fullPath =>
      ipcRenderer.invoke('system:showInFolder', fullPath),
    openExternal: url => ipcRenderer.invoke('system:openExternal', url),
  },

  // Process operations
  process: {
    execCommand: (command, options) =>
      ipcRenderer.invoke('process:execCommand', command, options),
    spawnProcess: (command, args, options) =>
      ipcRenderer.invoke('process:spawnProcess', command, args, options),
    killProcess: pid => ipcRenderer.invoke('process:killProcess', pid),
  },

  // IPC communication
  ipc: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => {
      const wrappedListener = (event, ...args) => listener(...args);
      ipcRenderer.on(channel, wrappedListener);
      return () => ipcRenderer.removeListener(channel, wrappedListener);
    },
    once: (channel, listener) => {
      const wrappedListener = (event, ...args) => listener(...args);
      ipcRenderer.once(channel, wrappedListener);
      return () => ipcRenderer.removeListener(channel, wrappedListener);
    },
    removeAllListeners: channel => ipcRenderer.removeAllListeners(channel),
  },

  // Clipboard operations
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:readText'),
    writeText: text => ipcRenderer.invoke('clipboard:writeText', text),
    readImage: () => ipcRenderer.invoke('clipboard:readImage'),
    writeImage: imageData =>
      ipcRenderer.invoke('clipboard:writeImage', imageData),
  },

  // Notification operations
  notification: {
    show: options => ipcRenderer.invoke('notification:show', options),
    requestPermission: () =>
      ipcRenderer.invoke('notification:requestPermission'),
  },

  // Menu operations
  menu: {
    showContextMenu: template =>
      ipcRenderer.invoke('menu:showContextMenu', template),
    setApplicationMenu: template =>
      ipcRenderer.invoke('menu:setApplicationMenu', template),
  },

  // Shell operations
  shell: {
    openExternal: url => ipcRenderer.invoke('shell:openExternal', url),
    openPath: path => ipcRenderer.invoke('shell:openPath', path),
    showItemInFolder: fullPath =>
      ipcRenderer.invoke('shell:showItemInFolder', fullPath),
  },
});

// Expose Node.js environment information
contextBridge.exposeInMainWorld('nodeEnv', {
  platform: process.platform,
  arch: process.arch,
  version: process.version,
});

// Log preload script initialization
console.log('Preload script loaded successfully');
