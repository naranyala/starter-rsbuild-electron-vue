export declare function getRandomPort(min?: number, max?: number): number;
export declare function findAvailablePort(min?: number, max?: number): Promise<number>;
export declare function isPortAvailable(port: number): Promise<boolean>;
export declare function parsePortFromUrl(url: string): number | null;
export declare function createUrlWithPort(host: string, port: number): string;
//# sourceMappingURL=port-utils.d.ts.map