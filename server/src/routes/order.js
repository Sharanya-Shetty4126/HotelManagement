const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { notifyAdmin, notifySession } = require('../socket');
const adminAuth = require('../middleware/adminAuth');

function deriveOrderStatus(items) {
  if (items.length === 0) return 'PENDING';
  if (items.every((i) => i.status === 'SERVED')) return 'SERVED';
  if (items.every((i) => i.status === 'READY' || i.status === 'SERVED')) return 'READY';
  if (items.some((i) => i.status !== 'PENDING')) return 'PREPARING';
  return 'PENDING';
}

// ============================================================
// Place a new order (customer)
// POST /api/order
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { sessionId, items, specialInstructions = '' } = req.body;

    if (!sessionId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'sessionId and at least one item are required' });
    }

    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { table: true }
    });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        sessionId,
        total,
        specialInstructions,
        items: {
          create: items.map((i) => ({
            menuItemId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            status: 'PENDING'
          }))
        }
      },
      include: { items: true }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'order-notification', {
        order: { ...order, tableNumber: session.table.number },
        sound: 'order-received.mp3'
      });
    }

    res.status(201).json({ success: true, order });

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// ============================================================
// GET all orders (admin only)
// GET /api/order
// ============================================================
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, session: { include: { table: true } } },
      orderBy: { placedAt: 'desc' }
    });

    const shaped = orders.map((order) => ({
      id: order.id,
      sessionId: order.sessionId,
      tableNumber: order.session.table.number,
      placedAt: order.placedAt,
      status: order.status,
      specialInstructions: order.specialInstructions,
      items: order.items
    }));

    res.json(shaped);

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// ============================================================
// Update order item status (admin/kitchen only)
// PUT /api/order/item/:itemId/status
// ============================================================
router.put('/item/:itemId/status', adminAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status }
    });

    const order = await prisma.order.findUnique({
      where: { id: updatedItem.orderId },
      include: { items: true }
    });

    const newOrderStatus = deriveOrderStatus(order.items);
    if (newOrderStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newOrderStatus }
      });
    }

    const io = req.app.get('io');
    if (io) {
      notifySession(io, order.sessionId, 'order-update', {
        orderId: order.id,
        itemId: updatedItem.id,
        status: updatedItem.status
      });
    }

    res.json({ success: true, item: updatedItem });

  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

module.exports = router;