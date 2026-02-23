/**
 * Renderer Process Dependency Injection Container
 * Central container for all renderer process services
 */

import { DIContainer, getGlobalContainer, setGlobalContainer } from '../../shared/di';
import { registerAllRendererServices } from './service-providers';
import type { AppInfo } from './tokens';

let rendererContainer: DIContainer | null = null;

/**
 * Get or create the renderer DI container
 */
export function getRendererContainer(config?: Partial<AppInfo>): DIContainer {
  if (!rendererContainer) {
    rendererContainer = new DIContainer();
    registerAllRendererServices(rendererContainer, config);
    setGlobalContainer(rendererContainer);
  }
  return rendererContainer;
}

/**
 * Reset the renderer container (useful for testing)
 */
export function resetRendererContainer(): void {
  if (rendererContainer) {
    rendererContainer.dispose();
    rendererContainer = null;
  }
}

/**
 * Create a scoped container for a component
 */
export function createComponentScope(parent?: DIContainer): DIContainer {
  const scope = (parent ?? getRendererContainer()).createScope();
  return scope;
}

export { rendererContainer };
