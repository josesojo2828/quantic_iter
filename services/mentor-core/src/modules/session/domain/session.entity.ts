export class Session {
  id!: string;
  tenantId!: string;
  coachId!: string;
  groupId?: string;
  menteeId?: string;
  type!: string; // ONE_ON_ONE, GROUP
  title!: string;
  description?: string;
  scheduledAt!: Date;
  duration!: number;
  meetingUrl?: string;
  status!: string; // SCHEDULED, COMPLETED, CANCELLED
  notes?: string;
  isNotesPrivate!: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class SessionAttendance {
  id!: string;
  sessionId!: string;
  menteeId!: string;
  status!: string; // PRESENT, ABSENT, JUSTIFIED
  createdAt!: Date;
}
