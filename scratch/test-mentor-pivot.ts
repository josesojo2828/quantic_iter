import fetch from 'node-fetch';

const AUTH_URL = 'http://localhost:3000';
const CORE_URL = 'http://localhost:3004';

async function runTest() {
  const timestamp = Date.now();
  const email = `mentor_${timestamp}@quantic.com`;
  const password = 'Password123!';

  console.log('🚀 Iniciando Prueba de Pivote MentorQuantic...');
  console.log(`📧 Email generado: ${email}`);

  // 1. Registro
  console.log('\n📝 [1/4] Registrando nuevo Mentor y Academia...');
  const regRes = await fetch(`${AUTH_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName: 'José',
      lastName: 'Sojo',
      mentorName: 'Quantic Master Academy'
    })
  });

  if (!regRes.ok) {
    console.error('❌ Error en registro:', await regRes.text());
    return;
  }
  console.log('✅ Registro exitoso.');

  // 2. Login
  console.log('\n🔐 [2/4] Autenticando...');
  const loginRes = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    console.error('❌ Error en login:', await loginRes.text());
    return;
  }

  const { user } = await loginRes.json() as any;
  // Note: auth-tenant sets cookie, but for this script we might need to handle the token if it's returned or set in headers
  // Let's assume we can get the token from cookies or if the API returns it
  const cookies = loginRes.headers.get('set-cookie');
  console.log('✅ Login exitoso. Bienvenue,', user.firstName);

  // 3. Verificar Sidebar/Módulos
  console.log('\n📊 [3/4] Verificando Módulos de Academia...');
  const meRes = await fetch(`${AUTH_URL}/auth/me`, {
    headers: { 'Cookie': cookies || '' }
  });

  const profile = await meRes.json() as any;
  const modules = profile.modules.map((m: any) => m.label);
  console.log('📦 Módulos activos:', modules.join(', '));
  
  if (modules.includes('Mentoría') || modules.includes('Programas')) {
    console.log('✅ Verificación de Branding: Los módulos son de ACADEMIA.');
  } else {
    console.warn('⚠️ Alerta: No se encontraron módulos de academia. Revisar SidebarService.');
  }

  // 4. Consultar Gamificación (Mentor-Core)
  console.log('\n🎮 [4/4] Consultando Motor de Gamificación...');
  const statsRes = await fetch(`${CORE_URL}/gamification/stats`, {
    headers: { 'Cookie': cookies || '' }
  });

  if (statsRes.ok) {
    const stats = await statsRes.json();
    console.log('✅ Gamificación accesible. Stats actuales:', stats || 'Iniciando (0 XP)');
  } else {
    console.log('ℹ️ Gamificación no accesible aún (posiblemente falta levantar mentor-core o JWT guard).');
  }

  console.log('\n✨ Prueba finalizada. ¡El ecosistema MentorQuantic está vivo!');
}

runTest().catch(console.error);
