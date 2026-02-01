/**
 * Enhanced Security Utilities for Electron Main Process
 * These utilities help implement and maintain security best practices
 */
import { session } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Configure Content Security Policy
 * @param policy - CSP policy string
 * @param options - CSP options
 * @returns Enhanced CSP policy
 */
export function setContentSecurityPolicy(policy, options = {}) {
    const { allowFileAccess = false, allowEval = false, allowInlineScripts = false, allowInlineStyles = false, } = options;
    let cspPolicy = policy;
    if (!allowFileAccess) {
        cspPolicy += " file:";
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
export function getDevelopmentCSP() {
    return setContentSecurityPolicy("default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "connect-src 'self' ws: wss:; " +
        "font-src 'self' data:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self';", {
        allowFileAccess: true,
        allowEval: true,
        allowInlineScripts: true,
        allowInlineStyles: true,
    });
}
/**
 * Default CSP for production
 */
export function getProductionCSP() {
    const nonce = crypto.randomBytes(16).toString('base64');
    return setContentSecurityPolicy(`default-src 'self'; ` +
        `script-src 'self' 'nonce-${nonce}'; ` +
        `style-src 'self' 'nonce-${nonce}'; ` +
        `img-src 'self' data: https:; ` +
        `connect-src 'self' https: wss:; ` +
        `font-src 'self' data:; ` +
        `object-src 'none'; ` +
        `base-uri 'self'; ` +
        `form-action 'self'; ` +
        `frame-ancestors 'none'; ` +
        'upgrade-insecure-requests;', {
        allowFileAccess: false,
        allowEval: false,
        allowInlineScripts: false,
        allowInlineStyles: false,
    });
}
/**
 * Configure security session settings
 * @param options - Security configuration options
 */
export function configureSecuritySession(options = {}) {
    const defaultSession = session.defaultSession;
    const { enableMixedContentMode = false, enableWebSecurity = true, allowRunningInsecureContent = false, enableNodeIntegration = false, enableContextIsolation = true, enableExperimentalFeatures = false, isDevelopment = false, } = options;
    // Disable mixed content mode
    if (!enableMixedContentMode) {
        defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [isDevelopment ? getDevelopmentCSP() : getProductionCSP()],
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
        try {
            const url = new URL(details.url);
            // Block dangerous protocols
            const blockedProtocols = ['data:', 'javascript:', 'vbscript:'];
            if (blockedProtocols.some(protocol => url.protocol === protocol)) {
                callback({ cancel: true });
                return;
            }
            // Block file:// access in production
            if (!enableMixedContentMode && url.protocol === 'file:') {
                callback({ cancel: true });
                return;
            }
            callback({});
        }
        catch (error) {
            callback({ cancel: true });
        }
    });
    // Set certificate verification
    defaultSession.setCertificateVerifyProc((request, callback) => {
        const { hostname } = request;
        // Allow localhost in development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            callback(0); // OK
        }
        else {
            callback(-2); // Use system verification
        }
    });
    // Disable dangerous features
    defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
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
        }
        else {
            callback(true);
        }
    });
}
/**
 * Validate URL security
 * @param url - URL to validate
 * @param options - Validation options
 * @returns True if URL is secure
 */
export function validateUrl(url, options = {}) {
    const { allowLocalhost = true, allowFileUrls = false, allowedDomains = [], allowedProtocols = ['https:', 'http:'], } = options;
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
/**
 * Sanitize user input
 * @param input - User input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized input
 */
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
/**
 * Generate random nonce for CSP
 * @returns Random nonce
 */
export function generateNonce() {
    return crypto.randomBytes(16).toString('base64');
}
/**
 * Create secure window configuration
 * @param options - Window options
 * @returns Secure window configuration
 */
export function createSecureWindowConfig(options = {}) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const secureConfig = {
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            preload: path.join(__dirname, '../dist-ts/preload.js'),
            additionalArguments: ['--disable-web-security'].filter(() => isDevelopment),
            ...options.webPreferences,
        },
        ...options,
    };
    if (isDevelopment) {
        // Less restrictive for development
        if (secureConfig.webPreferences) {
            secureConfig.webPreferences.nodeIntegration = true;
            secureConfig.webPreferences.contextIsolation = false;
            secureConfig.webPreferences.webSecurity = false;
        }
    }
    return secureConfig;
}
/**
 * Validate file path security
 * @param filePath - File path to validate
 * @param options - Validation options
 * @returns True if path is secure
 */
export function validateFilePath(filePath, options = {}) {
    const { allowedDirectories = [], blockedDirectories = [] } = options;
    if (typeof filePath !== 'string') {
        return false;
    }
    // Normalize path
    const normalizedPath = path.normalize(filePath);
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
        return allowedDirectories.some(allowedDir => normalizedPath.startsWith(allowedDir));
    }
    return true;
}
/**
 * Hash data using SHA-256
 * @param data - Data to hash
 * @returns SHA-256 hash of the data
 */
export function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt
 * @param password - Password for encryption
 * @returns Encrypted data with IV and auth tag
 */
export function encryptData(data, password) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag,
    };
}
/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Encrypted data object
 * @param password - Password for decryption
 * @returns Decrypted data or null if error
 */
export function decryptData(encryptedData, password) {
    try {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(password, 'salt', 32);
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Error decrypting data:', error instanceof Error ? error.message : String(error));
        return null;
    }
}
/**
 * Validate JWT token (basic implementation)
 * @param token - JWT token to validate
 * @param secret - Secret for validation
 * @returns Decoded payload or null if invalid
 */
export function validateJWT(token, secret) {
    try {
        const [header, payload, signature] = token.split('.');
        if (!header || !payload || !signature) {
            return null;
        }
        const headerDecoded = JSON.parse(Buffer.from(header, 'base64').toString());
        const payloadDecoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        // Verify signature (simplified)
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${header}.${payload}`)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        if (expectedSignature !== signature) {
            return null;
        }
        // Check expiration
        if (payloadDecoded.exp && Date.now() >= payloadDecoded.exp * 1000) {
            return null;
        }
        return payloadDecoded;
    }
    catch (error) {
        console.error('Error validating JWT:', error instanceof Error ? error.message : String(error));
        return null;
    }
}
/**
 * Security audit utilities
 */
export class SecurityAudit {
    /**
     * Log a security violation
     * @param message - Violation message
     */
    static logViolation(message) {
        this.violations.push(`${new Date().toISOString()}: ${message}`);
        console.error(`SECURITY VIOLATION: ${message}`);
    }
    /**
     * Get all security violations
     * @returns Array of security violations
     */
    static getViolations() {
        return [...this.violations];
    }
    /**
     * Clear security violations
     */
    static clearViolations() {
        this.violations = [];
    }
    /**
     * Perform security audit on a file
     * @param filePath - Path to the file to audit
     * @returns Audit results
     */
    static auditFile(filePath) {
        const violations = [];
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return { exists: false, isSafe: false, violations: ['File does not exist'] };
        }
        // Check file path security
        if (!validateFilePath(filePath)) {
            violations.push('Unsafe file path detected');
        }
        // Check file size (prevent large file attacks)
        try {
            const stats = fs.statSync(filePath);
            if (stats.size > 10 * 1024 * 1024) { // 10MB limit
                violations.push('File size exceeds security limit');
            }
        }
        catch (error) {
            violations.push(`Error checking file stats: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Check file extension (prevent execution of malicious files)
        const ext = path.extname(filePath).toLowerCase();
        const dangerousExtensions = ['.exe', '.bat', '.com', '.scr', '.vbs', '.js', '.jar'];
        if (dangerousExtensions.includes(ext)) {
            violations.push(`Potentially dangerous file extension: ${ext}`);
        }
        return {
            exists: true,
            isSafe: violations.length === 0,
            violations,
        };
    }
}
SecurityAudit.violations = [];
//# sourceMappingURL=security-utils.js.map