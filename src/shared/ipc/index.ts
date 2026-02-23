/**
 * IPC Module
 * Type-safe IPC communication utilities
 */

export { IPC_CHANNELS, getAllChannels, type IpcChannel } from './channels';
export {
  type IpcResult,
  type IpcSuccess,
  type IpcFailure,
  type IpcHandler,
  type IpcHandlerRegistration,
  createSuccessResult,
  createFailureResult,
  withErrorHandling,
  registerIpcHandlers,
} from './handlers';
