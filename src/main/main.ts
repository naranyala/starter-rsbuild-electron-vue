import { app, type BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { getMainContainer, initializeMainContainer } from './di';
import {
  APP_SERVICE_TOKEN,
  registerAllHandlers,
  WINDOW_SERVICE_TOKEN,
} from './use-cases';
import { WindowService } from './use-cases/window.service';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(1);
const serve = args.some(val => val === '--start-dev');

// Extract port from command line arguments if provided
let port = 1234; // default fallback
const portArg = args.find(arg => arg.startsWith('--port='))?.split('=')[1];
if (portArg) {
  port = parseInt(portArg, 10);
}

// Initialize the main DI container with Electron dependencies
const container = initializeMainContainer(app);

// To avoid being garbage collected
let mainWindow: BrowserWindow | null;

function createMainWindow() {
  // Create window service instance
  const windowService = new WindowService();

  // Create the browser window with secure defaults
  mainWindow = windowService.create({
    name: 'main',
    webPreferences: serve
      ? {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          devTools: true,
        }
      : {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
          allowRunningInsecureContent: false,
          experimentalFeatures: false,
          preload: path.join(__dirname, '../dist-ts/preload.js'),
        },
  });

  // Load the appropriate URL
  windowService.loadUrl(mainWindow, port, serve);

  windowService.setupHandlers(mainWindow, serve, {
    onReady: (window: BrowserWindow) => {
      console.log('Production window ready');
    },
    onClosed: (window: BrowserWindow) => {
      mainWindow = null;
    },
  });

  return mainWindow;
}

// Register IPC handlers
function registerIpcHandlers() {
  // Get app service from DI container and register handlers
  const appService = container.get(APP_SERVICE_TOKEN);
  appService.registerHandlers();

  // Register use case handlers
  registerAllHandlers();

  // Basic ping handler
  ipcMain.handle('ping', () => 'pong');
}

// Security: Handle external links
function setupSecurityHandlers() {
  app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(details => {
      // Open external links in the default browser
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    contents.on('will-navigate', (event, navigationUrl) => {
      try {
        const parsedUrl = new URL(navigationUrl);

        if (serve) {
          // In development, allow localhost and file://
          if (
            !parsedUrl.hostname?.includes('localhost') &&
            !parsedUrl.protocol.includes('file:')
          ) {
            event.preventDefault();
            shell.openExternal(navigationUrl);
          }
        } else {
          // In production, only allow file://
          if (!parsedUrl.protocol.includes('file:')) {
            event.preventDefault();
            shell.openExternal(navigationUrl);
          }
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });
  });
}

app.on('ready', () => {
  setupSecurityHandlers();
  registerIpcHandlers();
  createMainWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});
