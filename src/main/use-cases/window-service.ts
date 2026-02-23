// Main process window service
import {
  centerWindow,
  closeWindow,
  createMenu,
  createWindow as createWindowUtil,
  focusWindow,
  generateWindowId,
  getAllDisplays,
  getAllWindows,
  getPrimaryDisplay,
  getWindow,
  getWindowBounds,
  hideWindow,
  loadUrl as loadUrlUtil,
  maximizeWindow,
  minimizeWindow,
  registerWindow,
  reloadWindow,
  setupWindowHandlers as setupWindowHandlersUtil,
  setWindowBounds,
  showOpenDialog,
  showSaveDialog,
  showWindow,
  unregisterWindow,
} from '../lib/window-utils';

export class WindowService {
  static create = createWindowUtil;
  static loadUrl = loadUrlUtil;
  static setupHandlers = setupWindowHandlersUtil;
  static center = centerWindow;
  static maximize = maximizeWindow;
  static minimize = minimizeWindow;
  static close = closeWindow;
  static show = showWindow;
  static hide = hideWindow;
  static focus = focusWindow;
  static reload = reloadWindow;
  static getBounds = getWindowBounds;
  static setBounds = setWindowBounds;
  static getAllDisplays = getAllDisplays;
  static getPrimaryDisplay = getPrimaryDisplay;
  static createMenu = createMenu;
  static showOpenDialog = showOpenDialog;
  static showSaveDialog = showSaveDialog;
  static getAll = getAllWindows;
  static get = getWindow;
  static register = registerWindow;
  static unregister = unregisterWindow;
  static generateId = generateWindowId;
}
