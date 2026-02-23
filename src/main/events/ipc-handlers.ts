/**
 * IPC Handlers for Event Bus
 * Bridges events between main and renderer processes
 */

import { ipcMain } from 'electron';
import { getMainEventBus } from '../events/main-event-bus';

const EVENT_BUS_CHANNEL = 'event-bus:main';

/**
 * Register IPC handlers for event bus communication
 */
export function registerEventBusHandlers(): void {
  const eventBus = getMainEventBus();

  // Handle events emitted from renderer
  ipcMain.handle(
    `${EVENT_BUS_CHANNEL}:emit`,
    async (event, data: { event: string; payload: unknown }) => {
      const { event: eventName, payload } = data;
      
      console.log('[EventBus IPC] Received from renderer:', eventName);

      // Emit in main process
      await eventBus.emit(eventName, payload);

      return { success: true };
    }
  );

  console.log('[EventBus IPC] Handlers registered');
}

/**
 * Unregister IPC handlers for event bus
 */
export function unregisterEventBusHandlers(): void {
  ipcMain.removeHandler(`${EVENT_BUS_CHANNEL}:emit`);
  console.log('[EventBus IPC] Handlers unregistered');
}

/**
 * Forward event to specific renderer window
 */
export function forwardEventToWindow<TPayload>(
  windowId: number,
  event: string,
  payload?: TPayload
): void {
  const eventBus = getMainEventBus();
  eventBus.forwardToWindow(windowId, event, payload);
}

/**
 * Broadcast event to all renderer windows
 */
export function broadcastEventToRenderers<TPayload>(
  event: string,
  payload?: TPayload
): void {
  const eventBus = getMainEventBus({ forwardToRenderer: true });
  void eventBus.emit(event, payload, { forwardToRenderer: true });
}
