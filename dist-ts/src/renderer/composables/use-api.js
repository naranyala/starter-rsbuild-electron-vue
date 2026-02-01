// Vue composable for API operations
import { ref } from 'vue';
import { HttpClient } from '../lib/api.js';
export function useApi(baseUrl) {
    const client = new HttpClient(baseUrl);
    const loading = ref(false);
    const error = ref(null);
    const request = async (url, options = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const result = await client.request(url, options);
            return result;
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : String(err);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };
    const get = async (url, options = {}) => {
        return request(url, { ...options, method: 'GET' });
    };
    const post = async (url, data, options = {}) => {
        return request(url, { ...options, method: 'POST', body: data });
    };
    const put = async (url, data, options = {}) => {
        return request(url, { ...options, method: 'PUT', body: data });
    };
    const del = async (url, options = {}) => {
        return request(url, { ...options, method: 'DELETE' });
    };
    return {
        client,
        loading,
        error,
        request,
        get,
        post,
        put,
        delete: del,
    };
}
//# sourceMappingURL=use-api.js.map