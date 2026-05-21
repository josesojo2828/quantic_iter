const isServer = typeof window === 'undefined';
const API_URL = isServer ? 'http://auth-tenant:3000' : '/api';

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${path}`;

    console.log(`[apiClient] 🌐 Admin ${options.method || 'GET'} ${url}`);

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

    if (response.status >= 500) {
      throw new Error(`Error del servidor (${response.status}).`);
    }

    if (response.status === 401) {
      const isLoginRequest = path.includes('/login');
      const isMeRequest = path.includes('/auth/me');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login');

      if (typeof window !== 'undefined' && !isLoginRequest && !isMeRequest && !isLoginPage) {
        window.location.href = '/login?expired=true';
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Sesión expirada');
    }

    const text = await response.text();
    if (!text) return {} as T;

    try {
      const result = JSON.parse(text);
      return result as T;
    } catch {
      throw new Error('Respuesta inesperada del servidor.');
    }
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
