export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly roles: Array<{
      tenantId: string;
      tenantName: string;
      tenantSlug: string;
      roleSlug: string;
      branchId: string | null;
      permissions: string[];
    }>,
    public readonly lastTenantId: string | null = null,
    public readonly avatarUrl: string | null = null,
  ) {}
}
