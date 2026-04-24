import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@quantic.app';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdminRole = await prisma.role.findUnique({
    where: { slug: 'super_admin' },
  });

  if (!superAdminRole) {
    console.error('❌ Rol super_admin no encontrado. ¿Corriste el seed?');
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Súper',
      lastName: 'Admin',
    },
  });

  // Create UserRole for Super Admin (at global level, tenantId = null)
  await prisma.userRole.upsert({
    where: {
      userId_tenantId_roleId: {
        userId: user.id,
        tenantId: null as any,
        roleId: superAdminRole.id,
      },
    },
    update: {
      roleId: superAdminRole.id,
    },
    create: {
      userId: user.id,
      tenantId: null as any,
      roleId: superAdminRole.id,
    },
  });

  console.log('✅ Súper Admin creado/actualizado con éxito:');
  console.log(`📧 Email: ${user.email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`🔐 Rol: GLOBAL Super Admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
