import { centerWindow, closeWindow, createMenu, createWindow as createWindowUtil, focusWindow, generateWindowId, getAllDisplays, getAllWindows, getPrimaryDisplay, getWindow, getWindowBounds, hideWindow, loadUrl as loadUrlUtil, maximizeWindow, minimizeWindow, registerWindow, reloadWindow, setupWindowHandlers as setupWindowHandlersUtil, setWindowBounds, showOpenDialog, showSaveDialog, showWindow, unregisterWindow } from '../lib/window-utils';
export declare class WindowService {
    static create: typeof createWindowUtil;
    static loadUrl: typeof loadUrlUtil;
    static setupHandlers: typeof setupWindowHandlersUtil;
    static center: typeof centerWindow;
    static maximize: typeof maximizeWindow;
    static minimize: typeof minimizeWindow;
    static close: typeof closeWindow;
    static show: typeof showWindow;
    static hide: typeof hideWindow;
    static focus: typeof focusWindow;
    static reload: typeof reloadWindow;
    static getBounds: typeof getWindowBounds;
    static setBounds: typeof setWindowBounds;
    static getAllDisplays: typeof getAllDisplays;
    static getPrimaryDisplay: typeof getPrimaryDisplay;
    static createMenu: typeof createMenu;
    static showOpenDialog: typeof showOpenDialog;
    static showSaveDialog: typeof showSaveDialog;
    static getAll: typeof getAllWindows;
    static get: typeof getWindow;
    static register: typeof registerWindow;
    static unregister: typeof unregisterWindow;
    static generateId: typeof generateWindowId;
}
//# sourceMappingURL=window-service.d.ts.map