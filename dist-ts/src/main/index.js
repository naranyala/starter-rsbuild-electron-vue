// Main process entry point
import { app, ipcMain, shell } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerAllHandlers } from './handlers.js';
import { AppService } from './services/app-service.js';
import { WindowService } from './services/window-service.js';
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
// To avoid being garbage collected
let mainWindow;
function createMainWindow() {
    // Create the browser window with secure default settings
    mainWindow = WindowService.create({
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
    WindowService.loadUrl(mainWindow, port, serve);
    WindowService.setupHandlers(mainWindow, serve, {
        onReady: (window) => {
            console.log('Production window ready');
        },
        onClosed: (window) => {
            mainWindow = null;
        },
    });
    return mainWindow;
}
// Register IPC handlers
function registerIpcHandlers() {
    // Register common app handlers
    AppService.registerHandlers();
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
                    if (!parsedUrl.hostname?.includes('localhost') &&
                        !parsedUrl.protocol.includes('file:')) {
                        event.preventDefault();
                        shell.openExternal(navigationUrl);
                    }
                }
                else {
                    // In production, only allow file://
                    if (!parsedUrl.protocol.includes('file:')) {
                        event.preventDefault();
                        shell.openExternal(navigationUrl);
                    }
                }
            }
            catch (error) {
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
//# sourceMappingURL=index.js.map