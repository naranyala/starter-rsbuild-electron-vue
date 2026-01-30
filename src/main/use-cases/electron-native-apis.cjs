// Backend handler for Electron Native APIs use case
const { ipcMain } = require('electron');

function registerElectronNativeAPIsHandler() {
  ipcMain.handle('use-case:electron-native-apis', async (event, data) => {
    try {
      // Return static content for this use case
      const content = {
        id: 'electron-native-apis',
        title: 'Native Operating System APIs',
        content:
          '<p>Electron provides access to native OS features through its APIs: file system operations, dialog boxes, notifications, tray icons, clipboard, and more. These APIs bridge the gap between web technologies and desktop functionality.</p><p>Common native integrations include file dialogs, system notifications, context menus, and deep OS integration for a native-like experience.</p>',
        category: 'api',
        tags: ['native-api', 'file-system', 'notifications', 'dialogs'],
      };

      return { success: true, data: content };
    } catch (error) {
      console.error('Error in electron-native-apis handler:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerElectronNativeAPIsHandler };
