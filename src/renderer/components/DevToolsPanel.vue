<template>
  <div class="devtools-panel" :class="{ 'panel-collapsed': isCollapsed }">
    <!-- Toggle Button -->
    <button
      class="devtools-toggle"
      @click="togglePanel"
      :title="isCollapsed ? 'Open DevTools' : 'Close DevTools'"
    >
      <svg v-if="isCollapsed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Panel Content -->
    <div class="devtools-content">
      <!-- Header -->
      <div class="devtools-header">
        <div class="devtools-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          DevTools
        </div>
        <div class="devtools-actions">
          <button class="action-btn" @click="refreshAll" title="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          <button class="action-btn" @click="clearLogs" title="Clear Logs">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="devtools-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.iconText }}</span>
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="devtools-body">
        <!-- Backend Tab -->
        <div v-if="activeTab === 'backend'" class="tab-content backend-tab">
          <div class="info-grid">
            <div class="info-card">
              <h4>Process Info</h4>
              <div class="info-row">
                <span class="info-label">PID:</span>
                <span class="info-value">{{ backendInfo.pid }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Platform:</span>
                <span class="info-value">{{ backendInfo.platform }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Arch:</span>
                <span class="info-value">{{ backendInfo.arch }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Node:</span>
                <span class="info-value">{{ backendInfo.nodeVersion }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Electron:</span>
                <span class="info-value">{{ backendInfo.electronVersion }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Chrome:</span>
                <span class="info-value">{{ backendInfo.chromeVersion }}</span>
              </div>
            </div>

            <div class="info-card">
              <h4>Memory</h4>
              <div class="info-row">
                <span class="info-label">RSS:</span>
                <span class="info-value">{{ formatBytes(backendInfo.memory.rss) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Heap Total:</span>
                <span class="info-value">{{ formatBytes(backendInfo.memory.heapTotal) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Heap Used:</span>
                <span class="info-value">{{ formatBytes(backendInfo.memory.heapUsed) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">External:</span>
                <span class="info-value">{{ formatBytes(backendInfo.memory.external) }}</span>
              </div>
            </div>

            <div class="info-card">
              <h4>Windows</h4>
              <div class="window-list">
                <div v-for="win in backendInfo.windows" :key="win.id" class="window-item">
                  <span class="window-name">{{ win.name || 'Unnamed' }}</span>
                  <span class="window-id">#{{ win.id }}</span>
                </div>
                <div v-if="backendInfo.windows.length === 0" class="no-data">No windows</div>
              </div>
            </div>

            <div class="info-card">
              <h4>IPC Channels</h4>
              <div class="channel-list">
                <div v-for="channel in backendInfo.ipcChannels" :key="channel" class="channel-item">
                  <code>{{ channel }}</code>
                </div>
                <div v-if="backendInfo.ipcChannels.length === 0" class="no-data">No channels registered</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Frontend Tab -->
        <div v-if="activeTab === 'frontend'" class="tab-content frontend-tab">
          <div class="info-grid">
            <div class="info-card">
              <h4>App Info</h4>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">{{ frontendInfo.appName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Version:</span>
                <span class="info-value">{{ frontendInfo.version }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vue:</span>
                <span class="info-value">{{ frontendInfo.vueVersion }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Environment:</span>
                <span class="info-value" :class="frontendInfo.isDev ? 'dev' : 'prod'">
                  {{ frontendInfo.isDev ? 'Development' : 'Production' }}
                </span>
              </div>
            </div>

            <div class="info-card">
              <h4>Performance</h4>
              <div class="info-row">
                <span class="info-label">Memory:</span>
                <span class="info-value">{{ formatBytes(frontendInfo.memory.usedJSHeapSize) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">FPS:</span>
                <span class="info-value">{{ frontendInfo.fps }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Render Time:</span>
                <span class="info-value">{{ frontendInfo.renderTime }}ms</span>
              </div>
            </div>

            <div class="info-card full-width">
              <h4>Pinia Stores</h4>
              <div class="stores-list">
                <div v-for="(store, name) in frontendInfo.stores" :key="name" class="store-item">
                  <div class="store-header">
                    <span class="store-name">{{ name }}</span>
                    <span class="store-state">{{ Object.keys(store).length }} keys</span>
                  </div>
                  <pre class="store-data">{{ JSON.stringify(store, null, 2) }}</pre>
                </div>
                <div v-if="Object.keys(frontendInfo.stores).length === 0" class="no-data">No stores registered</div>
              </div>
            </div>
          </div>
        </div>

        <!-- IPC Tab -->
        <div v-if="activeTab === 'ipc'" class="tab-content ipc-tab">
          <div class="ipc-controls">
            <button class="test-btn" @click="sendTestIPC">Send Test IPC</button>
            <label class="auto-scroll-label">
              <input type="checkbox" v-model="autoScroll" />
              Auto-scroll
            </label>
          </div>
          <div class="ipc-log" ref="ipcLogRef">
            <div v-for="(log, index) in ipcLogs" :key="index" class="ipc-log-entry" :class="log.type">
              <span class="log-time">{{ log.timestamp }}</span>
              <span class="log-type">{{ log.type }}</span>
              <span class="log-channel">{{ log.channel }}</span>
              <span class="log-data">{{ formatIPCData(log.data) }}</span>
            </div>
            <div v-if="ipcLogs.length === 0" class="no-data">No IPC activity</div>
          </div>
        </div>

        <!-- Console Tab -->
        <div v-if="activeTab === 'console'" class="tab-content console-tab">
          <div class="console-filters">
            <button
              v-for="level in ['all', 'log', 'warn', 'error']"
              :key="level"
              :class="['filter-btn', { active: consoleFilter === level }]"
              @click="consoleFilter = level"
            >
              {{ level.toUpperCase() }}
            </button>
          </div>
          <div class="console-output">
            <div v-for="(log, index) in filteredConsoleLogs" :key="index" class="console-entry" :class="log.level">
              <span class="log-time">{{ log.timestamp }}</span>
              <span class="log-level">{{ log.level }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="filteredConsoleLogs.length === 0" class="no-data">No console output</div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-content settings-tab">
          <div class="settings-grid">
            <div class="setting-item">
              <label>
                <span class="setting-label">Auto-refresh</span>
                <span class="setting-desc">Automatically refresh backend info</span>
              </label>
              <input type="checkbox" v-model="settings.autoRefresh" />
            </div>
            <div class="setting-item">
              <label>
                <span class="setting-label">Refresh Interval</span>
                <span class="setting-desc">Backend info refresh rate (ms)</span>
              </label>
              <input type="number" v-model.number="settings.refreshInterval" min="500" max="10000" step="500" />
            </div>
            <div class="setting-item">
              <label>
                <span class="setting-label">Max Log Entries</span>
                <span class="setting-desc">Maximum number of log entries to keep</span>
              </label>
              <input type="number" v-model.number="settings.maxLogEntries" min="50" max="1000" step="50" />
            </div>
            <div class="setting-item">
              <label>
                <span class="setting-label">Show IPC Logs</span>
                <span class="setting-desc">Log all IPC communication</span>
              </label>
              <input type="checkbox" v-model="settings.logIPC" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useWindowStore } from '../stores/windowStore';

export default {
  name: 'DevToolsPanel',
  setup() {
    const isCollapsed = ref(true);
    const activeTab = ref('backend');
    const autoScroll = ref(true);
    const consoleFilter = ref('all');
    const ipcLogRef = ref(null);

    const tabs = ref([
      { id: 'backend', label: 'Backend', iconText: '🖥️', badge: null },
      { id: 'frontend', label: 'Frontend', iconText: '🎨', badge: null },
      { id: 'ipc', label: 'IPC', iconText: '🔌', badge: null },
      { id: 'console', label: 'Console', iconText: '💬', badge: null },
      { id: 'settings', label: 'Settings', iconText: '⚙️', badge: null },
    ]);

    const backendInfo = ref({
      pid: 0,
      platform: '',
      arch: '',
      nodeVersion: '',
      electronVersion: '',
      chromeVersion: '',
      memory: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
      windows: [],
      ipcChannels: [],
    });

    const frontendInfo = ref({
      appName: 'Electron Vue App',
      version: '0.1.2',
      vueVersion: '3.5.x',
      isDev: true,
      memory: { usedJSHeapSize: 0 },
      fps: 60,
      renderTime: 0,
      stores: {},
    });

    const ipcLogs = ref([]);
    const consoleLogs = ref([]);

    const settings = ref({
      autoRefresh: true,
      refreshInterval: 2000,
      maxLogEntries: 200,
      logIPC: true,
    });

    let refreshInterval = null;
    let fpsInterval = null;

    const filteredConsoleLogs = computed(() => {
      if (consoleFilter.value === 'all') return consoleLogs.value;
      return consoleLogs.value.filter(log => log.level === consoleFilter.value);
    });

    const togglePanel = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatIPCData = (data) => {
      if (typeof data === 'object') {
        return JSON.stringify(data).slice(0, 100);
      }
      return String(data);
    };

    const refreshBackendInfo = async () => {
      try {
        if (window.electronAPI) {
          // Get process info
          const processInfo = await window.electronAPI.ipc.invoke('devtools:get-process-info');
          backendInfo.value.pid = processInfo.pid;
          backendInfo.value.platform = processInfo.platform;
          backendInfo.value.arch = processInfo.arch;
          backendInfo.value.nodeVersion = processInfo.nodeVersion;
          backendInfo.value.electronVersion = processInfo.electronVersion;
          backendInfo.value.chromeVersion = processInfo.chromeVersion;

          // Get memory info
          const memoryInfo = await window.electronAPI.ipc.invoke('devtools:get-memory-info');
          backendInfo.value.memory = {
            rss: memoryInfo.residentSetSize || memoryInfo.private || 0,
            heapTotal: process.memoryUsage?.().heapTotal || 0,
            heapUsed: process.memoryUsage?.().heapUsed || 0,
            external: process.memoryUsage?.().external || 0,
          };

          // Get windows
          const windows = await window.electronAPI.ipc.invoke('devtools:get-windows');
          backendInfo.value.windows = windows;
        }

        // Get IPC channels (mock - in real app track registered handlers)
        backendInfo.value.ipcChannels = [
          'fs:readFile',
          'fs:writeFile',
          'window:minimize',
          'window:maximize',
          'app:getVersion',
          'system:getPlatform',
          'devtools:get-process-info',
          'devtools:get-memory-info',
          'devtools:get-windows',
        ];
      } catch (error) {
        console.error('Failed to refresh backend info:', error);
      }
    };

    const refreshFrontendInfo = () => {
      frontendInfo.value.memory = {
        usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
      };

      // Get Pinia stores
      try {
        const { useWindowStore } = require('../stores/windowStore');
        const windowStore = useWindowStore();
        frontendInfo.value.stores = {
          windows: {
            count: windowStore.windows.length,
            windows: windowStore.windows.map(w => ({
              id: w.id,
              title: w.title,
              minimized: w.minimized,
              focused: w.focused,
            })),
          },
        };
      } catch (e) {
        // Pinia stores not available
      }
    };

    const calculateFPS = () => {
      let lastTime = performance.now();
      let frames = 0;
      let fps = 60;

      const loop = () => {
        frames++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          fps = frames;
          frames = 0;
          lastTime = now;
          frontendInfo.value.fps = fps;
        }
        requestAnimationFrame(loop);
      };
      loop();
    };

    const addIPCLog = (type, channel, data) => {
      if (!settings.value.logIPC) return;

      const now = new Date();
      ipcLogs.value.push({
        timestamp: now.toLocaleTimeString(),
        type,
        channel,
        data,
      });

      // Limit log entries
      if (ipcLogs.value.length > settings.value.maxLogEntries) {
        ipcLogs.value.shift();
      }

      // Update badge
      const ipcTab = tabs.value.find(t => t.id === 'ipc');
      if (ipcTab) {
        ipcTab.badge = ipcLogs.value.length;
      }
    };

    const sendTestIPC = async () => {
      try {
        const result = await window.electronAPI?.ipc.invoke('app:getVersion');
        addIPCLog('invoke', 'app:getVersion', { result });
      } catch (error) {
        addIPCLog('error', 'app:getVersion', { error: error.message });
      }
    };

    const clearLogs = () => {
      ipcLogs.value = [];
      consoleLogs.value = [];
      tabs.value.forEach(tab => {
        if (tab.id === 'ipc' || tab.id === 'console') {
          tab.badge = null;
        }
      });
    };

    const refreshAll = () => {
      refreshBackendInfo();
      refreshFrontendInfo();
    };

    // Override console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    const addConsoleLog = (level, args) => {
      const now = new Date();
      consoleLogs.value.push({
        timestamp: now.toLocaleTimeString(),
        level,
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
      });

      // Limit log entries
      if (consoleLogs.value.length > settings.value.maxLogEntries) {
        consoleLogs.value.shift();
      }

      // Update badge
      const consoleTab = tabs.value.find(t => t.id === 'console');
      if (consoleTab) {
        const count = consoleLogs.value.filter(l => l.level === 'error' || l.level === 'warn').length;
        consoleTab.badge = count > 0 ? count : null;
      }
    };

    // Watch for auto-scroll
    watch(ipcLogs, () => {
      if (autoScroll.value && ipcLogRef.value) {
        ipcLogRef.value.scrollTop = ipcLogRef.value.scrollHeight;
      }
    }, { deep: true });

    onMounted(() => {
      refreshBackendInfo();
      refreshFrontendInfo();
      calculateFPS();

      // Auto-refresh
      if (settings.value.autoRefresh) {
        refreshInterval = setInterval(() => {
          refreshBackendInfo();
          refreshFrontendInfo();
        }, settings.value.refreshInterval);
      }

      // Override console
      console.log = (...args) => {
        originalConsole.log.apply(console, args);
        addConsoleLog('log', args);
      };
      console.warn = (...args) => {
        originalConsole.warn.apply(console, args);
        addConsoleLog('warn', args);
      };
      console.error = (...args) => {
        originalConsole.error.apply(console, args);
        addConsoleLog('error', args);
      };

      // Hook into IPC if available
      if (window.electronAPI) {
        const originalInvoke = window.electronAPI.ipc.invoke;
        window.electronAPI.ipc.invoke = async (channel, ...args) => {
          addIPCLog('invoke', channel, args);
          return originalInvoke.call(window.electronAPI.ipc, channel, ...args);
        };
      }
    });

    onUnmounted(() => {
      if (refreshInterval) clearInterval(refreshInterval);
      
      // Restore console
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    });

    return {
      isCollapsed,
      activeTab,
      tabs,
      backendInfo,
      frontendInfo,
      ipcLogs,
      consoleLogs,
      filteredConsoleLogs,
      consoleFilter,
      autoScroll,
      settings,
      ipcLogRef,
      togglePanel,
      formatBytes,
      formatIPCData,
      refreshAll,
      clearLogs,
      sendTestIPC,
    };
  },
};
</script>

<style scoped>
.devtools-panel {
  position: fixed;
  bottom: 0;
  left: 300px;
  right: 0;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  z-index: 9999;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.devtools-panel.panel-collapsed {
  transform: translateY(calc(100% - 32px));
}

.devtools-toggle {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 32px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.devtools-toggle:hover {
  background: var(--border);
}

.devtools-content {
  display: flex;
  flex-direction: column;
  height: 400px;
  min-height: 200px;
  max-height: 80vh;
}

.devtools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
}

.devtools-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.devtools-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--border);
}

.devtools-tabs {
  display: flex;
  gap: 2px;
  padding: 0 12px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
}

.tab-icon {
  font-size: 16px;
  line-height: 1;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 4px 4px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--bg-secondary);
  color: var(--accent);
}

.tab-badge {
  background: var(--accent);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.devtools-body {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--bg-secondary);
}

.tab-content {
  height: 100%;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.info-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.info-card h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 12px;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.info-value.dev {
  color: #f59e0b;
}

.info-value.prod {
  color: #10b981;
}

.window-list,
.channel-list,
.stores-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.window-item,
.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  font-size: 11px;
}

.window-name {
  color: var(--text-primary);
}

.window-id {
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}

.channel-item code {
  background: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: var(--accent);
}

.store-item {
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.store-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
}

.store-name {
  font-weight: 600;
  font-size: 12px;
  color: var(--text-primary);
}

.store-state {
  font-size: 11px;
  color: var(--text-secondary);
}

.store-data {
  padding: 12px;
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  max-height: 150px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.ipc-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.test-btn {
  padding: 6px 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.test-btn:hover {
  background: #6366f1;
}

.auto-scroll-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}

.ipc-log,
.console-output {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 8px;
  height: calc(100% - 60px);
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.ipc-log-entry,
.console-entry {
  display: grid;
  grid-template-columns: 60px 50px 120px 1fr;
  gap: 8px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border);
}

.ipc-log-entry:last-child,
.console-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: var(--text-secondary);
}

.log-type,
.log-level {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10px;
}

.log-type.invoke,
.log-level.log {
  color: #10b981;
}

.log-type.error,
.log-level.error {
  color: #ef4444;
}

.log-type.warn,
.log-level.warn {
  color: #f59e0b;
}

.log-channel {
  color: var(--accent);
}

.log-data,
.log-message {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.console-filters {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.filter-btn {
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-btn:hover {
  background: var(--border);
}

.filter-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.setting-item label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 11px;
  color: var(--text-secondary);
}

.setting-item input[type="checkbox"],
.setting-item input[type="number"] {
  margin-left: 12px;
}

.setting-item input[type="number"] {
  width: 80px;
  padding: 6px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
}

.no-data {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
  font-size: 12px;
  font-style: italic;
}

/* Scrollbar styling */
.devtools-body::-webkit-scrollbar,
.window-list::-webkit-scrollbar,
.channel-list::-webkit-scrollbar,
.stores-list::-webkit-scrollbar,
.ipc-log::-webkit-scrollbar,
.console-output::-webkit-scrollbar {
  width: 8px;
}

.devtools-body::-webkit-scrollbar-track,
.ipc-log::-webkit-scrollbar-track,
.console-output::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

.devtools-body::-webkit-scrollbar-thumb,
.ipc-log::-webkit-scrollbar-thumb,
.console-output::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.devtools-body::-webkit-scrollbar-thumb:hover,
.ipc-log::-webkit-scrollbar-thumb:hover,
.console-output::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>
