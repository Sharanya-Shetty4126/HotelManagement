// server/prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const MENU = [
  { category: 'Starters', items: [
    { name: 'Chicken 65', price: 220, description: 'Spicy deep-fried chicken tossed in curry leaves', emoji: '🍗', isVeg: false, rating: 4.6 },
    { name: 'Veg Spring Rolls', price: 160, description: 'Crispy rolls stuffed with mixed vegetables', emoji: '🥟', isVeg: true, rating: 4.1 },
  ]},
  { category: 'Main Course', items: [
    { name: 'Chicken Biryani', price: 350, description: 'Hyderabadi style biryani with aromatic spices', emoji: '🍛', isVeg: false, rating: 4.5 },
    { name: 'Paneer Butter Masala', price: 280, description: 'Creamy tomato gravy with paneer', emoji: '🧀', isVeg: true, rating: 4.3 },
    { name: 'Jeera Rice', price: 150, description: 'Basmati rice tempered with cumin', emoji: '🍚', isVeg: true, rating: 4.0 },
  ]},
  { category: 'Breads', items: [
    { name: 'Garlic Naan', price: 60, description: 'Fresh tandoor naan with garlic butter', emoji: '🥖', isVeg: true, rating: 4.4 },
  ]},
  { category: 'Beverages', items: [
    { name: 'Masala Chaas', price: 50, description: 'Spiced buttermilk, served chilled', emoji: '🥛', isVeg: true, rating: 4.2 },
  ]},
  { category: 'Desserts', items: [
    { name: 'Gulab Jamun', price: 90, description: 'Warm milk dumplings in sugar syrup', emoji: '🍮', isVeg: true, rating: 4.7 },
  ]},
];

const TABLES = [
  { number: 1, section: 'AC', capacity: 4 },
  { number: 2, section: 'AC', capacity: 4 },
  { number: 3, section: 'AC', capacity: 2 },
  { number: 4, section: 'AC', capacity: 6 },
  { number: 5, section: 'Non-AC', capacity: 4 },
  { number: 6, section: 'Non-AC', capacity: 4 },
  { number: 7, section: 'Non-AC', capacity: 2 },
  { number: 8, section: 'Non-AC', capacity: 8 },
];

async function main() {
  // ✅ FIX: Clear all prepared statements before doing anything
  try {
    await prisma.$executeRaw`DEALLOCATE ALL;`;
    console.log('✅ Prepared statements cleared');
  } catch (e) {
    console.log('⚠️ Could not clear prepared statements (may not be needed)');
  }

  if (!process.env.QR_SECRET) {
    throw new Error('QR_SECRET is not set in .env — cannot sign QR tokens.');
  }

  // --- Admin ---
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { passwordHash: passwordHash },
    create: { 
      username: 'admin', 
      passwordHash: passwordHash,
      name: 'Restaurant Admin' 
    }
  });
  console.log('✅ Seeded admin login -> username: admin / password: admin123');

  // --- Tables ---
  for (const t of TABLES) {
    const table = await prisma.table.upsert({
      where: { number: t.number },
      update: {},
      create: { 
        number: t.number, 
        section: t.section, 
        capacity: t.capacity, 
        qrToken: `pending-${t.number}` 
      }
    });
    const qrToken = jwt.sign({ tableId: table.id }, process.env.QR_SECRET);
    await prisma.table.update({ 
      where: { id: table.id }, 
      data: { qrToken } 
    });
    console.log(`✅ Table ${t.number}: /table/${qrToken}`);
  }

  // --- Menu ---
  let order = 0;
  for (const group of MENU) {
    const category = await prisma.menuCategory.upsert({
      where: { name: group.category },
      update: {},
      create: { name: group.category, displayOrder: order++ }
    });
    for (const item of group.items) {
      const existing = await prisma.menuItem.findFirst({
        where: { name: item.name, categoryId: category.id }
      });
      if (!existing) {
        await prisma.menuItem.create({ data: { ...item, categoryId: category.id } });
      }
    }
  }
  console.log('✅ Seeded menu categories and items.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });