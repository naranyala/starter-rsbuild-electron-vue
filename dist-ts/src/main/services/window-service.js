// Main process window service
import { centerWindow, closeWindow, createMenu, createWindow as createWindowUtil, focusWindow, generateWindowId, getAllDisplays, getAllWindows, getPrimaryDisplay, getWindow, getWindowBounds, hideWindow, loadUrl as loadUrlUtil, maximizeWindow, minimizeWindow, registerWindow, reloadWindow, setupWindowHandlers as setupWindowHandlersUtil, setWindowBounds, showOpenDialog, showSaveDialog, showWindow, unregisterWindow, } from '../lib/window-utils.js';
export class WindowService {
}
WindowService.create = createWindowUtil;
WindowService.loadUrl = loadUrlUtil;
WindowService.setupHandlers = setupWindowHandlersUtil;
WindowService.center = centerWindow;
WindowService.maximize = maximizeWindow;
WindowService.minimize = minimizeWindow;
WindowService.close = closeWindow;
WindowService.show = showWindow;
WindowService.hide = hideWindow;
WindowService.focus = focusWindow;
WindowService.reload = reloadWindow;
WindowService.getBounds = getWindowBounds;
WindowService.setBounds = setWindowBounds;
WindowService.getAllDisplays = getAllDisplays;
WindowService.getPrimaryDisplay = getPrimaryDisplay;
WindowService.createMenu = createMenu;
WindowService.showOpenDialog = showOpenDialog;
WindowService.showSaveDialog = showSaveDialog;
WindowService.getAll = getAllWindows;
WindowService.get = getWindow;
WindowService.register = registerWindow;
WindowService.unregister = unregisterWindow;
WindowService.generateId = generateWindowId;
//# sourceMappingURL=window-service.js.map