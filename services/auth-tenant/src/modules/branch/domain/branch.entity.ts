export class Branch {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly tenantId: string,
    public readonly address?: string | null,
    public readonly phone?: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly deletedAt?: Date | null,
  ) {}
}
