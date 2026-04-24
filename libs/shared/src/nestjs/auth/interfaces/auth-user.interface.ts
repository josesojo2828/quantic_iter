export interface AuthUser {
  userId: string;
  email: string;
  tenantId: string;
  role: string | null;
  permissions: string[];
  branchId?: string | null;
}
