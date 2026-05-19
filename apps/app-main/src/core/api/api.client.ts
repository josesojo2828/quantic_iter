const API_URL = '/api';

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${path}`;
    console.log(`[apiClient] 🌐 ${options.method || 'GET'} ${url}`);
    
    // Always include credentials for HttpOnly cookies
    const defaultOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    let response: Response;
    try {
      response = await fetch(url, defaultOptions);
    } catch (networkErr) {
      console.error('[apiClient] 🔴 Network error:', networkErr);
      throw new Error('No se pudo conectar con el servidor. Verificá tu conexión.');
    }

    console.log(`[apiClient] 📨 Response: ${response.status} ${response.statusText}`);

    // Server is down (Nginx 502/503/504)
    if (response.status >= 500) {
      throw new Error(`Error del servidor (${response.status}). Intentá de nuevo en unos segundos.`);
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') && 
          !path.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
      // If it's a login attempt, we don't redirect, just let the error bubble up
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Credenciales inválidas o sesión expirada');
    }

    // Try to parse JSON safely
    const text = await response.text();
    if (!text) {
      console.log('[apiClient] 📦 Empty response received');
      return {} as T;
    }

    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      console.error('[apiClient] 🔴 Response is not JSON:', text.substring(0, 200));
      throw new Error('Respuesta inesperada del servidor.');
    }


    console.log('[apiClient] 📦 Parsed response:', result);

    // If the backend doesn't use the {success, data} wrapper, we return the result directly
    if (result.success === undefined) {
      return result as T;
    }

    if (!result.success) {
      throw new Error(result.message || 'Error en la petición');
    }

    return result.data as T;
  },

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<T>(path: string, body: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch<T>(path: string, body: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  },
};
