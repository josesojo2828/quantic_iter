import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@quantic.app';
  
  const superAdminRole = await prisma.role.findUnique({
    where: { slug: 'super_admin' },
  });

  if (!superAdminRole) {
    console.error('❌ Role super_admin not found.');
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('❌ User admin@quantic.app not found.');
    return;
  }

  // Check if role already exists
  const existingRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      roleId: superAdminRole.id
    }
  });

  if (existingRole) {
    console.log('✅ User already has the super_admin role.');
    return;
  }

  await (prisma.userRole as any).create({
    data: {
      userId: user.id,
      roleId: superAdminRole.id,
      tenantId: null,
    },
  });

  console.log('🚀 Fixed! admin@quantic.app now has global super_admin role.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
