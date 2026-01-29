/**
 * HTTP Request Utilities for Frontend Renderer Process
 * These utilities provide enhanced fetch functionality and API helpers
 */

/**
 * HTTP request configuration options
 */
interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  abortController?: AbortController;
  onProgress?: (progress: number) => void;
  skipCache?: boolean;
}

/**
 * API response wrapper
 */
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  url: string;
}

/**
 * Enhanced fetch with timeout, retries, and progress
 * @param {string} url - Request URL
 * @param {RequestOptions} options - Request options
 * @returns {Promise<Response>} - Fetch response
 */
async function enhancedFetch(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    abortController = new AbortController(),
    onProgress,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Set timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);

      // Create fetch options
      const fetchOpts: RequestInit = {
        ...fetchOptions,
        signal: abortController.signal,
      };

      // Make request
      const response = await fetch(url, fetchOpts);
      clearTimeout(timeoutId);

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      lastError = error;

      // Don't retry on abort or 4xx errors
      if (
        error.name === 'AbortError' ||
        (error.message && error.message.includes('HTTP 4'))
      ) {
        break;
      }

      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * Fetch JSON data with automatic parsing
 * @param {string} url - Request URL
 * @param {RequestOptions} options - Request options
 * @returns {Promise<ApiResponse>} - Parsed JSON response
 */
async function fetchJson<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const response = await enhancedFetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    ok: response.ok,
    url: response.url,
  };
}

/**
 * Upload file with progress tracking
 * @param {string} url - Upload URL
 * @param {FormData|File} data - Data to upload
 * @param {RequestOptions} options - Request options
 * @returns {Promise<ApiResponse>} - Upload response
 */
async function uploadFile(
  url: string,
  data: FormData | File,
  options: RequestOptions = {}
): Promise<ApiResponse> {
  const formData =
    data instanceof FormData
      ? data
      : (() => {
          const fd = new FormData();
          fd.append('file', data);
          return fd;
        })();

  // Add progress tracking if available
  if (options.onProgress && typeof XMLHttpRequest !== 'undefined') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(options.method || 'POST', url, true);

      // Set headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string);
        });
      }

      // Progress tracking
      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          options.onProgress!(progress);
        }
      });

      // Load complete
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            resolve({
              data,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: {} as Headers, // XHR doesn't expose headers easily
              ok: xhr.status >= 200 && xhr.status < 300,
              url: xhr.responseURL,
            });
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Error handling
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Request timeout'));
      });

      xhr.timeout = options.timeout || 30000;
      xhr.send(formData);
    });
  }

  // Fallback to regular fetch
  return fetchJson(url, {
    ...options,
    method: 'POST',
    body: formData,
  });
}

/**
 * Create API client with base configuration
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultOptions: RequestOptions;

  constructor(baseURL: string, defaultOptions: RequestOptions = {}) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...((defaultOptions.headers as Record<string, string>) || {}),
    };
    this.defaultOptions = defaultOptions;
  }

  /**
   * Set default headers
   * @param {Record<string, string>} headers - Headers to set
   */
  setHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Set authorization header
   * @param {string} token - Authorization token
   * @param {string} type - Token type (default: 'Bearer')
   */
  setAuth(token: string, type: string = 'Bearer'): void {
    this.defaultHeaders.Authorization = `${type} ${token}`;
  }

  /**
   * Clear authorization header
   */
  clearAuth(): void {
    delete this.defaultHeaders.Authorization;
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {RequestOptions} options - Request options
   * @returns {Promise<ApiResponse>} - API response
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {RequestOptions} options - Request options
   * @returns {Promise<ApiResponse>} - API response
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {RequestOptions} options - Request options
   * @returns {Promise<ApiResponse>} - API response
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Make PATCH request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {RequestOptions} options - Request options
   * @returns {Promise<ApiResponse>} - API response
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {RequestOptions} options - Request options
   * @returns {Promise<ApiResponse>} - API response
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Make HTTP request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {RequestOptions} options - Request options
   * @returns {Promise<ApiResponse>} - API response
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/${endpoint.replace(/^\//, '')}`;

    const requestOptions: RequestOptions = {
      ...this.defaultOptions,
      ...options,
      method,
      headers: {
        ...this.defaultHeaders,
        ...((options.headers as Record<string, string>) || {}),
      },
    };

    // Add body for methods that support it
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      if (data instanceof FormData) {
        // Don't set Content-Type for FormData (browser sets it automatically)
        if (requestOptions.headers) {
          delete (requestOptions.headers as Record<string, string>)['Content-Type'];
        }
        requestOptions.body = data;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    return fetchJson<T>(url, requestOptions);
  }
}

/**
 * Cache API responses in memory
 */
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached response
   * @param {string} key - Cache key
   * @returns {any} - Cached data or null
   */
  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set cached response
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Delete cached response
   * @param {string} key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean expired entries
   */
  clean(): void {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create a global cache instance
const apiCache = new ApiCache();

/**
 * Make cached request
 * @param {string} url - Request URL
 * @param {RequestOptions} options - Request options
 * @param {number} cacheTTL - Cache TTL in milliseconds
 * @returns {Promise<ApiResponse>} - API response
 */
async function cachedFetch<T = any>(
  url: string,
  options: RequestOptions = {},
  cacheTTL?: number
): Promise<ApiResponse<T>> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;

  // Try to get from cache first
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  // Make request and cache result
  const response = await fetchJson<T>(url, options);

  if (response.ok && !options.skipCache) {
    apiCache.set(cacheKey, response, cacheTTL);
  }

  return response;
}

export {
  enhancedFetch,
  fetchJson,
  uploadFile,
  ApiClient,
  ApiCache,
  apiCache,
  cachedFetch,
};
export type { RequestOptions, ApiResponse };
