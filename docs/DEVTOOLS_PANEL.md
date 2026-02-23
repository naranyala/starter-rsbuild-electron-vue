# DevTools Panel Documentation

## Overview

The DevTools Panel is a comprehensive bottom panel that exposes backend and frontend debugging information for the Electron + Vue application. It provides real-time insights into both processes, IPC communication, console logs, and performance metrics.

## Features

### 🔌 Backend Tab

Exposes Electron main process information:

- **Process Info**: PID, Platform, Architecture, Node.js version, Electron version, Chrome version
- **Memory**: RSS, Heap Total, Heap Used, External memory
- **Windows**: List of all open BrowserWindows with their state
- **IPC Channels**: Registered IPC channel handlers

### 🖥️ Frontend Tab

Exposes renderer process information:

- **App Info**: Application name, version, Vue version, Environment (dev/prod)
- **Performance**: Memory usage, FPS, Render time
- **Pinia Stores**: Real-time state of all registered Pinia stores

### 🔗 IPC Tab

Monitor all IPC communication between renderer and main processes:

- **Live Logging**: Real-time IPC invoke/send events
- **Channel Tracking**: See which channels are being used
- **Data Inspection**: View arguments and return values
- **Auto-scroll**: Automatically scroll to latest entries
- **Test Button**: Send test IPC messages

### 💻 Console Tab

Captures all console output:

- **Filter by Level**: All, Log, Warn, Error
- **Timestamps**: Each log entry has a timestamp
- **Badge Counter**: Shows count of warnings/errors
- **Clear Function**: Clear all console logs

### ⚙️ Settings Tab

Configure DevTools behavior:

- **Auto-refresh**: Automatically refresh backend info
- **Refresh Interval**: Set refresh rate (500ms - 10000ms)
- **Max Log Entries**: Limit log history (50 - 1000)
- **Show IPC Logs**: Toggle IPC logging

## Usage

### Opening/Closing the Panel

1. **Toggle Button**: Click the arrow button at the bottom center of the screen
2. **Keyboard Shortcut**: (Future) `Ctrl+Shift+D` / `Cmd+Shift+D`

### Navigation

The panel has 5 tabs:
- **Backend** - Main process information
- **Frontend** - Renderer process information
- **IPC** - IPC communication logs
- **Console** - Console output
- **Settings** - Configuration options

### Real-time Monitoring

The panel automatically refreshes backend/frontend info every 2 seconds (configurable in Settings).

## IPC Handlers

The following IPC handlers are added for DevTools functionality:

### Main Process Handlers

```typescript
// Get process information
ipcMain.handle('devtools:get-process-info', () => {
  return {
    pid: process.pid,
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
  };
});

// Get memory information
ipcMain.handle('devtools:get-memory-info', () => {
  const memory = process.getProcessMemoryInfo?.() || {};
  return {
    private: memory.private || 0,
    shared: memory.shared || 0,
    residentSetSize: memory.residentSetSize || 0,
  };
});

// Get all windows
ipcMain.handle('devtools:get-windows', () => {
  const windows = BrowserWindow.getAllWindows();
  return windows.map(win => ({
    id: win.id,
    title: win.getTitle(),
    isMinimized: win.isMinimized(),
    isMaximized: win.isMaximized(),
    isFocused: win.isFocused(),
    bounds: win.getBounds(),
  }));
});
```

## Component Integration

### App.vue

The DevToolsPanel is integrated into the main App component:

```vue
<template>
  <div class="App">
    <Sidebar @go-home="goHome" />
    <main class="App-main">
      <!-- Main content -->
    </main>
    <!-- DevTools Panel -->
    <DevToolsPanel />
  </div>
</template>

<script>
import DevToolsPanel from './DevToolsPanel.vue';

export default {
  components: {
    DevToolsPanel,
  },
};
</script>
```

## Styling

The DevTools panel uses CSS variables for theming:

```css
--bg-primary      /* Primary background */
--bg-secondary    /* Secondary background */
--bg-tertiary     /* Tertiary background */
--border          /* Border color */
--text-primary    /* Primary text color */
--text-secondary  /* Secondary text color */
--accent          /* Accent color (indigo) */
```

## Performance Considerations

- **Auto-refresh**: Configurable interval to balance freshness vs performance
- **Log limits**: Maximum log entries to prevent memory buildup
- **FPS monitoring**: Uses `requestAnimationFrame` for accurate FPS calculation
- **Memory tracking**: Uses Chrome's `performance.memory` API

## Future Enhancements

Potential additions for future versions:

1. **Network Tab**: Monitor HTTP requests and responses
2. **Performance Profiler**: Record and analyze performance traces
3. **Event Bus Monitor**: Track event bus communication
4. **State Time Travel**: Debug Pinia store changes over time
5. **Custom Commands**: Execute custom devtools commands
6. **Export Logs**: Download logs for debugging
7. **Remote Debugging**: Connect to remote Electron instances

## Troubleshooting

### Panel not showing

- Ensure `DevToolsPanel` is imported in `App.vue`
- Check that the component is registered correctly
- Verify CSS variables are defined in your styles

### Backend info not updating

- Check IPC handlers are registered in `main.dev.ts`
- Verify `window.electronAPI` is available
- Check console for IPC errors

### IPC logs not appearing

- Enable "Show IPC Logs" in Settings tab
- Check that IPC hook is installed correctly
- Verify auto-scroll is enabled for new entries

## Best Practices

1. **Development Only**: Consider disabling DevTools in production builds
2. **Performance**: Increase refresh interval if experiencing slowdowns
3. **Memory**: Set appropriate max log entries limit
4. **Security**: Don't expose sensitive data in DevTools

## Example Use Cases

### Debugging Memory Leaks

1. Open DevTools panel
2. Go to **Backend** tab
3. Monitor **Memory** section
4. Look for continuously increasing heap usage

### Tracking IPC Issues

1. Open DevTools panel
2. Go to **IPC** tab
3. Enable "Auto-scroll"
4. Perform actions that trigger IPC
5. Check for errors or unexpected data

### Monitoring App Performance

1. Open DevTools panel
2. Go to **Frontend** tab
3. Watch **FPS** counter
4. Check **Render Time** for spikes
5. Correlate with user actions

### Inspecting Pinia State

1. Open DevTools panel
2. Go to **Frontend** tab
3. Scroll to **Pinia Stores** section
4. Expand store data to see current state
5. Monitor changes in real-time

## Related Documentation

- [Testing Guide](./TESTING.md)
- [Biome Setup](./BIOME_SETUP.md)
- [Architecture Overview](./architecture.md)
