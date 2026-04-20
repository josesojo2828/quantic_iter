import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Subscription Plans...');

  const plans = [
    {
      name: 'Plan Inicial',
      slug: 'basic',
      description: 'Ideal para pequeños talleres que recién comienzan.',
      price: 29.99,
      billingCycle: 'MONTHLY',
      config: { maxUsers: 2, maxVehicles: 50 },
    },
    {
      name: 'Plan Profesional',
      slug: 'pro',
      description: 'Perfecto para talleres en crecimiento.',
      price: 59.99,
      billingCycle: 'MONTHLY',
      config: { maxUsers: 5, maxVehicles: 200 },
    },
    {
      name: 'Plan Premium',
      slug: 'premium',
      description: 'Toda la potencia de WorkshopArch sin límites.',
      price: 99.99,
      billingCycle: 'MONTHLY',
      config: { maxUsers: 20, maxVehicles: 1000 },
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
