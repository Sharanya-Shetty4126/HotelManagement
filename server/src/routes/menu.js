// server/src/routes/menu.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// Get the full menu
// GET /api/menu
// ============================================================
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { items: { where: { available: true } } }
    });

    const items = categories.flatMap((category) =>
      category.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: category.name,
        price: item.price,
        description: item.description,
        emoji: item.emoji,
        isVeg: item.isVeg,
        rating: item.rating
      }))
    );

    res.json({
      items,
      categories: categories.map((c) => c.name)
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Failed to get menu' });
  }
});

module.exports = router;