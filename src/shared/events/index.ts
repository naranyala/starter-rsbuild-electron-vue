/**
 * Events Module
 * Type-safe event bus system
 */

// Core types and implementation
export { EventBus, getSharedEventBus, resetSharedEventBus } from './event-bus';
export type {
  EventHandler,
  EventData,
  SubscriptionOptions,
  Subscription,
  EventBusConfig,
  EventBusStats,
  EventMiddleware,
  IEventBus,
} from './types';

// Event definitions
export {
  EVENT_CATEGORIES,
  type EventMap,
  type EventName,
  type EventPayload,
  type EventCategory,
  type AppEvents,
  type WindowEvents,
  type FileEvents,
  type UserEvents,
  type NavigationEvents,
  type DataEvents,
  type UIEvents,
  type ErrorEvents,
} from './definitions';
