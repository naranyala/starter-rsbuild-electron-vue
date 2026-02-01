// Backend handler for Electron Native APIs use case
import { type IpcMainInvokeEvent, ipcMain } from 'electron';

export function registerElectronNativeAPIsHandler() {
  ipcMain.handle(
    'use-case:electron-native-apis',
    async (event: IpcMainInvokeEvent, data: any) => {
      try {
        // Return static content for this use case
        const content = {
          id: 'electron-native-apis',
          title: 'Electron Native APIs',
          content:
            '<p>Electron provides access to native operating system capabilities through its APIs. These include file system access, dialogs, notifications, tray icons, and more.</p><p>Key modules include dialog for user interactions, shell for opening files/URLs, clipboard for data exchange, and nativeImage for image handling. These APIs enable rich desktop experiences while maintaining security.</p>',
          category: 'api',
          tags: ['native-api', 'dialog', 'shell', 'clipboard', 'tray'],
        };

        return { success: true, data: content };
      } catch (error) {
        console.error(
          'Error in electron-native-apis handler:',
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
