// Backend handler for Electron Security use case
const { ipcMain } = require('electron');

function registerElectronSecurityHandler() {
  ipcMain.handle('use-case:electron-security', async (event, data) => {
    try {
      // Return static content for this use case
      const content = {
        id: 'electron-security',
        title: 'Electron Security Best Practices',
        content:
          '<p>Security is crucial in Electron applications. Important practices include: enabling context isolation, disabling nodeIntegration when possible, using CSP (Content Security Policy), validating all input, and sanitizing user-provided content.</p><p>Always run Electron in a secure context and keep your dependencies updated. Follow the principle of least privilege for all operations.</p>',
        category: 'security',
        tags: ['security', 'context-isolation', 'csp', 'best-practices'],
      };

      return { success: true, data: content };
    } catch (error) {
      console.error('Error in electron-security handler:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerElectronSecurityHandler };
