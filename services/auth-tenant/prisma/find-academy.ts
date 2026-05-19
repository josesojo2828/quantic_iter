import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log('🏢 Academiaes encontrados:');
  tenants.forEach(t => console.log(`- Nombre: "${t.name}" | Slug: "${t.slug}" | ID: ${t.id}`));
}
main().finally(() => prisma.$disconnect());
