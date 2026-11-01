// server/scripts/check-db-images.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const items = await prisma.menuItem.findMany({
    select: { id: true, name: true, imageUrl: true, category: { select: { name: true } } }
  });
  console.log(`Total items in DB: ${items.length}`);
  const withImages = items.filter(i => i.imageUrl && i.imageUrl.trim() !== '');
  console.log(`Items with imageUrl in DB: ${withImages.length}`);
  console.log(`Items with null/empty imageUrl: ${items.length - withImages.length}`);
  
  // Count frequency of imageUrls
  const freq = {};
  for (const i of withImages) {
    freq[i.imageUrl] = (freq[i.imageUrl] || 0) + 1;
  }
  const duplicates = Object.entries(freq).filter(([url, count]) => count > 1);
  console.log(`Unique image URLs in DB: ${Object.keys(freq).length}`);
  console.log(`Duplicate image URLs used across multiple items: ${duplicates.length}`);
  duplicates.forEach(([url, count]) => {
    const dishNames = withImages.filter(i => i.imageUrl === url).map(i => i.name).slice(0, 5).join(', ');
    console.log(`  - Used ${count} times: ${url.slice(0, 60)}... (e.g. ${dishNames})`);
  });
}

check()
  .catch(e => console.error('DB Error:', e.message))
  .finally(() => prisma.$disconnect());

