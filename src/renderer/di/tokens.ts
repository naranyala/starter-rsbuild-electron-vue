/**
 * Frontend Dependency Injection Tokens
 */

import { InjectionToken } from '../../shared/di';

// IPC Service token
export const IPC_SERVICE_TOKEN = new InjectionToken<IPCService>(
  'IPCService',
  'Service for Electron IPC communication'
);

// Window Service token
export const FRONTEND_WINDOW_SERVICE_TOKEN =
  new InjectionToken<FrontendWindowService>(
    'FrontendWindowService',
    'Service for window-related operations from renderer'
  );

// App Info token
export const APP_INFO_TOKEN = new InjectionToken<AppInfo>(
  'AppInfo',
  'Application metadata and configuration'
);

/**
 * App info interface
 */
export interface AppInfo {
  version: string;
  name: string;
  environment: 'development' | 'production';
}

/**
 * IPC Service interface for type-safe IPC calls
 */
export interface IPCService {
  invoke<T>(channel: string, ...args: unknown[]): Promise<T>;
  send(channel: string, ...args: unknown[]): void;
  on(channel: string, callback: (...args: unknown[]) => void): () => void;
  once(channel: string, callback: (...args: unknown[]) => void): () => void;
  removeAllListeners(channel: string): void;
}

/**
 * Frontend Window Service interface
 */
export interface FrontendWindowService {
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
  isMaximized(): Promise<boolean>;
  onMinimize(callback: () => void): () => void;
  onMaximize(callback: () => void): () => void;
  onClose(callback: () => void): () => void;
}
