/**
 * Event system for renderer process
 */

/**
 * Simple event emitter
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Remove function
   */
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);

    // Return remove function
    return () => this.off(event, handler);
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Remove function
   */
  once(event, handler) {
    const onceHandler = (...args) => {
      this.off(event, onceHandler);
      handler(...args);
    };
    return this.on(event, onceHandler);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    if (!this.events.has(event)) return;

    const handlers = this.events.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emit(event, ...args) {
    if (!this.events.has(event)) return;

    this.events.get(event).forEach((handler) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.events.clear();
  }

  /**
   * Get listener count for event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
}

/**
 * Global event bus for application-wide events
 */
export const EventBus = new EventEmitter();

/**
 * Keyboard event utilities
 */
export class KeyboardUtils {
  /**
   * Check if key matches
   * @param {KeyboardEvent} event - Keyboard event
   * @param {string|Array} keys - Key(s) to check
   * @returns {boolean} Whether key matches
   */
  static isKey(event, keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return keyArray.includes(event.key.toLowerCase());
  }

  /**
   * Check if modifier key is pressed
   * @param {KeyboardEvent} event - Keyboard event
   * @param {string} modifier - Modifier key ('ctrl', 'shift', 'alt', 'meta')
   * @returns {boolean} Whether modifier is pressed
   */
  static hasModifier(event, modifier) {
    switch (modifier.toLowerCase()) {
      case 'ctrl':
      case 'control':
        return event.ctrlKey;
      case 'shift':
        return event.shiftKey;
      case 'alt':
        return event.altKey;
      case 'meta':
      case 'cmd':
      case 'command':
        return event.metaKey;
      default:
        return false;
    }
  }

  /**
   * Check if shortcut combination matches
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Object} shortcut - Shortcut object
   * @param {string} shortcut.key - Key to match
   * @param {boolean} shortcut.ctrl - Ctrl required
   * @param {boolean} shortcut.shift - Shift required
   * @param {boolean} shortcut.alt - Alt required
   * @param {boolean} shortcut.meta - Meta required
   * @returns {boolean} Whether shortcut matches
   */
  static isShortcut(event, shortcut) {
    const { key, ctrl = false, shift = false, alt = false, meta = false } = shortcut;

    return (
      KeyboardUtils.isKey(event, key) &&
      event.ctrlKey === ctrl &&
      event.shiftKey === shift &&
      event.altKey === alt &&
      event.metaKey === meta
    );
  }
}

/**
 * Debounce utility
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
