export declare function validateUrl(url: string, options?: {
    allowLocalhost?: boolean;
    allowFileUrls?: boolean;
    allowedDomains?: string[];
    allowedProtocols?: string[];
}): boolean;
export declare function sanitizeInput(input: any, options?: {
    allowHtml?: boolean;
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
}): string;
export declare const APP_CONSTANTS: {
    readonly DEFAULT_WINDOW_WIDTH: 1200;
    readonly DEFAULT_WINDOW_HEIGHT: 800;
    readonly MIN_WINDOW_WIDTH: 800;
    readonly MIN_WINDOW_HEIGHT: 600;
    readonly DEVELOPMENT_PORT: 3000;
    readonly CSP_NONCE_LENGTH: 16;
};
export type AppConstants = typeof APP_CONSTANTS;
//# sourceMappingURL=helpers.d.ts.map