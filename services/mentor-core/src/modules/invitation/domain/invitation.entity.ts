export class Invitation {
  id!: string;
  tenantId!: string;
  coachId!: string;
  token!: string;
  type!: string; // PROGRAM, GROUP, TENANT
  programId?: string;
  groupId?: string;
  maxUses?: number;
  uses!: number;
  isActive!: boolean;
  expiresAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
