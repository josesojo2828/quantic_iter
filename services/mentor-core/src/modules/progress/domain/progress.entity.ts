export class Milestone {
  id!: string;
  tenantId!: string;
  programId!: string;
  title!: string;
  description?: string;
  order!: number;
  xpReward!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class MilestoneCompletion {
  id!: string;
  milestoneId!: string;
  menteeId!: string;
  completedAt!: Date;
}

export class ActivityLog {
  id!: string;
  tenantId!: string;
  menteeId!: string;
  type!: 'TASK_COMPLETED' | 'HABIT_STREAK' | 'SESSION_ATTENDED' | 'MILESTONE_REACHED' | 'MEASUREMENT_RECORDED';
  title!: string;
  description?: string;
  metadata?: any;
  createdAt!: Date;
}
