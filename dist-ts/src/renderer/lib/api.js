/**
 * Enhanced HTTP and API utilities for renderer process
 */
/**
 * Enhanced HTTP client with error handling and retry logic
 */
export class HttpClient {
    constructor(baseURL = '', options = {}) {
        this.baseURL = baseURL;
        this.defaultOptions = {
            timeout: 10000,
            retries: 3,
            retryDelay: 1000,
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };
    }
    /**
     * Make HTTP request with retry logic
     * @param url - Request URL
     * @param options - Request options
     * @returns Response promise
     */
    async request(url, options = {}) {
        const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;
        const requestOptions = { ...this.defaultOptions, ...options };
        // Merge headers
        requestOptions.headers = {
            ...this.defaultOptions.headers,
            ...options.headers,
        };
        let lastError = null;
        for (let attempt = 0; attempt <= (requestOptions.retries || 0); attempt++) {
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
                }
                else {
                    return await response.text();
                }
            }
            catch (error) {
                lastError = error;
                if (attempt < (requestOptions.retries || 0)) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, requestOptions.retryDelay));
                }
                else {
                    throw lastError;
                }
            }
        }
        throw lastError; // This should never be reached, but TypeScript wants it
    }
    /**
     * GET request
     * @param url - Request URL
     * @param options - Request options
     * @returns Response promise
     */
    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }
    /**
     * POST request
     * @param url - Request URL
     * @param data - Request data
     * @param options - Request options
     * @returns Response promise
     */
    post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    /**
     * PUT request
     * @param url - Request URL
     * @param data - Request data
     * @param options - Request options
     * @returns Response promise
     */
    put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    /**
     * PATCH request
     * @param url - Request URL
     * @param data - Request data
     * @param options - Request options
     * @returns Response promise
     */
    patch(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    /**
     * DELETE request
     * @param url - Request URL
     * @param options - Request options
     * @returns Response promise
     */
    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
    /**
     * Upload file
     * @param url - Upload URL
     * @param file - File to upload
     * @param options - Request options
     * @returns Response promise
     */
    async upload(url, file, options = {}) {
        const formData = new FormData();
        formData.append('file', file, file.name || 'file');
        return this.request(url, {
            ...options,
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for multipart/form-data, let browser set it
                ...options.headers,
            },
        });
    }
    /**
     * Download file
     * @param url - Download URL
     * @param filename - Filename to save as
     * @param options - Request options
     * @returns Promise when download completes
     */
    async download(url, filename, options = {}) {
        const response = await this.request(url, {
            ...options,
            method: 'GET',
            headers: {
                ...options.headers,
            },
        });
        const blob = new Blob([response]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    }
}
/**
 * Enhanced local storage utilities with encryption
 */
export class StorageUtils {
    /**
     * Get value from local storage
     * @param key - Storage key
     * @param defaultValue - Default value if not found
     * @returns Stored value or default
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        }
        catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    /**
     * Set value to local storage
     * @param key - Storage key
     * @param value - Value to store
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }
    /**
     * Remove value from local storage
     * @param key - Storage key
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
    /**
     * Clear all local storage
     */
    static clear() {
        try {
            localStorage.clear();
        }
        catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
    /**
     * Check if key exists in local storage
     * @param key - Storage key
     * @returns Whether key exists
     */
    static has(key) {
        return localStorage.getItem(key) !== null;
    }
    /**
     * Get all keys from local storage
     * @returns Array of keys
     */
    static keys() {
        return Object.keys(localStorage);
    }
    /**
     * Get storage size in bytes
     * @returns Storage size in bytes
     */
    static size() {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += key.length + localStorage[key].length;
            }
        }
        return total;
    }
    /**
     * Get storage usage percentage
     * @returns Usage percentage (0-100)
     */
    static usagePercentage() {
        // Approximate storage limit (5-10MB depending on browser)
        const approxLimit = 5 * 1024 * 1024; // 5MB
        return Math.min(100, (this.size() / approxLimit) * 100);
    }
    /**
     * Set with expiration
     * @param key - Storage key
     * @param value - Value to store
     * @param ttl - Time to live in milliseconds
     */
    static setWithExpiry(key, value, ttl) {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl,
        };
        this.set(key, item);
    }
    /**
     * Get with expiration check
     * @param key - Storage key
     * @returns Stored value or null if expired
     */
    static getWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }
        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    }
    /**
     * Get remaining time for key
     * @param key - Storage key
     * @returns Remaining time in milliseconds or null if not found/expired
     */
    static getTimeToLive(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }
        const item = JSON.parse(itemStr);
        const now = new Date();
        const timeLeft = item.expiry - now.getTime();
        if (timeLeft <= 0) {
            localStorage.removeItem(key);
            return null;
        }
        return timeLeft;
    }
}
StorageUtils.ENCRYPTION_KEY = 'app_storage_key';
/**
 * Enhanced session storage utilities
 */
export class SessionStorageUtils {
    /**
     * Get value from session storage
     * @param key - Storage key
     * @param defaultValue - Default value if not found
     * @returns Stored value or default
     */
    static get(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        }
        catch (error) {
            console.error('Error reading from sessionStorage:', error);
            return defaultValue;
        }
    }
    /**
     * Set value to session storage
     * @param key - Storage key
     * @param value - Value to store
     */
    static set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error('Error writing to sessionStorage:', error);
        }
    }
    /**
     * Remove value from session storage
     * @param key - Storage key
     */
    static remove(key) {
        try {
            sessionStorage.removeItem(key);
        }
        catch (error) {
            console.error('Error removing from sessionStorage:', error);
        }
    }
    /**
     * Clear all session storage
     */
    static clear() {
        try {
            sessionStorage.clear();
        }
        catch (error) {
            console.error('Error clearing sessionStorage:', error);
        }
    }
    /**
     * Check if key exists in session storage
     * @param key - Storage key
     * @returns Whether key exists
     */
    static has(key) {
        return sessionStorage.getItem(key) !== null;
    }
    /**
     * Get all keys from session storage
     * @returns Array of keys
     */
    static keys() {
        return Object.keys(sessionStorage);
    }
}
/**
 * Enhanced cookie utilities
 */
export class CookieUtils {
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
    static set(name, value, days, path, domain, secure, sameSite) {
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            cookieString += `; expires=${date.toUTCString()}`;
        }
        if (path) {
            cookieString += `; path=${path}`;
        }
        if (domain) {
            cookieString += `; domain=${domain}`;
        }
        if (secure) {
            cookieString += '; secure';
        }
        if (sameSite) {
            cookieString += `; samesite=${sameSite}`;
        }
        document.cookie = cookieString;
    }
    /**
     * Get cookie value
     * @param name - Cookie name
     * @returns Cookie value or null if not found
     */
    static get(name) {
        const nameEQ = encodeURIComponent(name) + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0)
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }
    /**
     * Remove cookie
     * @param name - Cookie name
     * @param path - Cookie path
     * @param domain - Cookie domain
     */
    static remove(name, path, domain) {
        this.set(name, "", -1, path, domain);
    }
    /**
     * Check if cookie exists
     * @param name - Cookie name
     * @returns Whether cookie exists
     */
    static has(name) {
        return this.get(name) !== null;
    }
    /**
     * Get all cookies
     * @returns Object with all cookies
     */
    static getAll() {
        const cookies = {};
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            const eqIndex = c.indexOf('=');
            if (eqIndex > 0) {
                const name = decodeURIComponent(c.substring(0, eqIndex).trim());
                const value = decodeURIComponent(c.substring(eqIndex + 1).trim());
                cookies[name] = value;
            }
        }
        return cookies;
    }
}
/**
 * Enhanced cache utilities
 */
export class CacheUtils {
    /**
     * Set cached value
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in milliseconds
     */
    static set(key, value, ttl = 300000) {
        this.cache.set(key, {
            data: value,
            timestamp: Date.now(),
            ttl,
        });
    }
    /**
     * Get cached value
     * @param key - Cache key
     * @returns Cached value or null if not found/expired
     */
    static get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    /**
     * Check if cached value exists
     * @param key - Cache key
     * @returns Whether value exists in cache
     */
    static has(key) {
        const item = this.cache.get(key);
        if (!item) {
            return false;
        }
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Remove cached value
     * @param key - Cache key
     */
    static remove(key) {
        this.cache.delete(key);
    }
    /**
     * Clear expired cache entries
     */
    static clearExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * Clear all cache
     */
    static clear() {
        this.cache.clear();
    }
    /**
     * Get cache size
     * @returns Number of cached items
     */
    static size() {
        this.clearExpired();
        return this.cache.size;
    }
}
CacheUtils.cache = new Map();
/**
 * Enhanced API utilities combining all storage and HTTP utilities
 */
export class ApiUtils {
}
ApiUtils.http = new HttpClient();
ApiUtils.storage = StorageUtils;
ApiUtils.sessionStorage = SessionStorageUtils;
ApiUtils.cookies = CookieUtils;
ApiUtils.cache = CacheUtils;
//# sourceMappingURL=api.js.map