import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Subscription Plans...');

  const plans = [
    {
      name: 'Plan Inicial',
      slug: 'basic',
      description: 'Ideal para pequeños mentoríaes que recién comienzan.',
      price: 29.99,
      billingCycle: 'MONTHLY',
      config: { 
        maxUsers: 2, 
        maxMentees: 50, 
        maxBranches: 1,
        features: ['dashboard', 'staff']
      },
    },
    {
      name: 'Plan Profesional',
      slug: 'pro',
      description: 'Perfecto para mentoríaes en crecimiento.',
      price: 59.99,
      billingCycle: 'MONTHLY',
      config: { 
        maxUsers: 5, 
        maxMentees: 200, 
        maxBranches: 3,
        features: ['dashboard', 'staff', 'inventory', 'crm']
      },
    },
    {
      name: 'Plan Premium',
      slug: 'premium',
      description: 'Toda la potencia de MentorQuantic sin límites.',
      price: 99.99,
      billingCycle: 'MONTHLY',
      config: { 
        maxUsers: 20, 
        maxMentees: 1000, 
        maxBranches: 10,
        features: ['dashboard', 'staff', 'inventory', 'crm', 'billing', 'reports']
      },
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
