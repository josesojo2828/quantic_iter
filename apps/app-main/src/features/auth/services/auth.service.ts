import { apiClient } from '../../../core/api/api.client';

export const authService = {
  register: async (data: any) => {
    return apiClient.post('/auth/register', data);
  },

  login: async (data: any) => {
    return apiClient.post('/auth/login', data);
  },

  logout: async () => {
    // In many cases, logout just clears the cookie on the server
    // or we just redirect to login
    return apiClient.post('/auth/logout', {});
  }
};
