export class Resource {
  id: string;
  tenantId: string;
  coachId: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  content?: string;
  category: string;
  isPublic: boolean;
  programId?: string;
  phaseId?: string;
  createdAt: Date;
  updatedAt: Date;
}
