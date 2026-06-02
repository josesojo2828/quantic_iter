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

    // Mentor Core
    {
      action: 'mentor:read',
      module: 'mentor',
      description: 'Ver datos de mentoría',
    },
    {
      action: 'mentor:update',
      module: 'mentor',
      description: 'Editar datos de mentoría',
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

    // Programs & Tasks
    {
      action: 'tasks:create',
      module: 'mentor',
      description: 'Crear tarea/objetivo',
    },
    {
      action: 'tasks:read',
      module: 'mentor',
      description: 'Ver tareas',
    },
    {
      action: 'tasks:update',
      module: 'mentor',
      description: 'Modificar tarea',
    },
    {
      action: 'tasks:delete',
      module: 'mentor',
      description: 'Cancelar/Borrar tarea',
    },

    // Multi-branch (Enterprise)
    {
      action: 'branches:read',
      module: 'branches',
      description: 'Ver sucursales',
    },
    {
      action: 'branches:create',
      module: 'branches',
      description: 'Crear nueva sucursal',
    },
    {
      action: 'branches:update',
      module: 'branches',
      description: 'Editar sucursal',
    },
    {
      action: 'branches:delete',
      module: 'branches',
      description: 'Cerrar sucursal',
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
    where: { slug: 'mentor_owner' },
    update: {
      permissionIds: permissions
        .filter((p) => p.module !== 'admin')
        .map((p) => p.id),
    },
    create: {
      name: 'Dueño de Mentoría',
      slug: 'mentor_owner',
      description: 'Administrador de la organización (Tenant)',
      permissionIds: permissions
        .filter((p) => p.module !== 'admin')
        .map((p) => p.id),
    },
  });

  await prisma.role.upsert({
    where: { slug: 'facilitator' },
    update: {
      permissionIds: permissions
        .filter((p) => p.module && ['mentor', 'inventory'].includes(p.module))
        .map((p) => p.id),
    },
    create: {
      name: 'Facilitador / Coach',
      slug: 'facilitator',
      description: 'Mentor encargado de guiar estudiantes',
      permissionIds: permissions
        .filter((p) => p.module && ['mentor', 'inventory'].includes(p.module))
        .map((p) => p.id),
    },
  });

  await prisma.role.upsert({
    where: { slug: 'support' },
    update: {
      permissionIds: permissions
        .filter((p) => p.module && ['mentor', 'auth'].includes(p.module) && p.action.includes(':read'))
        .map((p) => p.id),
    },
    create: {
      name: 'Staff de Soporte',
      slug: 'support',
      description: 'Gestión de alumnos y asistencia',
      permissionIds: permissions
        .filter((p) => p.module && ['mentor', 'auth'].includes(p.module) && p.action.includes(':read'))
        .map((p) => p.id),
    },
  });

  await prisma.role.upsert({
    where: { slug: 'mentee' },
    update: {
      permissionIds: permissions
        .filter((p) => p.action.endsWith(':read'))
        .map((p) => p.id),
    },
    create: {
      name: 'Estudiante / Mentoreado',
      slug: 'mentee',
      description: 'Usuario final que recibe mentoría',
      permissionIds: permissions
        .filter((p) => p.action.endsWith(':read'))
        .map((p) => p.id),
    },
  });

  // 3. Create Subscription Plans
  await prisma.subscriptionPlan.upsert({
    where: { slug: 'basico' },
    update: {
      name: 'Personal',
      description: 'Coach independiente básico',
      price: 0,
      config: { maxUsers: 1, maxMentees: 25, disabled: false },
      isActive: true,
    },
    create: {
      name: 'Personal',
      slug: 'basico',
      description: 'Coach independiente básico',
      price: 0,
      config: { maxUsers: 1, maxMentees: 25, disabled: false },
      isActive: true,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { slug: 'pro' },
    update: {
      name: 'Personal Plus',
      description: 'Coach con servicio de página web',
      price: 29.99,
      config: { maxUsers: 2, maxMentees: 500, hasWebsite: true, disabled: true },
      isActive: false,
    },
    create: {
      name: 'Personal Plus',
      slug: 'pro',
      description: 'Coach con servicio de página web',
      price: 29.99,
      config: { maxUsers: 2, maxMentees: 500, hasWebsite: true, disabled: true },
      isActive: false,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { slug: 'enterprise' },
    update: {
      name: 'Enterprise',
      description: 'Para gimnasios y centros deportivos con staff',
      price: 149.99,
      config: { maxUsers: 20, maxMentees: 5000, multiBranch: true, maxBranches: 5, vipSupport: true, disabled: false },
      isActive: true,
    },
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Para gimnasios y centros deportivos con staff',
      price: 149.99,
      config: { maxUsers: 20, maxMentees: 5000, multiBranch: true, maxBranches: 5, vipSupport: true, disabled: false },
      isActive: true,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { slug: 'enterprise_pro' },
    update: {
      name: 'Enterprise Plus',
      description: 'Plataforma corporativa: Asistencias, inventario, sitio web y más',
      price: 299.99,
      config: { maxUsers: 100, maxMentees: 50000, multiBranch: true, maxBranches: 999, vipSupport: true, advancedAudit: true, disabled: true },
      isActive: false,
    },
    create: {
      name: 'Enterprise Plus',
      slug: 'enterprise_pro',
      description: 'Plataforma corporativa: Asistencias, inventario, sitio web y más',
      price: 299.99,
      config: { maxUsers: 100, maxMentees: 50000, multiBranch: true, maxBranches: 999, vipSupport: true, advancedAudit: true, disabled: true },
      isActive: false,
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
