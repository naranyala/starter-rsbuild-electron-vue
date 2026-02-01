/**
 * Enhanced Security Utilities for Electron Main Process
 * These utilities help implement and maintain security best practices
 */
/**
 * Configure Content Security Policy
 * @param policy - CSP policy string
 * @param options - CSP options
 * @returns Enhanced CSP policy
 */
export declare function setContentSecurityPolicy(policy: string, options?: {
    allowFileAccess?: boolean;
    allowEval?: boolean;
    allowInlineScripts?: boolean;
    allowInlineStyles?: boolean;
}): string;
/**
 * Default CSP for development
 */
export declare function getDevelopmentCSP(): string;
/**
 * Default CSP for production
 */
export declare function getProductionCSP(): string;
/**
 * Configure security session settings
 * @param options - Security configuration options
 */
export declare function configureSecuritySession(options?: {
    enableMixedContentMode?: boolean;
    enableWebSecurity?: boolean;
    allowRunningInsecureContent?: boolean;
    enableNodeIntegration?: boolean;
    enableContextIsolation?: boolean;
    enableExperimentalFeatures?: boolean;
}): void;
/**
 * Validate URL security
 * @param url - URL to validate
 * @param options - Validation options
 * @returns True if URL is secure
 */
export declare function validateUrl(url: string, options?: {
    allowLocalhost?: boolean;
    allowFileUrls?: boolean;
    allowedDomains?: string[];
    allowedProtocols?: string[];
}): boolean;
/**
 * Sanitize user input
 * @param input - User input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized input
 */
export declare function sanitizeInput(input: any, options?: {
    allowHtml?: boolean;
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
}): string;
/**
 * Generate random nonce for CSP
 * @returns Random nonce
 */
export declare function generateNonce(): string;
/**
 * Create secure window configuration
 * @param options - Window options
 * @returns Secure window configuration
 */
export declare function createSecureWindowConfig(options?: Electron.BrowserWindowConstructorOptions): Electron.BrowserWindowConstructorOptions;
/**
 * Validate file path security
 * @param filePath - File path to validate
 * @param options - Validation options
 * @returns True if path is secure
 */
export declare function validateFilePath(filePath: string, options?: {
    allowedDirectories?: string[];
    blockedDirectories?: string[];
}): boolean;
/**
 * Hash data using SHA-256
 * @param data - Data to hash
 * @returns SHA-256 hash of the data
 */
export declare function hashData(data: string): string;
/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt
 * @param password - Password for encryption
 * @returns Encrypted data with IV and auth tag
 */
export declare function encryptData(data: string, password: string): {
    encrypted: string;
    iv: string;
    authTag: string;
};
/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Encrypted data object
 * @param password - Password for decryption
 * @returns Decrypted data or null if error
 */
export declare function decryptData(encryptedData: {
    encrypted: string;
    iv: string;
    authTag: string;
}, password: string): string | null;
/**
 * Validate JWT token (basic implementation)
 * @param token - JWT token to validate
 * @param secret - Secret for validation
 * @returns Decoded payload or null if invalid
 */
export declare function validateJWT(token: string, secret: string): any | null;
/**
 * Security audit utilities
 */
export declare class SecurityAudit {
    private static violations;
    /**
     * Log a security violation
     * @param message - Violation message
     */
    static logViolation(message: string): void;
    /**
     * Get all security violations
     * @returns Array of security violations
     */
    static getViolations(): string[];
    /**
     * Clear security violations
     */
    static clearViolations(): void;
    /**
     * Perform security audit on a file
     * @param filePath - Path to the file to audit
     * @returns Audit results
     */
    static auditFile(filePath: string): {
        exists: boolean;
        isSafe: boolean;
        violations: string[];
    };
}
//# sourceMappingURL=security-utils.d.ts.map