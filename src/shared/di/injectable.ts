import type { InjectionToken } from './injection-token';
import type { InjectableMetadata } from './service-metadata';

const INJECTABLE_METADATA_KEY = Symbol('INJECTABLE_METADATA');

/**
 * Type-safe Reflect interface
 */
interface ReflectWithMetadata {
  defineMetadata?(
    metadataKey: unknown,
    metadataValue: unknown,
    target: unknown,
    propertyKey?: unknown
  ): void;
  getMetadata?(
    metadataKey: unknown,
    target: unknown,
    propertyKey?: unknown
  ): unknown;
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
 * Decorator to mark a class as injectable
 * @param dependencies - Optional array of dependency tokens
 */
export function Injectable(
  dependencies?: Array<InjectionToken<unknown> | string>
) {
  return <T extends new (...args: unknown[]) => unknown>(target: T) => {
    const reflect = getReflect();
    if (reflect?.defineMetadata) {
      reflect.defineMetadata(INJECTABLE_METADATA_KEY, { dependencies }, target);
    }
    return target;
  };
}

/**
 * Get injectable metadata from a class
 */
export function getInjectableMetadata(
  target: new (...args: unknown[]) => unknown
): InjectableMetadata | undefined {
  const reflect = getReflect();
  if (reflect?.getMetadata) {
    return reflect.getMetadata(INJECTABLE_METADATA_KEY, target) as
      | InjectableMetadata
      | undefined;
  }
  return undefined;
}

/**
 * Parameter decorator to inject a dependency by token
 */
export function Inject<T>(token: InjectionToken<T> | string) {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const reflect = getReflect();
    if (reflect?.defineMetadata && reflect?.getMetadata) {
      const existing =
        reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
      reflect.defineMetadata(
        `inject:${parameterIndex}`,
        token,
        target,
        propertyKey
      );
    }
  };
}
