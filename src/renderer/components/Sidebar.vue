<template>
  <aside class="sidebar" :class="{ 'sidebar-hidden': !sidebarVisible }">
    <div class="sidebar-backdrop" v-if="sidebarVisible && isSmallScreen" @click="toggleSidebar"></div>

    <div class="sidebar-content">
      <!-- Home Button -->
      <div class="sidebar-header">
        <button class="home-button" @click="goHome">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          HOME
        </button>

        <button
          class="sidebar-toggle"
          @click="toggleSidebar"
          v-if="isSmallScreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Opened Windows Section -->
      <div class="opened-windows-section">
        <h3 class="section-title">Opened Windows</h3>
        <div class="window-cards">
          <div
            v-for="window in openedWindows"
            :key="window.id"
            class="window-card"
            :class="{
              'window-card-minimized': window.minimized || window.hidden,
              'window-card-focused': window.focused
            }"
            @click="focusWindow(window)"
          >
            <div class="window-card-content">
              <div class="window-card-title">{{ window.title }}</div>
              <div class="window-card-meta">{{ getWindowStatus(window) }}</div>
            </div>
            <div class="window-card-actions">
              <button
                class="close-window-btn"
                @click.stop="closeWindow(window)"
                title="Close window"
              >
                ×
              </button>
            </div>
          </div>

          <div v-if="openedWindows.length === 0" class="no-windows">
            No windows opened
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useWindowStore } from '../stores/windowStore';
import { windowManager } from '../windows';

export default {
  name: 'Sidebar',
  setup(props, { emit }) {
    const sidebarVisible = ref(true);
    const isSmallScreen = ref(false);
    const windowStore = useWindowStore();
    const { windows: openedWindows } = storeToRefs(windowStore);

    const checkScreenSize = () => {
      isSmallScreen.value = window.innerWidth < 768;
      if (isSmallScreen.value) {
        sidebarVisible.value = false;
      } else {
        sidebarVisible.value = true;
      }
    };

    const toggleSidebar = () => {
      sidebarVisible.value = !sidebarVisible.value;
    };

    const goHome = () => {
      windowStore.minimizeAllWindows();
      emit('go-home');
    };

    const focusWindow = window => {
      if (window.instance) {
        // Use the enhanced window manager to handle focus properly with maximized windows
        if (
          windowManager.focusSpecificWindow &&
          typeof windowManager.focusSpecificWindow === 'function'
        ) {
          windowManager.focusSpecificWindow(window.instance);
        } else {
          // Fallback to basic functionality
          if (
            (window.minimized || window.instance.hidden) &&
            typeof window.instance.show === 'function'
          ) {
            window.instance.show();
          }
          if (
            window.instance.min &&
            typeof window.instance.restore === 'function'
          ) {
            window.instance.restore();
          }
          if (typeof window.instance.focus === 'function') {
            window.instance.focus();
          }
        }
      }
    };

    const closeWindow = window => {
      if (window.instance && typeof window.instance.close === 'function') {
        window.instance.close();
      }
    };

    const getWindowStatus = window => {
      if (window.minimized || window.hidden) return 'Minimized';
      if (window.maximized) return 'Maximized';
      if (window.focused) return 'Active';
      return 'Open';
    };

    onMounted(() => {
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkScreenSize);
    });

    return {
      sidebarVisible,
      isSmallScreen,
      openedWindows,
      checkScreenSize,
      toggleSidebar,
      goHome,
      focusWindow,
      closeWindow,
      getWindowStatus,
    };
  },
};
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  width: 300px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar.sidebar-hidden {
  transform: translateX(-100%);
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
}

.sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.home-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.home-button:hover {
  background: #6366f1;
  transform: translateY(-1px);
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sidebar-toggle:hover {
  background: var(--border);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.opened-windows-section {
  flex: 1;
  min-height: 0;
}

.window-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.window-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 2px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.window-card:hover {
  background: var(--bg-primary);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.window-card-minimized {
  opacity: 0.75;
}

.window-card-focused {
  background: rgba(99, 102, 241, 0.18);
  border-color: rgba(99, 102, 241, 0.4);
}

.window-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.window-card-title {
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.window-card-meta {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.window-card-actions {
  display: flex;
  align-items: center;
}

.close-window-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.close-window-btn:hover {
  background: var(--border);
  color: var(--text-primary);
}

.no-windows {
  text-align: center;
  padding: 12px;
  color: var(--text-secondary);
  font-size: 12px;
  font-style: italic;
}

@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
  }

  .sidebar.sidebar-hidden {
    transform: translateX(-100%);
  }

  .sidebar:not(.sidebar-hidden) {
    transform: translateX(0);
  }
}
</style>
