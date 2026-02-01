// Backend handler for Electron Development use case
import { type IpcMainInvokeEvent, ipcMain } from 'electron';

export function registerElectronDevelopmentHandler() {
  ipcMain.handle(
    'use-case:electron-development',
    async (event: IpcMainInvokeEvent, data: any) => {
      try {
        // Return static content for this use case
        const content = {
          id: 'electron-development',
          title: 'Electron Development',
          content:
            '<p>Developing Electron applications involves setting up a proper development workflow with hot reloading, debugging capabilities, and proper tooling. Common tools include Webpack, Vite, or Rsbuild for bundling.</p><p>Development workflows typically involve separate processes for the main and renderer processes, with proper error handling and logging. Testing strategies should cover both processes separately and together.</p>',
          category: 'development',
          tags: ['development', 'workflow', 'debugging', 'tooling', 'testing'],
        };

        return { success: true, data: content };
      } catch (error) {
        console.error(
          'Error in electron-development handler:',
          error instanceof Error ? error.message : String(error)
        );
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );
}
