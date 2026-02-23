/**
 * Renderer API Module
 * Type-safe API layer for renderer process
 */

export { invoke, send, on, once, removeAllListeners } from './base.api';

export {
  type ReadFileResult,
  type WriteFileParams,
  type ExistsResult,
  type MkdirParams,
  type ReaddirResult,
  type DeleteFileParams,
  readFile,
  writeFile,
  exists,
  mkdir,
  readdir,
  deleteFile,
  fileSystemAPI,
} from './file.api';

export {
  type AppInfo,
  getVersion,
  getName,
  getPath,
  getInfo,
  quit,
  focus,
  setBadgeCount,
  appAPI,
} from './app.api';

export {
  type WindowBounds,
  minimize,
  maximize,
  closeWindow,
  focusWindow,
  center,
  getBounds,
  setBounds,
  windowAPI,
} from './window.api';

export {
  type SystemInfo,
  getPlatform,
  getArch,
  getSystemInfo,
  showInFolder,
  openExternal,
  systemAPI,
} from './system.api';

/**
 * Combined API object for convenience
 */
import { fileSystemAPI } from './file.api';
import { appAPI } from './app.api';
import { windowAPI } from './window.api';
import { systemAPI } from './system.api';

export const api = {
  fs: fileSystemAPI,
  app: appAPI,
  window: windowAPI,
  system: systemAPI,
};
