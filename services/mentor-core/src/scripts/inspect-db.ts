import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('--- INSPECCIÓN MULTI-BASE DE DATOS ---');
  
  // 1. Conectar a auth_db para encontrar al usuario
  const authPrisma = new PrismaClient({
    datasources: {
      db: { url: "mongodb://mentor_mongo:27017/auth_db?replicaSet=rs0&directConnection=true" }
    }
  });

  // Intentar consultar usando Prisma
  const user = await (authPrisma as any).user?.findFirst({
    where: { email: 'nutringest@gmail.com' }
  }) || await authPrisma.$runCommandRaw({
    find: 'users',
    filter: { email: 'nutringest@gmail.com' }
  });

  console.log('Usuario en auth_db:', JSON.stringify(user, null, 2));

  let studentId = '';
  let tenantId = '';

  if (user) {
    const rawResult = user as any;
    if (rawResult.cursor && rawResult.cursor.firstBatch && rawResult.cursor.firstBatch.length > 0) {
      const u = rawResult.cursor.firstBatch[0];
      studentId = u._id.$oid || u._id;
      tenantId = u.lastTenantId?.$oid || u.lastTenantId || u.tenantId?.$oid || u.tenantId;
    } else if (rawResult.firstBatch && rawResult.firstBatch.length > 0) {
      const u = rawResult.firstBatch[0];
      studentId = u._id.$oid || u._id;
      tenantId = u.lastTenantId?.$oid || u.lastTenantId || u.tenantId?.$oid || u.tenantId;
    } else {
      studentId = rawResult.id || rawResult._id;
      tenantId = rawResult.tenantId;
    }
  }

  await authPrisma.$disconnect();

  if (!studentId) {
    console.log('❌ ¡No se encontró al estudiante nutringest@gmail.com en auth_db!');
    return;
  }

  console.log('✅ Estudiante encontrado!');
  console.log('ID del estudiante:', studentId);
  console.log('Tenant ID:', tenantId);

  // 2. Conectar a mentor_core_db para ver enrollments y programas
  const corePrisma = new PrismaClient({
    datasources: {
      db: { url: "mongodb://mentor_mongo:27017/mentor_core_db?replicaSet=rs0&directConnection=true" }
    }
  });

  const enrollments = await corePrisma.enrollment.findMany({
    where: { menteeId: studentId }
  });
  console.log('📚 Enrollments del estudiante en mentor_core_db:', JSON.stringify(enrollments, null, 2));

  const groupMembers = await corePrisma.groupMember.findMany({
    where: { menteeId: studentId }
  });
  console.log('👥 Membresías de Grupo del estudiante en mentor_core_db:', JSON.stringify(groupMembers, null, 2));

  const programs = await corePrisma.program.findMany({
    where: { tenantId }
  });
  console.log('📋 Cantidad total de programas en el tenant:', programs.length);
  console.log('Muestra de Programas:', JSON.stringify(programs.map(p => ({
    id: p.id,
    name: p.name,
    isTemplate: p.isTemplate,
    isPublic: p.isPublic,
    menteeId: p.menteeId,
    status: p.status
  })), null, 2));

  await corePrisma.$disconnect();
}

main().catch(console.error);
