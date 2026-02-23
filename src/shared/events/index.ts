/**
 * Events Module
 * Type-safe event bus system
 */

// Event definitions
export {
  type AppEvents,
  type DataEvents,
  type ErrorEvents,
  EVENT_CATEGORIES,
  type EventCategory,
  type EventMap,
  type EventName,
  type EventPayload,
  type FileEvents,
  type NavigationEvents,
  type UIEvents,
  type UserEvents,
  type WindowEvents,
} from './definitions';
// Core types and implementation
export { EventBus, getSharedEventBus, resetSharedEventBus } from './event-bus';
export type {
  EventBusConfig,
  EventBusStats,
  EventData,
  EventHandler,
  EventMiddleware,
  IEventBus,
  Subscription,
  SubscriptionOptions,
} from './types';
