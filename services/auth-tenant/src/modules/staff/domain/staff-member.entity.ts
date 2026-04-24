export class StaffMember {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly roleSlug: string,
    public readonly tenantId: string,
    public readonly createdAt: Date,
    public readonly deletedAt: Date | null,
    public readonly role?: { id: string; name: string; slug: string },
    public readonly branchId?: string | null,
    public readonly avatarUrl?: string | null,
  ) {}
}
