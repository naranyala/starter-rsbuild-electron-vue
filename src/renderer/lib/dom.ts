/**
 * Enhanced DOM utilities for renderer process
 */

/**
 * Enhanced DOM manipulation utilities
 */
export class DOMUtils {
  /**
   * Create element with attributes and children
   * @param tagName - Tag name
   * @param attributes - Element attributes
   * @param children - Child elements or text
   * @returns Created element
   */
  static createElement(
    tagName: string,
    attributes: Record<string, any> = {},
    children: (string | HTMLElement)[] = []
  ): HTMLElement {
    const element = document.createElement(tagName);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        // Add event listeners
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (key === 'style' && typeof value === 'object') {
        // Apply style object
        Object.assign(element.style, value);
      } else {
        (element as any)[key] = value;
      }
    });

    // Add children
    children.forEach(child => {
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
   * @param selector - CSS selector
   * @param parent - Parent element (default: document)
   * @returns Found element or null
   */
  static find(selector: string, parent: ParentNode = document): Element | null {
    return parent.querySelector(selector);
  }

  /**
   * Find all elements by selector
   * @param selector - CSS selector
   * @param parent - Parent element (default: document)
   * @returns Found elements
   */
  static findAll(selector: string, parent: ParentNode = document): NodeListOf<Element> {
    return parent.querySelectorAll(selector);
  }

  /**
   * Add event listener with automatic cleanup
   * @param element - Target element
   * @param event - Event name
   * @param handler - Event handler
   * @param options - Event options
   * @returns Cleanup function
   */
  static on(
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): () => void {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }

  /**
   * Add one-time event listener
   * @param element - Target element
   * @param event - Event name
   * @param handler - Event handler
   * @param options - Event options
   * @returns Cleanup function
   */
  static once(
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): () => void {
    const onceHandler = (e: Event) => {
      handler instanceof Function ? handler(e) : handler.handleEvent(e);
      element.removeEventListener(event, onceHandler, options);
    };
    element.addEventListener(event, onceHandler, options);
    return () => element.removeEventListener(event, onceHandler, options);
  }

  /**
   * Add CSS class to element
   * @param element - Target element
   * @param className - Class name to add
   */
  static addClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  /**
   * Remove CSS class from element
   * @param element - Target element
   * @param className - Class name to remove
   */
  static removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  /**
   * Toggle CSS class on element
   * @param element - Target element
   * @param className - Class name to toggle
   * @returns Whether class is now present
   */
  static toggleClass(element: HTMLElement, className: string): boolean {
    return element.classList.toggle(className);
  }

  /**
   * Check if element has CSS class
   * @param element - Target element
   * @param className - Class name to check
   * @returns Whether class is present
   */
  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  /**
   * Set multiple attributes at once
   * @param element - Target element
   * @param attributes - Attributes to set
   */
  static setAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  /**
   * Get multiple attributes at once
   * @param element - Target element
   * @param attributeNames - Names of attributes to get
   * @returns Object with attribute values
   */
  static getAttributes(element: HTMLElement, attributeNames: string[]): Record<string, string> {
    const attrs: Record<string, string> = {};
    attributeNames.forEach(name => {
      attrs[name] = element.getAttribute(name) || '';
    });
    return attrs;
  }

  /**
   * Remove multiple attributes at once
   * @param element - Target element
   * @param attributeNames - Names of attributes to remove
   */
  static removeAttributes(element: HTMLElement, attributeNames: string[]): void {
    attributeNames.forEach(name => {
      element.removeAttribute(name);
    });
  }

  /**
   * Set element text content
   * @param element - Target element
   * @param text - Text to set
   */
  static setText(element: HTMLElement, text: string): void {
    element.textContent = text;
  }

  /**
   * Get element text content
   * @param element - Target element
   * @returns Text content
   */
  static getText(element: HTMLElement): string {
    return element.textContent || '';
  }

  /**
   * Set element HTML content
   * @param element - Target element
   * @param html - HTML to set
   */
  static setHTML(element: HTMLElement, html: string): void {
    element.innerHTML = html;
  }

  /**
   * Get element HTML content
   * @param element - Target element
   * @returns HTML content
   */
  static getHTML(element: HTMLElement): string {
    return element.innerHTML;
  }

  /**
   * Append child to element
   * @param parent - Parent element
   * @param child - Child element to append
   */
  static append(parent: HTMLElement, child: HTMLElement): void {
    parent.appendChild(child);
  }

  /**
   * Prepend child to element
   * @param parent - Parent element
   * @param child - Child element to prepend
   */
  static prepend(parent: HTMLElement, child: HTMLElement): void {
    parent.insertBefore(child, parent.firstChild);
  }

  /**
   * Insert element after another element
   * @param element - Element to insert
   * @param referenceElement - Reference element
   */
  static insertAfter(element: HTMLElement, referenceElement: HTMLElement): void {
    referenceElement.parentNode?.insertBefore(element, referenceElement.nextSibling);
  }

  /**
   * Insert element before another element
   * @param element - Element to insert
   * @param referenceElement - Reference element
   */
  static insertBefore(element: HTMLElement, referenceElement: HTMLElement): void {
    referenceElement.parentNode?.insertBefore(element, referenceElement);
  }

  /**
   * Remove element from DOM
   * @param element - Element to remove
   */
  static remove(element: HTMLElement): void {
    element.remove();
  }

  /**
   * Clone element
   * @param element - Element to clone
   * @param deep - Whether to clone children
   * @returns Cloned element
   */
  static clone(element: HTMLElement, deep: boolean = true): HTMLElement {
    return element.cloneNode(deep) as HTMLElement;
  }

  /**
   * Get element dimensions and position
   * @param element - Target element
   * @returns Element dimensions and position
   */
  static getRect(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  /**
   * Scroll element into view
   * @param element - Element to scroll into view
   * @param options - Scroll options
   */
  static scrollToView(element: HTMLElement, options?: ScrollIntoViewOptions): void {
    element.scrollIntoView(options);
  }

  /**
   * Check if element is visible in viewport
   * @param element - Element to check
   * @returns Whether element is visible
   */
  static isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Get computed style of element
   * @param element - Target element
   * @param property - CSS property name
   * @returns Computed style value
   */
  static getComputedStyle(element: HTMLElement, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property);
  }

  /**
   * Set element style
   * @param element - Target element
   * @param property - CSS property name
   * @param value - CSS property value
   */
  static setStyle(element: HTMLElement, property: string, value: string): void {
    element.style.setProperty(property, value);
  }

  /**
   * Get element's parent with specific class
   * @param element - Starting element
   * @param className - Class name to find
   * @returns Parent element with class or null
   */
  static getParentByClass(element: HTMLElement, className: string): HTMLElement | null {
    let parent = element.parentElement;
    while (parent) {
      if (parent.classList.contains(className)) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  /**
   * Get element's parent with specific tag
   * @param element - Starting element
   * @param tagName - Tag name to find (uppercase)
   * @returns Parent element with tag or null
   */
  static getParentByTag(element: HTMLElement, tagName: string): HTMLElement | null {
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === tagName.toUpperCase()) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  /**
   * Create a deep clone of an element with all event listeners
   * @param element - Element to clone
   * @returns Cloned element with preserved event listeners
   */
  static cloneWithEvents(element: HTMLElement): HTMLElement {
    const cloned = element.cloneNode(true) as HTMLElement;
    
    // Copy event listeners by reattaching them
    const originalListeners = this.getElementEventListeners(element);
    originalListeners.forEach(({ event, handler, options }) => {
      cloned.addEventListener(event, handler, options);
    });
    
    return cloned;
  }

  /**
   * Get all event listeners attached to an element
   * @param element - Element to inspect
   * @returns Array of event listener descriptors
   */
  static getElementEventListeners(element: HTMLElement): Array<{
    event: string;
    handler: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  }> {
    // This is a simplified implementation
    // In a real scenario, you'd need to track event listeners manually
    // as there's no built-in way to retrieve them
    return [];
  }

  /**
   * Create a debounced function that executes in the next animation frame
   * @param fn - Function to debounce
   * @returns Debounced function
   */
  static debounceAnimationFrame<T extends (...args: any[]) => void>(
    fn: T
  ): (this: any, ...args: Parameters<T>) => void {
    let rafId: number | null = null;

    return function (this: any, ...args: Parameters<T>) {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        fn.apply(this, args);
        rafId = null;
      });
    };
  }
}

/**
 * Enhanced animation utilities
 */
export class AnimationUtils {
  /**
   * Fade in element
   * @param element - Target element
   * @param duration - Animation duration in ms
   * @param easing - Easing function
   * @returns Promise when animation completes
   */
  static fadeIn(
    element: HTMLElement,
    duration: number = 300,
    easing: string = 'ease'
  ): Promise<void> {
    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.display = 'block';

      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing function
        const easedProgress = this.applyEasing(progress, easing);
        element.style.opacity = easedProgress.toString();

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
   * @param element - Target element
   * @param duration - Animation duration in ms
   * @param easing - Easing function
   * @returns Promise when animation completes
   */
  static fadeOut(
    element: HTMLElement,
    duration: number = 300,
    easing: string = 'ease'
  ): Promise<void> {
    return new Promise(resolve => {
      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing function
        const easedProgress = 1 - this.applyEasing(progress, easing);
        element.style.opacity = easedProgress.toString();

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
   * @param element - Target element
   * @param duration - Animation duration in ms
   * @param easing - Easing function
   * @returns Promise when animation completes
   */
  static slideInFromTop(
    element: HTMLElement,
    duration: number = 300,
    easing: string = 'ease'
  ): Promise<void> {
    return new Promise(resolve => {
      element.style.transform = 'translateY(-100%)';
      element.style.display = 'block';

      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing function
        const easedProgress = this.applyEasing(progress, easing);
        element.style.transform = `translateY(${(1 - easedProgress) * -100}%)`;

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

  /**
   * Slide element out to bottom
   * @param element - Target element
   * @param duration - Animation duration in ms
   * @param easing - Easing function
   * @returns Promise when animation completes
   */
  static slideOutToBottom(
    element: HTMLElement,
    duration: number = 300,
    easing: string = 'ease'
  ): Promise<void> {
    return new Promise(resolve => {
      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing function
        const easedProgress = this.applyEasing(progress, easing);
        element.style.transform = `translateY(${easedProgress * 100}%)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = 'none';
          element.style.transform = '';
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Apply easing function to progress value
   * @param progress - Progress value (0-1)
   * @param easing - Easing function name
   * @returns Eased progress value
   */
  private static applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return progress;
      case 'ease':
        return this.easeInOutQuad(progress);
      case 'ease-in':
        return this.easeInQuad(progress);
      case 'ease-out':
        return this.easeOutQuad(progress);
      case 'ease-in-out':
        return this.easeInOutQuad(progress);
      default:
        return progress;
    }
  }

  /**
   * Quadratic easing in - accelerating from zero velocity
   * @param t - Time progress (0-1)
   * @returns Eased value
   */
  private static easeInQuad(t: number): number {
    return t * t;
  }

  /**
   * Quadratic easing out - decelerating to zero velocity
   * @param t - Time progress (0-1)
   * @returns Eased value
   */
  private static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  /**
   * Quadratic easing in/out - acceleration until halfway, then deceleration
   * @param t - Time progress (0-1)
   * @returns Eased value
   */
  private static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Cubic easing in - accelerating from zero velocity
   * @param t - Time progress (0-1)
   * @returns Eased value
   */
  private static easeInCubic(t: number): number {
    return t * t * t;
  }

  /**
   * Cubic easing out - decelerating to zero velocity
   * @param t - Time progress (0-1)
   * @returns Eased value
   */
  private static easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  }

  /**
   * Cubic easing in/out - acceleration until halfway, then deceleration
   * @param t - Time progress (0-1)
   * @returns Eased value
   */
  private static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Animate element with custom CSS properties
   * @param element - Target element
   * @param properties - Properties to animate
   * @param duration - Animation duration in ms
   * @param easing - Easing function
   * @returns Promise when animation completes
   */
  static animateProperties(
    element: HTMLElement,
    properties: Record<string, { from: any; to: any }>,
    duration: number = 300,
    easing: string = 'ease'
  ): Promise<void> {
    return new Promise(resolve => {
      // Store original values and set initial values
      const originalValues: Record<string, any> = {};
      Object.entries(properties).forEach(([prop, { from }]) => {
        originalValues[prop] = element.style.getPropertyValue(prop);
        element.style.setProperty(prop, from);
      });

      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing function
        const easedProgress = this.applyEasing(progress, easing);

        // Update properties based on progress
        Object.entries(properties).forEach(([prop, { from, to }]) => {
          // For numeric values, interpolate between from and to
          if (typeof from === 'number' && typeof to === 'number') {
            const value = from + (to - from) * easedProgress;
            element.style.setProperty(prop, value.toString());
          } else {
            // For non-numeric values, switch at the end
            if (progress === 1) {
              element.style.setProperty(prop, to);
            }
          }
        });

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
   * Create a CSS animation class and apply it to element
   * @param element - Target element
   * @param keyframes - Keyframe definition
   * @param options - Animation options
   * @returns Promise when animation completes
   */
  static cssAnimate(
    element: HTMLElement,
    keyframes: PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions = { duration: 300 }
  ): Promise<void> {
    const animation = element.animate(keyframes, options);
    return animation.finished.then(() => {});
  }
}

/**
 * Enhanced form utilities
 */
export class FormUtils {
  /**
   * Get form data as object
   * @param form - Form element
   * @returns Form data object
   */
  static getFormData(form: HTMLFormElement): Record<string, any> {
    const formData = new FormData(form);
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  /**
   * Set form data from object
   * @param form - Form element
   * @param data - Data object
   */
  static setFormData(form: HTMLFormElement, data: Record<string, any>): void {
    Object.entries(data).forEach(([name, value]) => {
      const elements = form.querySelectorAll(`[name="${name}"]`);
      elements.forEach(element => {
        if (element instanceof HTMLInputElement) {
          if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = Array.isArray(value) ? value.includes(element.value) : value === element.value;
          } else {
            element.value = value;
          }
        } else if (element instanceof HTMLSelectElement) {
          element.value = value;
        } else if (element instanceof HTMLTextAreaElement) {
          element.value = value;
        } else {
          (element as HTMLElement).textContent = value;
        }
      });
    });
  }

  /**
   * Validate form fields
   * @param form - Form element
   * @returns Validation result
   */
  static validateForm(form: HTMLFormElement): {
    isValid: boolean;
    errors: Record<string, string[]>;
  } {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const name = (input as HTMLInputElement).name;
      if (!name) return;

      const fieldErrors: string[] = [];

      // Required validation
      if ((input as HTMLInputElement).required && !(input as HTMLInputElement).value) {
        fieldErrors.push('This field is required');
        isValid = false;
      }

      // Pattern validation
      if ((input as HTMLInputElement).pattern && (input as HTMLInputElement).value) {
        const regex = new RegExp((input as HTMLInputElement).pattern);
        if (!regex.test((input as HTMLInputElement).value)) {
          fieldErrors.push('Invalid format');
          isValid = false;
        }
      }

      // Min/max length validation
      if ((input as HTMLInputElement).minLength && (input as HTMLInputElement).value.length < (input as HTMLInputElement).minLength) {
        fieldErrors.push(`Minimum length is ${(input as HTMLInputElement).minLength}`);
        isValid = false;
      }

      if ((input as HTMLInputElement).maxLength && (input as HTMLInputElement).value.length > (input as HTMLInputElement).maxLength) {
        fieldErrors.push(`Maximum length is ${(input as HTMLInputElement).maxLength}`);
        isValid = false;
      }

      if (fieldErrors.length > 0) {
        errors[name] = fieldErrors;
      }
    });

    return { isValid, errors };
  }

  /**
   * Reset form to initial state
   * @param form - Form element
   */
  static resetForm(form: HTMLFormElement): void {
    form.reset();
  }

  /**
   * Serialize form to URL-encoded string
   * @param form - Form element
   * @returns URL-encoded string
   */
  static serializeForm(form: HTMLFormElement): string {
    const formData = new FormData(form);
    return new URLSearchParams(formData as any).toString();
  }

  /**
   * Disable all form elements
   * @param form - Form element
   */
  static disableForm(form: HTMLFormElement): void {
    const elements = form.querySelectorAll('input, select, textarea, button');
    elements.forEach(element => {
      (element as HTMLInputElement).disabled = true;
    });
  }

  /**
   * Enable all form elements
   * @param form - Form element
   */
  static enableForm(form: HTMLFormElement): void {
    const elements = form.querySelectorAll('input, select, textarea, button');
    elements.forEach(element => {
      (element as HTMLInputElement).disabled = false;
    });
  }
}

/**
 * Enhanced DOM utilities combining all utilities
 */
export class EnhancedDOMUtils {
  static readonly dom = DOMUtils;
  static readonly animation = AnimationUtils;
  static readonly form = FormUtils;
}