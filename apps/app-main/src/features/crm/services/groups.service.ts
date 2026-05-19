import { apiClient } from '@/core/api/api.client';

export interface Group {
  id: string;
  name: string;
  description?: string;
  menteesCount: number;
  coachId?: string;
}

export const groupsService = {
  getGroups: async (): Promise<Group[]> => {
    return apiClient.get<Group[]>('/groups');
  }
};
