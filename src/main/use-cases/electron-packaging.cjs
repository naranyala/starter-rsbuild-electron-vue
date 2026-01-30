// Backend handler for Electron Packaging use case
const { ipcMain } = require('electron');

function registerElectronPackagingHandler() {
  ipcMain.handle('use-case:electron-packaging', async (event, data) => {
    try {
      // Return static content for this use case
      const content = {
        id: 'electron-packaging',
        title: 'Packaging and Distribution',
        content:
          '<p>Electron applications can be packaged for distribution using tools like electron-builder, electron-forge, or electron-packager. These tools create installable executables for Windows, macOS, and Linux.</p><p>Configuration includes app metadata, icons, installer options, and platform-specific settings. Proper packaging ensures a professional user experience across all platforms.</p>',
        category: 'packaging',
        tags: ['packaging', 'distribution', 'electron-builder', 'installer'],
      };

      return { success: true, data: content };
    } catch (error) {
      console.error('Error in electron-packaging handler:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerElectronPackagingHandler };
