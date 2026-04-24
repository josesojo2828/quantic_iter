import { apiClient } from '@/core/api/api.client';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export const branchesService = {
  getBranches: async (): Promise<Branch[]> => {
    return apiClient.get<Branch[]>('/branches');
  },

  getBranchById: async (id: string): Promise<Branch> => {
    return apiClient.get<Branch>(`/branches/${id}`);
  },

  createBranch: async (data: {
    name: string;
    address?: string;
    phone?: string;
  }): Promise<Branch> => {
    return apiClient.post<Branch>('/branches', data);
  },

  updateBranch: async (id: string, data: Partial<{
    name: string;
    address?: string;
    phone?: string;
  }>): Promise<Branch> => {
    return apiClient.patch<Branch>(`/branches/${id}`, data);
  },

  deleteBranch: async (id: string): Promise<void> => {
    return apiClient.delete(`/branches/${id}`);
  },
};
