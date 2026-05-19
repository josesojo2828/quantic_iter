export class BusinessTier {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BusinessSubscription {
  id: string;
  tenantId: string;
  menteeId: string;
  tierId: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
