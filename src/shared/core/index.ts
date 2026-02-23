// ===========================================
// Shared Core Utilities
// Consolidates duplicated code from helpers.ts
// ===========================================

import {
  AsyncResult,
  Err,
  type JsonValue,
  Ok,
  type Result,
  type SanitizationOptions,
  type ValidationResult,
  type ValidationRule,
  type ValidationSchema,
} from './types';

// ===========================================
// URL Validation
// ===========================================

export interface UrlValidationOptions {
  allowLocalhost?: boolean;
  allowFileUrls?: boolean;
  allowedDomains?: string[];
  allowedProtocols?: string[];
  blockedProtocols?: string[];
}

export function validateUrl(
  url: string,
  options: UrlValidationOptions = {}
): boolean {
  const {
    allowLocalhost = true,
    allowFileUrls = false,
    allowedDomains = [],
    allowedProtocols = ['https:', 'http:', 'wss:', 'ws:'],
    blockedProtocols = ['javascript:', 'vbscript:', 'data:'],
  } = options;

  try {
    const parsedUrl = new URL(url);

    // Check blocked protocols first
    if (blockedProtocols.some(p => parsedUrl.protocol === p)) {
      return false;
    }

    // Check allowed protocols
    if (
      allowedProtocols.length > 0 &&
      !allowedProtocols.includes(parsedUrl.protocol)
    ) {
      return false;
    }

    // Check file URLs
    if (parsedUrl.protocol === 'file:' && !allowFileUrls) {
      return false;
    }

    // Check localhost
    if (
      !allowLocalhost &&
      (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')
    ) {
      return false;
    }

    // Check allowed domains
    if (
      allowedDomains.length > 0 &&
      !allowedDomains.includes(parsedUrl.hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ===========================================
// Input Sanitization
// ===========================================

export function sanitizeInput(
  input: unknown,
  options: SanitizationOptions = {}
): string {
  const {
    allowHtml = false,
    allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'span', 'div'],
    stripScripts = true,
    stripIframes = true,
    maxLength,
  } = options;

  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Truncate if maxLength specified
  if (typeof maxLength === 'number' && maxLength > 0) {
    sanitized = sanitized.slice(0, maxLength);
  }

  if (!allowHtml) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>"'&]/g, '');
  } else {
    // Remove dangerous elements
    if (stripScripts) {
      sanitized = sanitized.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      );
    }

    if (stripIframes) {
      sanitized = sanitized.replace(
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        ''
      );
    }

    sanitized = sanitized.replace(
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      ''
    );
    sanitized = sanitized.replace(/<embed\b[^<]*>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Basic tag allowlist
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });
  }

  return sanitized.trim();
}

// ===========================================
// Validation Utilities
// ===========================================

export const Validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value: unknown) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  email: (message = 'Invalid email format'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message,
  }),

  url: (message = 'Invalid URL format'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Minimum length is ${min}`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Maximum length is ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => {
      if (typeof value !== 'number') return true;
      return value >= min;
    },
    message: message || `Minimum value is ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => {
      if (typeof value !== 'number') return true;
      return value <= max;
    },
    message: message || `Maximum value is ${max}`,
  }),

  equals: (
    expected: unknown,
    message = 'Values do not match'
  ): ValidationRule => ({
    validate: (value: unknown) => value === expected,
    message,
  }),
};

export function validateSchema<T>(
  data: T,
  schema: ValidationSchema<T>
): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const [key, rule] of Object.entries(schema)) {
    const value = data[key as keyof T];
    const rules = Array.isArray(rule) ? rule : [rule];

    for (const validationRule of rules) {
      if (!validationRule.validate(value)) {
        if (!errors[key]) errors[key] = [];
        errors[key].push(validationRule.message || 'Validation failed');
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ===========================================
// Common Helpers
// ===========================================

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function memoize<T, Args extends any[]>(
  fn: (...args: Args) => T,
  maxSize = 100
): (...args: Args) => T {
  const cache = new Map<string, { args: Args; value: T }>();
  return (...args: Args) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached) return cached.value;
    const result = fn(...args);
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    cache.set(key, { args, value: result });
    return result;
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => T | Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    backoff?: number;
    onError?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { attempts = 3, delay = 1000, backoff = 2, onError } = options;
  return (async () => {
    let lastError: Error | undefined;
    let currentDelay = delay;
    for (let i = 1; i <= attempts; i++) {
      try {
        return await Promise.resolve(fn());
      } catch (error) {
        lastError = error as Error;
        if (onError) onError(lastError, i);
        if (i < attempts) {
          await sleep(currentDelay);
          currentDelay *= backoff;
        }
      }
    }
    throw lastError;
  })();
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function randomId(length = 8): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMin === inMax) {
    console.warn('mapRange: inMin and inMax cannot be equal');
    return outMin;
  }
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  if (obj instanceof Map) {
    const cloned = new Map();
    obj.forEach((value, key) => {
      cloned.set(key, deepClone(value));
    });
    return cloned as unknown as T;
  }
  if (obj instanceof Set) {
    const cloned = new Set();
    obj.forEach(value => {
      cloned.add(deepClone(value));
    });
    return cloned as unknown as T;
  }
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target } as T;
  for (const key of Object.keys(source)) {
    const typedKey = key as keyof T;
    if (
      source[typedKey] &&
      typeof source[typedKey] === 'object' &&
      !Array.isArray(source[typedKey])
    ) {
      result[typedKey] = deepMerge(
        target[typedKey] || {},
        source[typedKey]
      ) as T[keyof T];
    } else {
      result[typedKey] = source[typedKey] as T[keyof T];
    }
  }
  return result;
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  const getKey =
    typeof key === 'function' ? key : (item: T) => String(item[key]);
  return array.reduce(
    (groups, item) => {
      const groupKey = getKey(item);
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

export function sortBy<T>(
  array: T[],
  key: keyof T | ((item: T) => number | string)
): T[] {
  const getKey = typeof key === 'function' ? key : (item: T) => item[key];
  return [...array].sort((a, b) => {
    const aKey = getKey(a);
    const bKey = getKey(b);
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
}

export function uniqBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): T[] {
  const seen = new Set();
  return array.filter(item => {
    const k = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const trueGroup: T[] = [];
  const falseGroup: T[] = [];
  array.forEach(item => {
    if (predicate(item)) trueGroup.push(item);
    else falseGroup.push(item);
  });
  return [trueGroup, falseGroup];
}

// ===========================================
// Result/Error Handling Helpers
// ===========================================

export function tryCatch<T, E = Error>(
  fn: () => T,
  errorHandler?: (error: Error) => E
): Result<T, E> {
  try {
    return Ok(fn());
  } catch (error) {
    return Err(errorHandler ? errorHandler(error as Error) : (error as E));
  }
}

export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => E
): Promise<Result<T, E>> {
  try {
    return Ok(await fn());
  } catch (error) {
    return Err(errorHandler ? errorHandler(error as Error) : (error as E));
  }
}

// ===========================================
// Type Guards
// ===========================================

export function is<T>(
  value: unknown,
  predicate: (val: unknown) => boolean
): value is T {
  return predicate(value);
}

export const TypeGuards = {
  string: (val: unknown): val is string => typeof val === 'string',
  number: (val: unknown): val is number =>
    typeof val === 'number' && !isNaN(val),
  boolean: (val: unknown): val is boolean => typeof val === 'boolean',
  bigint: (val: unknown): val is bigint => typeof val === 'bigint',
  symbol: (val: unknown): val is symbol => typeof val === 'symbol',
  undefined: (val: unknown): val is undefined => val === undefined,
  null: (val: unknown): val is null => val === null,
  primitive: (
    val: unknown
  ): val is string | number | boolean | bigint | symbol | null | undefined =>
    val === null || typeof val !== 'object',
  function: (val: unknown): val is Function => typeof val === 'function',
  array: Array.isArray,
  plainObject: (val: unknown): val is Record<string, unknown> =>
    val !== null && typeof val === 'object' && !Array.isArray(val),
  emptyString: (val: unknown): val is string => val === '',
  emptyArray: (val: unknown): val is unknown[] =>
    Array.isArray(val) && val.length === 0,
  emptyObject: (val: unknown): val is Record<string, unknown> => {
    return (
      TypeGuards.plainObject(val) && Object.keys(val as object).length === 0
    );
  },
  promise: (val: unknown): val is Promise<unknown> => {
    if (val instanceof Promise) return true;
    if (!val || typeof val !== 'object') return false;
    return 'then' in val;
  },
  date: (val: unknown): val is Date => val instanceof Date,
  error: (val: unknown): val is Error => val instanceof Error,
  json: (val: unknown): val is JsonValue => {
    if (val === null) return true;
    if (typeof val === 'string') {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }
    return typeof val === 'number' || typeof val === 'boolean';
  },
};

// ===========================================
// Constants
// ===========================================

export const CONSTANTS = {
  APP: {
    DEFAULT_WINDOW_WIDTH: 1200,
    DEFAULT_WINDOW_HEIGHT: 800,
    MIN_WINDOW_WIDTH: 800,
    MIN_WINDOW_HEIGHT: 600,
    DEVELOPMENT_PORT: 3000,
    CSP_NONCE_LENGTH: 16,
  },
  STORAGE: {
    LOCAL_STORAGE_PREFIX: 'app_',
    SESSION_STORAGE_PREFIX: 'session_',
    COMPRESSION_THRESHOLD: 1024,
    ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  },
  CACHE: {
    DEFAULT_MAX_SIZE: 100,
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  },
  PROCESS: {
    DEFAULT_TIMEOUT: 30000,
    MAX_BUFFER: 1024 * 1024, // 1MB
  },
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL_REGEX: /^https?:\/\/[^\s]+$/,
    UUID_REGEX:
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  },
} as const;

// ===========================================
// Environment Helpers
// ===========================================

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getEnv(name: string, defaultValue = ''): string {
  return process.env[name] || defaultValue;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ===========================================
// Export Types for convenience
// ===========================================

export type {
  AsyncReturnType,
  Awaited,
  Constructor,
  DeepPartial,
  DeepReadonly,
  DeepRequired,
  FunctionArgs,
  JsonArray,
  JsonObject,
  JsonValue,
  NonNullable,
  Omit,
  PartialBy,
  Primitive,
  RequiredBy,
  UnionToIntersection,
  UnpackPromise,
  Writable,
} from './types';
