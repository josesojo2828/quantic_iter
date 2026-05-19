import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INSPECCIÓN DE BASE DE DATOS ---');
  
  // 1. Buscar el usuario
  const user = await prisma.$runCommandRaw({
    find: 'users',
    filter: { email: 'nutringest@gmail.com' }
  }) as any;

  console.log('Estudiante:', JSON.stringify(user, null, 2));

  if (user && user.firstBatch && user.firstBatch.length > 0) {
    const studentId = user.firstBatch[0]._id.$oid;
    console.log('ID del estudiante:', studentId);

    // 2. Buscar enrollments para este estudiante
    const enrollments = await prisma.enrollment.findMany({
      where: { menteeId: studentId }
    });
    console.log('Enrollments del estudiante:', JSON.stringify(enrollments, null, 2));

    // 3. Buscar todos los programas en el tenant
    const tenantId = user.firstBatch[0].tenantId?.$oid || user.firstBatch[0].tenantId;
    console.log('Tenant ID:', tenantId);

    const programs = await prisma.program.findMany({
      where: { tenantId }
    });
    console.log('Todos los programas del tenant (cantidad):', programs.length);
    console.log('Muestra de Programas:', JSON.stringify(programs.slice(0, 5), null, 2));
  } else {
    console.log('¡No se encontró el estudiante!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
