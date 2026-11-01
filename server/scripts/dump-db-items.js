// server/scripts/dump-db-items.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function dump() {
  const items = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: [{ categoryId: 'asc' }, { id: 'asc' }]
  });
  console.log(`Fetched ${items.length} items from database.`);
  fs.writeFileSync('db_items_dump.json', JSON.stringify(items, null, 2));
  
  const categories = await prisma.menuCategory.findMany({
    include: { _count: { select: { items: true } } }
  });
  console.log('Categories:');
  categories.forEach(c => console.log(`  - ${c.name}: ${c._count.items} items (available: ${items.filter(i => i.categoryId === c.id && i.available).length})`));
}

dump()
  .catch(e => console.error(e.message))
  .finally(() => prisma.$disconnect());

