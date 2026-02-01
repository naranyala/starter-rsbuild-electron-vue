// Backend handler for Electron Security use case
import { type IpcMainInvokeEvent, ipcMain } from 'electron';

export function registerElectronSecurityHandler() {
  ipcMain.handle(
    'use-case:electron-security',
    async (event: IpcMainInvokeEvent, data: any) => {
      try {
        // Return static content for this use case
        const content = {
          id: 'electron-security',
          title: 'Electron Security',
          content:
            '<p>Electron security involves protecting applications from various threats. Key areas include preventing remote code execution, securing IPC communication, and properly configuring web preferences.</p><p>Best practices include disabling nodeIntegration in renderer processes, using contextIsolation, validating all inputs, and sanitizing all outputs. CSP (Content Security Policy) is also crucial for preventing XSS attacks.</p>',
          category: 'security',
          tags: ['security', 'csp', 'context-isolation', 'validation', 'xss'],
        };

        return { success: true, data: content };
      } catch (error) {
        console.error(
          'Error in electron-security handler:',
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
