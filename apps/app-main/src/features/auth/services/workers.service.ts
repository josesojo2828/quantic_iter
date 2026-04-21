import { apiClient } from '@/core/api/api.client';

export interface Worker {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    slug: string;
    permissions: { action: string }[];
  } | string;
  createdAt: string;
}



export const workersService = {
  getWorkers: async (filters: { search?: string, page?: number, limit?: number } = {}): Promise<{ workers: Worker[], total: number }> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return apiClient.get<{ workers: Worker[], total: number }>(`/auth/worker?${params.toString()}`);
  },

  getWorkerById: async (id: string): Promise<Worker> => {
    return apiClient.get<Worker>(`/auth/worker/${id}`);
  },


  inviteWorker: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    roleSlug: 'mechanic' | 'receptionist';
    password?: string;
  }): Promise<Worker> => {
    const payload = {
      ...data,
      password: data.password || 'Workshop2026*',
    };
    return apiClient.post<Worker>('/auth/worker', payload);
  },

  updateWorker: async (id: string, data: Partial<any>): Promise<Worker> => {
    return apiClient.patch<Worker>(`/auth/worker/${id}`, data);
  },

  deleteWorker: async (id: string): Promise<void> => {
    return apiClient.delete(`/auth/worker/${id}`);
  },
};

