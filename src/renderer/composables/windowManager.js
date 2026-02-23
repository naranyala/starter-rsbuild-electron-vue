import { ref } from 'vue';

// Global store for windows (reactive)
const windows = ref([]);

// Force Vue to notice in-place mutations
function notifyUpdate() {
  console.log('Notifying update, windows count:', windows.value.length); // Debug log
  windows.value = [...windows.value];
}

export const WindowManager = {
  registerWindow(title, instance) {
    console.log('Registering window:', title, instance); // Debug log

    // Check if window already exists
    const existingIndex = windows.value.findIndex(w => w.instance === instance);

    if (existingIndex !== -1) {
      // Update existing window
      windows.value[existingIndex].title = title;
      console.log('Updated existing window'); // Debug log
      notifyUpdate();
    } else {
      // Create a new window entry
      const windowEntry = {
        id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title,
        instance,
        timestamp: Date.now(),
        minimized: false,
        hidden: false,
        focused: false
      };

      const updateEntry = (updates) => {
        Object.assign(windowEntry, updates);
        notifyUpdate();
      };

      const chainHandler = (handlerName, next) => {
        const prev = instance[handlerName];
        instance[handlerName] = function(...args) {
          let result;
          if (typeof prev === 'function') {
            result = prev.apply(instance, args);
          }
          next(...args);
          return result;
        };
      };

      // Track hide/show to reflect hidden state
      if (typeof instance.hide === 'function') {
        const originalHide = instance.hide;
        instance.hide = function(...args) {
          const result = originalHide.apply(instance, args);
          updateEntry({ hidden: true, focused: false, minimized: !!instance.min });
          return result;
        };
      }
      if (typeof instance.show === 'function') {
        const originalShow = instance.show;
        instance.show = function(...args) {
          const result = originalShow.apply(instance, args);
          updateEntry({ hidden: false, minimized: !!instance.min });
          return result;
        };
      }

      // Track WinBox lifecycle + state changes via callbacks if available
      if ('onminimize' in instance) {
        chainHandler('onminimize', () => {
          updateEntry({ minimized: true, hidden: !!instance.hidden, focused: false });
        });
      }
      if ('onrestore' in instance) {
        chainHandler('onrestore', () => {
          updateEntry({ minimized: false, hidden: !!instance.hidden });
        });
      }
      if ('onfocus' in instance) {
        chainHandler('onfocus', () => {
          updateEntry({ focused: true, minimized: false, hidden: !!instance.hidden });
        });
      }
      if ('onblur' in instance) {
        chainHandler('onblur', () => {
          updateEntry({ focused: false });
        });
      }

      // Remove from list when closed (WinBox uses onclose callback)
      const existingOnClose = instance.onclose;
      instance.onclose = function(...args) {
        let result;
        if (typeof existingOnClose === 'function') {
          result = existingOnClose.apply(instance, args);
        }
        if (result !== true) {
          WindowManager.unregisterWindow(instance);
        }
        return result;
      };

      // Store original close method and wrap it as a fallback
      const originalClose = instance.close;
      if (typeof originalClose === 'function') {
        instance.close = function(...args) {
          console.log('Window close method called'); // Debug log
          const result = originalClose.apply(instance, args);
          if (result !== true) {
            WindowManager.unregisterWindow(instance);
          }
          return result;
        };
      }

      windows.value.push(windowEntry);
      console.log('Added new window, total count:', windows.value.length); // Debug log
      notifyUpdate();
    }
  },

  unregisterWindow(instance) {
    console.log('Unregistering window:', instance); // Debug log
    const index = windows.value.findIndex(w => w.instance === instance);
    if (index !== -1) {
      windows.value.splice(index, 1);
      console.log('Removed window, total count:', windows.value.length); // Debug log
      notifyUpdate();
    }
  },

  getWindows() {
    return [...windows.value]; // Return a copy to prevent direct mutation
  },

  getAllWindowsCount() {
    return windows.value.length;
  },

  closeAllWindows() {
    [...windows.value].forEach(window => {
      if (window.instance && typeof window.instance.close === 'function') {
        window.instance.close();
      }
    });
  },

  minimizeAllWindows() {
    [...windows.value].forEach(window => {
      if (window.instance) {
        if (typeof window.instance.minimize === 'function') {
          window.instance.minimize();
        } else if (typeof window.instance.hide === 'function') {
          window.instance.hide();
        }
      }
      window.minimized = true;
      window.hidden = !!window.instance?.hidden;
      window.focused = false;
    });
    notifyUpdate();
  },

  focusWindow(instance) {
    if (instance && typeof instance.focus === 'function') {
      instance.focus();
    }
  }
};

export function useWindowManager() {
  return {
    windows,
    registerWindow: WindowManager.registerWindow,
    unregisterWindow: WindowManager.unregisterWindow,
    getWindows: WindowManager.getWindows,
    getAllWindowsCount: WindowManager.getAllWindowsCount,
    closeAllWindows: WindowManager.closeAllWindows,
    minimizeAllWindows: WindowManager.minimizeAllWindows,
    focusWindow: WindowManager.focusWindow,
  };
}

// Export the raw windows ref and update function for direct access if needed
export { windows, notifyUpdate };
