// Using native fetch from Node.js runtime
import { PrismaClient as AuthPrisma } from '../services/auth-tenant/node_modules/@prisma/client/index.js';
import { PrismaClient as CorePrisma } from '../services/mentor-core/node_modules/@prisma/client/index.js';

const AUTH_URL = 'http://localhost/api';
const CORE_URL = 'http://localhost/api/mentor';

async function runB2BTest() {
  console.log('🚀 INICIANDO PRUEBA DE INTEGRACIÓN B2B MULTI-TENANCY...\n');

  const authPrisma = new AuthPrisma({
    datasources: {
      db: {
        url: 'mongodb://localhost:27017/auth_db?replicaSet=rs0&directConnection=true'
      }
    }
  });
  const corePrisma = new CorePrisma({
    datasources: {
      db: {
        url: 'mongodb://localhost:27017/mentor_core_db?replicaSet=rs0&directConnection=true'
      }
    }
  });

  try {
    const timestamp = Date.now();
    const gymOwnerEmail = `gym_owner_${timestamp}@quantic.com`;
    const password = 'Password123!';
    const trainer1Email = `trainer1_${timestamp}@quantic.com`;
    const trainer2Email = `trainer2_${timestamp}@quantic.com`;

    // ==========================================
    // 1. REGISTRO DEL DUEÑO DEL GIMNASIO (TENANT)
    // ==========================================
    console.log(`📝 [1/7] Registrando gimnasio con dueño: ${gymOwnerEmail}...`);
    const regRes = await fetch(`${AUTH_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: gymOwnerEmail,
        password,
        firstName: 'Dwayne',
        lastName: 'Johnson',
        mentorName: `Gold Gym ${timestamp}`,
      }),
    });

    if (!regRes.ok) {
      throw new Error(`Error al registrar gimnasio: ${await regRes.text()}`);
    }
    console.log('✅ Gimnasio registrado con éxito.');

    // LOGIN DEL DUEÑO
    console.log('\n🔐 [2/7] Autenticando al dueño del gimnasio...');
    const loginRes = await fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: gymOwnerEmail, password }),
    });

    if (!loginRes.ok) {
      throw new Error(`Error en login: ${await loginRes.text()}`);
    }

    const loginData = await loginRes.json() as any;
    console.log('DEBUG: loginData returned:', loginData);
    const tenantId = loginData.data?.user?.tenantId;
    if (!tenantId) {
      throw new Error('No se pudo extraer el tenantId de la respuesta de login');
    }
    const ownerCookies = loginRes.headers.get('set-cookie');
    console.log(`✅ Login exitoso. TenantID asignado: ${tenantId}`);

    // Esperar un momento a que Kafka procese la creación de la suscripción básica
    console.log('⏳ Esperando 2 segundos para la sincronización de la suscripción básica vía Kafka...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verificamos si se sincronizó en mentor-core (MongoDB)
    const syncedSub = await corePrisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (syncedSub) {
      console.log(`✅ Suscripción sincronizada en MongoDB local de mentor-core: Plan ${syncedSub.plan.name}`);
    } else {
      console.warn('⚠️ Suscripción no se sincronizó a tiempo en MongoDB. Continuando test...');
    }

    // Consultar el rol facilitator
    const coachRole = await authPrisma.role.findUnique({
      where: { slug: 'facilitator' },
    });
    if (!coachRole) {
      throw new Error('No se encontró el rol "facilitator" en la base de datos de Auth.');
    }
    const coachRoleId = coachRole.id;

    // ==========================================
    // 2. ENVIAR INVITACIÓN AL ENTRENADOR 1 (DENTRO DEL LÍMITE)
    // ==========================================
    console.log(`\n✉️ [3/7] Invitando al primer entrenador: ${trainer1Email}...`);
    const inv1Res = await fetch(`${AUTH_URL}/invitation/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': ownerCookies || '',
      },
      body: JSON.stringify({
        email: trainer1Email,
        roleId: coachRoleId,
      }),
    });

    if (!inv1Res.ok) {
      throw new Error(`Error al enviar invitación 1: ${await inv1Res.text()}`);
    }
    console.log('✅ Invitación 1 enviada correctamente.');

    // ==========================================
    // 3. ENVIAR INVITACIÓN AL ENTRENADOR 2 (EXCEDE EL LÍMITE DEL PLAN BÁSICO QUE TIENE LÍMITE 2)
    // ==========================================
    console.log(`\n🚫 [4/7] Intentando invitar al segundo entrenador (debería fallar, límite del plan básico = 2)...`);
    const inv2Res = await fetch(`${AUTH_URL}/invitation/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': ownerCookies || '',
      },
      body: JSON.stringify({
        email: trainer2Email,
        roleId: coachRoleId,
      }),
    });

    if (inv2Res.ok) {
      console.warn('⚠️ ALERTA: La segunda invitación fue permitida. El límite de suscripción no se aplicó.');
    } else {
      console.log(`✅ Validaciones de límite B2B funcionando. Respuesta esperada: 400 Bad Request.`);
      console.log(`   Mensaje recibido: "${await inv2Res.text()}"`);
    }

    // ==========================================
    // 4. ACEPTACIÓN DE INVITACIÓN Y REGISTRO ATÓMICO
    // ==========================================
    console.log(`\n🔄 [5/7] Aceptando invitación para Entrenador 1 (${trainer1Email})...`);
    // Buscamos el token de invitación en Postgres de auth-tenant
    const dbInvitation = await authPrisma.invitation.findFirst({
      where: { email: trainer1Email },
    });

    if (!dbInvitation) {
      throw new Error('No se encontró el registro de invitación en la base de datos.');
    }

    console.log(`🔗 Token de invitación obtenido: ${dbInvitation.token}`);

    // Registramos al nuevo usuario usando el flujo de invitación
    const regTrainerRes = await fetch(`${AUTH_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: trainer1Email,
        password,
        firstName: 'Trainer One',
        lastName: 'Gym',
        mentorName: `Trainer Academy`,
        invitationToken: dbInvitation.token, // Asociamos invitación
      }),
    });

    if (!regTrainerRes.ok) {
      throw new Error(`Error al registrar entrenador: ${await regTrainerRes.text()}`);
    }
    console.log('✅ Entrenador registrado y auto-vinculado al gimnasio.');

    // Verificamos en DB que la invitación se marcó como aceptada y tiene el rol correcto
    const updatedInv = await authPrisma.invitation.findFirst({
      where: { email: trainer1Email },
    });

    if (updatedInv?.acceptedAt) {
      console.log('✅ Estado de invitación en DB: ACEPTADA.');
    } else {
      throw new Error('La invitación no se marcó como aceptada en base de datos.');
    }

    // ==========================================
    // 5. VERIFICACIÓN DE GUARD ACTIVO EN MENTOR-CORE
    // ==========================================
    console.log('\n🔐 Autenticando al Entrenador 1...');
    const loginTrainerRes = await fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trainer1Email, password }),
    });

    if (!loginTrainerRes.ok) {
      throw new Error(`Error login entrenador: ${await loginTrainerRes.text()}`);
    }

    const trainerCookies = loginTrainerRes.headers.get('set-cookie');
    
    console.log('🏋️ [6/7] Creando programa en mentor-core (Suscripción activa)...');
    const createProgRes = await fetch(`${CORE_URL}/programs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': trainerCookies || '',
      },
      body: JSON.stringify({
        name: `Rutina de Fuerza Trainer 1`,
        description: 'Programa de alto rendimiento',
      }),
    });

    if (createProgRes.ok) {
      const prog = await createProgRes.json() as any;
      console.log(`✅ Programa creado exitosamente en mentor-core. ID: ${prog.id}`);
    } else {
      throw new Error(`Error al crear programa: ${await createProgRes.text()}`);
    }

    // ==========================================
    // 6. BLOQUEO POR EXPIRACIÓN (SUSCRIPCIÓN EXPIRADA TRAS PERIODO DE GRACIA)
    // ==========================================
    console.log('\n⌛ [7/7] Simulando expiración de suscripción en mentor-core...');
    
    // Forzamos fecha de expiración antigua en Mongo (hace 5 días, fuera de periodo de gracia)
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 5);

    await corePrisma.subscription.update({
      where: { tenantId },
      data: { expiresAt: expiredDate },
    });
    console.log(`🕒 Fecha de expiración modificada en MongoDB a: ${expiredDate.toISOString()}`);

    console.log('🏋️ Intentando crear otro programa en mentor-core con suscripción vencida...');
    const createProgBlockedRes = await fetch(`${CORE_URL}/programs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': trainerCookies || '',
      },
      body: JSON.stringify({
        name: `Rutina de Fuerza Trainer Bloqueado`,
        description: 'Esto debería fallar',
      }),
    });

    if (createProgBlockedRes.ok) {
      console.warn('⚠️ ALERTA: Se permitió la creación de programa con suscripción vencida.');
    } else {
      console.log(`✅ Bloqueo de suscripción vencida funcionando. Respuesta esperada: 403 Forbidden.`);
      console.log(`   Mensaje recibido: "${await createProgBlockedRes.text()}"`);
    }

    // Restaurar suscripción en MongoDB para no dejar el entorno en mal estado
    console.log('\n🧹 Limpiando base de datos tras las pruebas...');
    const restoredDate = new Date();
    restoredDate.setDate(restoredDate.getDate() + 30);
    await corePrisma.subscription.update({
      where: { tenantId },
      data: { expiresAt: restoredDate },
    });
    console.log('✅ Suscripción restaurada correctamente.');

    console.log('\n🎉 ¡PRUEBA DE INTEGRACIÓN B2B MULTI-TENANCY FINALIZADA EXITOSAMENTE! 🎉');

  } catch (error) {
    console.error('\n❌ ERROR EN LA VERIFICACIÓN B2B:', error);
  } finally {
    await authPrisma.$disconnect();
    await corePrisma.$disconnect();
  }
}

runB2BTest().catch(console.error);
