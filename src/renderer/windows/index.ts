// Import the store
import { useWindowStore } from '../stores/windowStore';

// Global window store to track all open windows
class WindowManager {
  private static windows: WinBoxWrapper[] = [];

  static addWindow(window: WinBoxWrapper) {
    WindowManager.windows.push(window);
  }

  static removeWindow(window: WinBoxWrapper) {
    const index = WindowManager.windows.indexOf(window);
    if (index !== -1) {
      WindowManager.windows.splice(index, 1);
    }
  }

  static getWindows(): WinBoxWrapper[] {
    return [...WindowManager.windows]; // Return a copy to prevent external modification
  }

  static minimizeAll() {
    WindowManager.windows.forEach(window => {
      window.minimize();
    });
  }

  static restoreAll() {
    WindowManager.windows.forEach(window => {
      window.restore();
    });
  }

  static closeAll() {
    [...WindowManager.windows].forEach(window => {
      window.close(); // This will automatically remove it from the array
    });
  }
}

// Define the WinBox-like interface to match the store expectations
interface WinBoxInstance {
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
}

// Proper WinBox implementation with drag, resize, and theming support
class WinBoxWrapper implements WinBoxInstance {
  protected element: HTMLElement;
  private titleBar: HTMLElement;
  private contentDiv: HTMLElement;
  private closeBtn: HTMLElement;
  private minimizeBtn: HTMLElement;
  private maximizeBtn: HTMLElement;
  private isDragging = false;
  private isResizing = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private originalX = 0;
  private originalY = 0;
  private originalWidth = 0;
  private originalHeight = 0;

  // Implement the WinBox-like interface properties
  title?: string;
  hidden = false;
  min = false;
  maximized = false;
  onclose?: (...args: any[]) => any;
  onminimize?: (...args: any[]) => any;
  onrestore?: (...args: any[]) => any;
  onmaximize?: (...args: any[]) => any;
  onfocus?: (...args: any[]) => any;
  onblur?: (...args: any[]) => any;

  constructor(
    title: string,
    content: string,
    options?: { width?: number; height?: number; x?: number; y?: number }
  ) {
    const width = options?.width || 800;
    const height = options?.height || 600;
    const x = options?.x || 50;
    const y = options?.y || 50;

    // Set the title property
    this.title = title;

    // Create window container
    this.element = document.createElement('div');
    this.element.className = 'winbox';
    this.element.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      background: var(--bg-color, #202020);
      color: var(--text-color, #fff);
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      z-index: 10000;
      font-family: Arial, sans-serif;
      overflow: hidden;
      border: 1px solid var(--border-color, #444);
    `;

    // Create title bar
    this.titleBar = document.createElement('div');
    this.titleBar.className = 'wb-title';
    this.titleBar.style.cssText = `
      height: 36px;
      background: var(--title-bg, #333);
      color: var(--title-color, #fff);
      display: flex;
      align-items: center;
      padding: 0 10px;
      cursor: move;
      user-select: none;
      border-bottom: 1px solid var(--border-color, #444);
    `;
    this.titleBar.textContent = title;

    // Create controls container
    const controls = document.createElement('div');
    controls.className = 'wb-control';
    controls.style.cssText = `
      margin-left: auto;
      display: flex;
      gap: 5px;
    `;

    // Create control buttons with SVG icons
    this.minimizeBtn = document.createElement('button');
    this.minimizeBtn.className = 'wb-min';
    this.minimizeBtn.style.cssText = `
      width: 20px;
      height: 20px;
      background: #ffbd2e;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
    `;
    this.minimizeBtn.innerHTML = `<svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="1" fill="#000"/>
    </svg>`;

    this.maximizeBtn = document.createElement('button');
    this.maximizeBtn.className = 'wb-max';
    this.maximizeBtn.style.cssText = `
      width: 20px;
      height: 20px;
      background: #2ecc40;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
    `;
    this.maximizeBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H9V9H1V1Z" stroke="#000" stroke-width="1.5" fill="none"/>
    </svg>`;

    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'wb-close';
    this.closeBtn.style.cssText = `
      width: 20px;
      height: 20px;
      background: #ff5f57;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
    `;
    this.closeBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L9 9M9 1L1 9" stroke="#000" stroke-width="1.5"/>
    </svg>`;

    // Add buttons to controls
    controls.appendChild(this.minimizeBtn);
    controls.appendChild(this.maximizeBtn);
    controls.appendChild(this.closeBtn);

    // Add controls to title bar
    this.titleBar.appendChild(controls);

    // Create content area
    this.contentDiv = document.createElement('div');
    this.contentDiv.className = 'wb-body';
    this.contentDiv.style.cssText = `
      flex: 1;
      padding: 15px;
      overflow: auto;
      background: var(--content-bg, #1a1a1a);
      color: var(--content-color, #ddd);
    `;
    this.contentDiv.innerHTML = content;

    // Assemble window
    this.element.appendChild(this.titleBar);
    this.element.appendChild(this.contentDiv);

    // Add to document
    document.body.appendChild(this.element);

    // Register window with the manager
    WindowManager.addWindow(this);

    // Setup event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Drag functionality
    this.titleBar.addEventListener('mousedown', e => {
      if (
        e.target !== this.minimizeBtn &&
        e.target !== this.maximizeBtn &&
        e.target !== this.closeBtn
      ) {
        this.isDragging = true;
        this.dragOffsetX = e.clientX - this.element.offsetLeft;
        this.dragOffsetY = e.clientY - this.element.offsetTop;

        // Bring to front
        this.element.style.zIndex = `${Date.now()}`;

        // Trigger focus event
        if (this.onfocus) {
          this.onfocus();
        }

        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', e => {
      if (this.isDragging) {
        const newX = e.clientX - this.dragOffsetX;
        const newY = e.clientY - this.dragOffsetY;

        // Boundary checks
        const boundedX = Math.max(
          0,
          Math.min(window.innerWidth - this.element.offsetWidth, newX)
        );
        const boundedY = Math.max(
          0,
          Math.min(window.innerHeight - this.element.offsetHeight, newY)
        );

        this.element.style.left = `${boundedX}px`;
        this.element.style.top = `${boundedY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;

      // Trigger blur event when releasing drag
      if (this.onblur) {
        this.onblur();
      }
    });

    // Close button
    this.closeBtn.addEventListener('click', () => {
      if (this.onclose) {
        this.onclose();
      }
      this.close();
    });

    // Minimize button
    this.minimizeBtn.addEventListener('click', () => {
      this.element.style.display = 'none';
      this.min = true;
      this.hidden = true;
      if (this.onminimize) {
        this.onminimize();
      }
    });

    // Maximize button
    this.maximizeBtn.addEventListener('click', () => {
      if (this.element.style.width === 'calc(100vw - 320px)') {
        // Account for sidebar width (300px + 20px padding)
        // Restore to original size
        this.element.style.width = `${this.originalWidth}px`;
        this.element.style.height = `${this.originalHeight}px`;
        this.element.style.left = `${this.originalX}px`;
        this.element.style.top = `${this.originalY}px`;

        // Update state
        this.min = false;
        this.hidden = false;
        this.maximized = false;

        if (this.onrestore) {
          this.onrestore();
        }
      } else {
        // Store original dimensions
        this.originalX = parseInt(this.element.style.left, 10);
        this.originalY = parseInt(this.element.style.top, 10);
        this.originalWidth = parseInt(this.element.style.width, 10);
        this.originalHeight = parseInt(this.element.style.height, 10);

        // Maximize but account for sidebar width (300px sidebar + 20px padding)
        this.element.style.width = 'calc(100vw - 320px)';
        this.element.style.height = 'calc(100vh - 20px)';
        this.element.style.left = '310px'; // Position to the right of the sidebar (300px + 10px padding)
        this.element.style.top = '10px';

        // Update state
        this.maximized = true;

        if (this.onmaximize) {
          this.onmaximize();
        }
      }
    });
  }

  setTitle(title: string) {
    this.title = title;
    this.titleBar.textContent = title;
  }

  focus() {
    this.element.style.zIndex = `${Date.now()}`;
    // Ensure the window doesn't go under the sidebar when brought to front
    if (parseInt(this.element.style.left) < 310) {
      // If window is positioned to the left of the sidebar
      this.element.style.left = '310px'; // Position it to the right of the sidebar
    }
    if (this.onfocus) {
      this.onfocus();
    }
  }

  close() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      WindowManager.removeWindow(this);
    }
  }

  // Implement the WinBox-like methods
  minimize() {
    this.element.style.display = 'none';
    this.min = true;
    this.hidden = true;
    if (this.onminimize) {
      this.onminimize();
    }
  }

  restore() {
    this.element.style.display = 'flex';
    this.min = false;
    this.hidden = false;
    if (this.onrestore) {
      this.onrestore();
    }
  }

  hide() {
    this.element.style.display = 'none';
    this.hidden = true;
  }

  show() {
    this.element.style.display = 'flex';
    this.hidden = false;
  }
}

export class ElectronIntroWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Intro',
      '<div><h2>Electron Introduction</h2><p>Welcome to Electron development!</p></div>',
      { width: 800, height: 600, x: 100, y: 50 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Intro', window);

    return window;
  }
}

export class ElectronArchitectureWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Architecture',
      '<div><h2>Electron Architecture</h2><p>Main and Renderer processes...</p></div>',
      { width: 800, height: 600, x: 150, y: 100 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Architecture', window);

    return window;
  }
}

export class ElectronSecurityWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Security',
      '<div><h2>Electron Security</h2><p>Security best practices...</p></div>',
      { width: 800, height: 600, x: 200, y: 150 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Security', window);

    return window;
  }
}

export class ElectronPackagingWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Packaging',
      '<div><h2>Electron Packaging</h2><p>How to package your app...</p></div>',
      { width: 800, height: 600, x: 250, y: 200 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Packaging', window);

    return window;
  }
}

export class ElectronNativeAPIsWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Native APIs',
      '<div><h2>Electron Native APIs</h2><p>Accessing native OS features...</p></div>',
      { width: 800, height: 600, x: 300, y: 250 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Native APIs', window);

    return window;
  }
}

export class ElectronPerformanceWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Performance',
      '<div><h2>Electron Performance</h2><p>Optimizing performance...</p></div>',
      { width: 800, height: 600, x: 350, y: 300 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Performance', window);

    return window;
  }
}

export class ElectronDevelopmentWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Development',
      '<div><h2>Electron Development</h2><p>Development workflow...</p></div>',
      { width: 800, height: 600, x: 400, y: 350 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Development', window);

    return window;
  }
}

export class ElectronVersionsWindow {
  static create() {
    const window = new WinBoxWrapper(
      'Electron Versions',
      '<div><h2>Electron Versions</h2><p>Version management...</p></div>',
      { width: 800, height: 600, x: 450, y: 400 }
    );

    // Register with the store
    const store = useWindowStore();
    store.registerWindow('Electron Versions', window);

    return window;
  }
}

export class WindowFactory {
  static createWindow(type: string) {
    switch (type) {
      case 'intro':
        return ElectronIntroWindow.create();
      case 'architecture':
        return ElectronArchitectureWindow.create();
      case 'security':
        return ElectronSecurityWindow.create();
      case 'packaging':
        return ElectronPackagingWindow.create();
      case 'native-apis':
        return ElectronNativeAPIsWindow.create();
      case 'performance':
        return ElectronPerformanceWindow.create();
      case 'development':
        return ElectronDevelopmentWindow.create();
      case 'versions':
        return ElectronVersionsWindow.create();
      default:
        return ElectronIntroWindow.create();
    }
  }
}

// Export the window manager functions for use in the sidebar
export const windowManager = {
  minimizeAll: WindowManager.minimizeAll,
  restoreAll: WindowManager.restoreAll,
  closeAll: WindowManager.closeAll,
  getWindows: WindowManager.getWindows,

  // Function to focus a specific window, handling maximized windows appropriately
  focusSpecificWindow: (targetWindow: WinBoxWrapper) => {
    // First, restore any currently maximized windows
    WindowManager.getWindows().forEach(window => {
      if (window.maximized && window !== targetWindow) {
        window.restore();
      }
    });

    // Then focus the target window
    targetWindow.focus();

    // If the target window was minimized or hidden, show it
    if (targetWindow.hidden || targetWindow.min) {
      targetWindow.show();
    }
  },
};
