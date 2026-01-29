/**
 * Security Utilities for Electron Main Process
 * These utilities help implement and maintain security best practices
 */

const { session } = require('electron');

/**
 * Configure Content Security Policy
 * @param {string} policy - CSP policy string
 * @param {object} options - CSP options
 */
function setContentSecurityPolicy(policy, options = {}) {
  const {
    allowFileAccess = false,
    allowEval = false,
    allowInlineScripts = false,
    allowInlineStyles = false,
  } = options;

  let cspPolicy = policy;

  if (!allowFileAccess) {
    cspPolicy += ' file:';
  }

  if (!allowEval) {
    cspPolicy = cspPolicy.replace(/'unsafe-eval'/g, '');
  }

  if (!allowInlineScripts) {
    cspPolicy = cspPolicy.replace(/'unsafe-inline'/g, '');
  }

  if (!allowInlineStyles) {
    cspPolicy = cspPolicy.replace(/'unsafe-inline'/g, '');
  }

  return cspPolicy;
}

/**
 * Default CSP for development
 */
function getDevelopmentCSP() {
  return setContentSecurityPolicy(
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' ws: wss:; " +
      "font-src 'self' data:; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';",
    {
      allowFileAccess: true,
      allowEval: true,
      allowInlineScripts: true,
      allowInlineStyles: true,
    }
  );
}

/**
 * Default CSP for production
 */
function getProductionCSP() {
  return setContentSecurityPolicy(
    "default-src 'self'; " +
      "script-src 'self' 'nonce-${nonce}'; " +
      "style-src 'self' 'nonce-${nonce}'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https: wss:; " +
      "font-src 'self' data:; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "frame-ancestors 'none'; " +
      'upgrade-insecure-requests;',
    {
      allowFileAccess: false,
      allowEval: false,
      allowInlineScripts: false,
      allowInlineStyles: false,
    }
  );
}

/**
 * Configure security session settings
 * @param {object} options - Security configuration options
 */
function configureSecuritySession(options = {}) {
  const defaultSession = session.defaultSession;

  const {
    enableMixedContentMode = false,
    enableWebSecurity = true,
    allowRunningInsecureContent = false,
    enableNodeIntegration = false,
    enableRemoteModule = false,
    enableContextIsolation = true,
    enableExperimentalFeatures = false,
    enableNativefierOpenUrlProtocol = false,
  } = options;

  // Disable mixed content mode
  if (!enableMixedContentMode) {
    defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [getProductionCSP()],
          'X-Content-Type-Options': ['nosniff'],
          'X-Frame-Options': ['DENY'],
          'X-XSS-Protection': ['1; mode=block'],
          'Referrer-Policy': ['strict-origin-when-cross-origin'],
        },
      });
    });
  }

  // Configure web security settings
  defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = new URL(details.url);

    // Block dangerous protocols
    const blockedProtocols = ['data:', 'javascript:', 'vbscript:'];
    if (blockedProtocols.includes(url.protocol)) {
      callback({ cancel: true });
      return;
    }

    // Block file:// access in production
    if (!enableMixedContentMode && url.protocol === 'file:') {
      callback({ cancel: true });
      return;
    }

    callback({});
  });

  // Set certificate verification
  defaultSession.setCertificateVerifyProc((request, callback) => {
    const { hostname } = request;

    // Allow localhost in development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      callback(0); // OK
    } else {
      callback(-2); // Use system verification
    }
  });

  // Disable dangerous features
  defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const deniedPermissions = [
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
      ];

      if (deniedPermissions.includes(permission)) {
        callback(false);
      } else {
        callback(true);
      }
    }
  );
}

/**
 * Validate URL security
 * @param {string} url - URL to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if URL is secure
 */
function validateUrl(url, options = {}) {
  const {
    allowLocalhost = true,
    allowFileUrls = false,
    allowedDomains = [],
    allowedProtocols = ['https:', 'http:', 'wss:', 'ws:'],
  } = options;

  try {
    const parsedUrl = new URL(url);

    // Check protocol
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }

    // Check file URLs
    if (parsedUrl.protocol === 'file:' && !allowFileUrls) {
      return false;
    }

    // Check localhost
    if (
      !allowLocalhost &&
      (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')
    ) {
      return false;
    }

    // Check allowed domains
    if (
      allowedDomains.length > 0 &&
      !allowedDomains.includes(parsedUrl.hostname)
    ) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize user input
 * @param {string} input - User input to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input, options = {}) {
  const {
    allowHtml = false,
    allowedTags = [],
    allowedAttributes = {},
  } = options;

  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  if (!allowHtml) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>"'&]/g, '');
  } else {
    // Basic HTML sanitization
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
    sanitized = sanitized.replace(
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      ''
    );
    sanitized = sanitized.replace(
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      ''
    );
    sanitized = sanitized.replace(/<embed\b[^<]*>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  }

  return sanitized.trim();
}

/**
 * Generate random nonce for CSP
 * @returns {string} - Random nonce
 */
function generateNonce() {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Create secure window configuration
 * @param {object} options - Window options
 * @returns {object} - Secure window configuration
 */
function createSecureWindowConfig(options = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const secureConfig = {
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.cjs'),
      additionalArguments: ['--disable-web-security'].filter(
        () => isDevelopment
      ),
      ...options.webPreferences,
    },
    ...options,
  };

  if (isDevelopment) {
    // Less restrictive for development
    secureConfig.webPreferences.nodeIntegration = true;
    secureConfig.webPreferences.contextIsolation = false;
    secureConfig.webPreferences.webSecurity = false;
  }

  return secureConfig;
}

/**
 * Validate file path security
 * @param {string} filePath - File path to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if path is secure
 */
function validateFilePath(filePath, options = {}) {
  const { allowedDirectories = [], blockedDirectories = [] } = options;

  if (typeof filePath !== 'string') {
    return false;
  }

  // Normalize path
  const normalizedPath = require('path').normalize(filePath);

  // Check for path traversal attempts
  if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
    return false;
  }

  // Check blocked directories
  for (const blockedDir of blockedDirectories) {
    if (normalizedPath.startsWith(blockedDir)) {
      return false;
    }
  }

  // Check allowed directories
  if (allowedDirectories.length > 0) {
    return allowedDirectories.some(allowedDir =>
      normalizedPath.startsWith(allowedDir)
    );
  }

  return true;
}

module.exports = {
  setContentSecurityPolicy,
  getDevelopmentCSP,
  getProductionCSP,
  configureSecuritySession,
  validateUrl,
  sanitizeInput,
  generateNonce,
  createSecureWindowConfig,
  validateFilePath,
};
