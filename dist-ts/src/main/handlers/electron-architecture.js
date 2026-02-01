// Backend handler for Electron Architecture use case
import { ipcMain } from 'electron';
export function registerElectronArchitectureHandler() {
    ipcMain.handle('use-case:electron-architecture', async (event, data) => {
        try {
            // Return static content for this use case
            const content = {
                id: 'electron-architecture',
                title: 'Electron Architecture',
                content: '<p>Electron applications have two main processes: the Main Process and the Renderer Process. The Main Process controls the life cycle of the app and creates browser windows. The Renderer Process renders the UI and runs in the browser window.</p><p>Communication between processes happens via IPC (Inter-Process Communication). This architecture allows for secure separation of concerns while maintaining flexibility.</p>',
                category: 'architecture',
                tags: ['main-process', 'renderer-process', 'ipc', 'architecture'],
            };
            return { success: true, data: content };
        }
        catch (error) {
            console.error('Error in electron-architecture handler:', error instanceof Error ? error.message : String(error));
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    });
}
//# sourceMappingURL=electron-architecture.js.map