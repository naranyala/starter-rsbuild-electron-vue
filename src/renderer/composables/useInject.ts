/**
 * Vue Composable for Dependency Injection
 * Provides useInject composable for Vue 3 components
 *
 * Note: This is a simple, decorator-free approach that works
 * natively with Vue 3's composition API.
 */

import {
  type ComputedRef,
  type InjectionKey,
  inject,
  provide,
  type Ref,
} from 'vue';
import type { InjectionToken } from '../../shared/di';
import { getRendererContainer } from '../di';

/**
 * Key for the container injection
 */
const CONTAINER_KEY: InjectionKey<ReturnType<typeof getRendererContainer>> =
  Symbol('DIContainer');

/**
 * Provide the DI container to child components
 * Call this in your root component or main.ts
 */
export function provideDIContainer(
  container?: ReturnType<typeof getRendererContainer>
): void {
  const diContainer = container ?? getRendererContainer();
  provide(CONTAINER_KEY, diContainer);
}

/**
 * Inject a dependency using a token
 * @param token - The injection token
 * @param fallback - Optional fallback value if not found
 */
export function useInject<T>(
  token: InjectionToken<T> | string,
  fallback?: T
): T {
  const container =
    inject<ReturnType<typeof getRendererContainer>>(CONTAINER_KEY);

  if (container) {
    try {
      return container.get(token);
    } catch (error) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw error;
    }
  }

  // Fallback to global container
  if (fallback !== undefined) {
    return fallback;
  }

  const globalContainer = getRendererContainer();
  return globalContainer.get(token);
}

/**
 * Inject a dependency as a computed ref
 * Useful for reactive dependencies
 */
export function useInjectComputed<T>(
  token: InjectionToken<T> | string,
  fallback?: T
): ComputedRef<T> {
  const { computed } = require('vue');
  const value = useInject(token, fallback);
  return computed(() => value);
}

/**
 * Inject a dependency as a ref
 * Useful for mutable dependencies
 */
export function useInjectRef<T>(
  token: InjectionToken<T> | string,
  fallback?: T
): Ref<T> {
  const { ref } = require('vue');
  const value = useInject(token, fallback);
  return ref(value);
}

/**
 * Provide a value for dependency injection
 */
export function useProvide<T>(
  token: InjectionToken<T> | string,
  value: T
): void {
  const container =
    inject<ReturnType<typeof getRendererContainer>>(CONTAINER_KEY);

  if (container) {
    container.addValue(token, value);
  }
}

/**
 * Check if a token is available
 */
export function useIsAvailable(
  token: InjectionToken<unknown> | string
): boolean {
  const container =
    inject<ReturnType<typeof getRendererContainer>>(CONTAINER_KEY);

  if (container) {
    return container.isRegistered(token);
  }

  const globalContainer = getRendererContainer();
  return globalContainer.isRegistered(token);
}
