import { apiClient } from '../core/api/api.client';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  active: boolean;
  logo?: string;
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  users?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    role: {
      name: string;
      slug: string;
    };
  }>;
  branches?: Array<{
    id: string;
    name: string;
    address?: string;
    createdAt: string;
  }>;
  subscription?: {
    expiresAt: string;
    plan: {
      name: string;
    };
    usage: {
      users: { current: number; limit: number };
      branches: { current: number; limit: number };
    };
  };
}

export const adminService = {
  getTenants: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    const response = await apiClient.get<any>(`/admin/tenants?${query.toString()}`);
    return response.data;
  },

  getUsers: async (params: { search?: string; page?: number; limit?: number; roleId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.roleId) query.append('roleId', params.roleId);
    
    const response = await apiClient.get<any>(`/admin/users?${query.toString()}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get<any>('/admin/stats');
    return response.data;
  },

  getTenant: async (id: string) => {
    const response = await apiClient.get<any>(`/admin/tenants/${id}`);
    return response.data;
  },

  getSubscriptions: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    const response = await apiClient.get<any>(`/admin/subscriptions?${query.toString()}`);
    return response.data;
  },

  getSubscriptionStats: async () => {
    const response = await apiClient.get<any>('/admin/subscriptions/stats');
    return response.data;
  },

  impersonate: async (tenantId: string) => {
    const response = await apiClient.post<any>(`/admin/impersonate/${tenantId}`, {});
    return response.data;
  },

  createBranch: async (tenantId: string, data: { name: string; address?: string }) => {
    const response = await apiClient.post<any>(`/admin/tenants/${tenantId}/branches`, data);
    return response.data;
  },

  updateBranch: async (tenantId: string, branchId: string, data: { name?: string; address?: string }) => {
    const response = await apiClient.patch<any>(`/admin/tenants/${tenantId}/branches/${branchId}`, data);
    return response.data;
  },

  deleteBranch: async (tenantId: string, branchId: string) => {
    const response = await apiClient.delete<any>(`/admin/tenants/${tenantId}/branches/${branchId}`);
    return response.data;
  },

  getPlans: async () => {
    const response = await apiClient.get<any>('/admin/plans');
    return response.data;
  },

  createPlan: async (data: any) => {
    const response = await apiClient.post<any>('/admin/plans', data);
    return response.data;
  },

  updatePlan: async (id: string, data: any) => {
    const response = await apiClient.put<any>(`/admin/plans/${id}`, data);
    return response.data;
  },

  getTenantSubscriptionHistory: async (tenantId: string) => {
    const response = await apiClient.get<any>(`/admin/tenants/${tenantId}/subscription-history`);
    return response.data;
  },
};
