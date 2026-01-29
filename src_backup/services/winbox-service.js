// WinBox Service for Vue Integration
import { WindowContentGenerator } from './window-content-generator.js';

class WinBoxService {
  constructor() {
    this.isReady = false;
    this.pendingOperations = [];
    this.instances = new Map();
    this.contentGenerator = new WindowContentGenerator();

    // Check if WinBox is available and DOM is ready
    this.init();
  }

  async init() {
    // Wait for DOM to be ready and WinBox to be available
    await this.waitForDomAndLibrary();
    this.isReady = true;

    // Process any pending operations
    this.processPendingOperations();
  }

  waitForDomAndLibrary() {
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

  processPendingOperations() {
    while (this.pendingOperations.length > 0) {
      const operation = this.pendingOperations.shift();
      operation.execute();
    }
  }

  createWindow(options = {}) {
    const execute = () => {
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
      const winboxInstance = new window.WinBox({
        id,
        title,
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
  createWindowWithTitle(title, options = {}) {
    return this.createWindow({
      title,
      useRandomContent: true,
      ...options,
    });
  }

  closeWindow(id) {
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

  closeAllWindows() {
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

  maximizeWindow(id) {
    if (this.instances.has(id)) {
      const instance = this.instances.get(id);
      if (instance && typeof instance.maximize === 'function') {
        instance.maximize();
        return true;
      }
    }
    return false;
  }

  fullscreenWindow(id) {
    if (this.instances.has(id)) {
      const instance = this.instances.get(id);
      if (instance && typeof instance.fullscreen === 'function') {
        instance.fullscreen();
        return true;
      }
    }
    return false;
  }

  restoreWindow(id) {
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
