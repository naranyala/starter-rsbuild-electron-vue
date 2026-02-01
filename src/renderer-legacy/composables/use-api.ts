// Vue composable for API operations
import { ref } from 'vue';
import { HttpClient } from '../lib/api';

export function useApi(baseUrl?: string) {
  const client = new HttpClient(baseUrl);

  const loading = ref(false);
  const error = ref<string | null>(null);

  const request = async <T>(url: string, options: any = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await client.request(url, options);
      return result as T;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const get = async <T>(url: string, options: any = {}) => {
    return request<T>(url, { ...options, method: 'GET' });
  };

  const post = async <T>(url: string, data?: any, options: any = {}) => {
    return request<T>(url, { ...options, method: 'POST', body: data });
  };

  const put = async <T>(url: string, data?: any, options: any = {}) => {
    return request<T>(url, { ...options, method: 'PUT', body: data });
  };

  const del = async <T>(url: string, options: any = {}) => {
    return request<T>(url, { ...options, method: 'DELETE' });
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
