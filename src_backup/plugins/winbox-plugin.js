const WinBoxPlugin = {
  install(app) {
    // Create a shared instance manager
    const instances = new Map();

    // Function to create a WinBox window
    const createWindow = (options = {}) => {
      const {
        id = Date.now().toString(),
        title = 'Window',
        content = '',
        width = '400px',
        height = '300px',
        x = '50px',
        y = '50px',
      } = options;

      // Check if we're in the browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('WinBox can only be used in browser environments');
        return null;
      }

      try {
        // Check if WinBox is already loaded in the global scope
        if (typeof window.WinBox === 'undefined') {
          console.error(
            'WinBox is not available. Make sure it is properly loaded.'
          );
          return null;
        }

        // Close existing instance if it exists
        if (instances.has(id)) {
          instances.get(id).close();
        }

        // Create content element
        const contentElement = document.createElement('div');
        contentElement.innerHTML = `
          <div style="padding: 20px; height: 100%; overflow-y: auto;">
            <h3 style="margin-top: 0;">${title}</h3>
            <p>${content}</p>
          </div>
        `;

        // Create winbox instance
        const winboxInstance = new window.WinBox({
          id,
          title,
          width,
          height,
          top: y,
          right: x,
          bottom: '50px',
          left: '50px',
          mount: contentElement,
          onclose: () => {
            instances.delete(id);
            return true;
          },
        });

        // Store the instance
        instances.set(id, winboxInstance);

        return winboxInstance;
      } catch (error) {
        console.error('Failed to create WinBox window:', error);
        return null;
      }
    };

    // Function to close a window
    const closeWindow = id => {
      if (instances.has(id)) {
        const instance = instances.get(id);
        if (instance && typeof instance.close === 'function') {
          instance.close();
        }
        instances.delete(id);
      }
    };

    // Function to close all windows
    const closeAllWindows = () => {
      instances.forEach((instance, id) => {
        if (instance && typeof instance.close === 'function') {
          instance.close();
        }
        instances.delete(id);
      });
    };

    // Function to update content
    const updateContent = (id, newContent, newTitle = null) => {
      if (instances.has(id)) {
        const instance = instances.get(id);
        if (instance && instance.body) {
          const titleText = newTitle || instance.title;
          instance.body.innerHTML = `
            <div style="padding: 20px; height: 100%; overflow-y: auto;">
              <h3 style="margin-top: 0;">${titleText}</h3>
              <p>${newContent}</p>
            </div>
          `;

          // Update title if provided
          if (newTitle && typeof instance.setTitle === 'function') {
            instance.setTitle(newTitle);
          }
        }
      }
    };

    // Expose methods globally through app.config.globalProperties
    app.config.globalProperties.$winbox = {
      create: createWindow,
      close: closeWindow,
      closeAll: closeAllWindows,
      update: updateContent,
      instances,
    };

    // Also provide as a provide/inject option
    app.provide('winbox', {
      create: createWindow,
      close: closeWindow,
      closeAll: closeAllWindows,
      update: updateContent,
      instances,
    });
  },
};

export default WinBoxPlugin;
