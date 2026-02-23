import { getInjectableMetadata } from './injectable';
import type { InjectionToken } from './injection-token';
import type { ServiceLifetime, ServiceMetadata } from './service-metadata';
import { ServiceLifetime as Lifetime } from './service-metadata';

/**
 * Type-safe Reflect interface for DI
 */
interface ReflectWithMetadata {
  getMetadata?(metadataKey: unknown, target: unknown): unknown;
}

/**
 * Get Reflect with metadata support
 */
function getReflect(): ReflectWithMetadata | null {
  if (typeof Reflect !== 'undefined') {
    return Reflect as ReflectWithMetadata;
  }
  return null;
}

/**
 * Dependency Injection Container
 * Manages service registration and resolution
 */
export class DIContainer {
  private services = new Map<
    string | InjectionToken<unknown>,
    ServiceMetadata
  >();
  private instances = new Map<string | InjectionToken<unknown>, unknown>();
  private parent?: DIContainer;

  constructor(parent?: DIContainer) {
    this.parent = parent;
  }

  /**
   * Register a service with the container
   */
  register<T>(
    token: InjectionToken<T> | string,
    options: {
      useClass?: new (...args: unknown[]) => T;
      useFactory?: (...args: unknown[]) => T;
      useValue?: T;
      useExisting?: InjectionToken<unknown> | string;
      lifetime?: ServiceLifetime;
      dependencies?: Array<InjectionToken<unknown> | string>;
    }
  ): this {
    const metadata: ServiceMetadata<T> = {
      token,
      provider: {
        useClass: options.useClass,
        useFactory: options.useFactory,
        useValue: options.useValue,
        useExisting: options.useExisting,
      },
      lifetime: options.lifetime ?? Lifetime.Singleton,
      dependencies: options.dependencies,
    };

    this.services.set(token, metadata);
    return this;
  }

  /**
   * Register a class as a singleton
   */
  addSingleton<T>(
    token: InjectionToken<T> | string,
    useClass?: new (...args: unknown[]) => T
  ): this {
    return this.register(token, {
      useClass:
        useClass ??
        (typeof token === 'function' ? (token as new () => T) : undefined),
      lifetime: Lifetime.Singleton,
    });
  }

  /**
   * Register a class as transient (new instance each time)
   */
  addTransient<T>(
    token: InjectionToken<T> | string,
    useClass?: new (...args: unknown[]) => T
  ): this {
    return this.register(token, {
      useClass:
        useClass ??
        (typeof token === 'function' ? (token as new () => T) : undefined),
      lifetime: Lifetime.Transient,
    });
  }

  /**
   * Register a factory function
   */
  addFactory<T>(
    token: InjectionToken<T> | string,
    factory: (...args: unknown[]) => T,
    lifetime: ServiceLifetime = Lifetime.Singleton
  ): this {
    return this.register(token, {
      useFactory: factory,
      lifetime,
    });
  }

  /**
   * Register a value
   */
  addValue<T>(token: InjectionToken<T> | string, value: T): this {
    return this.register(token, {
      useValue: value,
      lifetime: Lifetime.Singleton,
    });
  }

  /**
   * Resolve a dependency from the container
   */
  get<T>(token: InjectionToken<T> | string): T {
    const key = typeof token === 'string' ? token : token.name;

    // Check if already instantiated (for singletons)
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    // Check parent container
    if (!this.services.has(token) && this.parent) {
      return this.parent.get(token);
    }

    const metadata = this.services.get(token);
    if (!metadata) {
      throw new Error(`No service registered for token: ${token}`);
    }

    const instance = this.createInstance(metadata);

    // Cache singleton instances
    if (metadata.lifetime === Lifetime.Singleton) {
      this.instances.set(token, instance);
    }

    return instance as T;
  }

  /**
   * Create an instance from service metadata
   */
  private createInstance<T>(metadata: ServiceMetadata<T>): T {
    const { provider, dependencies } = metadata;

    // useValue
    if (provider.useValue !== undefined) {
      return provider.useValue;
    }

    // useExisting (alias)
    if (provider.useExisting) {
      return this.get(provider.useExisting) as T;
    }

    // useFactory
    if (provider.useFactory) {
      const deps = dependencies?.map(dep => this.get(dep)) ?? [];
      return provider.useFactory(...deps);
    }

    // useClass
    if (provider.useClass) {
      const deps = this.resolveDependencies(provider.useClass, dependencies);
      return new provider.useClass(...deps) as T;
    }

    throw new Error(`No provider configured for: ${metadata.token}`);
  }

  /**
   * Resolve constructor dependencies for a class
   */
  private resolveDependencies<T>(
    useClass: new (...args: unknown[]) => T,
    explicitDeps?: Array<InjectionToken<unknown> | string>
  ): unknown[] {
    // Use explicit dependencies if provided
    if (explicitDeps && explicitDeps.length > 0) {
      return explicitDeps.map(dep => this.get(dep));
    }

    // Try to get dependencies from @Injectable decorator
    const metadata = getInjectableMetadata(useClass);
    if (metadata?.dependencies) {
      return metadata.dependencies.map(dep => this.get(dep));
    }

    // Try to infer from constructor parameter types
    const reflect = getReflect();
    if (reflect?.getMetadata) {
      const paramTypes = reflect.getMetadata('design:paramtypes', useClass);
      if (paramTypes) {
        return (paramTypes as Array<new () => unknown>).map(
          (ParamClass: new () => unknown) => {
            // If it's a class, try to resolve it
            if (ParamClass) {
              try {
                return this.get(ParamClass);
              } catch {
                // If not registered, instantiate directly
                return new ParamClass();
              }
            }
            return undefined;
          }
        );
      }
    }

    return [];
  }

  /**
   * Create a child container (for scoped services)
   */
  createScope(): DIContainer {
    return new DIContainer(this);
  }

  /**
   * Check if a service is registered
   */
  isRegistered(token: InjectionToken<unknown> | string): boolean {
    return (
      this.services.has(token) || (this.parent?.isRegistered(token) ?? false)
    );
  }

  /**
   * Clear all cached instances
   */
  clearInstances(): void {
    this.instances.clear();
  }

  /**
   * Dispose the container (clear instances and services)
   */
  dispose(): void {
    this.clearInstances();
    this.services.clear();
  }
}

/**
 * Global container instance (for convenience)
 */
let globalContainer: DIContainer | null = null;

export function getGlobalContainer(): DIContainer {
  if (!globalContainer) {
    globalContainer = new DIContainer();
  }
  return globalContainer;
}

export function setGlobalContainer(container: DIContainer): void {
  globalContainer = container;
}
