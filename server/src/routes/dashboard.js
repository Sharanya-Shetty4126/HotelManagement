// server/src/routes/dashboard.js
//
// Bug 4 fix: revenue must be calculated from the database using the real
// completion date of each payment (Bill.confirmedAt), not by summing every
// order ever placed. Nothing here is deleted day to day — each Bill keeps
// its own confirmedAt permanently, so historical days/months can always be
// recomputed. This endpoint is the single source of truth the frontend
// dashboard should read from instead of computing revenue client-side.

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
// ============================================================
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const todayStart = startOfToday();
    const monthStart = startOfMonth();

    const [activeTablesCount, todaysOrders, pendingOrders, todaysPaidBills, monthPaidBills] =
      await Promise.all([
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
        })
      ]);

    const revenueToday = todaysPaidBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const revenueThisMonth = monthPaidBills.reduce((sum, b) => sum + b.grandTotal, 0);

    res.json({
      activeTables: activeTablesCount,
      todaysOrders,
      pendingOrders,
      revenueToday,
      revenueThisMonth
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// ============================================================
// GET /api/dashboard/revenue/daily?days=7  (admin only)
// Optional: a small breakdown for a revenue chart, grouped by calendar
// date using each bill's confirmedAt.
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
      const key = bill.confirmedAt.toISOString().slice(0, 10); // YYYY-MM-DD
      byDate[key] = (byDate[key] || 0) + bill.grandTotal;
    }

    res.json({ days, breakdown: byDate });
  } catch (error) {
    console.error('Get daily revenue error:', error);
    res.status(500).json({ error: 'Failed to get daily revenue' });
  }
});

module.exports = router;