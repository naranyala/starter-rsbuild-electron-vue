// ===========================================
// Core Type Definitions
// ===========================================

export type Primitive = string | number | boolean | null | undefined;
export type JsonValue = Primitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Constructor<T> = new (...args: any[]) => T;

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

export type FunctionArgs<T extends (...args: any) => any> = T extends (
  ...args: infer A
) => any
  ? A
  : never;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type UnionToIntersection<U> = (
  U extends any
    ? (k: U) => void
    : never
) extends (k: infer I) => void
  ? I
  : never;

export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Awaited<T> = T extends Promise<infer U> ? U : T;

export type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

// ===========================================
// Result Types for Error Handling
// ===========================================

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export function Ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function Err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

export function isOk<T, E>(
  result: Result<T, E>
): result is { success: true; data: T } {
  return result.success;
}

export function isErr<T, E>(
  result: Result<T, E>
): result is { success: false; error: E } {
  return !result.success;
}

// ===========================================
// Common Interfaces
// ===========================================

export interface IDisposable {
  dispose(): void | Promise<void>;
}

export interface ICloneable<T> {
  clone(): T;
}

export interface IEquatable<T> {
  equals(other: T): boolean;
}

export interface IComparable<T> {
  compareTo(other: T): number;
}

export interface IFactory<T, Args extends any[] = []> {
  create(...args: Args): T;
}

export interface IObserver<T> {
  next(value: T): void;
  error(err: Error): void;
  complete(): void;
}

export interface IObservable<T> {
  subscribe(observer: IObserver<T>): IDisposable;
}

export interface IEventEmitter<T extends string = string> {
  on(event: T, listener: (...args: any[]) => void): IDisposable;
  emit(event: T, ...args: any[]): void;
  off(event: T, listener: (...args: any[]) => void): void;
  once(event: T, listener: (...args: any[]) => void): IDisposable;
}

// ===========================================
// Configuration Types
// ===========================================

export interface AppConfig {
  name: string;
  version: string;
  window: {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
  };
  development: {
    port: number;
    openDevTools: boolean;
  };
}

export interface WindowConfig {
  name: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  frame?: boolean;
  show?: boolean;
  webPreferences?: {
    nodeIntegration?: boolean;
    contextIsolation?: boolean;
    webSecurity?: boolean;
    preload?: string;
  };
}

// ===========================================
// IPC Types
// ===========================================

export type IpcChannel = string;

export type IpcHandler<T = any, Args extends any[] = any[]> = (
  event: Electron.IpcMainEvent,
  ...args: Args
) => T;

export type IpcInvokeHandler<T = any, Args extends any[] = any[]> = (
  event: Electron.IpcMainInvokeEvent,
  ...args: Args
) => T | Promise<T>;

export type IpcRendererHandler<T = any> = (...args: any[]) => Promise<T>;

export interface IpcRequest<T = any> {
  channel: string;
  payload?: any;
}

export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===========================================
// Storage Types
// ===========================================

export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number;
  namespace?: string;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export interface LRUCacheOptions {
  maxSize?: number;
  ttl?: number;
  onEvict?: (key: string, value: any) => void;
}

// ===========================================
// Event Types
// ===========================================

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export interface DragDropEvent {
  event: MouseEvent;
  element: HTMLElement;
}

export interface TouchGestureEvent {
  event: TouchEvent;
  touches: Touch[];
}

// ===========================================
// Validation Types
// ===========================================

export interface ValidationRule<T = any> {
  validate(value: T): boolean;
  message?: string;
}

export interface ValidationSchema<T> {
  [key: string]: ValidationRule<T[keyof T]> | ValidationSchema<any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// ===========================================
// File System Types
// ===========================================

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  isDirectory: boolean;
}

export interface DirectoryEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: DirectoryEntry[];
}

export interface CopyOptions {
  overwrite?: boolean;
  filter?: (src: string, dest: string) => boolean;
}

export interface WatchOptions {
  recursive?: boolean;
  encoding?: BufferEncoding;
}

// ===========================================
// Process Types
// ===========================================

export interface ProcessInfo {
  pid: number;
  ppid: number;
  title: string;
  version: string;
  platform: NodeJS.Platform;
  arch: string;
  env: Record<string, string>;
  argv: string[];
  cwd: string;
}

export interface SystemInfo {
  platform: NodeJS.Platform;
  arch: string;
  release: string;
  hostname: string;
  cpus: {
    model: string;
    speed: number;
    times: {
      user: number;
      nice: number;
      sys: number;
      idle: number;
      irq: number;
    };
  }[];
  totalMemory: number;
  freeMemory: number;
  uptime: number;
}

export interface ExecuteOptions {
  timeout?: number;
  maxBuffer?: number;
  encoding?: string;
  cwd?: string;
  env?: Record<string, string>;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  success: boolean;
  code?: number;
}

// ===========================================
// Security Types
// ===========================================

export interface CspDirectives {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  fontSrc?: string[];
  objectSrc?: string[];
  baseUri?: string[];
  formAction?: string[];
  frameAncestors?: string[];
}

export interface SecurityConfig {
  csp?: CspDirectives;
  enableMixedContentMode?: boolean;
  enableWebSecurity?: boolean;
  enableNodeIntegration?: boolean;
  enableContextIsolation?: boolean;
  allowedOrigins?: string[];
  blockedProtocols?: string[];
}

export interface SanitizationOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripScripts?: boolean;
  stripIframes?: boolean;
  maxLength?: number;
}

// ===========================================
// Window Types
// ===========================================

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayInfo {
  id: number;
  bounds: WindowBounds;
  workArea: WindowBounds;
  scaleFactor: number;
  rotation: number;
  touchSupport: 'unknown' | 'available' | 'unavailable';
}

export interface MenuTemplate {
  label?: string;
  submenu?: MenuTemplate[];
  accelerator?: string;
  click?: () => void;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  role?:
    | 'undo'
    | 'redo'
    | 'cut'
    | 'copy'
    | 'paste'
    | 'selectAll'
    | 'reload'
    | 'forceReload'
    | 'toggleDevTools'
    | 'resetZoom'
    | 'zoomIn'
    | 'zoomOut'
    | 'togglefullscreen'
    | 'window'
    | 'minimize'
    | 'close'
    | 'help'
    | 'about'
    | 'services'
    | 'hide'
    | 'hideOthers'
    | 'unhide'
    | 'zoom';
}

// ===========================================
// Animation Types
// ===========================================

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface KeyframeAnimation {
  [key: string]: string | number;
}

export interface TransitionConfig {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

// ===========================================
// Logger Types
// ===========================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

export interface LoggerOptions {
  level?: LogLevel;
  format?: 'json' | 'pretty';
  colors?: boolean;
  timestamps?: boolean;
  prefix?: string;
}

export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  log(level: LogLevel, message: string, context?: Record<string, any>): void;
}

// ===========================================
// Vue 3 Specific Types
// ===========================================

import type { ComputedRef, Ref, WatchSource } from 'vue';

export type VueRef<T> = Ref<T> | ComputedRef<T>;

export type VueWatchOptions = {
  deep?: boolean;
  immediate?: boolean;
  flush?: 'pre' | 'post' | 'sync';
  onTrigger?: () => void;
};

export type LifecycleHook =
  | 'onMounted'
  | 'onUnmounted'
  | 'onBeforeMount'
  | 'onBeforeUnmount'
  | 'onBeforeUpdate'
  | 'onUpdated'
  | 'onActivated'
  | 'onDeactivated'
  | 'onErrorCaptured';

export interface UseAsyncOptions<T> {
  timeout?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  immediate?: boolean;
  resetOnExecute?: boolean;
}

export interface UseAsyncReturn<T, E = Error> {
  data: Ref<T | null>;
  error: Ref<E | null>;
  loading: Ref<boolean>;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export interface UseDebounceOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface UseThrottleOptions {
  limit?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface UseStorageOptions<T> {
  defaultValue?: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  namespace?: string;
}

export interface UseClipboardOptions {
  source?: () => string;
  timeout?: number;
}
