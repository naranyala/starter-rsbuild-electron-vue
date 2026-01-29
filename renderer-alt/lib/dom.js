/**
 * DOM utilities for renderer process
 */

/**
 * DOM manipulation utilities
 */
export class DOMUtils {
  /**
   * Create element with attributes and children
   * @param {string} tagName - Tag name
   * @param {Object} attributes - Element attributes
   * @param {Array} children - Child elements or text
   * @returns {HTMLElement} Created element
   */
  static createElement(tagName, attributes = {}, children = []) {
    const element = document.createElement(tagName);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    });

    // Add children
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * Find element by selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (default: document)
   * @returns {HTMLElement|null} Found element or null
   */
  static find(selector, parent = document) {
    return parent.querySelector(selector);
  }

  /**
   * Find all elements by selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (default: document)
   * @returns {NodeList} Found elements
   */
  static findAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  /**
   * Add event listener with automatic cleanup
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {Function} Cleanup function
   */
  static on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }

  /**
   * Add CSS class to element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to add
   */
  static addClass(element, className) {
    element.classList.add(className);
  }

  /**
   * Remove CSS class from element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to remove
   */
  static removeClass(element, className) {
    element.classList.remove(className);
  }

  /**
   * Toggle CSS class on element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to toggle
   * @returns {boolean} Whether class is now present
   */
  static toggleClass(element, className) {
    return element.classList.toggle(className);
  }

  /**
   * Check if element has CSS class
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to check
   * @returns {boolean} Whether class is present
   */
  static hasClass(element, className) {
    return element.classList.contains(className);
  }
}

/**
 * Animation utilities
 */
export class AnimationUtils {
  /**
   * Fade in element
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   * @returns {Promise} Animation promise
   */
  static fadeIn(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.display = 'block';

      const start = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Fade out element
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   * @returns {Promise} Animation promise
   */
  static fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
      const start = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = 'none';
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Slide element in from top
   * @param {HTMLElement} element - Target element
   * @param {number} duration - Animation duration in ms
   * @returns {Promise} Animation promise
   */
  static slideInFromTop(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.transform = 'translateY(-100%)';
      element.style.display = 'block';

      const start = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.transform = `translateY(${(1 - progress) * -100}%)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.transform = '';
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
}
