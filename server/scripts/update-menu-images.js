// server/scripts/update-menu-images.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateMenuImages() {
  console.log('🔄 Loading master menu definitions from seed.js...');
  const seedFile = fs.readFileSync(path.join(__dirname, '../prisma/seed.js'), 'utf8');
  const match = seedFile.match(/const MENU = (\[[\s\S]*?\n\];)/);
  if (!match) {
    console.error('❌ Could not parse MENU from seed.js');
    process.exit(1);
  }

  const menu = eval(match[1]);
  let updatedCount = 0;
  let notFoundCount = 0;

  for (const cat of menu) {
    for (const item of cat.items) {
      if (!item.imageUrl) continue;

      const existing = await prisma.menuItem.findFirst({
        where: { name: item.name }
      });

      if (existing) {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data: { imageUrl: item.imageUrl }
        });
        updatedCount++;
      } else {
        notFoundCount++;
      }
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} menu item images in database!`);
  if (notFoundCount > 0) {
    console.log(`ℹ️ ${notFoundCount} items were not found in current database table.`);
  }
}

updateMenuImages()
  .catch((e) => {
    console.error('❌ Update menu images error:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

