/**
 * Enhanced DOM utilities for renderer process
 */
/**
 * Enhanced DOM manipulation utilities
 */
export declare class DOMUtils {
    /**
     * Create element with attributes and children
     * @param tagName - Tag name
     * @param attributes - Element attributes
     * @param children - Child elements or text
     * @returns Created element
     */
    static createElement(tagName: string, attributes?: Record<string, any>, children?: (string | HTMLElement)[]): HTMLElement;
    /**
     * Find element by selector
     * @param selector - CSS selector
     * @param parent - Parent element (default: document)
     * @returns Found element or null
     */
    static find(selector: string, parent?: ParentNode): Element | null;
    /**
     * Find all elements by selector
     * @param selector - CSS selector
     * @param parent - Parent element (default: document)
     * @returns Found elements
     */
    static findAll(selector: string, parent?: ParentNode): NodeListOf<Element>;
    /**
     * Add event listener with automatic cleanup
     * @param element - Target element
     * @param event - Event name
     * @param handler - Event handler
     * @param options - Event options
     * @returns Cleanup function
     */
    static on(element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void;
    /**
     * Add one-time event listener
     * @param element - Target element
     * @param event - Event name
     * @param handler - Event handler
     * @param options - Event options
     * @returns Cleanup function
     */
    static once(element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void;
    /**
     * Add CSS class to element
     * @param element - Target element
     * @param className - Class name to add
     */
    static addClass(element: HTMLElement, className: string): void;
    /**
     * Remove CSS class from element
     * @param element - Target element
     * @param className - Class name to remove
     */
    static removeClass(element: HTMLElement, className: string): void;
    /**
     * Toggle CSS class on element
     * @param element - Target element
     * @param className - Class name to toggle
     * @returns Whether class is now present
     */
    static toggleClass(element: HTMLElement, className: string): boolean;
    /**
     * Check if element has CSS class
     * @param element - Target element
     * @param className - Class name to check
     * @returns Whether class is present
     */
    static hasClass(element: HTMLElement, className: string): boolean;
    /**
     * Set multiple attributes at once
     * @param element - Target element
     * @param attributes - Attributes to set
     */
    static setAttributes(element: HTMLElement, attributes: Record<string, string>): void;
    /**
     * Get multiple attributes at once
     * @param element - Target element
     * @param attributeNames - Names of attributes to get
     * @returns Object with attribute values
     */
    static getAttributes(element: HTMLElement, attributeNames: string[]): Record<string, string>;
    /**
     * Remove multiple attributes at once
     * @param element - Target element
     * @param attributeNames - Names of attributes to remove
     */
    static removeAttributes(element: HTMLElement, attributeNames: string[]): void;
    /**
     * Set element text content
     * @param element - Target element
     * @param text - Text to set
     */
    static setText(element: HTMLElement, text: string): void;
    /**
     * Get element text content
     * @param element - Target element
     * @returns Text content
     */
    static getText(element: HTMLElement): string;
    /**
     * Set element HTML content
     * @param element - Target element
     * @param html - HTML to set
     */
    static setHTML(element: HTMLElement, html: string): void;
    /**
     * Get element HTML content
     * @param element - Target element
     * @returns HTML content
     */
    static getHTML(element: HTMLElement): string;
    /**
     * Append child to element
     * @param parent - Parent element
     * @param child - Child element to append
     */
    static append(parent: HTMLElement, child: HTMLElement): void;
    /**
     * Prepend child to element
     * @param parent - Parent element
     * @param child - Child element to prepend
     */
    static prepend(parent: HTMLElement, child: HTMLElement): void;
    /**
     * Insert element after another element
     * @param element - Element to insert
     * @param referenceElement - Reference element
     */
    static insertAfter(element: HTMLElement, referenceElement: HTMLElement): void;
    /**
     * Insert element before another element
     * @param element - Element to insert
     * @param referenceElement - Reference element
     */
    static insertBefore(element: HTMLElement, referenceElement: HTMLElement): void;
    /**
     * Remove element from DOM
     * @param element - Element to remove
     */
    static remove(element: HTMLElement): void;
    /**
     * Clone element
     * @param element - Element to clone
     * @param deep - Whether to clone children
     * @returns Cloned element
     */
    static clone(element: HTMLElement, deep?: boolean): HTMLElement;
    /**
     * Get element dimensions and position
     * @param element - Target element
     * @returns Element dimensions and position
     */
    static getRect(element: HTMLElement): DOMRect;
    /**
     * Scroll element into view
     * @param element - Element to scroll into view
     * @param options - Scroll options
     */
    static scrollToView(element: HTMLElement, options?: ScrollIntoViewOptions): void;
    /**
     * Check if element is visible in viewport
     * @param element - Element to check
     * @returns Whether element is visible
     */
    static isVisible(element: HTMLElement): boolean;
    /**
     * Get computed style of element
     * @param element - Target element
     * @param property - CSS property name
     * @returns Computed style value
     */
    static getComputedStyle(element: HTMLElement, property: string): string;
    /**
     * Set element style
     * @param element - Target element
     * @param property - CSS property name
     * @param value - CSS property value
     */
    static setStyle(element: HTMLElement, property: string, value: string): void;
    /**
     * Get element's parent with specific class
     * @param element - Starting element
     * @param className - Class name to find
     * @returns Parent element with class or null
     */
    static getParentByClass(element: HTMLElement, className: string): HTMLElement | null;
    /**
     * Get element's parent with specific tag
     * @param element - Starting element
     * @param tagName - Tag name to find (uppercase)
     * @returns Parent element with tag or null
     */
    static getParentByTag(element: HTMLElement, tagName: string): HTMLElement | null;
    /**
     * Create a deep clone of an element with all event listeners
     * @param element - Element to clone
     * @returns Cloned element with preserved event listeners
     */
    static cloneWithEvents(element: HTMLElement): HTMLElement;
    /**
     * Get all event listeners attached to an element
     * @param element - Element to inspect
     * @returns Array of event listener descriptors
     */
    static getElementEventListeners(element: HTMLElement): Array<{
        event: string;
        handler: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
    }>;
    /**
     * Create a debounced function that executes in the next animation frame
     * @param fn - Function to debounce
     * @returns Debounced function
     */
    static debounceAnimationFrame<T extends (...args: any[]) => void>(fn: T): (this: any, ...args: Parameters<T>) => void;
}
/**
 * Enhanced animation utilities
 */
export declare class AnimationUtils {
    /**
     * Fade in element
     * @param element - Target element
     * @param duration - Animation duration in ms
     * @param easing - Easing function
     * @returns Promise when animation completes
     */
    static fadeIn(element: HTMLElement, duration?: number, easing?: string): Promise<void>;
    /**
     * Fade out element
     * @param element - Target element
     * @param duration - Animation duration in ms
     * @param easing - Easing function
     * @returns Promise when animation completes
     */
    static fadeOut(element: HTMLElement, duration?: number, easing?: string): Promise<void>;
    /**
     * Slide element in from top
     * @param element - Target element
     * @param duration - Animation duration in ms
     * @param easing - Easing function
     * @returns Promise when animation completes
     */
    static slideInFromTop(element: HTMLElement, duration?: number, easing?: string): Promise<void>;
    /**
     * Slide element out to bottom
     * @param element - Target element
     * @param duration - Animation duration in ms
     * @param easing - Easing function
     * @returns Promise when animation completes
     */
    static slideOutToBottom(element: HTMLElement, duration?: number, easing?: string): Promise<void>;
    /**
     * Apply easing function to progress value
     * @param progress - Progress value (0-1)
     * @param easing - Easing function name
     * @returns Eased progress value
     */
    private static applyEasing;
    /**
     * Quadratic easing in - accelerating from zero velocity
     * @param t - Time progress (0-1)
     * @returns Eased value
     */
    private static easeInQuad;
    /**
     * Quadratic easing out - decelerating to zero velocity
     * @param t - Time progress (0-1)
     * @returns Eased value
     */
    private static easeOutQuad;
    /**
     * Quadratic easing in/out - acceleration until halfway, then deceleration
     * @param t - Time progress (0-1)
     * @returns Eased value
     */
    private static easeInOutQuad;
    /**
     * Cubic easing in - accelerating from zero velocity
     * @param t - Time progress (0-1)
     * @returns Eased value
     */
    private static easeInCubic;
    /**
     * Cubic easing out - decelerating to zero velocity
     * @param t - Time progress (0-1)
     * @returns Eased value
     */
    private static easeOutCubic;
    /**
     * Cubic easing in/out - acceleration until halfway, then deceleration
     * @param t - Time progress (0-1)
     * @returns Eased value
     */
    private static easeInOutCubic;
    /**
     * Animate element with custom CSS properties
     * @param element - Target element
     * @param properties - Properties to animate
     * @param duration - Animation duration in ms
     * @param easing - Easing function
     * @returns Promise when animation completes
     */
    static animateProperties(element: HTMLElement, properties: Record<string, {
        from: any;
        to: any;
    }>, duration?: number, easing?: string): Promise<void>;
    /**
     * Create a CSS animation class and apply it to element
     * @param element - Target element
     * @param keyframes - Keyframe definition
     * @param options - Animation options
     * @returns Promise when animation completes
     */
    static cssAnimate(element: HTMLElement, keyframes: PropertyIndexedKeyframes, options?: KeyframeAnimationOptions): Promise<void>;
}
/**
 * Enhanced form utilities
 */
export declare class FormUtils {
    /**
     * Get form data as object
     * @param form - Form element
     * @returns Form data object
     */
    static getFormData(form: HTMLFormElement): Record<string, any>;
    /**
     * Set form data from object
     * @param form - Form element
     * @param data - Data object
     */
    static setFormData(form: HTMLFormElement, data: Record<string, any>): void;
    /**
     * Validate form fields
     * @param form - Form element
     * @returns Validation result
     */
    static validateForm(form: HTMLFormElement): {
        isValid: boolean;
        errors: Record<string, string[]>;
    };
    /**
     * Reset form to initial state
     * @param form - Form element
     */
    static resetForm(form: HTMLFormElement): void;
    /**
     * Serialize form to URL-encoded string
     * @param form - Form element
     * @returns URL-encoded string
     */
    static serializeForm(form: HTMLFormElement): string;
    /**
     * Disable all form elements
     * @param form - Form element
     */
    static disableForm(form: HTMLFormElement): void;
    /**
     * Enable all form elements
     * @param form - Form element
     */
    static enableForm(form: HTMLFormElement): void;
}
/**
 * Enhanced DOM utilities combining all utilities
 */
export declare class EnhancedDOMUtils {
    static readonly dom: typeof DOMUtils;
    static readonly animation: typeof AnimationUtils;
    static readonly form: typeof FormUtils;
}
//# sourceMappingURL=dom.d.ts.map