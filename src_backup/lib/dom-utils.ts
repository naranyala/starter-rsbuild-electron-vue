/**
 * DOM Utilities for Frontend Renderer Process
 * These utilities are browser-specific and work with DOM elements
 */

/**
 * Wait for DOM to be ready
 * @returns {Promise<void>} - Promise that resolves when DOM is ready
 */
function waitForDom(): Promise<void> {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Create an element with attributes and children
 * @param {string} tagName - Tag name of the element
 * @param {object} attributes - Object of attributes to set
 * @param {Array<string|Element>} children - Array of child elements or text
 * @returns {Element} - Created element
 */
function createElement(
  tagName: string,
  attributes: Record<string, string> = {},
  children: Array<string | Element> = []
): Element {
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign((element as HTMLElement).style, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Add children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Query selector with null check
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element to search in (optional)
 * @returns {Element|null} - Found element or null
 */
function querySelector(selector: string, parent?: Element): Element | null {
  return (parent || document).querySelector(selector);
}

/**
 * Query selector all with array return
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element to search in (optional)
 * @returns {Element[]} - Array of found elements
 */
function querySelectorAll(selector: string, parent?: Element): Element[] {
  return Array.from((parent || document).querySelectorAll(selector));
}

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {object} options - Event listener options
 * @returns {Function} - Cleanup function to remove listener
 */
function addEventListener(
  element: Element,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  element.addEventListener(event, handler, options);

  return () => {
    element.removeEventListener(event, handler, options);
  };
}

/**
 * Check if element is visible in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} - True if element is visible
 */
function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

export {
  waitForDom,
  createElement,
  querySelector,
  querySelectorAll,
  addEventListener,
  isInViewport,
};
