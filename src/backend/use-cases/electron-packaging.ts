// Backend handler for Electron Packaging use case
import { type IpcMainInvokeEvent, ipcMain } from 'electron';

export function registerElectronPackagingHandler() {
  ipcMain.handle(
    'use-case:electron-packaging',
    async (event: IpcMainInvokeEvent, data: any) => {
      try {
        // Return static content for this use case
        const content = {
          id: 'electron-packaging',
          title: 'Electron Packaging',
          content:
            '<p>Electron applications can be packaged for distribution using tools like electron-builder, electron-forge, or packager. These tools create distributable executables for Windows, macOS, and Linux.</p><p>Key considerations include optimizing bundle size, code signing for security, auto-updater implementation, and platform-specific configurations. Proper packaging ensures smooth installation and updates for end users.</p>',
          category: 'packaging',
          tags: [
            'packaging',
            'distribution',
            'electron-builder',
            'signing',
            'auto-update',
          ],
        };

        return { success: true, data: content };
      } catch (error) {
        console.error(
          'Error in electron-packaging handler:',
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
