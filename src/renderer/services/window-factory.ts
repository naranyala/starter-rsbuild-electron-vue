import 'winbox';
import 'winbox/dist/css/winbox.min.css';
import { generateTheme, generateWindowContent } from './window-generator';

declare global {
  interface Window {
    WinBox: any;
  }
}

interface WindowOptions {
  width?: string;
  height?: string;
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
  setBackground: (color: string) => void;
}

export class WindowFactory {
  static createWindow(
    title: string,
    customContent: string | null = null,
    options: WindowOptions = {}
  ): WinBoxWindow {
    const dynamicContent = customContent || generateWindowContent(title);
    const windowTheme = generateTheme(title);

    const windowOptions = {
      title: title,
      html: `<div class="winbox-content"><h3 style="color: ${windowTheme.color};">${title}</h3><div style="color: ${windowTheme.color};" class="winbox-dynamic-content">Loading content...</div></div>`,
      width: '500px',
      height: '400px',
      x: 'center',
      y: 'center',
      class: 'modern',
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
