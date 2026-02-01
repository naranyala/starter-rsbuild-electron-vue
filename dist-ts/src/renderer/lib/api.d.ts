/**
 * Enhanced HTTP and API utilities for renderer process
 */
export interface RequestOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}
export interface HttpClientOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
    baseURL?: string;
    [key: string]: any;
}
/**
 * Enhanced HTTP client with error handling and retry logic
 */
export declare class HttpClient {
    private baseURL;
    private defaultOptions;
    constructor(baseURL?: string, options?: HttpClientOptions);
    /**
     * Make HTTP request with retry logic
     * @param url - Request URL
     * @param options - Request options
     * @returns Response promise
     */
    request<T = any>(url: string, options?: RequestOptions): Promise<T>;
    /**
     * GET request
     * @param url - Request URL
     * @param options - Request options
     * @returns Response promise
     */
    get<T = any>(url: string, options?: RequestOptions): Promise<T>;
    /**
     * POST request
     * @param url - Request URL
     * @param data - Request data
     * @param options - Request options
     * @returns Response promise
     */
    post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
    /**
     * PUT request
     * @param url - Request URL
     * @param data - Request data
     * @param options - Request options
     * @returns Response promise
     */
    put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
    /**
     * PATCH request
     * @param url - Request URL
     * @param data - Request data
     * @param options - Request options
     * @returns Response promise
     */
    patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>;
    /**
     * DELETE request
     * @param url - Request URL
     * @param options - Request options
     * @returns Response promise
     */
    delete<T = any>(url: string, options?: RequestOptions): Promise<T>;
    /**
     * Upload file
     * @param url - Upload URL
     * @param file - File to upload
     * @param options - Request options
     * @returns Response promise
     */
    upload<T = any>(url: string, file: File | Blob, options?: RequestOptions): Promise<T>;
    /**
     * Download file
     * @param url - Download URL
     * @param filename - Filename to save as
     * @param options - Request options
     * @returns Promise when download completes
     */
    download(url: string, filename: string, options?: RequestOptions): Promise<void>;
}
/**
 * Enhanced local storage utilities with encryption
 */
export declare class StorageUtils {
    private static readonly ENCRYPTION_KEY;
    /**
     * Get value from local storage
     * @param key - Storage key
     * @param defaultValue - Default value if not found
     * @returns Stored value or default
     */
    static get<T = any>(key: string, defaultValue?: T | null): T | null;
    /**
     * Set value to local storage
     * @param key - Storage key
     * @param value - Value to store
     */
    static set(key: string, value: any): void;
    /**
     * Remove value from local storage
     * @param key - Storage key
     */
    static remove(key: string): void;
    /**
     * Clear all local storage
     */
    static clear(): void;
    /**
     * Check if key exists in local storage
     * @param key - Storage key
     * @returns Whether key exists
     */
    static has(key: string): boolean;
    /**
     * Get all keys from local storage
     * @returns Array of keys
     */
    static keys(): string[];
    /**
     * Get storage size in bytes
     * @returns Storage size in bytes
     */
    static size(): number;
    /**
     * Get storage usage percentage
     * @returns Usage percentage (0-100)
     */
    static usagePercentage(): number;
    /**
     * Set with expiration
     * @param key - Storage key
     * @param value - Value to store
     * @param ttl - Time to live in milliseconds
     */
    static setWithExpiry(key: string, value: any, ttl: number): void;
    /**
     * Get with expiration check
     * @param key - Storage key
     * @returns Stored value or null if expired
     */
    static getWithExpiry<T = any>(key: string): T | null;
    /**
     * Get remaining time for key
     * @param key - Storage key
     * @returns Remaining time in milliseconds or null if not found/expired
     */
    static getTimeToLive(key: string): number | null;
}
/**
 * Enhanced session storage utilities
 */
export declare class SessionStorageUtils {
    /**
     * Get value from session storage
     * @param key - Storage key
     * @param defaultValue - Default value if not found
     * @returns Stored value or default
     */
    static get<T = any>(key: string, defaultValue?: T | null): T | null;
    /**
     * Set value to session storage
     * @param key - Storage key
     * @param value - Value to store
     */
    static set(key: string, value: any): void;
    /**
     * Remove value from session storage
     * @param key - Storage key
     */
    static remove(key: string): void;
    /**
     * Clear all session storage
     */
    static clear(): void;
    /**
     * Check if key exists in session storage
     * @param key - Storage key
     * @returns Whether key exists
     */
    static has(key: string): boolean;
    /**
     * Get all keys from session storage
     * @returns Array of keys
     */
    static keys(): string[];
}
/**
 * Enhanced cookie utilities
 */
export declare class CookieUtils {
    /**
     * Set cookie
     * @param name - Cookie name
     * @param value - Cookie value
     * @param days - Days until expiration
     * @param path - Cookie path
     * @param domain - Cookie domain
     * @param secure - Whether to use secure protocol
     * @param sameSite - SameSite attribute
     */
    static set(name: string, value: string, days?: number, path?: string, domain?: string, secure?: boolean, sameSite?: 'Strict' | 'Lax' | 'None'): void;
    /**
     * Get cookie value
     * @param name - Cookie name
     * @returns Cookie value or null if not found
     */
    static get(name: string): string | null;
    /**
     * Remove cookie
     * @param name - Cookie name
     * @param path - Cookie path
     * @param domain - Cookie domain
     */
    static remove(name: string, path?: string, domain?: string): void;
    /**
     * Check if cookie exists
     * @param name - Cookie name
     * @returns Whether cookie exists
     */
    static has(name: string): boolean;
    /**
     * Get all cookies
     * @returns Object with all cookies
     */
    static getAll(): Record<string, string>;
}
/**
 * Enhanced cache utilities
 */
export declare class CacheUtils {
    private static cache;
    /**
     * Set cached value
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in milliseconds
     */
    static set(key: string, value: any, ttl?: number): void;
    /**
     * Get cached value
     * @param key - Cache key
     * @returns Cached value or null if not found/expired
     */
    static get<T = any>(key: string): T | null;
    /**
     * Check if cached value exists
     * @param key - Cache key
     * @returns Whether value exists in cache
     */
    static has(key: string): boolean;
    /**
     * Remove cached value
     * @param key - Cache key
     */
    static remove(key: string): void;
    /**
     * Clear expired cache entries
     */
    static clearExpired(): void;
    /**
     * Clear all cache
     */
    static clear(): void;
    /**
     * Get cache size
     * @returns Number of cached items
     */
    static size(): number;
}
/**
 * Enhanced API utilities combining all storage and HTTP utilities
 */
export declare class ApiUtils {
    static readonly http: HttpClient;
    static readonly storage: typeof StorageUtils;
    static readonly sessionStorage: typeof SessionStorageUtils;
    static readonly cookies: typeof CookieUtils;
    static readonly cache: typeof CacheUtils;
}
//# sourceMappingURL=api.d.ts.map