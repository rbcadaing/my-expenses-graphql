import { prisma } from './src/infrastructure/database/client';

async function checkDatabase() {
  try {
    const categories = await prisma.category.findMany();
    console.log('=== Existing Categories ===');
    if (categories.length === 0) {
      console.log('No categories found in database.');
    } else {
      categories.forEach(cat => {
        console.log(`- ${cat.name} (ID: ${cat.id})`);
        console.log(`  Description: ${cat.description || 'N/A'}`);
        console.log(`  Color: ${cat.color}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
