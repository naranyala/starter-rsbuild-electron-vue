/**
 * Enhanced Storage Utilities for Renderer Process
 * These utilities provide advanced storage capabilities beyond basic localStorage
 */

import { EventEmitter } from './events';

/**
 * Enhanced storage with encryption and compression
 */
export class EnhancedStorage {
  private static readonly STORAGE_KEY_PREFIX = 'enhanced_storage_';
  private static readonly ENCRYPTION_KEY = 'default_encryption_key'; // In production, use a more secure method
  private static readonly COMPRESSION_THRESHOLD = 1024; // 1KB threshold for compression

  /**
   * Set value with optional encryption and compression
   * @param key - Storage key
   * @param value - Value to store
   * @param options - Storage options
   */
  static set(key: string, value: any, options: {
    encrypt?: boolean;
    compress?: boolean;
    ttl?: number; // Time to live in milliseconds
  } = {}): void {
    const { encrypt = false, compress = false, ttl = null } = options;

    let processedValue = value;

    // Compress if needed
    if (compress && this.getSize(JSON.stringify(value)) > this.COMPRESSION_THRESHOLD) {
      processedValue = this.compress(JSON.stringify(value));
    }

    // Encrypt if needed
    if (encrypt) {
      processedValue = this.encrypt(JSON.stringify(processedValue));
    }

    // Prepare storage object
    const storageObj = {
      value: processedValue,
      encrypted: encrypt,
      compressed: compress,
      timestamp: Date.now(),
      ttl: ttl || null,
    };

    try {
      localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${key}`, JSON.stringify(storageObj));
    } catch (error) {
      console.error('Error storing value:', error);
      // Fallback to sessionStorage if localStorage is full
      try {
        sessionStorage.setItem(`${this.STORAGE_KEY_PREFIX}${key}`, JSON.stringify(storageObj));
      } catch (sessionError) {
        console.error('Error storing value in sessionStorage:', sessionError);
      }
    }
  }

  /**
   * Get value with optional decryption and decompression
   * @param key - Storage key
   * @returns Stored value or null if not found/expired
   */
  static get<T = any>(key: string): T | null {
    let storageObjStr = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`);
    
    if (!storageObjStr) {
      // Try sessionStorage as fallback
      storageObjStr = sessionStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`);
    }

    if (!storageObjStr) {
      return null;
    }

    try {
      const storageObj = JSON.parse(storageObjStr);

      // Check if expired
      if (storageObj.ttl && Date.now() - storageObj.timestamp > storageObj.ttl) {
        this.remove(key);
        return null;
      }

      let value = storageObj.value;

      // Decrypt if needed
      if (storageObj.encrypted) {
        const decrypted = this.decrypt(value);
        value = JSON.parse(decrypted);
      }

      // Decompress if needed
      if (storageObj.compressed) {
        value = JSON.parse(this.decompress(value));
      }

      return value as T;
    } catch (error) {
      console.error('Error retrieving value:', error);
      return null;
    }
  }

  /**
   * Remove value from storage
   * @param key - Storage key
   */
  static remove(key: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${key}`);
    sessionStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${key}`);
  }

  /**
   * Clear all enhanced storage items
   */
  static clear(): void {
    const keysToRemove: string[] = [];
    
    // Collect keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove collected keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Collect keys from sessionStorage
    keysToRemove.length = 0; // Reset array
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove collected keys
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }

  /**
   * Check if key exists in storage
   * @param key - Storage key
   * @returns Whether key exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`) !== null ||
           sessionStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`) !== null;
  }

  /**
   * Get all keys in enhanced storage
   * @returns Array of keys
   */
  static keys(): string[] {
    const keys: string[] = [];
    
    // Get keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        keys.push(key.substring(this.STORAGE_KEY_PREFIX.length));
      }
    }
    
    // Get keys from sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        const cleanKey = key.substring(this.STORAGE_KEY_PREFIX.length);
        if (!keys.includes(cleanKey)) { // Avoid duplicates
          keys.push(cleanKey);
        }
      }
    }
    
    return keys;
  }

  /**
   * Get storage size in bytes
   * @returns Storage size in bytes
   */
  static size(): number {
    let total = 0;
    
    // Calculate localStorage size
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        total += key.length + localStorage.getItem(key)!.length;
      }
    }
    
    // Calculate sessionStorage size
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        total += key.length + sessionStorage.getItem(key)!.length;
      }
    }
    
    return total;
  }

  /**
   * Get remaining time for key
   * @param key - Storage key
   * @returns Remaining time in milliseconds or null if not found/expired
   */
  static getTimeToLive(key: string): number | null {
    let storageObjStr = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`);
    
    if (!storageObjStr) {
      storageObjStr = sessionStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`);
    }

    if (!storageObjStr) {
      return null;
    }

    try {
      const storageObj = JSON.parse(storageObjStr);
      
      if (!storageObj.ttl) {
        return null; // No TTL set
      }

      const elapsed = Date.now() - storageObj.timestamp;
      const remaining = storageObj.ttl - elapsed;

      if (remaining <= 0) {
        this.remove(key);
        return null;
      }

      return remaining;
    } catch (error) {
      console.error('Error getting TTL:', error);
      return null;
    }
  }

  /**
   * Compress data using a simple algorithm
   * @param data - Data to compress
   * @returns Compressed data
   */
  private static compress(data: string): string {
    // This is a simplified compression algorithm
    // In a real implementation, you might use a library like LZ-string
    return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g,
      function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      }));
  }

  /**
   * Decompress data
   * @param data - Data to decompress
   * @returns Decompressed data
   */
  private static decompress(data: string): string {
    // This is a simplified decompression algorithm
    // In a real implementation, you might use a library like LZ-string
    return decodeURIComponent(atob(data).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  /**
   * Encrypt data
   * @param data - Data to encrypt
   * @returns Encrypted data
   */
  private static encrypt(data: string): string {
    // This is a simplified encryption algorithm
    // In a real implementation, use a proper encryption library
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length));
    }
    return btoa(encrypted);
  }

  /**
   * Decrypt data
   * @param data - Data to decrypt
   * @returns Decrypted data
   */
  private static decrypt(data: string): string {
    // This is a simplified decryption algorithm
    // In a real implementation, use a proper encryption library
    const decoded = atob(data);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length));
    }
    return decrypted;
  }

  /**
   * Get size of string in bytes
   * @param str - String to measure
   * @returns Size in bytes
   */
  private static getSize(str: string): number {
    return new Blob([str]).size;
  }
}

/**
 * IndexedDB wrapper for complex data storage
 */
export class IndexedDBStorage {
  private static db: IDBDatabase | null = null;
  private static dbName: string = 'EnhancedStorageDB';
  private static version: number = 1;

  /**
   * Initialize IndexedDB
   * @returns Promise that resolves when DB is ready
   */
  static async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('objects')) {
          const objectStore = db.createObjectStore('objects', { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('collections')) {
          const collectionStore = db.createObjectStore('collections', { keyPath: 'id' });
          collectionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Store object in IndexedDB
   * @param storeName - Store name
   * @param data - Data to store
   * @returns Promise with stored object ID
   */
  static async store(storeName: string, data: any): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const item = {
        id: this.generateId(),
        data,
        timestamp: Date.now(),
      };

      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item.id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Retrieve object from IndexedDB
   * @param storeName - Store name
   * @param id - Object ID
   * @returns Promise with stored object
   */
  static async retrieve(storeName: string, id: string): Promise<any> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Update object in IndexedDB
   * @param storeName - Store name
   * @param id - Object ID
   * @param data - Updated data
   * @returns Promise that resolves when updated
   */
  static async update(storeName: string, id: string, data: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          const item = {
            ...request.result,
            data,
            timestamp: Date.now(),
          };

          const updateRequest = store.put(item);
          
          updateRequest.onsuccess = () => {
            resolve();
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          reject(new Error(`Item with ID ${id} not found`));
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete object from IndexedDB
   * @param storeName - Store name
   * @param id - Object ID
   * @returns Promise that resolves when deleted
   */
  static async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Query objects in IndexedDB
   * @param storeName - Store name
   * @param query - Query function
   * @returns Promise with matching objects
   */
  static async query(storeName: string, query: (item: any) => boolean): Promise<any[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const results: any[] = [];

      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (query(cursor.value)) {
            results.push(cursor.value.data);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clear all data from a store
   * @param storeName - Store name
   * @returns Promise that resolves when cleared
   */
  static async clear(storeName: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Generate unique ID
   * @returns Unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

/**
 * State management utilities
 */
export class StateManager {
  private state: Map<string, any> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private persistenceKey: string | null = null;

  constructor(persistenceKey?: string) {
    this.persistenceKey = persistenceKey || null;
    
    // Load persisted state if key provided
    if (this.persistenceKey) {
      this.loadState();
    }
  }

  /**
   * Set state value
   * @param key - State key
   * @param value - State value
   */
  setState(key: string, value: any): void {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    
    // Emit change event
    this.eventEmitter.emit('stateChange', { key, newValue: value, oldValue });
    
    // Persist if key provided
    if (this.persistenceKey) {
      this.saveState();
    }
  }

  /**
   * Get state value
   * @param key - State key
   * @param defaultValue - Default value if not found
   * @returns State value
   */
  getState<T = any>(key: string, defaultValue?: T): T | undefined {
    return this.state.has(key) ? this.state.get(key) as T : defaultValue;
  }

  /**
   * Get all state
   * @returns Complete state object
   */
  getAllState(): Record<string, any> {
    return Object.fromEntries(this.state);
  }

  /**
   * Subscribe to state changes
   * @param key - State key (optional, if omitted subscribes to all changes)
   * @param callback - Change callback
   * @returns Unsubscribe function
   */
  subscribe(key: string | null, callback: (data: { key: string; newValue: any; oldValue: any }) => void): () => void {
    if (key) {
      // Subscribe to specific key changes
      return this.eventEmitter.on('stateChange', (data: { key: string; newValue: any; oldValue: any }) => {
        if (data.key === key) {
          callback(data);
        }
      });
    } else {
      // Subscribe to all changes
      return this.eventEmitter.on('stateChange', callback);
    }
  }

  /**
   * Remove state key
   * @param key - State key
   */
  removeState(key: string): void {
    const oldValue = this.state.get(key);
    this.state.delete(key);
    
    // Emit removal event
    this.eventEmitter.emit('stateRemoved', { key, oldValue });
    
    // Persist if key provided
    if (this.persistenceKey) {
      this.saveState();
    }
  }

  /**
   * Clear all state
   */
  clearState(): void {
    const oldState = { ...this.getAllState() };
    this.state.clear();
    
    // Emit clear event
    this.eventEmitter.emit('stateCleared', { oldState });
    
    // Persist if key provided
    if (this.persistenceKey) {
      this.saveState();
    }
  }

  /**
   * Save state to persistent storage
   */
  private saveState(): void {
    if (this.persistenceKey) {
      EnhancedStorage.set(this.persistenceKey, Object.fromEntries(this.state));
    }
  }

  /**
   * Load state from persistent storage
   */
  private loadState(): void {
    if (this.persistenceKey) {
      const savedState = EnhancedStorage.get<Record<string, any>>(this.persistenceKey);
      if (savedState) {
        this.state = new Map(Object.entries(savedState));
      }
    }
  }

  /**
   * Reset state to initial values
   * @param initialState - Initial state to reset to
   */
  reset(initialState: Record<string, any> = {}): void {
    const oldState = { ...this.getAllState() };
    this.state.clear();
    
    // Set initial state
    Object.entries(initialState).forEach(([key, value]) => {
      this.state.set(key, value);
    });
    
    // Emit reset event
    this.eventEmitter.emit('stateReset', { oldState, newState: initialState });
    
    // Persist if key provided
    if (this.persistenceKey) {
      this.saveState();
    }
  }

  /**
   * Get state history (if tracking is enabled)
   * @returns State history
   */
  getHistory(): Array<{ key: string; newValue: any; oldValue: any; timestamp: number }> {
    // This would require additional implementation to track history
    // For now, returning an empty array
    return [];
  }
}

/**
 * Cache utilities with LRU eviction
 */
export class LRUCache {
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  private capacity: number;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(capacity: number = 100) {
    this.capacity = capacity;
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null
   */
  get<T = any>(key: string): T | null {
    if (this.cache.has(key)) {
      const item = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, item);
      return item.value as T;
    }
    return null;
  }

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   */
  set(key: string, value: any): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used item
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
        this.eventEmitter.emit('evicted', { key: firstKey });
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
    this.eventEmitter.emit('set', { key, value });
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns Whether key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Remove key from cache
   * @param key - Cache key
   */
  remove(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.eventEmitter.emit('removed', { key });
    }
  }

  /**
   * Clear cache
   */
  clear(): void {
    const keys = Array.from(this.cache.keys());
    this.cache.clear();
    this.eventEmitter.emit('cleared', { keys });
  }

  /**
   * Get cache size
   * @returns Number of items in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache capacity
   * @returns Maximum capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Set cache capacity
   * @param capacity - New capacity
   */
  setCapacity(capacity: number): void {
    this.capacity = capacity;
    // Trim cache if it exceeds new capacity
    while (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
        this.eventEmitter.emit('evicted', { key: firstKey });
      }
    }
  }

  /**
   * Subscribe to cache events
   * @param event - Event name
   * @param callback - Event callback
   * @returns Unsubscribe function
   */
  on(event: 'set' | 'removed' | 'evicted' | 'cleared', callback: Function): () => void {
    return this.eventEmitter.on(event, callback);
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache entries
   * @returns Array of [key, value] pairs
   */
  entries(): [string, any][] {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }
}

/**
 * Enhanced storage utilities combining all storage utilities
 */
export class EnhancedStorageUtils {
  static readonly storage = EnhancedStorage;
  static readonly indexedDB = IndexedDBStorage;
  static readonly state = StateManager;
  static readonly cache = LRUCache;
}