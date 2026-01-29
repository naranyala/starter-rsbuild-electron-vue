/**
 * Event Management Utilities for Frontend Renderer Process
 * These utilities provide enhanced event handling and communication
 */

/**
 * Enhanced event emitter with type safety
 */
class EventEmitter {
  private events: Map<
    string,
    Array<{ listener: Function; once?: boolean; context?: any }>
  >;

  constructor() {
    this.events = new Map();
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @param {object} options - Listener options
   * @returns {Function} - Remove listener function
   */
  on(
    event: string,
    listener: Function,
    options: { once?: boolean; context?: any } = {}
  ): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listenerData = {
      listener,
      once: options.once,
      context: options.context,
    };
    this.events.get(event)!.push(listenerData);

    // Return remove function
    return () => this.off(event, listener);
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @param {any} context - Execution context
   * @returns {Function} - Remove listener function
   */
  once(event: string, listener: Function, context?: any): () => void {
    return this.on(event, listener, { once: true, context });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @returns {boolean} - True if listener was removed
   */
  off(event: string, listener: Function): boolean {
    const listeners = this.events.get(event);
    if (!listeners) return false;

    const index = listeners.findIndex(l => l.listener === listener);
    if (index !== -1) {
      listeners.splice(index, 1);

      if (listeners.length === 0) {
        this.events.delete(event);
      }
      return true;
    }
    return false;
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  offAll(event: string): void {
    this.events.delete(event);
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   * @returns {boolean} - True if event had listeners
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) return false;

    // Create a copy of listeners to avoid issues with modifications during iteration
    const listenersToCall = [...listeners];

    for (const { listener, once, context } of listenersToCall) {
      try {
        if (context) {
          listener.apply(context, args);
        } else {
          listener(...args);
        }
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }

      // Remove once listeners
      if (once) {
        this.off(event, listener);
      }
    }

    return true;
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} - Number of listeners
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * Get all event names
   * @returns {string[]} - Array of event names
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.events.clear();
  }
}

/**
 * Custom event with additional properties
 */
class CustomEvent<T = any> extends Event {
  detail: T;
  timestamp: number;

  constructor(type: string, detail: T, eventInitDict?: EventInit) {
    super(type, eventInitDict);
    this.detail = detail;
    this.timestamp = Date.now();
  }
}

/**
 * Enhanced event target with custom events
 */
class EventTarget {
  private listeners: Map<string, Set<EventListener>>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * Add event listener
   * @param {string} type - Event type
   * @param {EventListener} listener - Event listener
   * @param {AddEventListenerOptions} options - Event options
   */
  addEventListener(
    type: string,
    listener: EventListener | ((event: Event) => void | boolean),
    options?: AddEventListenerOptions
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(listener);

    // Handle once option
    if (options?.once) {
      const onceListener = (event: Event) => {
        this.removeEventListener(type, onceListener);
        listener(event);
      };
      this.addEventListener(type, onceListener);
    }
  }

  /**
   * Remove event listener
   * @param {string} type - Event type
   * @param {EventListener} listener - Event listener
   */
  removeEventListener(type: string, listener: EventListener | ((event: Event) => void | boolean)): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  /**
   * Dispatch event
   * @param {Event} event - Event to dispatch
   * @returns {boolean} - True if event was not canceled
   */
  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type);
    if (!listeners) return true;

    let canceled = false;
    for (const listener of listeners) {
      try {
        const result = listener.call(this, event);
        if (typeof result === 'boolean' && result === false) {
          canceled = true;
        }
      } catch (error) {
        console.error(`Error in event listener for '${event.type}':`, error);
      }
    }

    return !canceled;
  }

  /**
   * Dispatch custom event
   * @param {string} type - Event type
   * @param {any} detail - Event detail data
   * @param {EventInit} eventInit - Event initialization options
   * @returns {boolean} - True if event was not canceled
   */
  dispatchCustomEvent<T>(
    type: string,
    detail: T,
    eventInit?: EventInit
  ): boolean {
    const event = new CustomEvent(type, detail, eventInit);
    return this.dispatchEvent(event);
  }

  /**
   * Check if event has listeners
   * @param {string} type - Event type
   * @returns {boolean} - True if event has listeners
   */
  hasListeners(type: string): boolean {
    const listeners = this.listeners.get(type);
    return listeners ? listeners.size > 0 : false;
  }

  /**
   * Get listener count for event type
   * @param {string} type - Event type
   * @returns {number} - Number of listeners
   */
  getListenerCount(type: string): number {
    const listeners = this.listeners.get(type);
    return listeners ? listeners.size : 0;
  }

  /**
   * Remove all event listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @returns {Function} - Debounced function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    const later = () => {
      timeoutId = null;
      if (!immediate && timeSinceLastCall >= delay) {
        func(...args);
      }
    };

    const callNow = immediate && timeSinceLastCall >= delay;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(later, delay);

    if (callNow) {
      func(...args);
    }

    lastCallTime = now;
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} trailing - Whether to execute on trailing edge
 * @returns {Function} - Throttled function
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  trailing: boolean = true
): (...args: Parameters<T>) => void {
  let lastCallTime: number = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastInvokeTime: number = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const timeSinceLastInvoke = now - lastInvokeTime;

    lastCallTime = now;

    if (timeSinceLastInvoke >= delay) {
      func(...args);
      lastInvokeTime = now;
    } else if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        func(...args);
        lastInvokeTime = Date.now();
        timeoutId = null;
      }, delay - timeSinceLastInvoke);
    }
  };
}

/**
 * Wait for DOM event
 * @param {Element|Window|Document} target - Event target
 * @param {string} eventType - Event type
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Event>} - Promise that resolves with event
 */
function waitForEvent(
  target: Element | Window | Document,
  eventType: string,
  timeout: number = 5000
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Event '${eventType}' timeout after ${timeout}ms`));
    }, timeout);

    const handler = (event: Event) => {
      cleanup();
      resolve(event);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      target.removeEventListener(eventType, handler);
    };

    target.addEventListener(eventType, handler);
  });
}

/**
 * Create keyboard shortcut handler
 * @param {string} shortcut - Keyboard shortcut (e.g., 'Ctrl+S', 'Cmd+Enter')
 * @param {Function} handler - Handler function
 * @param {Element} target - Event target (default: document)
 * @returns {Function} - Cleanup function
 */
function createKeyboardShortcut(
  shortcut: string,
  handler: (event: KeyboardEvent) => void,
  target: Element | Document = document
): () => void {
  const parts = shortcut.toLowerCase().split('+');
  const keys = new Set(parts);

  const keyHandler = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    const eventKeys = new Set<string>();

    if (keyboardEvent.ctrlKey || keyboardEvent.metaKey) eventKeys.add('ctrl');
    if (keyboardEvent.altKey) eventKeys.add('alt');
    if (keyboardEvent.shiftKey) eventKeys.add('shift');
    eventKeys.add(keyboardEvent.key.toLowerCase());

    // Normalize cmd to ctrl for cross-platform
    if (keys.has('cmd')) {
      keys.delete('cmd');
      keys.add('ctrl');
    }

    const isMatch =
      keys.size === eventKeys.size &&
      [...keys].every(key => eventKeys.has(key));

    if (isMatch) {
      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      handler(keyboardEvent);
    }
  };

  target.addEventListener('keydown', keyHandler);

  return () => {
    target.removeEventListener('keydown', keyHandler);
  };
}

/**
 * Create global event bus
 */
const eventBus = new EventEmitter();

/**
 * Create simple state manager with events
 */
class StateManager<T = any> {
  private state: T;
  private events: EventEmitter;
  private history: T[];
  private maxHistorySize: number;

  constructor(initialState: T, maxHistorySize: number = 50) {
    this.state = { ...initialState };
    this.events = new EventEmitter();
    this.history = [initialState];
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Get current state
   * @returns {T} - Current state
   */
  getState(): T {
    return { ...this.state };
  }

  /**
   * Set state
   * @param {Partial<T>} newState - New state properties
   * @param {boolean} silent - Whether to emit events
   */
  setState(newState: Partial<T>, silent: boolean = false): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };

    // Add to history
    this.history.push({ ...this.state });
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    if (!silent) {
      this.events.emit('change', this.state, prevState);
      this.events.emit('stateChange', {
        current: this.state,
        previous: prevState,
      });
    }
  }

  /**
   * Reset state to initial value
   * @param {boolean} silent - Whether to emit events
   */
  reset(silent: boolean = false): void {
    const initialState = this.history[0];
    this.setState(initialState, silent);
  }

  /**
   * Undo last state change
   * @returns {boolean} - True if undo was successful
   */
  undo(): boolean {
    if (this.history.length > 1) {
      this.history.pop(); // Remove current state
      const prevState = this.history[this.history.length - 1];
      this.state = { ...prevState };
      this.events.emit('change', this.state);
      return true;
    }
    return false;
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribe(callback: (state: T, prevState: T) => void): () => void {
    return this.events.on('change', callback);
  }

  /**
   * Get state history
   * @returns {T[]} - State history
   */
  getHistory(): T[] {
    return [...this.history];
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.events.clear();
  }
}

export {
  EventEmitter,
  CustomEvent,
  EventTarget,
  debounce,
  throttle,
  waitForEvent,
  createKeyboardShortcut,
  eventBus,
  StateManager,
};
