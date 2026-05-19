import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_TENANT_ID = "000000000000000000000000";

const templates = [
  {
    name: "Hidratación Elite",
    description: "Hábito fundamental para mantener el enfoque y la energía durante el día.",
    type: "HABITS",
    duration: "30 d",
    habits: [
      { title: "Beber 500ml al despertar", xp: 10, description: "Activa tu metabolismo" },
      { title: "2 Litros de Agua diarios", xp: 50, description: "Consumo base durante el día" }
    ]
  },
  {
    name: "Ayuno Intermitente 16:8",
    description: "Optimiza tu salud metabólica y claridad mental.",
    type: "HABITS",
    duration: "30 d",
    habits: [
      { title: "Ventana de ayuno 16h", xp: 100, description: "Solo agua, café o té sin azúcar" },
      { title: "Romper ayuno con proteína", xp: 50, description: "Primera comida balanceada" }
    ]
  },
  {
    name: "Lectura de Alto Impacto",
    description: "Desarrollo continuo a través de la lectura diaria.",
    type: "HABITS",
    duration: "30 d",
    habits: [
      { title: "Leer 10 páginas", xp: 30, description: "Lectura enfocada sin distracciones" },
      { title: "Resumen de aprendizaje", xp: 20, description: "Escribe 1 idea clave hoy" }
    ]
  },
  {
    name: "Ejercicio - Rutina Diaria",
    description: "Movimiento constante para fortalecer el cuerpo y la disciplina.",
    type: "HABITS",
    duration: "30 d",
    habits: [
      { title: "30 Min de actividad física", xp: 80, description: "Entrenamiento moderado a intenso" },
      { title: "Movilidad matutina", xp: 20, description: "10 min de estiramientos al levantarse" }
    ]
  },
  {
    name: "Mindfulness & Foco",
    description: "Entrena tu atención plena para reducir el estrés.",
    type: "HABITS",
    duration: "30 d",
    habits: [
      { title: "10 Min Meditación", xp: 40, description: "Sesión de respiración guiada o silencio" },
      { title: "Deep Work - Bloque 90 min", xp: 60, description: "Trabajo enfocada en 1 sola tarea" }
    ]
  }
];

async function main() {
  console.log('🚀 Publicando plantillas en el Marketplace Global...');

  const tenant = await (prisma as any).tenant?.findFirst() || await (prisma as any).user?.findFirst({ where: { role: 'OWNER' } });
  const myTenantId = tenant?.tenantId || tenant?.id || "69fe6cbd3f6859308a2c86e5";

  // 1. Limpiar versiones viejas si quedaron
  const programsToDelete = await prisma.program.findMany({
    where: { 
      name: { in: templates.map(t => t.name) },
      tenantId: myTenantId,
      isTemplate: true
    },
    select: { id: true }
  });

  if (programsToDelete.length > 0) {
    const ids = programsToDelete.map(p => p.id);
    await prisma.$transaction([
      prisma.milestone.deleteMany({ where: { programId: { in: ids } } }),
      prisma.phase.deleteMany({ where: { programId: { in: ids } } }),
      prisma.program.deleteMany({ where: { id: { in: ids } } })
    ]);
  }

  for (const t of templates) {
    console.log(`🔄 Sincronizando: ${t.name}...`);
    
    await prisma.$transaction(async (tx) => {
      const existingProgram = await tx.program.findFirst({
        where: { name: t.name, isTemplate: true, tenantId: SYSTEM_TENANT_ID }
      });

      if (existingProgram) {
        await tx.program.update({
          where: { id: existingProgram.id },
          data: { 
            isPublic: true, 
            category: "Aura Official", 
            status: "PUBLISHED" // <--- EL CAMBIO CLAVE
          }
        });
      } else {
        const program = await tx.program.create({
          data: {
            name: t.name,
            description: t.description,
            type: t.type,
            duration: t.duration,
            isTemplate: true,
            isPublic: true,
            category: "Aura Official",
            tenantId: SYSTEM_TENANT_ID,
            status: "PUBLISHED", // <--- EL CAMBIO CLAVE
            phases: {
              create: [{ name: "Fase Única", order: 0, description: "Fase inicial" }]
            }
          },
          include: { phases: true }
        });

        const phaseId = program.phases[0].id;

        for (let i = 0; i < t.habits.length; i++) {
          const h = t.habits[i];
          await tx.milestone.create({
            data: {
              title: h.title,
              description: h.description,
              xpReward: h.xp,
              isHabit: true,
              order: i,
              programId: program.id,
              phaseId: phaseId,
              tenantId: SYSTEM_TENANT_ID,
              frequency: "DAILY"
            }
          });
        }
      }
    });
  }

  console.log('✨ Marketplace sincronizado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
