/**
 * Enhanced Event System for Renderer Process
 * These utilities help with managing events and state in the renderer process
 */
/**
 * Enhanced event emitter with middleware support
 */
export declare class EventEmitter {
    private events;
    private maxListeners;
    /**
     * Add event listener
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     * @returns Remove function
     */
    on(event: string, handler: Function, middleware?: Function): () => void;
    /**
     * Add one-time event listener
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     * @returns Remove function
     */
    once(event: string, handler: Function, middleware?: Function): () => void;
    /**
     * Remove event listener
     * @param event - Event name
     * @param handler - Event handler to remove
     */
    off(event: string, handler: Function): void;
    /**
     * Emit event
     * @param event - Event name
     * @param args - Event arguments
     */
    emit(event: string, ...args: any[]): Promise<void>;
    /**
     * Remove all listeners for event
     * @param event - Event name
     */
    removeAllListeners(event?: string): void;
    /**
     * Get listener count for event
     * @param event - Event name
     * @returns Listener count
     */
    listenerCount(event: string): number;
    /**
     * Get all registered events
     * @returns Array of event names
     */
    eventNames(): string[];
    /**
     * Set max listeners limit
     * @param n - Max listeners count
     */
    setMaxListeners(n: number): void;
    /**
     * Prepend listener to the beginning of the listeners array
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     */
    prependListener(event: string, handler: Function, middleware?: Function): () => void;
    /**
     * Prepend one-time listener to the beginning of the listeners array
     * @param event - Event name
     * @param handler - Event handler
     * @param middleware - Optional middleware function
     */
    prependOnceListener(event: string, handler: Function, middleware?: Function): () => void;
}
/**
 * Global event bus for application-wide events
 */
export declare const EventBus: EventEmitter;
/**
 * Enhanced keyboard event utilities
 */
export declare class KeyboardUtils {
    /**
     * Check if key matches
     * @param event - Keyboard event
     * @param keys - Key(s) to check
     * @returns Whether key matches
     */
    static isKey(event: KeyboardEvent, keys: string | string[]): boolean;
    /**
     * Check if modifier key is pressed
     * @param event - Keyboard event
     * @param modifier - Modifier key ('ctrl', 'shift', 'alt', 'meta')
     * @returns Whether modifier is pressed
     */
    static hasModifier(event: KeyboardEvent, modifier: string): boolean;
    /**
     * Check if shortcut combination matches
     * @param event - Keyboard event
     * @param shortcut - Shortcut object
     * @returns Whether shortcut matches
     */
    static isShortcut(event: KeyboardEvent, shortcut: {
        key: string;
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
        meta?: boolean;
    }): boolean;
    /**
     * Create a keyboard shortcut manager
     * @returns Keyboard shortcut manager instance
     */
    static createShortcutManager(): KeyboardShortcutManager;
}
/**
 * Keyboard shortcut manager
 */
export declare class KeyboardShortcutManager {
    private shortcuts;
    private eventEmitter;
    constructor();
    /**
     * Register a keyboard shortcut
     * @param keyCombination - Key combination (e.g., 'Ctrl+S', 'Cmd+Shift+K')
     * @param handler - Handler function
     */
    register(keyCombination: string, handler: (event: KeyboardEvent) => void): void;
    /**
     * Unregister a keyboard shortcut
     * @param keyCombination - Key combination to unregister
     */
    unregister(keyCombination: string): void;
    /**
     * Handle key down event
     * @param event - Keyboard event
     */
    private handleKeyDown;
    /**
     * Get key combination from event
     * @param event - Keyboard event
     * @returns Normalized key combination string
     */
    private getKeyCombination;
    /**
     * Normalize key combination string
     * @param keyCombination - Raw key combination
     * @returns Normalized key combination
     */
    private normalizeKeyCombination;
}
/**
 * Enhanced mouse event utilities
 */
export declare class MouseUtils {
    /**
     * Check if mouse event is a right click
     * @param event - Mouse event
     * @returns Whether it's a right click
     */
    static isRightClick(event: MouseEvent): boolean;
    /**
     * Check if mouse event is a left click
     * @param event - Mouse event
     * @returns Whether it's a left click
     */
    static isLeftClick(event: MouseEvent): boolean;
    /**
     * Check if mouse event is a middle click
     * @param event - Mouse event
     * @returns Whether it's a middle click
     */
    static isMiddleClick(event: MouseEvent): boolean;
    /**
     * Get mouse position relative to element
     * @param event - Mouse event
     * @param element - Reference element
     * @returns Mouse position relative to element
     */
    static getMousePositionRelativeTo(event: MouseEvent, element: HTMLElement): {
        x: number;
        y: number;
    };
    /**
     * Check if mouse is within element bounds
     * @param event - Mouse event
     * @param element - Element to check
     * @returns Whether mouse is within element
     */
    static isMouseWithin(event: MouseEvent, element: HTMLElement): boolean;
    /**
     * Create a drag and drop manager
     * @returns Drag and drop manager instance
     */
    static createDragDropManager(): DragDropManager;
}
/**
 * Drag and drop manager
 */
export declare class DragDropManager {
    private eventEmitter;
    private isDragging;
    private dragElement;
    constructor();
    /**
     * Handle mouse down event
     * @param event - Mouse event
     */
    private handleMouseDown;
    /**
     * Handle mouse move event
     * @param event - Mouse event
     */
    private handleMouseMove;
    /**
     * Handle mouse up event
     * @param event - Mouse event
     */
    private handleMouseUp;
    /**
     * Add drag event listener
     * @param handler - Drag event handler
     * @returns Remove function
     */
    onDrag(handler: (data: {
        event: MouseEvent;
        element: HTMLElement;
    }) => void): () => void;
    /**
     * Add drag start event listener
     * @param handler - Drag start event handler
     * @returns Remove function
     */
    onDragStart(handler: (data: {
        event: MouseEvent;
        element: HTMLElement;
    }) => void): () => void;
    /**
     * Add drag end event listener
     * @param handler - Drag end event handler
     * @returns Remove function
     */
    onDragEnd(handler: (data: {
        event: MouseEvent;
        element: HTMLElement;
    }) => void): () => void;
}
/**
 * Enhanced touch event utilities
 */
export declare class TouchUtils {
    /**
     * Calculate distance between two touch points
     * @param touch1 - First touch point
     * @param touch2 - Second touch point
     * @returns Distance between touches
     */
    static getDistanceBetweenTouches(touch1: Touch, touch2: Touch): number;
    /**
     * Calculate midpoint between two touch points
     * @param touch1 - First touch point
     * @param touch2 - Second touch point
     * @returns Midpoint coordinates
     */
    static getMidpointBetweenTouches(touch1: Touch, touch2: Touch): {
        x: number;
        y: number;
    };
    /**
     * Create a touch gesture manager
     * @param element - HTML element to attach touch gestures to
     * @returns Touch gesture manager instance
     */
    static createTouchGestureManager(element: HTMLElement): TouchGestureManager;
}
/**
 * Touch gesture manager
 */
export declare class TouchGestureManager {
    private element;
    private eventEmitter;
    constructor(element: HTMLElement);
    /**
     * Handle touch start event
     * @param event - Touch event
     */
    private handleTouchStart;
    /**
     * Handle touch move event
     * @param event - Touch event
     */
    private handleTouchMove;
    /**
     * Handle touch end event
     * @param event - Touch event
     */
    private handleTouchEnd;
    /**
     * Add pinch event listener
     * @param handler - Pinch event handler
     * @returns Remove function
     */
    onPinch(handler: (data: {
        event: TouchEvent;
        touches: Touch[];
    }) => void): () => void;
    /**
     * Add pinch start event listener
     * @param handler - Pinch start event handler
     * @returns Remove function
     */
    onPinchStart(handler: (data: {
        event: TouchEvent;
        touches: Touch[];
    }) => void): () => void;
    /**
     * Add pinch end event listener
     * @param handler - Pinch end event handler
     * @returns Remove function
     */
    onPinchEnd(handler: (data: {
        event: TouchEvent;
        touches: Touch[];
    }) => void): () => void;
}
/**
 * Enhanced debounce utility
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
}): (...args: Parameters<T>) => ReturnType<T> extends Promise<any> ? ReturnType<T> : Promise<ReturnType<T>>;
/**
 * Enhanced throttle utility
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => ReturnType<T> extends Promise<any> ? ReturnType<T> : Promise<ReturnType<T>>;
/**
 * Enhanced event utilities combining all utilities
 */
export declare class EnhancedEventUtils {
    static readonly emitter: EventEmitter;
    static readonly keyboard: typeof KeyboardUtils;
    static readonly mouse: typeof MouseUtils;
    static readonly touch: typeof TouchUtils;
    static readonly debounce: typeof debounce;
    static readonly throttle: typeof throttle;
}
//# sourceMappingURL=events.d.ts.map