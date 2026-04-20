import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Permissions (Granular Action-Based)
  const permissionsData = [
    // Auth & Admin
    {
      action: 'auth:login',
      module: 'auth',
      description: 'Permitir login',
    },
    {
      action: 'auth:register',
      module: 'auth',
      description: 'Permitir registro de inquilinos',
    },
    {
      action: 'saas:admin',
      module: 'admin',
      description: 'Acceso total al SaaS (Súper Admin)',
    },

    // Workshop Core
    {
      action: 'workshop:read',
      module: 'workshop',
      description: 'Ver datos del taller',
    },
    {
      action: 'workshop:update',
      module: 'workshop',
      description: 'Editar datos del taller',
    },

    // Inventory
    {
      action: 'inventory:create',
      module: 'inventory',
      description: 'Crear items',
    },
    {
      action: 'inventory:read',
      module: 'inventory',
      description: 'Ver inventario',
    },
    {
      action: 'inventory:update',
      module: 'inventory',
      description: 'Editar inventario',
    },
    {
      action: 'inventory:delete',
      module: 'inventory',
      description: 'Borrar del inventario',
    },
    {
      action: 'inventory:export',
      module: 'inventory',
      description: 'Exportar inventario',
    },

    // Staff
    {
      action: 'staff:create',
      module: 'staff',
      description: 'Contratar/Crear empleado',
    },
    {
      action: 'staff:read',
      module: 'staff',
      description: 'Ver lista de empleados',
    },
    {
      action: 'staff:update',
      module: 'staff',
      description: 'Editar perfil empleado',
    },
    {
      action: 'staff:delete',
      module: 'staff',
      description: 'Dar de baja empleado',
    },

    // Vehicles / Work Orders (Workshop Core)
    {
      action: 'orders:create',
      module: 'workshop',
      description: 'Crear orden de trabajo',
    },
    {
      action: 'orders:read',
      module: 'workshop',
      description: 'Ver órdenes',
    },
    {
      action: 'orders:update',
      module: 'workshop',
      description: 'Modificar órden',
    },
    {
      action: 'orders:delete',
      module: 'workshop',
      description: 'Cancelar órden',
    },
  ];

  const permissions = [];
  for (const p of permissionsData) {
    const created = await prisma.permission.upsert({
      where: { action: p.action },
      update: {},
      create: {
        ...p,
        roleIds: [],
      },
    });
    permissions.push(created);
  }

  // 2. Create Global Roles
  await prisma.role.upsert({
    where: { slug: 'super_admin' },
    update: {
      permissionIds: permissions.map((p) => p.id),
    },
    create: {
      name: 'Super Administrador',
      slug: 'super_admin',
      description: 'Acceso total al sistema',
      permissionIds: permissions.map((p) => p.id),
    },
  });

  await prisma.role.upsert({
    where: { slug: 'workshop_owner' },
    update: {
      permissionIds: permissions
        .filter((p) => p.module !== 'admin')
        .map((p) => p.id),
    },
    create: {
      name: 'Dueño de Taller',
      slug: 'workshop_owner',
      description: 'Administrador del taller (Tenant)',
      permissionIds: permissions
        .filter((p) => p.module !== 'admin')
        .map((p) => p.id),
    },
  });

  await prisma.role.upsert({
    where: { slug: 'mechanic' },
    update: {
      permissionIds: permissions
        .filter((p) => p.module && ['workshop', 'inventory'].includes(p.module))
        .map((p) => p.id),
    },
    create: {
      name: 'Mecánico',
      slug: 'mechanic',
      description: 'Operario de taller',
      permissionIds: permissions
        .filter((p) => p.module && ['workshop', 'inventory'].includes(p.module))
        .map((p) => p.id),
    },
  });

  await prisma.role.upsert({
    where: { slug: 'receptionist' },
    update: {
      permissionIds: permissions
        .filter((p) => p.module && ['workshop', 'auth'].includes(p.module) && p.action.includes(':read'))
        .map((p) => p.id),
    },
    create: {
      name: 'Recepcionista',
      slug: 'receptionist',
      description: 'Gestión de clientes y turnos',
      permissionIds: permissions
        .filter((p) => p.module && ['workshop', 'auth'].includes(p.module) && p.action.includes(':read'))
        .map((p) => p.id),
    },
  });

  await prisma.role.upsert({
    where: { slug: 'client' },
    update: {
      permissionIds: permissions
        .filter((p) => p.action.endsWith(':read'))
        .map((p) => p.id),
    },
    create: {
      name: 'Cliente',
      slug: 'client',
      description: 'Usuario final / dueño de vehículo',
      permissionIds: permissions
        .filter((p) => p.action.endsWith(':read'))
        .map((p) => p.id),
    },
  });

  // 3. Create Subscription Plans
  await prisma.subscriptionPlan.upsert({
    where: { slug: 'basico' },
    update: {},
    create: {
      name: 'Plan Básico',
      slug: 'basico',
      description: 'Para talleres pequeños',
      price: 0,
      config: { maxUsers: 2, maxVehicles: 20 },
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Plan Profesional',
      slug: 'pro',
      description: 'Para talleres en crecimiento',
      price: 29.99,
      config: { maxUsers: 10, maxVehicles: 500 },
    },
  });

  const plansCount = await prisma.subscriptionPlan.count();
  const rolesCount = await prisma.role.count();
  const permissionsCount = await prisma.permission.count();

  console.log('-----------------------------------------');
  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Permissions created/updated: ${permissionsCount}`);
  console.log(`   - Roles created/updated: ${rolesCount}`);
  console.log(`   - Subscription Plans: ${plansCount}`);
  console.log('-----------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
