import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: 'WELCOME_USER',
      subject: '¡Bienvenido a Quantic, {{name}}!',
      content: `
        <h1>Hola {{name}}!</h1>
        <p>Estamos muy felices de tenerte en el ecosistema Quantic.</p>
        <p>Tu cuenta ya está activa. Podés empezar a gestionar tu negocio desde acá: <a href="{{url}}">Ir al Dashboard</a></p>
        <br/>
        <p>Saludos,<br/>El equipo de Quantic</p>
      `,
    },
    {
      name: 'RECOVER_PASSWORD',
      subject: 'Recuperar Contraseña - Quantic',
      content: `
        <h1>¿Olvidaste tu contraseña, {{name}}?</h1>
        <p>No pasa nada, a todos nos pasa. Hacé click en el siguiente link para resetearla:</p>
        <a href="{{url}}?token={{token}}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Resetear Contraseña</a>
        <p>Este link expira en 1 hora. Si no solicitaste esto, ignorá este mail.</p>
      `,
    },
    {
      name: 'VERIFY_EMAIL',
      subject: 'Verificá tu cuenta de Quantic',
      content: `
        <h1>¡Hola {{name}}! Verificá tu correo</h1>
        <p>Para empezar a usar Quantic, necesitamos confirmar que este es tu mail. Hacé click abajo:</p>
        <a href="{{url}}/verify?token={{token}}" style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">Confirmar Email</a>
      `,
    },
  ];

  for (const t of templates) {
    const existing = await prisma.notificationTemplate.findFirst({
      where: { name: t.name, tenantId: null },
    });

    const data = {
      ...t,
      type: 'EMAIL',
      tenantId: null,
    };

    if (existing) {
      await prisma.notificationTemplate.update({
        where: { id: existing.id },
        data,
      });
      console.log(`Seed: Template ${t.name} updated`);
    } else {
      await prisma.notificationTemplate.create({ data });
      console.log(`Seed: Template ${t.name} created`);
    }
  }

  console.log('Seed completed: Auth templates ready!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
