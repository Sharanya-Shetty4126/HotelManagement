const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyQRToken } = require('../utils/qrToken');
const { generateSessionCode } = require('../utils/sessionCode');
const { notifyAdmin } = require('../socket');  // ✅ UNCOMMENTED
const adminAuth = require('../middleware/adminAuth');

// A session still counts as "open"/occupying the table until CLOSED.
const OPEN_SESSION_STATUSES = ['ACTIVE', 'BILL_GENERATED'];

// ============================================================
// CREATE SESSION
// POST /api/session/create
// Always creates a brand new, independent session.
// ============================================================
router.post('/create', async (req, res) => {
  try {
    const { qrToken, guestCount = 1 } = req.body;

    if (!qrToken) {
      return res.status(400).json({ error: 'QR token is required' });
    }

    let decoded;
    try {
      decoded = verifyQRToken(qrToken);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    const sessionCode = await generateSessionCode();
    const session = await prisma.tableSession.create({
      data: {
        tableId: decoded.tableId,
        sessionCode: sessionCode,
        guestCount: guestCount,
        status: 'ACTIVE',
        startedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      sessionId: session.id,
      sessionCode: session.sessionCode,
      existing: false,
      table: { id: decoded.tableId }
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ============================================================
// JOIN SESSION
// POST /api/session/join
// Joins an existing open session (ACTIVE or BILL_GENERATED).
// ============================================================
router.post('/join', async (req, res) => {
  try {
    const { qrToken, sessionCode } = req.body;

    if (!qrToken || !sessionCode) {
      return res.status(400).json({ error: 'QR token and session code are required' });
    }

    let decoded;
    try {
      decoded = verifyQRToken(qrToken);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    const session = await prisma.tableSession.findFirst({
      where: {
        sessionCode: sessionCode,
        tableId: decoded.tableId,
        status: { in: OPEN_SESSION_STATUSES }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await prisma.tableSession.update({
      where: { id: session.id },
      data: { guestCount: { increment: 1 } }
    });

    res.json({
      success: true,
      sessionId: updatedSession.id,
      sessionCode: updatedSession.sessionCode,
      table: { id: decoded.tableId }
    });

  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// ============================================================
// GET SESSION ENTRY (QR scan)
// GET /api/session/entry/:qrToken
// ============================================================
router.get('/entry/:qrToken', async (req, res) => {
  try {
    const { qrToken } = req.params;

    let decoded;
    try {
      decoded = verifyQRToken(qrToken);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    const table = await prisma.table.findUnique({
      where: { id: decoded.tableId },
      include: {
        sessions: {
          where: { status: { in: OPEN_SESSION_STATUSES } },
          include: { orders: true }
        }
      }
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({
      table: {
        id: table.id,
        number: table.number,
        section: table.section,
        capacity: table.capacity
      },
      activeSessions: table.sessions.map(session => ({
        id: session.id,
        startedAt: session.startedAt,
        guestCount: session.guestCount,
        sessionCode: session.sessionCode,
        orderCount: session.orders.length
      }))
    });

  } catch (error) {
    console.error('Session entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// GET SESSION BY ID (full session detail)
// GET /api/session/:sessionId
// ============================================================
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        table: true,
        orders: {
          include: { items: true },
          orderBy: { placedAt: 'asc' }
        },
        bill: true,
        requests: { orderBy: { raisedAt: 'desc' } }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      id: session.id,
      sessionCode: session.sessionCode,
      status: session.status,
      startedAt: session.startedAt,
      guestCount: session.guestCount,
      tableNumber: session.table.number,
      table: {
        id: session.table.id,
        number: session.table.number,
        section: session.table.section
      },
      orders: session.orders,
      bill: session.bill,
      requests: session.requests
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session details' });
  }
});

// ============================================================
// GENERATE BILL
// POST /api/session/:sessionId/bill
// ============================================================
router.post('/:sessionId/bill', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        orders: { include: { items: true } },
        table: true,
        bill: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'CLOSED') {
      return res.status(400).json({ error: 'Session is already closed' });
    }

    if (session.bill) {
      return res.status(200).json({ success: true, bill: session.bill });
    }

    const subtotal = session.orders.reduce((sum, order) => {
      return sum + (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
    }, 0);

    const tax = Math.round(subtotal * 0.05);
    const serviceCharge = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + tax + serviceCharge;

    const bill = await prisma.bill.create({
      data: {
        sessionId: sessionId,
        total: subtotal,
        tax: tax,
        serviceCharge: serviceCharge,
        grandTotal: grandTotal,
        generatedAt: new Date()
      }
    });

    await prisma.tableSession.update({
      where: { id: sessionId },
      data: { status: 'BILL_GENERATED' }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'bill-notification', {
        bill,
        sessionId,
        tableNumber: session.table.number,
        sound: 'bill-requested.mp3'
      });
    }

    res.status(201).json({ success: true, bill });

  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({ error: 'Failed to generate bill' });
  }
});

// ============================================================
// CONFIRM PAYMENT & CLOSE SESSION (admin only)
// PUT /api/session/:sessionId/pay
// ============================================================
router.put('/:sessionId/pay', adminAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { bill: true, table: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.bill) {
      return res.status(400).json({ error: 'Bill not generated yet' });
    }

    if (session.bill.paymentConfirmed) {
      return res.status(400).json({ error: 'Payment already confirmed' });
    }

    const confirmedAt = new Date();

    const updatedBill = await prisma.bill.update({
      where: { sessionId: sessionId },
      data: {
        paymentConfirmed: true,
        confirmedAt
      }
    });

    await prisma.tableSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        endedAt: confirmedAt
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('payment-confirmed', {
        sessionId,
        tableNumber: session.table.number,
        bill: updatedBill
      });
    }

    res.json({
      success: true,
      bill: updatedBill,
      message: 'Payment confirmed and session closed'
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

module.exports = router;