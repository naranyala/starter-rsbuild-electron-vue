/**
 * Dependency Injection Module
 *
 * Provides a lightweight DI container with support for:
 * - Singleton, Transient, and Scoped lifetimes
 * - Class, Factory, Value, and Existing providers
 * - Constructor injection with @Injectable decorator
 * - Parameter injection with @Inject decorator
 * - Hierarchical containers (parent/child scopes)
 */

export { DIContainer, getGlobalContainer, setGlobalContainer } from './di-container';
export { Injectable, Inject, getInjectableMetadata } from './injectable';
export { InjectionToken } from './injection-token';
export { ServiceLifetime, type ServiceMetadata, type InjectableMetadata } from './service-metadata';
