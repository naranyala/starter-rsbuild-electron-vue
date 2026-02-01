// Shared validation utilities
export function validateUrl(url, options = {}) {
    const { allowLocalhost = true, allowFileUrls = false, allowedDomains = [], allowedProtocols = ['https:', 'http:', 'wss:', 'ws:'], } = options;
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
        if (!allowLocalhost &&
            (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')) {
            return false;
        }
        // Check allowed domains
        if (allowedDomains.length > 0 &&
            !allowedDomains.includes(parsedUrl.hostname)) {
            return false;
        }
        return true;
    }
    catch (error) {
        return false;
    }
}
// Shared helper utilities
export function sanitizeInput(input, options = {}) {
    const { allowHtml = false, allowedTags = [], allowedAttributes = {}, } = options;
    if (typeof input !== 'string') {
        return '';
    }
    let sanitized = input;
    if (!allowHtml) {
        // Remove all HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        // Remove potentially dangerous characters
        sanitized = sanitized.replace(/[<>"'&]/g, '');
    }
    else {
        // Basic HTML sanitization
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
        sanitized = sanitized.replace(/<embed\b[^<]*>/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/vbscript:/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    }
    return sanitized.trim();
}
// Shared constants
export const APP_CONSTANTS = {
    DEFAULT_WINDOW_WIDTH: 1200,
    DEFAULT_WINDOW_HEIGHT: 800,
    MIN_WINDOW_WIDTH: 800,
    MIN_WINDOW_HEIGHT: 600,
    DEVELOPMENT_PORT: 3000,
    CSP_NONCE_LENGTH: 16,
};
//# sourceMappingURL=helpers.js.map