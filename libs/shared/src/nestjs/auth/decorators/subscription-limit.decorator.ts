import { SetMetadata } from '@nestjs/common';
import { SubscriptionResource } from '../../../enums/subscription-resource.enum';

export const SUBSCRIPTION_LIMIT_KEY = 'subscription_limit';
export const SubscriptionLimit = (resource: SubscriptionResource) => 
  SetMetadata(SUBSCRIPTION_LIMIT_KEY, resource);
