// Backend handler for Electron Performance use case
const { ipcMain } = require('electron');

function registerElectronPerformanceHandler() {
  ipcMain.handle('use-case:electron-performance', async (event, data) => {
    try {
      // Return static content for this use case
      const content = {
        id: 'electron-performance',
        title: 'Performance Optimization',
        content:
          '<p>Optimizing Electron apps involves reducing memory usage, improving startup time, and efficient resource management. Techniques include code splitting, lazy loading, proper cleanup of event listeners, and optimizing asset loading.</p><p>Monitor performance with Chrome DevTools and consider using native modules for CPU-intensive tasks. Efficient IPC communication also improves responsiveness.</p>',
        category: 'performance',
        tags: ['performance', 'optimization', 'memory', 'startup-time'],
      };

      return { success: true, data: content };
    } catch (error) {
      console.error('Error in electron-performance handler:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerElectronPerformanceHandler };
