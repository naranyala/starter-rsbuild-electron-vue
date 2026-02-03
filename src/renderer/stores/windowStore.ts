import { defineStore } from 'pinia';
import { ref } from 'vue';

type WinBoxInstance = {
  title?: string;
  hidden?: boolean;
  min?: boolean;
  onclose?: (...args: any[]) => any;
  onminimize?: (...args: any[]) => any;
  onrestore?: (...args: any[]) => any;
  onmaximize?: (...args: any[]) => any;
  onfocus?: (...args: any[]) => any;
  onblur?: (...args: any[]) => any;
  close?: (...args: any[]) => any;
  minimize?: (...args: any[]) => any;
  restore?: (...args: any[]) => any;
  hide?: (...args: any[]) => any;
  show?: (...args: any[]) => any;
  focus?: (...args: any[]) => any;
};

type HandlerName =
  | 'onclose'
  | 'onminimize'
  | 'onrestore'
  | 'onmaximize'
  | 'onfocus'
  | 'onblur';

type WindowEntry = {
  id: string;
  title: string;
  instance: WinBoxInstance;
  timestamp: number;
  minimized: boolean;
  hidden: boolean;
  focused: boolean;
  maximized: boolean;
};

export const useWindowStore = defineStore('windows', () => {
  const windows = ref<WindowEntry[]>([]);

  const notifyUpdate = () => {
    windows.value = [...windows.value];
  };

  const registerWindow = (title: string, instance: WinBoxInstance) => {
    const existingIndex = windows.value.findIndex(w => w.instance === instance);
    if (existingIndex !== -1) {
      windows.value[existingIndex].title = title;
      notifyUpdate();
      return;
    }

    const windowEntry: WindowEntry = {
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      instance,
      timestamp: Date.now(),
      minimized: false,
      hidden: false,
      focused: false,
      maximized: false,
    };

    const updateEntry = (updates: Partial<WindowEntry>) => {
      Object.assign(windowEntry, updates);
      notifyUpdate();
    };

    const chainHandler = (handlerName: HandlerName, next: () => void) => {
      const prev = instance[handlerName];
      instance[handlerName] = function(...args: any[]) {
        let result;
        if (typeof prev === 'function') {
          result = prev.apply(instance, args);
        }
        next();
        return result;
      };
    };

    if (typeof instance.hide === 'function') {
      const originalHide = instance.hide;
      instance.hide = function(...args: any[]) {
        const result = originalHide.apply(instance, args);
        updateEntry({
          hidden: true,
          focused: false,
          minimized: !!instance.min,
        });
        return result;
      };
    }

    if (typeof instance.show === 'function') {
      const originalShow = instance.show;
      instance.show = function(...args: any[]) {
        const result = originalShow.apply(instance, args);
        updateEntry({
          hidden: false,
          minimized: !!instance.min,
        });
        return result;
      };
    }

    if ('onminimize' in instance) {
      chainHandler('onminimize', () => {
        updateEntry({
          minimized: true,
          hidden: !!instance.hidden,
          focused: false,
          maximized: false,
        });
      });
    }

    if ('onrestore' in instance) {
      chainHandler('onrestore', () => {
        updateEntry({
          minimized: false,
          hidden: !!instance.hidden,
          maximized: false,
        });
      });
    }

    if ('onmaximize' in instance) {
      chainHandler('onmaximize', () => {
        updateEntry({
          maximized: true,
          minimized: false,
          hidden: !!instance.hidden,
        });
      });
    }

    if ('onfocus' in instance) {
      chainHandler('onfocus', () => {
        updateEntry({
          focused: true,
          minimized: false,
          hidden: !!instance.hidden,
        });
      });
    }

    if ('onblur' in instance) {
      chainHandler('onblur', () => {
        updateEntry({ focused: false });
      });
    }

    const existingOnClose = instance.onclose;
    instance.onclose = function(...args: any[]) {
      let result;
      if (typeof existingOnClose === 'function') {
        result = existingOnClose.apply(instance, args);
      }
      if (result !== true) {
        unregisterWindow(instance);
      }
      return result;
    };

    if (typeof instance.close === 'function') {
      const originalClose = instance.close;
      instance.close = function(...args: any[]) {
        const result = originalClose.apply(instance, args);
        if (result !== true) {
          unregisterWindow(instance);
        }
        return result;
      };
    }

    windows.value.push(windowEntry);
    notifyUpdate();
  };

  const unregisterWindow = (instance: WinBoxInstance) => {
    const index = windows.value.findIndex(w => w.instance === instance);
    if (index !== -1) {
      windows.value.splice(index, 1);
      notifyUpdate();
    }
  };

  const minimizeAllWindows = () => {
    windows.value.forEach(window => {
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
      window.maximized = false;
    });
    notifyUpdate();
  };

  const focusWindow = (instance: WinBoxInstance) => {
    if (instance && typeof instance.focus === 'function') {
      instance.focus();
    }
  };

  return {
    windows,
    registerWindow,
    unregisterWindow,
    minimizeAllWindows,
    focusWindow,
  };
});
