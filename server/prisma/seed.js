// server/prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Authentic Coastal Karnataka, Seafood & Bar Menu for Julius Honnavar
const MENU = [
  {
    category: 'Coastal Starters & Fries',
    items: [
      { name: 'Anjal (Kingfish) Rava Fry', price: 380, description: 'Crisp semolina-crusted coastal kingfish with Byadgi chili marinade', emoji: '🐟', isVeg: false, rating: 4.9 },
      { name: 'Prawns Ghee Roast', price: 360, description: 'Kundapura-style slow-roasted tiger prawns in clarified spiced ghee', emoji: '🦐', isVeg: false, rating: 4.8 },
      { name: 'Squid Pepper Garlic', price: 320, description: 'Fresh Arabian Sea squid tossed in crushed coastal black pepper and garlic', emoji: '🦑', isVeg: false, rating: 4.6 },
      { name: 'Surmai Tawa Fry', price: 350, description: 'Pan-fried seer fish steaks steeped in coastal masala and lime', emoji: '🐠', isVeg: false, rating: 4.7 },
      { name: 'Paneer Ghee Roast', price: 260, description: 'Fresh paneer cubes roasted in authentic Byadgi chili and ghee paste', emoji: '🧀', isVeg: true, rating: 4.5 },
      { name: 'Cashew / Kaju Pakoda', price: 180, description: 'Golden fried coastal cashews with curry leaves and sea salt', emoji: '🥜', isVeg: true, rating: 4.4 },
    ]
  },
  {
    category: 'Coastal Mains & Curries',
    items: [
      { name: 'Mangalorean Fish Curry', price: 390, description: 'Fresh fish simmered in freshly ground coconut, teppal & tamarind gravy', emoji: '🍛', isVeg: false, rating: 4.9 },
      { name: 'Kori Rotti & Kori Gassi', price: 340, description: 'Crispy sun-dried rice wafers served with rich coastal chicken curry', emoji: '🍗', isVeg: false, rating: 4.8 },
      { name: 'Prawns Biryani', price: 380, description: 'Fragrant Jeerakasala rice layered with spiced prawns and caramelized onions', emoji: '🍚', isVeg: false, rating: 4.7 },
      { name: 'Mud Crab Sukka', price: 420, description: 'Fresh estuary crab tossed with roasted grated coconut and coastal spices', emoji: '🦀', isVeg: false, rating: 4.8 },
      { name: 'Chicken Sukka', price: 310, description: 'Traditional dry coastal chicken with roasted coconut and aromatics', emoji: '🥘', isVeg: false, rating: 4.6 },
      { name: 'Paneer Kundapura Curry', price: 280, description: 'Cottage cheese in silky coconut and coriander seed curry', emoji: '🍲', isVeg: true, rating: 4.3 },
    ]
  },
  {
    category: 'Coastal Breads & Rice',
    items: [
      { name: 'Neer Dosa (3 pcs)', price: 80, description: 'Cloud-light, melt-in-mouth coastal rice crepes', emoji: '🥞', isVeg: true, rating: 4.9 },
      { name: 'Appam (2 pcs)', price: 90, description: 'Fermented rice pancakes with soft spongy center and crispy lace edges', emoji: '🫓', isVeg: true, rating: 4.7 },
      { name: 'Coastal Boiled Rice (Kaje Rice)', price: 90, description: 'Traditional wholesome coastal red rice', emoji: '🍚', isVeg: true, rating: 4.5 },
      { name: 'Butter Garlic Naan', price: 70, description: 'Fresh tandoor flatbread with churned butter and garlic', emoji: '🥖', isVeg: true, rating: 4.4 },
    ]
  },
  {
    category: 'Julius Bar & Beverages',
    items: [
      { name: 'Honnavar Toddy Punch', price: 280, description: 'Signature tropical punch with tender coconut, lime, mint and coastal herbs', emoji: '🍹', isVeg: true, rating: 4.8 },
      { name: 'Kokum Sol Kadi Fizz', price: 140, description: 'Digestive kokum fruit infusion with roasted cumin and coconut milk', emoji: '🍸', isVeg: true, rating: 4.9 },
      { name: 'Alphonso Mango Mule', price: 220, description: 'Ripe coastal mango puree with a hint of chili and ginger fizz', emoji: '🥭', isVeg: true, rating: 4.6 },
      { name: 'Fresh Tender Coconut (Elaneer)', price: 90, description: 'Chilled sweet coastal coconut water served fresh', emoji: '🥥', isVeg: true, rating: 4.7 },
    ]
  },
  {
    category: 'Desserts',
    items: [
      { name: 'Honnavar Gadbad', price: 160, description: 'Layered coastal classic with jelly, dry fruits, fresh fruit and three ice cream scoops', emoji: '🍨', isVeg: true, rating: 4.9 },
      { name: 'Elaneer Payasam', price: 140, description: 'Silky tender coconut pulp pudding simmered with cardamom and milk', emoji: '🍮', isVeg: true, rating: 4.8 },
    ]
  }
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
  try {
    await prisma.$executeRaw`DEALLOCATE ALL;`;
    console.log('✅ Prepared statements cleared');
  } catch (e) {
    // May not be needed on non-pooler connections
  }

  const qrSecret = process.env.QR_SECRET || 'hotel-management-qr-secret-key-2026';

  // --- Admin ---
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { passwordHash: passwordHash },
    create: {
      username: 'admin',
      passwordHash: passwordHash,
      name: 'Julius Restaurant Manager'
    }
  });
  console.log('✅ Seeded admin login -> username: admin / password: admin123');

  // --- Tables ---
  for (const t of TABLES) {
    const table = await prisma.table.upsert({
      where: { number: t.number },
      update: { section: t.section, capacity: t.capacity },
      create: {
        number: t.number,
        section: t.section,
        capacity: t.capacity,
        qrToken: `pending-${t.number}`
      }
    });

    const qrToken = jwt.sign({ tableId: table.id }, qrSecret);
    await prisma.table.update({
      where: { id: table.id },
      data: { qrToken }
    });
    console.log(`✅ Table ${t.number} (${t.section}): /table/${qrToken}`);
  }

  // --- Menu ---
  let order = 0;
  for (const group of MENU) {
    const category = await prisma.menuCategory.upsert({
      where: { name: group.category },
      update: { displayOrder: order++ },
      create: { name: group.category, displayOrder: order++ }
    });

    for (const item of group.items) {
      const existing = await prisma.menuItem.findFirst({
        where: { name: item.name, categoryId: category.id }
      });
      if (!existing) {
        await prisma.menuItem.create({ data: { ...item, categoryId: category.id } });
      } else {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data: { price: item.price, description: item.description, emoji: item.emoji, rating: item.rating }
        });
      }
    }
  }
  console.log('✅ Seeded Julius coastal menu categories and items.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });