/**
 * DOM utilities for renderer process
 */
export class DOMUtils {
  static find<T extends HTMLElement>(
    selector: string,
    parent: ParentNode = document
  ): T | null {
    return parent.querySelector(selector) as T | null;
  }

  static findAll<T extends HTMLElement>(
    selector: string,
    parent: ParentNode = document
  ): NodeListOf<T> {
    return parent.querySelectorAll(selector) as NodeListOf<T>;
  }

  static createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K
  ): HTMLElementTagNameMap[K] {
    return document.createElement(tag);
  }

  static addClass(element: HTMLElement, ...classes: string[]): void {
    element.classList.add(...classes);
  }

  static removeClass(element: HTMLElement, ...classes: string[]): void {
    element.classList.remove(...classes);
  }

  static toggleClass(element: HTMLElement, className: string): boolean {
    return element.classList.toggle(className);
  }

  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  static setStyle(element: HTMLElement, property: string, value: string): void {
    element.style.setProperty(property, value);
  }

  static getStyle(element: HTMLElement, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property);
  }

  static show(element: HTMLElement): void {
    element.style.display = '';
  }

  static hide(element: HTMLElement): void {
    element.style.display = 'none';
  }

  static remove(element: HTMLElement): void {
    element.remove();
  }

  static empty(element: HTMLElement): void {
    element.innerHTML = '';
  }

  static append(parent: HTMLElement, child: HTMLElement): void {
    parent.appendChild(child);
  }

  static prepend(parent: HTMLElement, child: HTMLElement): void {
    parent.insertBefore(child, parent.firstChild);
  }

  static after(reference: HTMLElement, element: HTMLElement): void {
    reference.parentNode?.insertBefore(element, reference.nextSibling);
  }

  static before(reference: HTMLElement, element: HTMLElement): void {
    reference.parentNode?.insertBefore(element, reference);
  }

  static replace(oldEl: HTMLElement, newEl: HTMLElement): void {
    oldEl.parentNode?.replaceChild(newEl, oldEl);
  }

  static getRect(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  static isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  static scrollTo(
    element: HTMLElement,
    behavior: ScrollBehavior = 'smooth'
  ): void {
    element.scrollIntoView({ behavior });
  }

  static scrollTop(element: HTMLElement, value?: number): number {
    if (value !== undefined) {
      element.scrollTop = value;
      return value;
    }
    return element.scrollTop;
  }

  static scrollLeft(element: HTMLElement, value?: number): number {
    if (value !== undefined) {
      element.scrollLeft = value;
      return value;
    }
    return element.scrollLeft;
  }
}

export class AnimationUtils {
  static fadeIn(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.display = '';
      requestAnimationFrame(() => {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  }

  static fadeOut(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  }

  static slideDown(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      element.style.height = '0';
      element.style.display = '';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms`;
      requestAnimationFrame(() => {
        element.style.height = element.scrollHeight + 'px';
        setTimeout(() => {
          element.style.height = '';
          element.style.overflow = '';
          resolve();
        }, duration);
      });
    });
  }

  static slideUp(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      const height = element.scrollHeight;
      element.style.height = height + 'px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms`;
      requestAnimationFrame(() => {
        element.style.height = '0';
        setTimeout(() => {
          element.style.display = 'none';
          element.style.height = '';
          element.style.overflow = '';
          resolve();
        }, duration);
      });
    });
  }
}

export class FormUtils {
  static getData(form: HTMLFormElement): Record<string, FormDataEntryValue> {
    return Object.fromEntries(new FormData(form));
  }

  static setData(form: HTMLFormElement, data: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(data)) {
      const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (input) {
        if (input.type === 'checkbox') {
          (input as HTMLInputElement).checked = Boolean(value);
        } else {
          input.value = String(value);
        }
      }
    }
  }

  static clear(form: HTMLFormElement): void {
    form.reset();
  }

  static validate(form: HTMLFormElement): boolean {
    return form.checkValidity();
  }

  static getInvalidFields(form: HTMLFormElement): HTMLElement[] {
    return Array.from(form.querySelectorAll(':invalid')) as HTMLElement[];
  }
}

export class EnhancedDOMUtils {
  static async waitForElement<T extends HTMLElement>(
    selector: string,
    timeout = 5000,
    parent: ParentNode = document
  ): Promise<T | null> {
    return new Promise(resolve => {
      const element = DOMUtils.find<T>(selector, parent);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = DOMUtils.find<T>(selector, parent);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(parent, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  static async animateElement(
    element: HTMLElement,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ): Promise<Animation> {
    return element.animate(keyframes, options);
  }

  static createFragment(html: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  }

  static setAttributes(
    element: HTMLElement,
    attributes: Record<string, string>
  ): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  static getAttributes(
    element: HTMLElement,
    attributeNames: string[]
  ): Record<string, string> {
    const attributes: Record<string, string> = {};
    attributeNames.forEach(name => {
      attributes[name] = element.getAttribute(name) || '';
    });
    return attributes;
  }
}
