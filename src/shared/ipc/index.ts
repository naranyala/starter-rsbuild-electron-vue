/**
 * IPC Module
 * Type-safe IPC communication utilities
 */

export { getAllChannels, IPC_CHANNELS, type IpcChannel } from './channels';
export {
  createFailureResult,
  createSuccessResult,
  type IpcFailure,
  type IpcHandler,
  type IpcHandlerRegistration,
  type IpcResult,
  type IpcSuccess,
  registerIpcHandlers,
  withErrorHandling,
} from './handlers';
