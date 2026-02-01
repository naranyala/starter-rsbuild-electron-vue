/**
 * Enhanced Storage Utilities for Renderer Process
 * These utilities provide advanced storage capabilities beyond basic localStorage
 */
/**
 * Enhanced storage with encryption and compression
 */
export declare class EnhancedStorage {
    private static readonly STORAGE_KEY_PREFIX;
    private static readonly ENCRYPTION_KEY;
    private static readonly COMPRESSION_THRESHOLD;
    /**
     * Set value with optional encryption and compression
     * @param key - Storage key
     * @param value - Value to store
     * @param options - Storage options
     */
    static set(key: string, value: any, options?: {
        encrypt?: boolean;
        compress?: boolean;
        ttl?: number;
    }): void;
    /**
     * Get value with optional decryption and decompression
     * @param key - Storage key
     * @returns Stored value or null if not found/expired
     */
    static get<T = any>(key: string): T | null;
    /**
     * Remove value from storage
     * @param key - Storage key
     */
    static remove(key: string): void;
    /**
     * Clear all enhanced storage items
     */
    static clear(): void;
    /**
     * Check if key exists in storage
     * @param key - Storage key
     * @returns Whether key exists
     */
    static has(key: string): boolean;
    /**
     * Get all keys in enhanced storage
     * @returns Array of keys
     */
    static keys(): string[];
    /**
     * Get storage size in bytes
     * @returns Storage size in bytes
     */
    static size(): number;
    /**
     * Get remaining time for key
     * @param key - Storage key
     * @returns Remaining time in milliseconds or null if not found/expired
     */
    static getTimeToLive(key: string): number | null;
    /**
     * Compress data using a simple algorithm
     * @param data - Data to compress
     * @returns Compressed data
     */
    private static compress;
    /**
     * Decompress data
     * @param data - Data to decompress
     * @returns Decompressed data
     */
    private static decompress;
    /**
     * Encrypt data
     * @param data - Data to encrypt
     * @returns Encrypted data
     */
    private static encrypt;
    /**
     * Decrypt data
     * @param data - Data to decrypt
     * @returns Decrypted data
     */
    private static decrypt;
    /**
     * Get size of string in bytes
     * @param str - String to measure
     * @returns Size in bytes
     */
    private static getSize;
}
/**
 * IndexedDB wrapper for complex data storage
 */
export declare class IndexedDBStorage {
    private static db;
    private static dbName;
    private static version;
    /**
     * Initialize IndexedDB
     * @returns Promise that resolves when DB is ready
     */
    static init(): Promise<void>;
    /**
     * Store object in IndexedDB
     * @param storeName - Store name
     * @param data - Data to store
     * @returns Promise with stored object ID
     */
    static store(storeName: string, data: any): Promise<string>;
    /**
     * Retrieve object from IndexedDB
     * @param storeName - Store name
     * @param id - Object ID
     * @returns Promise with stored object
     */
    static retrieve(storeName: string, id: string): Promise<any>;
    /**
     * Update object in IndexedDB
     * @param storeName - Store name
     * @param id - Object ID
     * @param data - Updated data
     * @returns Promise that resolves when updated
     */
    static update(storeName: string, id: string, data: any): Promise<void>;
    /**
     * Delete object from IndexedDB
     * @param storeName - Store name
     * @param id - Object ID
     * @returns Promise that resolves when deleted
     */
    static delete(storeName: string, id: string): Promise<void>;
    /**
     * Query objects in IndexedDB
     * @param storeName - Store name
     * @param query - Query function
     * @returns Promise with matching objects
     */
    static query(storeName: string, query: (item: any) => boolean): Promise<any[]>;
    /**
     * Clear all data from a store
     * @param storeName - Store name
     * @returns Promise that resolves when cleared
     */
    static clear(storeName: string): Promise<void>;
    /**
     * Generate unique ID
     * @returns Unique ID
     */
    private static generateId;
}
/**
 * State management utilities
 */
export declare class StateManager {
    private state;
    private eventEmitter;
    private persistenceKey;
    constructor(persistenceKey?: string);
    /**
     * Set state value
     * @param key - State key
     * @param value - State value
     */
    setState(key: string, value: any): void;
    /**
     * Get state value
     * @param key - State key
     * @param defaultValue - Default value if not found
     * @returns State value
     */
    getState<T = any>(key: string, defaultValue?: T): T | undefined;
    /**
     * Get all state
     * @returns Complete state object
     */
    getAllState(): Record<string, any>;
    /**
     * Subscribe to state changes
     * @param key - State key (optional, if omitted subscribes to all changes)
     * @param callback - Change callback
     * @returns Unsubscribe function
     */
    subscribe(key: string | null, callback: (data: {
        key: string;
        newValue: any;
        oldValue: any;
    }) => void): () => void;
    /**
     * Remove state key
     * @param key - State key
     */
    removeState(key: string): void;
    /**
     * Clear all state
     */
    clearState(): void;
    /**
     * Save state to persistent storage
     */
    private saveState;
    /**
     * Load state from persistent storage
     */
    private loadState;
    /**
     * Reset state to initial values
     * @param initialState - Initial state to reset to
     */
    reset(initialState?: Record<string, any>): void;
    /**
     * Get state history (if tracking is enabled)
     * @returns State history
     */
    getHistory(): Array<{
        key: string;
        newValue: any;
        oldValue: any;
        timestamp: number;
    }>;
}
/**
 * Cache utilities with LRU eviction
 */
export declare class LRUCache {
    private cache;
    private capacity;
    private eventEmitter;
    constructor(capacity?: number);
    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or null
     */
    get<T = any>(key: string): T | null;
    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     */
    set(key: string, value: any): void;
    /**
     * Check if key exists in cache
     * @param key - Cache key
     * @returns Whether key exists
     */
    has(key: string): boolean;
    /**
     * Remove key from cache
     * @param key - Cache key
     */
    remove(key: string): void;
    /**
     * Clear cache
     */
    clear(): void;
    /**
     * Get cache size
     * @returns Number of items in cache
     */
    size(): number;
    /**
     * Get cache capacity
     * @returns Maximum capacity
     */
    getCapacity(): number;
    /**
     * Set cache capacity
     * @param capacity - New capacity
     */
    setCapacity(capacity: number): void;
    /**
     * Subscribe to cache events
     * @param event - Event name
     * @param callback - Event callback
     * @returns Unsubscribe function
     */
    on(event: 'set' | 'removed' | 'evicted' | 'cleared', callback: Function): () => void;
    /**
     * Get all cache keys
     * @returns Array of cache keys
     */
    keys(): string[];
    /**
     * Get cache entries
     * @returns Array of [key, value] pairs
     */
    entries(): [string, any][];
}
/**
 * Enhanced storage utilities combining all storage utilities
 */
export declare class EnhancedStorageUtils {
    static readonly storage: typeof EnhancedStorage;
    static readonly indexedDB: typeof IndexedDBStorage;
    static readonly state: typeof StateManager;
    static readonly cache: typeof LRUCache;
}
//# sourceMappingURL=storage.d.ts.map