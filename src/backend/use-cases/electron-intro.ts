// Backend handler for Electron Intro use case
import { type IpcMainInvokeEvent, ipcMain } from 'electron';

export function registerElectronIntroHandler() {
  ipcMain.handle(
    'use-case:electron-intro',
    async (event: IpcMainInvokeEvent, data: any) => {
      try {
        // Return static content for this use case
        const content = {
          id: 'electron-intro',
          title: 'What is Electron?',
          content:
            '<p>Electron is a framework for building cross-platform desktop applications using web technologies like HTML, CSS, and JavaScript. It combines the Chromium rendering engine and the Node.js runtime.</p><p>With Electron, you can develop desktop applications that run on Windows, macOS, and Linux using familiar web technologies. Popular applications like Visual Studio Code, Slack, Discord, and WhatsApp Desktop are built with Electron.</p>',
          category: 'framework',
          tags: ['electron', 'desktop', 'chromium', 'nodejs', 'cross-platform'],
        };

        return { success: true, data: content };
      } catch (error) {
        console.error(
          'Error in electron-intro handler:',
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
