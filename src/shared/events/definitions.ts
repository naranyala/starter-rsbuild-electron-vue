/**
 * Event Definitions
 * Type-safe event names and payloads
 */

/**
 * Application Events
 */
export interface AppEvents {
  'app:ready': { version: string };
  'app:quit': { reason?: string };
  'app:focus': void;
  'app:blur': void;
  'app:minimize': void;
  'app:maximize': void;
  'app:restore': void;
}

/**
 * Window Events
 */
export interface WindowEvents {
  'window:created': { windowId: string; name: string };
  'window:closed': { windowId: string; name: string };
  'window:focus': { windowId: string };
  'window:blur': { windowId: string };
  'window:resize': { windowId: string; width: number; height: number };
  'window:move': { windowId: string; x: number; y: number };
  'window:minimize': { windowId: string };
  'window:maximize': { windowId: string };
  'window:restore': { windowId: string };
}

/**
 * File System Events
 */
export interface FileEvents {
  'file:read': { path: string; success: boolean };
  'file:write': { path: string; success: boolean };
  'file:deleted': { path: string; success: boolean };
  'file:created': { path: string; success: boolean };
  'file:changed': { path: string; type: 'change' | 'rename' };
}

/**
 * User Events (example custom events)
 */
export interface UserEvents {
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
  'user:update': { userId: string; changes: Record<string, unknown> };
  'user:created': { userId: string; username: string };
  'user:deleted': { userId: string };
}

/**
 * Navigation Events
 */
export interface NavigationEvents {
  'navigate:start': { from: string; to: string };
  'navigate:end': { from: string; to: string; duration: number };
  'navigate:error': { from: string; to: string; error: string };
  'navigate:cancel': { from: string; to: string };
}

/**
 * Data Events
 */
export interface DataEvents {
  'data:loading': { resource: string };
  'data:loaded': { resource: string; count: number };
  'data:error': { resource: string; error: string };
  'data:refresh': { resource: string };
  'data:clear': { resource: string };
}

/**
 * UI Events
 */
export interface UIEvents {
  'ui:theme:change': { theme: 'light' | 'dark' | 'system' };
  'ui:language:change': { language: string };
  'ui:sidebar:toggle': { visible: boolean };
  'ui:modal:open': { modalId: string };
  'ui:modal:close': { modalId: string };
  'ui:notification:show': { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' };
}

/**
 * Error Events
 */
export interface ErrorEvents {
  'error:uncaught': { error: Error; context: string };
  'error:handled': { error: Error; handled: boolean };
  'error:api': { endpoint: string; status: number; message: string };
}

/**
 * Combined Event Map
 */
export type EventMap = 
  & AppEvents 
  & WindowEvents 
  & FileEvents 
  & UserEvents 
  & NavigationEvents 
  & DataEvents 
  & UIEvents 
  & ErrorEvents;

/**
 * All possible event names
 */
export type EventName = keyof EventMap;

/**
 * Get payload type for an event
 */
export type EventPayload<T extends EventName> = EventMap[T];

/**
 * Event category wildcards
 */
export const EVENT_CATEGORIES = {
  APP: 'app:*',
  WINDOW: 'window:*',
  FILE: 'file:*',
  USER: 'user:*',
  NAVIGATION: 'navigate:*',
  DATA: 'data:*',
  UI: 'ui:*',
  ERROR: 'error:*',
  ALL: '*',
} as const;

/**
 * Type for event categories
 */
export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];
