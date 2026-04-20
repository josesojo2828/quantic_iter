import { apiClient } from '@/core/api/api.client';

export interface Worker {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const workersService = {
  getWorkers: async (): Promise<Worker[]> => {
    return apiClient.get<Worker[]>('/auth/worker');
  },

  inviteWorker: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    roleSlug: 'mechanic' | 'receptionist';
    password?: string;
  }): Promise<Worker> => {
    // We can generate a temporary password if not provided
    const payload = {
      ...data,
      password: data.password || 'Workshop2026*',
    };
    return apiClient.post<Worker>('/auth/worker', payload);
  },
};
