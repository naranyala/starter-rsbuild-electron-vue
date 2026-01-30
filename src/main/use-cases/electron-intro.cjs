// Backend handler for Electron Intro use case
const { ipcMain } = require('electron');

function registerElectronIntroHandler() {
  ipcMain.handle('use-case:electron-intro', async (event, data) => {
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
      console.error('Error in electron-intro handler:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerElectronIntroHandler };
