/**
 * Enhanced Storage Utilities for Renderer Process
 * These utilities provide advanced storage capabilities beyond basic localStorage
 */
import { EventEmitter } from './events.js';
/**
 * Enhanced storage with encryption and compression
 */
export class EnhancedStorage {
    /**
     * Set value with optional encryption and compression
     * @param key - Storage key
     * @param value - Value to store
     * @param options - Storage options
     */
    static set(key, value, options = {}) {
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
        }
        catch (error) {
            console.error('Error storing value:', error);
            // Fallback to sessionStorage if localStorage is full
            try {
                sessionStorage.setItem(`${this.STORAGE_KEY_PREFIX}${key}`, JSON.stringify(storageObj));
            }
            catch (sessionError) {
                console.error('Error storing value in sessionStorage:', sessionError);
            }
        }
    }
    /**
     * Get value with optional decryption and decompression
     * @param key - Storage key
     * @returns Stored value or null if not found/expired
     */
    static get(key) {
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
            return value;
        }
        catch (error) {
            console.error('Error retrieving value:', error);
            return null;
        }
    }
    /**
     * Remove value from storage
     * @param key - Storage key
     */
    static remove(key) {
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${key}`);
        sessionStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${key}`);
    }
    /**
     * Clear all enhanced storage items
     */
    static clear() {
        const keysToRemove = [];
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
    static has(key) {
        return localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`) !== null ||
            sessionStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`) !== null;
    }
    /**
     * Get all keys in enhanced storage
     * @returns Array of keys
     */
    static keys() {
        const keys = [];
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
    static size() {
        let total = 0;
        // Calculate localStorage size
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
                total += key.length + localStorage.getItem(key).length;
            }
        }
        // Calculate sessionStorage size
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
                total += key.length + sessionStorage.getItem(key).length;
            }
        }
        return total;
    }
    /**
     * Get remaining time for key
     * @param key - Storage key
     * @returns Remaining time in milliseconds or null if not found/expired
     */
    static getTimeToLive(key) {
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
        }
        catch (error) {
            console.error('Error getting TTL:', error);
            return null;
        }
    }
    /**
     * Compress data using a simple algorithm
     * @param data - Data to compress
     * @returns Compressed data
     */
    static compress(data) {
        // This is a simplified compression algorithm
        // In a real implementation, you might use a library like LZ-string
        return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    }
    /**
     * Decompress data
     * @param data - Data to decompress
     * @returns Decompressed data
     */
    static decompress(data) {
        // This is a simplified decompression algorithm
        // In a real implementation, you might use a library like LZ-string
        return decodeURIComponent(atob(data).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
    /**
     * Encrypt data
     * @param data - Data to encrypt
     * @returns Encrypted data
     */
    static encrypt(data) {
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
    static decrypt(data) {
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
    static getSize(str) {
        return new Blob([str]).size;
    }
}
EnhancedStorage.STORAGE_KEY_PREFIX = 'enhanced_storage_';
EnhancedStorage.ENCRYPTION_KEY = 'default_encryption_key'; // In production, use a more secure method
EnhancedStorage.COMPRESSION_THRESHOLD = 1024; // 1KB threshold for compression
/**
 * IndexedDB wrapper for complex data storage
 */
export class IndexedDBStorage {
    /**
     * Initialize IndexedDB
     * @returns Promise that resolves when DB is ready
     */
    static async init() {
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
                const db = event.target.result;
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
    static async store(storeName, data) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
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
    static async retrieve(storeName, id) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
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
    static async update(storeName, id, data) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
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
                }
                else {
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
    static async delete(storeName, id) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
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
    static async query(storeName, query) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const results = [];
            const request = store.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (query(cursor.value)) {
                        results.push(cursor.value.data);
                    }
                    cursor.continue();
                }
                else {
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
    static async clear(storeName) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
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
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
IndexedDBStorage.db = null;
IndexedDBStorage.dbName = 'EnhancedStorageDB';
IndexedDBStorage.version = 1;
/**
 * State management utilities
 */
export class StateManager {
    constructor(persistenceKey) {
        this.state = new Map();
        this.eventEmitter = new EventEmitter();
        this.persistenceKey = null;
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
    setState(key, value) {
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
    getState(key, defaultValue) {
        return this.state.has(key) ? this.state.get(key) : defaultValue;
    }
    /**
     * Get all state
     * @returns Complete state object
     */
    getAllState() {
        return Object.fromEntries(this.state);
    }
    /**
     * Subscribe to state changes
     * @param key - State key (optional, if omitted subscribes to all changes)
     * @param callback - Change callback
     * @returns Unsubscribe function
     */
    subscribe(key, callback) {
        if (key) {
            // Subscribe to specific key changes
            return this.eventEmitter.on('stateChange', (data) => {
                if (data.key === key) {
                    callback(data);
                }
            });
        }
        else {
            // Subscribe to all changes
            return this.eventEmitter.on('stateChange', callback);
        }
    }
    /**
     * Remove state key
     * @param key - State key
     */
    removeState(key) {
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
    clearState() {
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
    saveState() {
        if (this.persistenceKey) {
            EnhancedStorage.set(this.persistenceKey, Object.fromEntries(this.state));
        }
    }
    /**
     * Load state from persistent storage
     */
    loadState() {
        if (this.persistenceKey) {
            const savedState = EnhancedStorage.get(this.persistenceKey);
            if (savedState) {
                this.state = new Map(Object.entries(savedState));
            }
        }
    }
    /**
     * Reset state to initial values
     * @param initialState - Initial state to reset to
     */
    reset(initialState = {}) {
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
    getHistory() {
        // This would require additional implementation to track history
        // For now, returning an empty array
        return [];
    }
}
/**
 * Cache utilities with LRU eviction
 */
export class LRUCache {
    constructor(capacity = 100) {
        this.cache = new Map();
        this.eventEmitter = new EventEmitter();
        this.capacity = capacity;
    }
    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or null
     */
    get(key) {
        if (this.cache.has(key)) {
            const item = this.cache.get(key);
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, item);
            return item.value;
        }
        return null;
    }
    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     */
    set(key, value) {
        if (this.cache.has(key)) {
            // Update existing key
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.capacity) {
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
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Remove key from cache
     * @param key - Cache key
     */
    remove(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.eventEmitter.emit('removed', { key });
        }
    }
    /**
     * Clear cache
     */
    clear() {
        const keys = Array.from(this.cache.keys());
        this.cache.clear();
        this.eventEmitter.emit('cleared', { keys });
    }
    /**
     * Get cache size
     * @returns Number of items in cache
     */
    size() {
        return this.cache.size;
    }
    /**
     * Get cache capacity
     * @returns Maximum capacity
     */
    getCapacity() {
        return this.capacity;
    }
    /**
     * Set cache capacity
     * @param capacity - New capacity
     */
    setCapacity(capacity) {
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
    on(event, callback) {
        return this.eventEmitter.on(event, callback);
    }
    /**
     * Get all cache keys
     * @returns Array of cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }
    /**
     * Get cache entries
     * @returns Array of [key, value] pairs
     */
    entries() {
        return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
    }
}
/**
 * Enhanced storage utilities combining all storage utilities
 */
export class EnhancedStorageUtils {
}
EnhancedStorageUtils.storage = EnhancedStorage;
EnhancedStorageUtils.indexedDB = IndexedDBStorage;
EnhancedStorageUtils.state = StateManager;
EnhancedStorageUtils.cache = LRUCache;
//# sourceMappingURL=storage.js.map