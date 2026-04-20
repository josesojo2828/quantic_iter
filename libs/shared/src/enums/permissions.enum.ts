export enum PermissionAction {
  // Auth & Admin
  AUTH_LOGIN = 'auth:login',
  AUTH_REGISTER = 'auth:register',
  SAAS_ADMIN = 'saas:admin',

  // Workshop Core
  WORKSHOP_READ = 'workshop:read',
  WORKSHOP_UPDATE = 'workshop:update',

  // Inventory
  INVENTORY_CREATE = 'inventory:create',
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_DELETE = 'inventory:delete',
  INVENTORY_EXPORT = 'inventory:export',

  // Staff
  STAFF_CREATE = 'staff:create',
  STAFF_READ = 'staff:read',
  STAFF_UPDATE = 'staff:update',
  STAFF_DELETE = 'staff:delete',

  // Work Orders
  ORDERS_CREATE = 'orders:create',
  ORDERS_READ = 'orders:read',
  ORDERS_UPDATE = 'orders:update',
  ORDERS_DELETE = 'orders:delete',

  // Generic Wildcards
  ALL = '*',
  WORKSHOP_ALL = 'workshop:*',
  INVENTORY_ALL = 'inventory:*',
  STAFF_ALL = 'staff:*',
  ORDERS_ALL = 'orders:*',
}
