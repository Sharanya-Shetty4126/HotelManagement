// server/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const adminAuth = require('../middleware/adminAuth');

const prisma = new PrismaClient();

const OPEN_SESSION_STATUSES = ['ACTIVE', 'BILL_GENERATED'];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============================================================
// GET /api/dashboard/stats  (admin only)
// Single source of truth for dashboard metrics
// ============================================================
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const todayStart = startOfToday();
    const monthStart = startOfMonth();

    const [
      activeTablesCount,
      todaysOrdersCount,
      pendingOrdersCount,
      todaysPaidBills,
      monthPaidBills,
      unresolvedRequestsCount,
      recentOrders
    ] = await Promise.all([
      prisma.table.count({
        where: { sessions: { some: { status: { in: OPEN_SESSION_STATUSES } } } }
      }),
      prisma.order.count({
        where: { placedAt: { gte: todayStart } }
      }),
      prisma.order.count({
        where: { status: 'PENDING' }
      }),
      prisma.bill.findMany({
        where: { paymentConfirmed: true, confirmedAt: { gte: todayStart } },
        select: { grandTotal: true }
      }),
      prisma.bill.findMany({
        where: { paymentConfirmed: true, confirmedAt: { gte: monthStart } },
        select: { grandTotal: true }
      }),
      prisma.customerRequest.count({
        where: { resolved: false }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { placedAt: 'desc' },
        include: {
          items: true,
          session: { include: { table: true } }
        }
      })
    ]);

    const revenueToday = todaysPaidBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const revenueThisMonth = monthPaidBills.reduce((sum, b) => sum + b.grandTotal, 0);

    const shapedRecentOrders = recentOrders.map((o) => ({
      id: o.id,
      sessionId: o.sessionId,
      tableNumber: o.session?.table?.number || 'N/A',
      placedAt: o.placedAt,
      status: o.status,
      total: o.total,
      items: o.items
    }));

    res.json({
      activeTables: activeTablesCount,
      todaysOrders: todaysOrdersCount,
      pendingOrders: pendingOrdersCount,
      unresolvedRequests: unresolvedRequestsCount,
      revenueToday,
      revenueThisMonth,
      recentOrders: shapedRecentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// ============================================================
// GET /api/dashboard/revenue/daily?days=7  (admin only)
// ============================================================
router.get('/revenue/daily', adminAuth, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 90);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const bills = await prisma.bill.findMany({
      where: { paymentConfirmed: true, confirmedAt: { gte: since } },
      select: { grandTotal: true, confirmedAt: true }
    });

    const byDate = {};
    for (const bill of bills) {
      if (bill.confirmedAt) {
        const key = bill.confirmedAt.toISOString().slice(0, 10);
        byDate[key] = (byDate[key] || 0) + bill.grandTotal;
      }
    }

    res.json({ days, breakdown: byDate });
  } catch (error) {
    console.error('Get daily revenue error:', error);
    res.status(500).json({ error: 'Failed to get daily revenue' });
  }
});

module.exports = router;