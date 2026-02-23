import { BrowserWindow, type Rectangle } from 'electron';
import * as path from 'path';
import { Err, Ok, type Result } from '../../shared/result';

export function createWindow(
  options: {
    name?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    minWidth?: number;
    minHeight?: number;
    frame?: boolean;
    show?: boolean;
    webPreferences?: Electron.WebPreferences;
  } = {}
): BrowserWindow {
  const {
    width = 1024,
    height = 640,
    x,
    y,
    minWidth = 640,
    minHeight = 480,
    frame = true,
    show = true,
    webPreferences = {},
  } = options;

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width,
    height,
    ...(x !== undefined && { x }),
    ...(y !== undefined && { y }),
    minWidth,
    minHeight,
    frame,
    show,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      ...webPreferences,
    },
  };

  return new BrowserWindow(windowOptions);
}

export function loadUrl(
  window: BrowserWindow,
  port: number,
  isDevelopment: boolean,
  devServerUrl?: string
): void {
  if (isDevelopment && devServerUrl) {
    window.loadURL(devServerUrl);
  } else {
    const indexPath = path.join(__dirname, '../renderer/index.html');
    window.loadFile(indexPath);
  }
}

export function setupWindowHandlers(
  window: BrowserWindow,
  isDevelopment: boolean,
  handlers: {
    onReady?: (window: BrowserWindow) => void;
    onClosed?: (window: BrowserWindow) => void;
  } = {}
): void {
  window.on('closed', () => {
    if (handlers.onClosed) {
      handlers.onClosed(window);
    }
  });

  window.webContents.on('did-finish-load', () => {
    if (handlers.onReady) {
      handlers.onReady(window);
    }
  });

  if (isDevelopment) {
    window.webContents.on('devtools-opened', () => {
      window.focus();
      setImmediate(() => {
        window.focus();
      });
    });
  }
}

export function centerWindow(window: BrowserWindow): void {
  const displaySize = [800, 600]; // Default fallback
  const [displayWidth, displayHeight] = displaySize;
  const [windowWidth, windowHeight] = window.getSize();

  const x = Math.floor((displayWidth - windowWidth) / 2);
  const y = Math.floor((displayHeight - windowHeight) / 2);

  window.setPosition(x, y);
}

export function setWindowSize(
  window: BrowserWindow,
  width: number,
  height: number
): void {
  window.setSize(width, height);
}

export function getWindowBounds(window: BrowserWindow): Rectangle {
  return window.getBounds();
}

export function setWindowBounds(
  window: BrowserWindow,
  bounds: Rectangle
): void {
  window.setBounds(bounds);
}

export function maximizeWindow(window: BrowserWindow): void {
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
}

export function minimizeWindow(window: BrowserWindow): void {
  window.minimize();
}

export function closeWindow(window: BrowserWindow): void {
  window.close();
}

export function focusWindow(window: BrowserWindow): void {
  window.focus();
}

export function showWindow(window: BrowserWindow): void {
  window.show();
}

export function hideWindow(window: BrowserWindow): void {
  window.hide();
}

export function reloadWindow(window: BrowserWindow): void {
  window.webContents.reload();
}

export function openDevTools(
  window: BrowserWindow,
  options?: Electron.OpenDevToolsOptions
): void {
  window.webContents.openDevTools(options);
}

export function createMenu(
  template: Electron.MenuItemConstructorOptions[]
): Electron.Menu {
  return require('electron').Menu.buildFromTemplate(template);
}

export function generateWindowId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getAllDisplays(): Electron.Display[] {
  const screen = require('electron').screen;
  return screen.getAllDisplays();
}

export function getAllWindows(): BrowserWindow[] {
  const { BrowserWindow } = require('electron');
  return BrowserWindow.getAllWindows();
}

export function getPrimaryDisplay(): Electron.Display {
  const screen = require('electron').screen;
  return screen.getPrimaryDisplay();
}

export function getWindow(id: number): BrowserWindow | null {
  const windows = getAllWindows();
  return windows.find(win => win.id === id) || null;
}

export function registerWindow(id: string, window: BrowserWindow): void {
  // In a real implementation, you would store the window in a registry
  // For now, we'll just use a global Map
  if (!(global as any).windowRegistry) {
    (global as any).windowRegistry = new Map();
  }
  (global as any).windowRegistry.set(id, window);
}

export function unregisterWindow(id: string): void {
  if ((global as any).windowRegistry) {
    (global as any).windowRegistry.delete(id);
  }
}

export function showOpenDialog(
  window: BrowserWindow,
  options: Electron.OpenDialogOptions
): Promise<Electron.OpenDialogReturnValue> {
  return require('electron').dialog.showOpenDialog(window, options);
}

export function showSaveDialog(
  window: BrowserWindow,
  options: Electron.SaveDialogOptions
): Promise<Electron.SaveDialogReturnValue> {
  return require('electron').dialog.showSaveDialog(window, options);
}

export function safeShowOpenDialog(
  window: BrowserWindow,
  options: Electron.OpenDialogOptions
): Promise<Result<Electron.OpenDialogReturnValue, Error>> {
  return require('electron')
    .dialog.showOpenDialog(window, options)
    .then((value: Electron.OpenDialogReturnValue) => Ok(value))
    .catch((e: Error) => Err(e instanceof Error ? e : new Error(String(e))));
}

export function safeShowSaveDialog(
  window: BrowserWindow,
  options: Electron.SaveDialogOptions
): Promise<Result<Electron.SaveDialogReturnValue, Error>> {
  return require('electron')
    .dialog.showSaveDialog(window, options)
    .then((value: Electron.SaveDialogReturnValue) => Ok(value))
    .catch((e: Error) => Err(e instanceof Error ? e : new Error(String(e))));
}

export function safeGetWindow(id: number): Result<BrowserWindow | null, Error> {
  try {
    const windows = getAllWindows();
    return Ok(windows.find(win => win.id === id) || null);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function safeGetWindowBounds(
  window: BrowserWindow
): Result<Rectangle, Error> {
  try {
    return Ok(window.getBounds());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export function safeSetWindowBounds(
  window: BrowserWindow,
  bounds: Rectangle
): Result<void, Error> {
  try {
    window.setBounds(bounds);
    return Ok(undefined);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}
