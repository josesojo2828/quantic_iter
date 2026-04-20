export class AuthUser {
  userId!: string;
  email!: string;
  tenantId!: string;
  role!: string;
  permissions!: string[];
}

export class RequestWithUser {
  user!: AuthUser;
  // We add other common request properties if needed,
  // but as a class to satisfy metadata reflection
  query: any;
  params: any;
  body: any;
  headers: any;
}
