/**
 * Main Process Dependency Injection Container
 * Central container for all main process services
 */

import { DIContainer, getGlobalContainer, setGlobalContainer } from '../../shared/di';
import { registerAllMainServices } from './service-providers';

let mainContainer: DIContainer | null = null;

/**
 * Get or create the main process DI container
 */
export function getMainContainer(): DIContainer {
  if (!mainContainer) {
    mainContainer = new DIContainer();
    registerAllMainServices(mainContainer);
    setGlobalContainer(mainContainer);
  }
  return mainContainer;
}

/**
 * Reset the main container (useful for testing)
 */
export function resetMainContainer(): void {
  if (mainContainer) {
    mainContainer.dispose();
    mainContainer = null;
  }
}

/**
 * Initialize the main container with Electron dependencies
 */
export function initializeMainContainer(app?: typeof import('electron').app): DIContainer {
  const container = getMainContainer();

  if (app) {
    // Re-register with actual Electron instances if provided
    container.clearInstances();
  }

  return container;
}

export { mainContainer };
