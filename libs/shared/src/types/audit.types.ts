export interface AuditPayload {
  userId: string;
  tenantId: string;
  action: string;
  module: string;
  payload: any;
  previousState?: any;
  timestamp: Date;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE_FULL = 'UPDATE_FULL',
  UPDATE_PARTIAL = 'UPDATE_PARTIAL',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
}
