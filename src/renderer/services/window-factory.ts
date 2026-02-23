import 'winbox';
import 'winbox/dist/css/winbox.min.css';
import { generateTheme, generateWindowContent } from './window-generator';
import { useWindowStore } from '../stores/windowStore';

declare global {
  interface Window {
    WinBox: any;
  }
}

interface WindowOptions {
  width?: string | number;
  height?: string | number;
  x?: string | number;
  y?: string | number;
  [key: string]: unknown;
}

interface WinBoxWindow {
  body: HTMLElement;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  restore: () => void;
  show: () => void;
  hide: () => void;
  setBackground: (color: string) => void;
  hidden?: boolean;
}

export class WindowFactory {
  static createWindow(
    title: string,
    customContent: string | null = null,
    options: WindowOptions = {}
  ): WinBoxWindow {
    const dynamicContent = customContent || generateWindowContent(title);
    const windowTheme = generateTheme(title);
    const sidebarWidth = 300;
    const edgeGap = 16;
    const headerHeight = 35;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const availableWidth = Math.max(320, screenWidth - sidebarWidth - edgeGap * 2);
    const availableHeight = Math.max(240, screenHeight - edgeGap * 2);
    const defaultWidth = Math.min(500, availableWidth);
    const defaultHeight = Math.min(400, availableHeight);
    const shouldOffset = screenWidth >= 900;

    const windowOptions = {
      title: title,
      html: `<div class="winbox-content"><h3 style="color: ${windowTheme.color};">${title}</h3><div style="color: ${windowTheme.color};" class="winbox-dynamic-content">Loading content...</div></div>`,
      width: defaultWidth,
      height: defaultHeight,
      x: shouldOffset ? sidebarWidth + edgeGap : 'center',
      y: 'center',
      class: ['modern', 'dark-theme', 'app-fullscreen'],
      background: windowTheme.bg,
      border: 4,
      ...options,
    };

    // Access WinBox from the global window object
    const WinBox = (globalThis as any).WinBox || window.WinBox;
    if (!WinBox) {
      throw new Error('WinBox is not available. Please ensure it is properly imported.');
    }

    const winbox = new WinBox(windowOptions);

    // Open windows maximized (app-fullscreen mode, respecting sidebar)
    try {
      // Set to app-fullscreen mode which maximizes within available space
      winbox.maximize();
    } catch (error) {
      // Ignore if maximize is not supported
    }

    // Register with the global window manager for sidebar tracking
    try {
      const windowStore = useWindowStore();
      windowStore.registerWindow(title, winbox);
    } catch (error) {
      // Non-blocking; window can still be used without registration
    }

    // Disable WinBox docked minimize behavior; use hide/show instead.
    if (typeof winbox.hide === 'function') {
      winbox.minimize = function(state?: boolean) {
        if (state === false) {
          winbox.min = false;
          if (typeof winbox.show === 'function') {
            winbox.show();
          }
          if (typeof winbox.onrestore === 'function') {
            winbox.onrestore();
          }
          return winbox;
        }
        winbox.min = true;
        winbox.hide();
        if (typeof winbox.onminimize === 'function') {
          winbox.onminimize();
        }
        return winbox;
      };
    }

    // Set up resize handler to respect sidebar when resizing
    const handleResize = () => {
      const currentScreenW = window.innerWidth;
      const currentScreenH = window.innerHeight;
      const currentAvailWidth = Math.max(320, currentScreenW - sidebarWidth - edgeGap * 2);
      const currentAvailHeight = Math.max(240, currentScreenH - headerHeight - edgeGap * 2);
      
      // Only adjust if window is maximized
      if (winbox.max) {
        winbox.setBounds(
          sidebarWidth + edgeGap,
          headerHeight + edgeGap,
          currentAvailWidth,
          currentAvailHeight
        );
      }
    };

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Override the maximize function to respect sidebar
    const originalMaximize = winbox.maximize;
    winbox.maximize = function() {
      const result = originalMaximize.call(this);
      // After maximizing, adjust bounds to respect sidebar
      setTimeout(() => {
        const winScreenW = window.innerWidth;
        const winScreenH = window.innerHeight;
        const availWidth = Math.max(320, winScreenW - sidebarWidth - edgeGap * 2);
        const availHeight = Math.max(240, winScreenH - headerHeight - edgeGap * 2);
        
        this.setBounds(
          sidebarWidth + edgeGap,
          headerHeight + edgeGap,
          availWidth,
          availHeight
        );
      }, 10);
      return result;
    };

    setTimeout(() => {
      if (winbox?.body) {
        const contentDiv = winbox.body.querySelector('.winbox-dynamic-content');
        if (contentDiv) {
          contentDiv.innerHTML = dynamicContent;
        } else {
          winbox.body.innerHTML = `<div class="winbox-content"><h3 style="color: ${windowTheme.color};">${title}</h3><div style="color: ${windowTheme.color};">${dynamicContent}</div></div>`;
        }
      }
    }, 10);

    return winbox;
  }
}
