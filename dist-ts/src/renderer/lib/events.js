/**
 * Enhanced Event System for Renderer Process
 * These utilities help with managing events and state in the renderer process
 */
/**
 * Enhanced event emitter with middleware support
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
    }
    /**
     * Add event listener
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     * @returns Remove function
     */
    on(event, handler, middleware) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        const handlers = this.events.get(event);
        if (handlers.length >= this.maxListeners) {
            console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
        }
        handlers.push({ handler, once: false, middleware });
        // Return remove function
        return () => this.off(event, handler);
    }
    /**
     * Add one-time event listener
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     * @returns Remove function
     */
    once(event, handler, middleware) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        const handlers = this.events.get(event);
        handlers.push({ handler, once: true, middleware });
        // Return remove function
        return () => this.off(event, handler);
    }
    /**
     * Remove event listener
     * @param event - Event name
     * @param handler - Event handler to remove
     */
    off(event, handler) {
        if (!this.events.has(event))
            return;
        const handlers = this.events.get(event);
        const index = handlers.findIndex(h => h.handler === handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
            this.events.delete(event);
        }
    }
    /**
     * Emit event
     * @param event - Event name
     * @param args - Event arguments
     */
    async emit(event, ...args) {
        if (!this.events.has(event))
            return;
        const handlers = [...this.events.get(event)]; // Create a copy to avoid issues during iteration
        for (let i = 0; i < handlers.length; i++) {
            const { handler, once, middleware } = handlers[i];
            try {
                // Apply middleware if exists
                if (middleware) {
                    const result = await middleware(event, ...args);
                    if (result === false) {
                        continue; // Skip this handler
                    }
                }
                // Call handler
                await Promise.resolve(handler(...args));
                // Remove if it was a one-time listener
                if (once) {
                    this.off(event, handler);
                }
            }
            catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        }
    }
    /**
     * Remove all listeners for event
     * @param event - Event name
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }
    }
    /**
     * Get listener count for event
     * @param event - Event name
     * @returns Listener count
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }
    /**
     * Get all registered events
     * @returns Array of event names
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
    /**
     * Set max listeners limit
     * @param n - Max listeners count
     */
    setMaxListeners(n) {
        this.maxListeners = n;
    }
    /**
     * Prepend listener to the beginning of the listeners array
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     */
    prependListener(event, handler, middleware) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        const handlers = this.events.get(event);
        handlers.unshift({ handler, once: false, middleware });
        // Return remove function
        return () => this.off(event, handler);
    }
    /**
     * Prepend one-time listener to the beginning of the listeners array
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     */
    prependOnceListener(event, handler, middleware) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        const handlers = this.events.get(event);
        handlers.unshift({ handler, once: true, middleware });
        // Return remove function
        return () => this.off(event, handler);
    }
}
/**
 * Global event bus for application-wide events
 */
export const EventBus = new EventEmitter();
/**
 * Enhanced keyboard event utilities
 */
export class KeyboardUtils {
    /**
     * Check if key matches
     * @param event - Keyboard event
     * @param keys - Key(s) to check
     * @returns Whether key matches
     */
    static isKey(event, keys) {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        return keyArray.some(k => event.key.toLowerCase() === k.toLowerCase());
    }
    /**
     * Check if modifier key is pressed
     * @param event - Keyboard event
     * @param modifier - Modifier key ('ctrl', 'shift', 'alt', 'meta')
     * @returns Whether modifier is pressed
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
     * @param event - Keyboard event
     * @param shortcut - Shortcut object
     * @returns Whether shortcut matches
     */
    static isShortcut(event, shortcut) {
        const { key, ctrl = false, shift = false, alt = false, meta = false, } = shortcut;
        return (this.isKey(event, key) &&
            event.ctrlKey === ctrl &&
            event.shiftKey === shift &&
            event.altKey === alt &&
            event.metaKey === meta);
    }
    /**
     * Create a keyboard shortcut manager
     * @returns Keyboard shortcut manager instance
     */
    static createShortcutManager() {
        return new KeyboardShortcutManager();
    }
}
/**
 * Keyboard shortcut manager
 */
export class KeyboardShortcutManager {
    constructor() {
        this.shortcuts = new Map();
        this.eventEmitter = new EventEmitter();
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    /**
     * Register a keyboard shortcut
     * @param keyCombination - Key combination (e.g., 'Ctrl+S', 'Cmd+Shift+K')
     * @param handler - Handler function
     */
    register(keyCombination, handler) {
        const normalizedKey = this.normalizeKeyCombination(keyCombination);
        this.shortcuts.set(normalizedKey, handler);
    }
    /**
     * Unregister a keyboard shortcut
     * @param keyCombination - Key combination to unregister
     */
    unregister(keyCombination) {
        const normalizedKey = this.normalizeKeyCombination(keyCombination);
        this.shortcuts.delete(normalizedKey);
    }
    /**
     * Handle key down event
     * @param event - Keyboard event
     */
    handleKeyDown(event) {
        const keyCombination = this.getKeyCombination(event);
        const handler = this.shortcuts.get(keyCombination);
        if (handler) {
            event.preventDefault();
            handler(event);
        }
    }
    /**
     * Get key combination from event
     * @param event - Keyboard event
     * @returns Normalized key combination string
     */
    getKeyCombination(event) {
        const modifiers = [];
        if (event.ctrlKey)
            modifiers.push('Ctrl');
        if (event.shiftKey)
            modifiers.push('Shift');
        if (event.altKey)
            modifiers.push('Alt');
        if (event.metaKey)
            modifiers.push('Meta');
        const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
        return [...modifiers, key].join('+');
    }
    /**
     * Normalize key combination string
     * @param keyCombination - Raw key combination
     * @returns Normalized key combination
     */
    normalizeKeyCombination(keyCombination) {
        return keyCombination
            .replace(/command|cmd|meta/gi, 'Meta')
            .replace(/control|ctrl/gi, 'Ctrl')
            .replace(/option|opt|alt/gi, 'Alt')
            .replace(/shift/gi, 'Shift')
            .split('+')
            .map(part => part.trim())
            .sort()
            .join('+');
    }
}
/**
 * Enhanced mouse event utilities
 */
export class MouseUtils {
    /**
     * Check if mouse event is a right click
     * @param event - Mouse event
     * @returns Whether it's a right click
     */
    static isRightClick(event) {
        return event.button === 2;
    }
    /**
     * Check if mouse event is a left click
     * @param event - Mouse event
     * @returns Whether it's a left click
     */
    static isLeftClick(event) {
        return event.button === 0;
    }
    /**
     * Check if mouse event is a middle click
     * @param event - Mouse event
     * @returns Whether it's a middle click
     */
    static isMiddleClick(event) {
        return event.button === 1;
    }
    /**
     * Get mouse position relative to element
     * @param event - Mouse event
     * @param element - Reference element
     * @returns Mouse position relative to element
     */
    static getMousePositionRelativeTo(event, element) {
        const rect = element.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }
    /**
     * Check if mouse is within element bounds
     * @param event - Mouse event
     * @param element - Element to check
     * @returns Whether mouse is within element
     */
    static isMouseWithin(event, element) {
        const rect = element.getBoundingClientRect();
        return (event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom);
    }
    /**
     * Create a drag and drop manager
     * @returns Drag and drop manager instance
     */
    static createDragDropManager() {
        return new DragDropManager();
    }
}
/**
 * Drag and drop manager
 */
export class DragDropManager {
    constructor() {
        this.eventEmitter = new EventEmitter();
        this.isDragging = false;
        this.dragElement = null;
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    /**
     * Handle mouse down event
     * @param event - Mouse event
     */
    handleMouseDown(event) {
        const target = event.target;
        if (target.hasAttribute('draggable') || target.draggable) {
            this.isDragging = true;
            this.dragElement = target;
            this.eventEmitter.emit('dragstart', { event, element: target });
        }
    }
    /**
     * Handle mouse move event
     * @param event - Mouse event
     */
    handleMouseMove(event) {
        if (this.isDragging && this.dragElement) {
            this.eventEmitter.emit('drag', { event, element: this.dragElement });
        }
    }
    /**
     * Handle mouse up event
     * @param event - Mouse event
     */
    handleMouseUp(event) {
        if (this.isDragging && this.dragElement) {
            this.eventEmitter.emit('dragend', { event, element: this.dragElement });
            this.isDragging = false;
            this.dragElement = null;
        }
    }
    /**
     * Add drag event listener
     * @param handler - Drag event handler
     * @returns Remove function
     */
    onDrag(handler) {
        return this.eventEmitter.on('drag', handler);
    }
    /**
     * Add drag start event listener
     * @param handler - Drag start event handler
     * @returns Remove function
     */
    onDragStart(handler) {
        return this.eventEmitter.on('dragstart', handler);
    }
    /**
     * Add drag end event listener
     * @param handler - Drag end event handler
     * @returns Remove function
     */
    onDragEnd(handler) {
        return this.eventEmitter.on('dragend', handler);
    }
}
/**
 * Enhanced touch event utilities
 */
export class TouchUtils {
    /**
     * Calculate distance between two touch points
     * @param touch1 - First touch point
     * @param touch2 - Second touch point
     * @returns Distance between touches
     */
    static getDistanceBetweenTouches(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Calculate midpoint between two touch points
     * @param touch1 - First touch point
     * @param touch2 - Second touch point
     * @returns Midpoint coordinates
     */
    static getMidpointBetweenTouches(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        };
    }
    /**
     * Create a touch gesture manager
     * @param element - HTML element to attach touch gestures to
     * @returns Touch gesture manager instance
     */
    static createTouchGestureManager(element) {
        return new TouchGestureManager(element);
    }
}
/**
 * Touch gesture manager
 */
export class TouchGestureManager {
    constructor(element) {
        this.element = element;
        this.eventEmitter = new EventEmitter();
        element.addEventListener('touchstart', this.handleTouchStart.bind(this));
        element.addEventListener('touchmove', this.handleTouchMove.bind(this));
        element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    /**
     * Handle touch start event
     * @param event - Touch event
     */
    handleTouchStart(event) {
        if (event.touches.length === 2) {
            this.eventEmitter.emit('pinchstart', { event, touches: Array.from(event.touches) });
        }
    }
    /**
     * Handle touch move event
     * @param event - Touch event
     */
    handleTouchMove(event) {
        if (event.touches.length === 2) {
            this.eventEmitter.emit('pinch', { event, touches: Array.from(event.touches) });
        }
    }
    /**
     * Handle touch end event
     * @param event - Touch event
     */
    handleTouchEnd(event) {
        if (event.touches.length < 2) {
            this.eventEmitter.emit('pinchend', { event, touches: Array.from(event.changedTouches) });
        }
    }
    /**
     * Add pinch event listener
     * @param handler - Pinch event handler
     * @returns Remove function
     */
    onPinch(handler) {
        return this.eventEmitter.on('pinch', handler);
    }
    /**
     * Add pinch start event listener
     * @param handler - Pinch start event handler
     * @returns Remove function
     */
    onPinchStart(handler) {
        return this.eventEmitter.on('pinchstart', handler);
    }
    /**
     * Add pinch end event listener
     * @param handler - Pinch end event handler
     * @returns Remove function
     */
    onPinchEnd(handler) {
        return this.eventEmitter.on('pinchend', handler);
    }
}
/**
 * Enhanced debounce utility
 */
export function debounce(func, wait, options = {}) {
    let timeoutId = null;
    let lastCallTime = null;
    let lastExecuteTime = 0;
    const { leading = false, trailing = true, maxWait = null } = options;
    function debounced(...args) {
        const currentTime = Date.now();
        lastCallTime = currentTime;
        const execute = () => {
            lastExecuteTime = Date.now();
            timeoutId = null;
            return func.apply(this, args);
        };
        const shouldCallNow = leading && timeoutId === null;
        const shouldExecute = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            if (shouldCallNow) {
                return execute();
            }
            if (trailing) {
                timeoutId = window.setTimeout(execute, wait);
            }
        };
        if (timeoutId === null) {
            if (maxWait && currentTime - lastExecuteTime >= maxWait) {
                return execute();
            }
            else {
                shouldExecute();
            }
        }
        else {
            // Extend the timeout
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(execute, wait);
        }
        // Return a promise for async/await compatibility
        return new Promise((resolve) => {
            if (timeoutId) {
                const checkInterval = setInterval(() => {
                    if (timeoutId === null) {
                        clearInterval(checkInterval);
                        // The function has already been executed
                    }
                }, 10);
            }
        });
    }
    // Add cancel method
    debounced.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    // Add flush method
    debounced.flush = function () {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
            const result = func.apply(this, Array.prototype.slice.call(arguments));
            lastExecuteTime = Date.now();
            return result;
        }
    };
    return debounced;
}
/**
 * Enhanced throttle utility
 */
export function throttle(func, limit) {
    let inThrottle;
    let lastResult;
    return function (...args) {
        if (!inThrottle) {
            lastResult = func.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
            return lastResult;
        }
        else {
            // Return the last result or a promise that resolves when throttling ends
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(lastResult);
                }, limit);
            });
        }
    };
}
/**
 * Enhanced event utilities combining all utilities
 */
export class EnhancedEventUtils {
}
EnhancedEventUtils.emitter = new EventEmitter();
EnhancedEventUtils.keyboard = KeyboardUtils;
EnhancedEventUtils.mouse = MouseUtils;
EnhancedEventUtils.touch = TouchUtils;
EnhancedEventUtils.debounce = debounce;
EnhancedEventUtils.throttle = throttle;
//# sourceMappingURL=events.js.map