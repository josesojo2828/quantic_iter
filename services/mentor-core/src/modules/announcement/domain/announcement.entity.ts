export class Announcement {
  id!: string;
  tenantId!: string;
  coachId!: string;
  title!: string;
  content!: string;
  type!: string;
  programId?: string;
  groupId?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
