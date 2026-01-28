// WinBox Service for Vue Integration
import { WindowContentGenerator } from './window-content-generator';

interface WinBoxInstance {
  close: () => void;
  maximize: () => void;
  fullscreen: () => void;
  restore: () => void;
  addClass: (className: string) => void;
  [key: string]: any;
}

interface WinBoxOptions {
  id?: string;
  title?: string;
  content?: string;
  width?: string;
  height?: string;
  x?: string;
  y?: string;
  enableMaximize?: boolean;
  enableMinimize?: boolean;
  modal?: boolean;
  useRandomContent?: boolean;
}

interface CreateWindowOptions extends WinBoxOptions {
  id: string;
  title: string;
  content?: string;
  width?: string;
  height?: string;
  x?: string;
  y?: string;
  enableMaximize?: boolean;
  enableMinimize?: boolean;
  modal?: boolean;
  useRandomContent?: boolean;
}

class WinBoxService {
  private isReady: boolean = false;
  private pendingOperations: Array<{ execute: () => any }> = [];
  private instances: Map<string, WinBoxInstance> = new Map();
  private contentGenerator: WindowContentGenerator;

  constructor() {
    this.contentGenerator = new WindowContentGenerator();

    // Check if WinBox is available and DOM is ready
    this.init();
  }

  async init(): Promise<void> {
    // Wait for DOM to be ready and WinBox to be available
    await this.waitForDomAndLibrary();
    this.isReady = true;

    // Process any pending operations
    this.processPendingOperations();
  }

  waitForDomAndLibrary(): Promise<void> {
    return new Promise(resolve => {
      const checkReady = () => {
        if (
          typeof window !== 'undefined' &&
          typeof window.WinBox !== 'undefined'
        ) {
          resolve();
        } else {
          // Wait a bit more to ensure WinBox is loaded in Electron environment
          setTimeout(checkReady, 100);
        }
      };

      // Check immediately in case everything is already loaded
      checkReady();
    });
  }

  processPendingOperations(): void {
    while (this.pendingOperations.length > 0) {
      const operation = this.pendingOperations.shift();
      if (operation) {
        operation.execute();
      }
    }
  }

  createWindow(options: CreateWindowOptions = {} as CreateWindowOptions): Promise<WinBoxInstance> | WinBoxInstance {
    const execute = (): WinBoxInstance => {
      const {
        id = Date.now().toString(),
        title = 'Window',
        content = '',
        width = '500px',
        height = '400px',
        x = 'center',
        y = 'center',
        enableMaximize = true, // Option to enable/disable maximize button
        enableMinimize = true, // Option to enable/disable minimize button
        modal = false, // Option to make window modal
        useRandomContent = true, // Option to use randomly generated content
      } = options;

      // Close existing instance if it exists
      if (this.instances.has(id)) {
        const existingInstance = this.instances.get(id);
        if (existingInstance && typeof existingInstance.close === 'function') {
          existingInstance.close();
        }
        this.instances.delete(id); // Remove from map after closing
      }

      // Generate content based on title if random content is enabled
      let finalContent = content;
      if (useRandomContent) {
        finalContent = this.contentGenerator.generateDetailedContent(title);
      }

      // Create content element
      const contentElement = document.createElement('div');
      contentElement.innerHTML = `
        <div style="padding: 20px; height: 100%; overflow-y: auto; color: var(--text-primary); font-size: 16px;">
          ${finalContent}
        </div>
      `;

      // Prepare class names based on options
      const classNames = ['winbox-custom'];
      if (modal) classNames.push('modal');

      // Create winbox instance with proper sizing and positioning
      const winboxInstance: WinBoxInstance = new window.WinBox({
        id,
        title: title || 'Window',
        width: width || '500px',
        height: height || '400px',
        x: x || 'center',
        y: y || 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minwidth: 200,
        minheight: 150,
        maxwidth: '100%',
        maxheight: '100%',
        mount: contentElement,
        modal: modal,
        className: classNames.join(' '),
        onclose: () => {
          this.instances.delete(id);
          return true;
        },
      });

      // Store the instance after it's fully created
      this.instances.set(id, winboxInstance);

      // Disable maximize/minimize if specified in options
      if (!enableMaximize) {
        winboxInstance.addClass('no-max');
      }
      if (!enableMinimize) {
        winboxInstance.addClass('no-min');
      }

      // Return the instance
      return winboxInstance;
    };

    if (this.isReady) {
      return execute();
    } else {
      // Queue the operation to be executed when ready
      return new Promise(resolve => {
        this.pendingOperations.push({
          execute: () => resolve(execute()),
        });
      });
    }
  }

  // Method to create a window with random content based on title
  createWindowWithTitle(title: string, options: CreateWindowOptions = {} as CreateWindowOptions): Promise<WinBoxInstance> | WinBoxInstance {
    return this.createWindow({
      ...options,
      title: options.title || title,
      useRandomContent: true,
    });
  }

  closeWindow(id: string): void {
    if (this.instances.has(id)) {
      const instance = this.instances.get(id);
      if (instance && typeof instance.close === 'function') {
        try {
          instance.close();
        } catch (error) {
          console.error(`Error closing window ${id}:`, error);
        }
      }
      this.instances.delete(id);
    }
  }

  closeAllWindows(): void {
    this.instances.forEach((instance, id) => {
      if (instance && typeof instance.close === 'function') {
        try {
          instance.close();
        } catch (error) {
          console.error(`Error closing window ${id}:`, error);
        }
      }
      this.instances.delete(id);
    });
  }

  maximizeWindow(id: string): boolean {
    if (this.instances.has(id)) {
      const instance = this.instances.get(id);
      if (instance && typeof instance.maximize === 'function') {
        instance.maximize();
        return true;
      }
    }
    return false;
  }

  fullscreenWindow(id: string): boolean {
    if (this.instances.has(id)) {
      const instance = this.instances.get(id);
      if (instance && typeof instance.fullscreen === 'function') {
        instance.fullscreen();
        return true;
      }
    }
    return false;
  }

  restoreWindow(id: string): boolean {
    if (this.instances.has(id)) {
      const instance = this.instances.get(id);
      if (instance && typeof instance.restore === 'function') {
        instance.restore();
        return true;
      }
    }
    return false;
  }
}

// Create a singleton instance
const winboxService = new WinBoxService();

export default winboxService;