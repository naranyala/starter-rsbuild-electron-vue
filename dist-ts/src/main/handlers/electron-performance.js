// Backend handler for Electron Performance use case
import { ipcMain } from 'electron';
export function registerElectronPerformanceHandler() {
    ipcMain.handle('use-case:electron-performance', async (event, data) => {
        try {
            // Return static content for this use case
            const content = {
                id: 'electron-performance',
                title: 'Electron Performance',
                content: '<p>Optimizing Electron app performance involves reducing memory usage, improving startup time, and ensuring smooth UI interactions. Techniques include code splitting, lazy loading, and efficient resource management.</p><p>Key strategies include using native modules appropriately, optimizing renderer processes, implementing proper cleanup, and monitoring performance metrics. Profiling tools can help identify bottlenecks.</p>',
                category: 'performance',
                tags: [
                    'performance',
                    'memory',
                    'startup',
                    'profiling',
                    'optimization',
                ],
            };
            return { success: true, data: content };
        }
        catch (error) {
            console.error('Error in electron-performance handler:', error instanceof Error ? error.message : String(error));
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    });
}
//# sourceMappingURL=electron-performance.js.map