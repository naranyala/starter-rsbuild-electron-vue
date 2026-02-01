// Shared constants
export const APP_CONSTANTS = {
  DEFAULT_WINDOW_WIDTH: 1200,
  DEFAULT_WINDOW_HEIGHT: 800,
  MIN_WINDOW_WIDTH: 800,
  MIN_WINDOW_HEIGHT: 600,
  DEVELOPMENT_PORT: 3000,
  CSP_NONCE_LENGTH: 16,
} as const;

export const SECURITY_CONSTANTS = {
  BLOCKED_PROTOCOLS: ['data:', 'javascript:', 'vbscript:'],
  DENIED_PERMISSIONS: [
    'media',
    'geolocation',
    'notifications',
    'midi',
    'midiSysex',
    'pointerLock',
    'fullscreen',
    'openExternal',
    'videoCapture',
    'audioCapture',
    'displayCapture',
    'desktopCapture',
  ],
} as const;

export const FILE_CONSTANTS = {
  DEFAULT_ENCODING: 'utf8',
  MAX_BUFFER_SIZE: 1024 * 1024, // 1MB
  DEFAULT_TIMEOUT: 30000, // 30 seconds
} as const;

export type AppConstants = typeof APP_CONSTANTS;
export type SecurityConstants = typeof SECURITY_CONSTANTS;
export type FileConstants = typeof FILE_CONSTANTS;
