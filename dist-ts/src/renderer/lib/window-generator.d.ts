interface Theme {
    name: string;
    bg: string;
    color: string;
}
/**
 * Generates content based on the window title
 * @param {string} title - The window title
 * @returns {string} HTML content for the window
 */
export declare function generateWindowContent(title: string): string;
/**
 * Generates a random color theme based on the title
 * @param {string} title - The window title
 * @returns {Theme} Theme with background and text colors
 */
export declare function generateTheme(title: string): Theme;
export {};
//# sourceMappingURL=window-generator.d.ts.map