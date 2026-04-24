import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'josesojo2828@gmail.com'; 
  const tenantSlug = 'sojo-machine'; // Slug exacto que encontramos :D

  console.log(`🔧 Reparando acceso para ${email}...`);

  const user = await prisma.user.findUnique({ where: { email } });
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  const role = await prisma.role.findUnique({ where: { slug: 'workshop_owner' } });

  if (!user || !tenant || !role) {
    console.error('❌ Error: No se encontró el usuario, el taller o el rol de dueño.');
    console.log({ user: !!user, tenant: !!tenant, role: !!role });
    return;
  }

  const userRole = await prisma.userRole.upsert({
    where: {
      userId_tenantId_roleId: {
        userId: user.id,
        tenantId: tenant.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      tenantId: tenant.id,
      roleId: role.id,
    },
  });

  console.log('✅ ¡Acceso reparado con éxito!');
  console.log(`🔗 Link creado: Usuario [${user.email}] <-> Taller [${tenant.name}] con Rol [${role.name}]`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
