import('file:///D:/Lab/my-expenses/src/infrastructure/database/client.js').then(({ prisma }) => {
  return prisma.category.findMany();
}).then(categories => {
  console.log('Existing categories:', JSON.stringify(categories, null, 2));
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
