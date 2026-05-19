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
  branchId?: string | null;
  createdAt: string;
}



export const workersService = {
  getWorkers: async (filters: { 
    search?: string, 
    page?: number, 
    limit?: number, 
    role?: string, 
    excludeRole?: string,
    excludeUserId?: string 
  } = {}): Promise<{ items: Worker[], total: number }> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.excludeRole) params.append('excludeRole', filters.excludeRole);
    if (filters.excludeUserId) params.append('excludeUserId', filters.excludeUserId);
    if (filters.page) params.append('page', (filters.page - 1).toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return apiClient.get<{ items: Worker[], total: number }>(`/staff?${params.toString()}`);
  },

  getWorkerById: async (id: string): Promise<Worker> => {
    return apiClient.get<Worker>(`/staff/${id}`);
  },

  inviteWorker: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    roleSlug: 'facilitator' | 'support';
    branchId?: string;
    password?: string;
  }): Promise<Worker> => {
    const payload = {
      ...data,
      password: data.password || 'Mentor2026*',
    };
    return apiClient.post<Worker>('/staff', payload);
  },

  updateWorker: async (id: string, data: Partial<any>): Promise<Worker> => {
    return apiClient.put<Worker>(`/staff/${id}`, data); // StaffController uses Put for group update
  },

  deleteWorker: async (id: string): Promise<void> => {
    return apiClient.delete(`/staff/${id}`);
  },
};

