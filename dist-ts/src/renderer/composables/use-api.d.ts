import { HttpClient } from '../lib/api';
export declare function useApi(baseUrl?: string): {
    client: HttpClient;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    request: <T>(url: string, options?: any) => Promise<T>;
    get: <T>(url: string, options?: any) => Promise<T>;
    post: <T>(url: string, data?: any, options?: any) => Promise<T>;
    put: <T>(url: string, data?: any, options?: any) => Promise<T>;
    delete: <T>(url: string, options?: any) => Promise<T>;
};
//# sourceMappingURL=use-api.d.ts.map