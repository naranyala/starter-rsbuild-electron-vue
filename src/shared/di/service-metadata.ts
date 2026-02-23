import type { InjectionToken } from './injection-token';

/**
 * Service lifetime scopes
 */
export enum ServiceLifetime {
  /** Singleton: One instance per container */
  Singleton = 'singleton',
  /** Transient: New instance every time */
  Transient = 'transient',
  /** Scoped: One instance per scope */
  Scoped = 'scoped',
}

/**
 * Metadata for a service registration
 */
export interface ServiceMetadata<T = unknown> {
  token: InjectionToken<T> | string;
  provider: {
    useClass?: new (...args: unknown[]) => T;
    useFactory?: (...args: unknown[]) => T;
    useValue?: T;
    useExisting?: InjectionToken<unknown> | string;
  };
  lifetime: ServiceLifetime;
  dependencies?: Array<InjectionToken<unknown> | string>;
}

/**
 * Decorator metadata for @Injectable
 */
export interface InjectableMetadata {
  dependencies?: Array<InjectionToken<unknown> | string>;
}
