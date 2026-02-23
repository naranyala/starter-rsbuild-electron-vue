import type { Ref } from 'vue';
import { onUnmounted as vueOnUnmounted, ref as vueRef } from 'vue';

// Re-export vue functions to avoid naming conflicts
export { vueOnUnmounted as onUnmounted, vueRef as ref };

export class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  once(event: string, callback: Function): void {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export function useEventEmitter() {
  const emitter = new EventEmitter();
  vueOnUnmounted(() => emitter.removeAllListeners());
  return emitter;
}

export const KeyboardUtils = {
  isModifierKey(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.altKey || event.shiftKey || event.metaKey;
  },

  getKeyName(event: KeyboardEvent): string {
    if (event.key.length === 1) {
      return event.key.toLowerCase();
    }
    return event.key;
  },

  parseShortcut(shortcut: string): {
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  } {
    const parts = shortcut.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    return {
      key,
      ctrl: parts.includes('ctrl') || parts.includes('control'),
      alt: parts.includes('alt'),
      shift: parts.includes('shift'),
      meta:
        parts.includes('meta') ||
        parts.includes('cmd') ||
        parts.includes('command'),
    };
  },

  matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
    const parsed = this.parseShortcut(shortcut);
    const keyMatch = this.getKeyName(event) === parsed.key;
    const ctrlMatch = event.ctrlKey === parsed.ctrl;
    const altMatch = event.altKey === parsed.alt;
    const shiftMatch = event.shiftKey === parsed.shift;
    const metaMatch = event.metaKey === parsed.meta;
    return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
  },
};

type NoArgsFn = () => void;
type ArgsFn<T extends any[]> = (...args: T) => void;

export function debounce<T extends NoArgsFn>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this), delay);
  } as T;
}

export function debounceWithResult<T, Args extends readonly any[]>(
  fn: (...args: Args) => T,
  delay: number
): (...args: Args) => Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastResolve: ((value: T) => void) | null = null;
  let lastReject: ((reason?: any) => void) | null = null;

  return function (this: any, ...args: Args): Promise<T> {
    if (timer) clearTimeout(timer);

    return new Promise((resolve, reject) => {
      lastResolve = resolve;
      lastReject = reject;
      timer = setTimeout(() => {
        if (lastResolve && lastReject) {
          try {
            const result = fn.apply(this, [...args] as any);
            lastResolve(result);
          } catch (e) {
            lastReject(e);
          }
        }
      }, delay);
    });
  };
}

export function throttle<T extends NoArgsFn>(fn: T, limit: number): T {
  let inThrottle = false;
  return function (this: any) {
    if (!inThrottle) {
      fn.apply(this);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
}

export function throttleWithResult<T, Args extends readonly any[]>(
  fn: (...args: Args) => T,
  limit: number
): (...args: Args) => Promise<T> {
  let inThrottle = false;
  let lastResolve: ((value: T) => void) | null = null;
  let lastReject: ((reason?: any) => void) | null = null;

  return function (this: any, ...args: Args): Promise<T> {
    if (inThrottle) {
      return Promise.reject(new ThrottleError('Throttle limit exceeded'));
    }

    inThrottle = true;
    setTimeout(() => (inThrottle = false), limit);

    return new Promise((resolve, reject) => {
      lastResolve = resolve;
      lastReject = reject;
      try {
        const result = fn.apply(this, [...args] as any);
        if (lastResolve) lastResolve(result);
      } catch (e) {
        if (lastReject) lastReject(e);
      }
    });
  };
}

export class ThrottleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThrottleError';
  }
}

export function useDebounce<T>(
  value: Ref<T>,
  delay: number
): { debouncedValue: Ref<T>; cancel: () => void } {
  const debouncedValue = vueRef(value.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const unwatch = watchDebounced(value, newValue => {
    cancel();
    timer = setTimeout(() => {
      debouncedValue.value = newValue;
      timer = null;
    }, delay);
  });

  vueOnUnmounted(() => {
    cancel();
    unwatch();
  });

  return { debouncedValue, cancel };
}

function watchDebounced<T>(
  source: Ref<T>,
  callback: (value: T) => void
): () => void {
  let oldValue = source.value;
  const watcher = (): void => {
    const newValue = source.value;
    if (newValue !== oldValue) {
      callback(newValue);
      oldValue = newValue;
    }
  };
  return watcher;
}

export function useThrottle<T>(
  value: Ref<T>,
  limit: number
): { throttledValue: Ref<T>; cancel: () => void } {
  const throttledValue = vueRef(value.value) as Ref<T>;
  let inThrottle = false;
  let pendingValue: T | null = null;

  const updateValue = (newValue: T) => {
    if (!inThrottle) {
      inThrottle = true;
      throttledValue.value = newValue;
      setTimeout(() => {
        inThrottle = false;
        if (pendingValue !== null) {
          throttledValue.value = pendingValue;
          pendingValue = null;
        }
      }, limit);
    } else {
      pendingValue = newValue;
    }
  };

  const unwatch = watchThrottled(value, updateValue);

  const cancel = () => {
    inThrottle = false;
    pendingValue = null;
    unwatch();
  };

  vueOnUnmounted(cancel);

  return { throttledValue, cancel };
}

function watchThrottled<T>(
  source: Ref<T>,
  callback: (value: T) => void
): () => void {
  let oldValue = source.value;
  const watcher = (): void => {
    const newValue = source.value;
    if (newValue !== oldValue) {
      callback(newValue);
      oldValue = newValue;
    }
  };
  return watcher;
}

export function useEventListener(
  target: EventTarget | Ref<EventTarget | null>,
  event: string,
  handler: (event: Event) => void,
  options?: AddEventListenerOptions
): () => void {
  const cleanup = () => {
    const el = target instanceof EventTarget ? target : target.value;
    if (el) {
      el.removeEventListener(event, handler, options);
    }
  };

  const targetRef = vueRef(target) as Ref<EventTarget | null>;

  const unwatch = watchTarget(targetRef, el => {
    cleanup();
    if (el) {
      el.addEventListener(event, handler, options);
    }
  });

  vueOnUnmounted(() => {
    cleanup();
    unwatch();
  });

  return cleanup;
}

function watchTarget<T>(
  source: Ref<T>,
  callback: (value: T) => void
): () => void {
  let oldValue = source.value;
  const watcher = () => {
    const newValue = source.value;
    if (newValue !== oldValue) {
      callback(newValue);
      oldValue = newValue;
    }
  };
  return watcher;
}

export class EnhancedEventUtils {
  static createCustomEvent<T>(
    type: string,
    detail?: T,
    options?: CustomEventInit<T>
  ): CustomEvent<T> {
    return new CustomEvent(type, { detail, ...options });
  }

  static dispatchCustomEvent<T>(
    target: EventTarget,
    type: string,
    detail?: T
  ): boolean {
    const event = EnhancedEventUtils.createCustomEvent(type, detail);
    return target.dispatchEvent(event);
  }

  static once(
    target: EventTarget,
    eventType: string,
    options?: AddEventListenerOptions
  ): Promise<Event> {
    return new Promise(resolve => {
      const listener = (event: Event) => {
        target.removeEventListener(eventType, listener, options);
        resolve(event);
      };
      target.addEventListener(eventType, listener, options);
    });
  }

  static on(
    target: EventTarget,
    eventType: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    target.addEventListener(eventType, handler, options);
    return () => target.removeEventListener(eventType, handler, options);
  }
}

export class EventBus {
  private static emitter = new EventEmitter();

  static on(event: string, callback: Function): () => void {
    return EventBus.emitter.on(event, callback);
  }

  static once(event: string, callback: Function): void {
    EventBus.emitter.once(event, callback);
  }

  static off(event: string, callback: Function): void {
    EventBus.emitter.off(event, callback);
  }

  static emit(event: string, ...args: any[]): void {
    EventBus.emitter.emit(event, ...args);
  }

  static removeAllListeners(event?: string): void {
    EventBus.emitter.removeAllListeners(event);
  }
}

export class MouseUtils {
  static getMousePosition(event: MouseEvent): { x: number; y: number } {
    return { x: event.clientX, y: event.clientY };
  }

  static getRelativePosition(
    event: MouseEvent,
    element: HTMLElement
  ): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  static isLeftClick(event: MouseEvent): boolean {
    return event.button === 0;
  }

  static isRightClick(event: MouseEvent): boolean {
    return event.button === 2;
  }

  static isMiddleClick(event: MouseEvent): boolean {
    return event.button === 1;
  }

  static preventContextMenu(element: HTMLElement): void {
    element.addEventListener('contextmenu', e => e.preventDefault());
  }
}
