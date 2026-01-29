/**
 * HTTP and API utilities for renderer process
 */

/**
 * HTTP client with error handling
 */
export class HttpClient {
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };
  }

  /**
   * Make HTTP request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async request(url, options = {}) {
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;
    const requestOptions = { ...this.defaultOptions, ...options };

    // Merge headers
    requestOptions.headers = { ...this.defaultOptions.headers, ...options.headers };

    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);

      const response = await fetch(fullUrl, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {any} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  post(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {any} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  put(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

/**
 * Local storage utilities
 */
export class StorageUtils {
  /**
   * Get value from local storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Stored value or default
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Set value to local storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Remove value from local storage
   * @param {string} key - Storage key
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * Clear all local storage
   */
  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists in local storage
   * @param {string} key - Storage key
   * @returns {boolean} Whether key exists
   */
  static has(key) {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from local storage
   * @returns {string[]} Array of keys
   */
  static keys() {
    return Object.keys(localStorage);
  }
}

/**
 * Electron API bridge utilities
 */
export class ElectronAPI {
  /**
   * Check if running in Electron
   * @returns {boolean} Whether running in Electron
   */
  static isElectron() {
    return typeof window !== 'undefined' && window.electronAPI;
  }

  /**
   * Get app version
   * @returns {Promise<string>} App version
   */
  static async getVersion() {
    if (ElectronAPI.isElectron()) {
      return await window.electronAPI.getVersion();
    }
    return 'web';
  }

  /**
   * Get platform
   * @returns {Promise<string>} Platform
   */
  static async getPlatform() {
    if (ElectronAPI.isElectron()) {
      return await window.electronAPI.getPlatform();
    }
    return navigator.platform;
  }

  /**
   * Send message to main process
   * @param {string} channel - IPC channel
   * @param {any} data - Data to send
   */
  static sendToMain(channel, data) {
    if (ElectronAPI.isElectron()) {
      // This would need to be implemented in preload.js
      console.log('Sending to main process:', channel, data);
    }
  }

  /**
   * Receive message from main process
   * @param {string} channel - IPC channel
   * @param {Function} callback - Message callback
   */
  static onFromMain(channel, callback) {
    if (ElectronAPI.isElectron()) {
      // This would need to be implemented in preload.js
      console.log('Listening for main process messages:', channel);
    }
  }
}
