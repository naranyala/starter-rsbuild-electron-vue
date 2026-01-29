/**
 * Storage Utilities for Frontend Renderer Process
 * These utilities provide enhanced localStorage and sessionStorage functionality
 */

/**
 * Enhanced localStorage with type safety and error handling
 */
class LocalStorage {
  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {object} options - Storage options
   */
  static setItem(
    key: string,
    value: any,
    options: { ttl?: number } = {}
  ): boolean {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl || null,
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Stored value or default
   */
  static getItem<T>(key: string, defaultValue: T = null as T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      const parsed = JSON.parse(item);

      // Check TTL if set
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return defaultValue;
      }

      return parsed.value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - True if successful
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  }

  /**
   * Clear all localStorage items
   * @returns {boolean} - True if successful
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get all localStorage keys
   * @returns {string[]} - Array of keys
   */
  static keys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - True if key exists
   */
  static hasKey(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error checking localStorage key:', error);
      return false;
    }
  }

  /**
   * Get localStorage size in bytes
   * @returns {number} - Size in bytes
   */
  static size(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
      return 0;
    }
  }
}

/**
 * Enhanced sessionStorage with type safety
 */
class SessionStorage {
  /**
   * Set item in sessionStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  static setItem(key: string, value: any): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
      return false;
    }
  }

  /**
   * Get item from sessionStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Stored value or default
   */
  static getItem<T>(key: string, defaultValue: T = null as T): T {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from sessionStorage
   * @param {string} key - Storage key
   * @returns {boolean} - True if successful
   */
  static removeItem(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
      return false;
    }
  }

  /**
   * Clear all sessionStorage items
   * @returns {boolean} - True if successful
   */
  static clear(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }

  /**
   * Get all sessionStorage keys
   * @returns {string[]} - Array of keys
   */
  static keys(): string[] {
    try {
      return Object.keys(sessionStorage);
    } catch (error) {
      console.error('Error getting sessionStorage keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists in sessionStorage
   * @param {string} key - Storage key
   * @returns {boolean} - True if key exists
   */
  static hasKey(key: string): boolean {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error checking sessionStorage key:', error);
      return false;
    }
  }
}

/**
 * IndexedDB utility for larger data storage
 */
class IndexedDBStorage {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'AppStorage', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  /**
   * Initialize IndexedDB connection
   * @returns {Promise<boolean>} - True if successful
   */
  async init(): Promise<boolean> {
    return new Promise(resolve => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('storage')) {
          db.createObjectStore('storage', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Store value in IndexedDB
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<boolean>} - True if successful
   */
  async setItem(key: string, value: any): Promise<boolean> {
    if (!this.db) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    return new Promise(resolve => {
      const transaction = this.db!.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');

      const request = store.put({ key, value, timestamp: Date.now() });

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('IndexedDB set error:', request.error);
        resolve(false);
      };
    });
  }

  /**
   * Get value from IndexedDB
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {Promise<any>} - Stored value or default
   */
  async getItem<T>(key: string, defaultValue: T = null as T): Promise<T> {
    if (!this.db) {
      const initialized = await this.init();
      if (!initialized) return defaultValue;
    }

    return new Promise(resolve => {
      const transaction = this.db!.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');

      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultValue);
      };

      request.onerror = () => {
        console.error('IndexedDB get error:', request.error);
        resolve(defaultValue);
      };
    });
  }

  /**
   * Remove item from IndexedDB
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - True if successful
   */
  async removeItem(key: string): Promise<boolean> {
    if (!this.db) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    return new Promise(resolve => {
      const transaction = this.db!.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');

      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('IndexedDB remove error:', request.error);
        resolve(false);
      };
    });
  }

  /**
   * Clear all items from IndexedDB
   * @returns {Promise<boolean>} - True if successful
   */
  async clear(): Promise<boolean> {
    if (!this.db) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    return new Promise(resolve => {
      const transaction = this.db!.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');

      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('IndexedDB clear error:', request.error);
        resolve(false);
      };
    });
  }

  /**
   * Get all keys from IndexedDB
   * @returns {Promise<string[]>} - Array of keys
   */
  async keys(): Promise<string[]> {
    if (!this.db) {
      const initialized = await this.init();
      if (!initialized) return [];
    }

    return new Promise(resolve => {
      const transaction = this.db!.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');

      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        console.error('IndexedDB keys error:', request.error);
        resolve([]);
      };
    });
  }

  /**
   * Close IndexedDB connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * Cookie utilities for browser-based storage
 */
class CookieStorage {
  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {object} options - Cookie options
   */
  static setCookie(
    name: string,
    value: string,
    options: {
      days?: number;
      hours?: number;
      minutes?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {}
  ): boolean {
    try {
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

      // Calculate expiration
      if (options.days || options.hours || options.minutes) {
        const date = new Date();
        const totalMinutes =
          (options.days || 0) * 24 * 60 +
          (options.hours || 0) * 60 +
          (options.minutes || 0);
        date.setTime(date.getTime() + totalMinutes * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      }

      // Add path
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }

      // Add domain
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      // Add secure flag
      if (options.secure) {
        cookieString += '; secure';
      }

      // Add SameSite attribute
      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      }

      document.cookie = cookieString;
      return true;
    } catch (error) {
      console.error('Error setting cookie:', error);
      return false;
    }
  }

  /**
   * Get cookie value
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null
   */
  static getCookie(name: string): string | null {
    try {
      const nameEQ = `${encodeURIComponent(name)}=`;
      const cookies = document.cookie.split(';');

      for (const cookie of cookies) {
        let c = cookie;
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  }

  /**
   * Delete cookie
   * @param {string} name - Cookie name
   * @param {object} options - Cookie options (path, domain)
   */
  static deleteCookie(
    name: string,
    options: {
      path?: string;
      domain?: string;
    } = {}
  ): boolean {
    try {
      let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      if (options.path) {
        cookieString += `; path=${options.path}`;
      }

      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      document.cookie = cookieString;
      return true;
    } catch (error) {
      console.error('Error deleting cookie:', error);
      return false;
    }
  }

  /**
   * Check if cookie exists
   * @param {string} name - Cookie name
   * @returns {boolean} - True if cookie exists
   */
  static hasCookie(name: string): boolean {
    return CookieStorage.getCookie(name) !== null;
  }

  /**
   * Get all cookies
   * @returns {object} - Object with all cookies
   */
  static getAllCookies(): Record<string, string> {
    try {
      const cookies: Record<string, string> = {};
      if (!document.cookie) return cookies;

      const cookieArray = document.cookie.split(';');
      for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      }
      return cookies;
    } catch (error) {
      console.error('Error getting all cookies:', error);
      return {};
    }
  }
}

export { LocalStorage, SessionStorage, IndexedDBStorage, CookieStorage };
