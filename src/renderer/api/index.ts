/**
 * Renderer API Module
 * Type-safe API layer for renderer process with "errors as values" pattern
 */

export {
  Err,
  invoke,
  invokeSafe,
  isErr,
  isOk,
  Ok,
  on,
  once,
  type Result,
  removeAllListeners,
  send,
} from './base.api';

export {
  type DeleteFileParams,
  deleteFile,
  type ExistsResult,
  exists,
  type MkdirParams,
  mkdir,
  type ReaddirResult,
  type ReadFileResult,
  readdir,
  readFile,
  safeDeleteFile,
  safeExists,
  safeMkdir,
  safeReaddir,
  safeReadFile,
  safeWriteFile,
  type WriteFileParams,
  writeFile,
} from './file.api';

import { fileSystemAPI } from './file.api';
export { fileSystemAPI };

export {
  type AppInfo,
  focus,
  getInfo,
  getName,
  getPath,
  getVersion,
  quit,
  safeGetInfo,
  safeGetName,
  safeGetPath,
  safeGetVersion,
  setBadgeCount,
} from './app.api';

import { appAPI } from './app.api';
export { appAPI };

export {
  center,
  closeWindow,
  focusWindow,
  getBounds,
  maximize,
  minimize,
  safeGetBounds,
  safeSetBounds,
  setBounds,
  type WindowBounds,
} from './window.api';

import { windowAPI } from './window.api';
export { windowAPI };

export {
  getArch,
  getPlatform,
  getSystemInfo,
  openExternal,
  type SystemInfo,
  safeGetArch,
  safeGetPlatform,
  safeGetSystemInfo,
  safeOpenExternal,
  safeShowInFolder,
  showInFolder,
} from './system.api';

import { systemAPI } from './system.api';
export { systemAPI };

export const api = {
  fs: fileSystemAPI,
  app: appAPI,
  window: windowAPI,
  system: systemAPI,
};
