import { PrismaClient } from '@prisma/client';
import { SEED_FOODS } from './seeds/foods';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert foods by external_id to allow re-seeding without duplicates
  let created = 0;
  let skipped = 0;

  for (const food of SEED_FOODS) {
    if (food.external_id) {
      const existing = await prisma.food.findFirst({
        where: { external_id: food.external_id },
      });

      if (existing) {
        skipped++;
        continue;
      }
    }

    await prisma.food.create({ data: food });
    created++;
  }

  console.log(`✓ Foods: ${created} created, ${skipped} skipped`);

  // Seed a few global template meals
  const chickenBreast = await prisma.food.findFirst({
    where: { external_id: 'off-chicken-breast-cooked' },
  });
  const rice = await prisma.food.findFirst({
    where: { external_id: 'off-white-rice-cooked' },
  });
  const broccoli = await prisma.food.findFirst({
    where: { external_id: 'off-broccoli-cooked' },
  });
  const oats = await prisma.food.findFirst({
    where: { external_id: 'off-oats' },
  });
  const greekYogurt = await prisma.food.findFirst({
    where: { external_id: 'off-greek-yogurt-2' },
  });
  const banana = await prisma.food.findFirst({
    where: { external_id: 'off-banana' },
  });

  const templateMeals = [
    {
      name: 'Poulet riz brocoli',
      foods: [
        { food: chickenBreast, quantity_g: 150 },
        { food: rice, quantity_g: 200 },
        { food: broccoli, quantity_g: 100 },
      ],
    },
    {
      name: 'Porridge banane',
      foods: [
        { food: oats, quantity_g: 80 },
        { food: banana, quantity_g: 120 },
        { food: greekYogurt, quantity_g: 100 },
      ],
    },
  ];

  for (const template of templateMeals) {
    const existing = await prisma.meal.findFirst({
      where: { name: template.name, is_template: true },
    });

    if (existing) {
      console.log(`  ↩ Template "${template.name}" already exists`);
      continue;
    }

    const validFoods = template.foods.filter((f) => f.food !== null);

    if (validFoods.length === 0) continue;

    await prisma.meal.create({
      data: {
        name: template.name,
        user_id: null,
        is_template: true,
        meal_foods: {
          create: validFoods.map((f) => ({
            food_id: f.food!.id,
            quantity_g: f.quantity_g,
          })),
        },
      },
    });

    console.log(`  ✓ Template "${template.name}" created`);
  }

  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
