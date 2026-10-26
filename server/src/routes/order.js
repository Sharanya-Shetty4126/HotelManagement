// server/src/routes/order.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { notifyAdmin, notifySession } = require('../socket');
const adminAuth = require('../middleware/adminAuth');

function deriveOrderStatus(items) {
  if (!items || items.length === 0) return 'PENDING';
  if (items.every((i) => i.status === 'SERVED')) return 'SERVED';
  return 'PENDING';
}

// ============================================================
// Customer: Place a new order
// POST /api/order
// Body: { sessionId, items: [{ id, name, price, quantity }], specialInstructions }
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

    if (session.status === 'CLOSED') {
      return res.status(400).json({ error: 'Cannot place orders for a closed session' });
    }

    // Calculate total from items
    const total = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1), 0);

    const order = await prisma.order.create({
      data: {
        sessionId,
        total,
        specialInstructions: specialInstructions || null,
        items: {
          create: items.map((i) => ({
            menuItemId: parseInt(i.id),
            name: i.name,
            price: parseFloat(i.price),
            quantity: parseInt(i.quantity) || 1,
            status: 'PENDING'
          }))
        }
      },
      include: { items: true }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'order-notification', {
        order: {
          ...order,
          tableNumber: session.table.number,
          section: session.table.section
        }
      });
      notifySession(io, sessionId, 'order-placed', { order });
    }

    res.status(201).json({ success: true, order });

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// ============================================================
// Admin: Get all orders
// GET /api/order
// ============================================================
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        session: { include: { table: true } }
      },
      orderBy: { placedAt: 'desc' }
    });

    const shaped = orders.map((order) => ({
      id: order.id,
      sessionId: order.sessionId,
      tableNumber: order.session?.table?.number || 'N/A',
      section: order.session?.table?.section || '',
      placedAt: order.placedAt,
      status: order.status,
      total: order.total,
      specialInstructions: order.specialInstructions,
      items: order.items
    }));

    res.json(shaped);

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ============================================================
// Admin/Kitchen: Update item status
// PUT /api/order/item/:itemId/status
// Body: { status: 'PENDING' | 'SERVED' }
// ============================================================
router.put('/item/:itemId/status', adminAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'SERVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status }
    });

    const order = await prisma.order.findUnique({
      where: { id: updatedItem.orderId },
      include: { items: true, session: { include: { table: true } } }
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
        status: updatedItem.status,
        overallStatus: newOrderStatus
      });
      notifyAdmin(io, 'order-update', {
        orderId: order.id,
        itemId: updatedItem.id,
        status: updatedItem.status,
        overallStatus: newOrderStatus,
        tableNumber: order.session?.table?.number
      });
    }

    res.json({ success: true, item: updatedItem, orderStatus: newOrderStatus });

  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

// ============================================================
// Customer: Cancel an order (Allowed only when PENDING and within 5 minutes)
// DELETE /api/order/:orderId
// ============================================================
router.delete('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        session: { include: { table: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.session?.status === 'CLOSED') {
      return res.status(400).json({ error: 'Cannot cancel an order for a closed table session' });
    }

    // Check status: only PENDING orders can be cancelled
    const hasServedItems = order.items.some((i) => i.status === 'SERVED');
    if (order.status === 'SERVED' || hasServedItems) {
      return res.status(400).json({ error: 'Cannot cancel order because items have already been served' });
    }

    const isAdmin = req.query.admin === 'true' || Boolean(req.headers.authorization);

    // Check 5-minute time window (300,000 milliseconds) for customer cancellation
    const placedTime = new Date(order.placedAt).getTime();
    const elapsedMinutes = (Date.now() - placedTime) / (1000 * 60);

    if (!isAdmin && elapsedMinutes > 5) {
      return res.status(400).json({
        error: `Cancellation window expired. Orders can only be cancelled within 5 minutes of placing them (placed ${Math.floor(elapsedMinutes)}m ago).`
      });
    }

    // Delete associated order items, then the order itself
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id }
    });

    await prisma.order.delete({
      where: { id: order.id }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'order-cancelled', {
        orderId: order.id,
        sessionId: order.sessionId,
        tableNumber: order.session?.table?.number,
        message: `Order #${order.id.slice(-6)} from Table ${order.session?.table?.number} was cancelled by guest.`
      });
      notifyAdmin(io, 'order-update', {
        orderId: order.id,
        cancelled: true,
        tableNumber: order.session?.table?.number
      });
      notifySession(io, order.sessionId, 'order-cancelled', {
        orderId: order.id,
        message: 'Order cancelled successfully'
      });
      notifyAdmin(io, 'table-updated', { tableId: order.session?.tableId });
    }

    res.json({
      success: true,
      message: `Order #${order.id.slice(-6)} cancelled successfully`
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// ============================================================
// Customer: Cancel an individual item in an order (within 5 minutes & if PENDING)
// DELETE /api/order/item/:itemId
// ============================================================
router.delete('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        order: {
          include: {
            items: true,
            session: { include: { table: true } }
          }
        }
      }
    });

    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    const order = orderItem.order;

    if (order.session?.status === 'CLOSED') {
      return res.status(400).json({ error: 'Cannot cancel item for a closed table session' });
    }

    if (orderItem.status === 'SERVED') {
      return res.status(400).json({ error: 'Cannot cancel item because it has already been served' });
    }

    const isAdmin = req.query.admin === 'true' || Boolean(req.headers.authorization);

    // Check 5-minute time window for customer cancellation
    const placedTime = new Date(order.placedAt).getTime();
    const elapsedMinutes = (Date.now() - placedTime) / (1000 * 60);

    if (!isAdmin && elapsedMinutes > 5) {
      return res.status(400).json({
        error: `Cancellation window expired. Items can only be cancelled within 5 minutes of placing them (placed ${Math.floor(elapsedMinutes)}m ago).`
      });
    }

    const remainingItems = order.items.filter((i) => i.id !== itemId);

    // If this was the only item in the order, delete the whole order
    if (remainingItems.length === 0) {
      await prisma.orderItem.delete({ where: { id: itemId } });
      await prisma.order.delete({ where: { id: order.id } });

      const io = req.app.get('io');
      if (io) {
        notifyAdmin(io, 'order-cancelled', {
          orderId: order.id,
          sessionId: order.sessionId,
          tableNumber: order.session?.table?.number,
          message: `${orderItem.name} (${orderItem.quantity}x) was cancelled from Table ${order.session?.table?.number}.`
        });
        notifyAdmin(io, 'order-update', {
          orderId: order.id,
          cancelled: true,
          tableNumber: order.session?.table?.number
        });
        notifySession(io, order.sessionId, 'order-cancelled', {
          orderId: order.id,
          itemId,
          message: `${orderItem.name} cancelled successfully`
        });
        notifyAdmin(io, 'table-updated', { tableId: order.session?.tableId });
      }

      return res.json({
        success: true,
        orderDeleted: true,
        message: `${orderItem.name} cancelled and order removed.`
      });
    }

    // Otherwise delete the item and recalculate order total
    await prisma.orderItem.delete({ where: { id: itemId } });
    const newTotal = remainingItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    await prisma.order.update({
      where: { id: order.id },
      data: { total: newTotal }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'order-update', {
        orderId: order.id,
        tableNumber: order.session?.table?.number,
        message: `${orderItem.name} (${orderItem.quantity}x) was cancelled from Table ${order.session?.table?.number}.`
      });
      notifySession(io, order.sessionId, 'order-update', {
        orderId: order.id,
        itemId,
        message: `${orderItem.name} cancelled successfully`
      });
      notifyAdmin(io, 'table-updated', { tableId: order.session?.tableId });
    }

    res.json({
      success: true,
      orderDeleted: false,
      newTotal,
      message: `${orderItem.name} cancelled successfully.`
    });

  } catch (error) {
    console.error('Cancel order item error:', error);
    res.status(500).json({ error: 'Failed to cancel order item' });
  }
});

module.exports = router;