export class Measurement {
  id!: string;
  tenantId!: string;
  menteeId!: string;
  coachId!: string;
  type!: string;
  value!: number;
  unit!: string;
  notes?: string;
  date!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
