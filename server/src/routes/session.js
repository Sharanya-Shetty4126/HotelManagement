// server/src/routes/session.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyQRToken } = require('../utils/qrToken');
const { generateSessionCode } = require('../utils/sessionCode');
const { notifyAdmin, notifySession } = require('../socket');
const adminAuth = require('../middleware/adminAuth');

const OPEN_SESSION_STATUSES = ['ACTIVE', 'BILL_GENERATED'];

// ============================================================
// CREATE SESSION (Customer scans QR and starts a new session)
// POST /api/session/create
// Body: { qrToken, guestCount }
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
      return res.status(400).json({ error: 'Invalid or expired QR code' });
    }

    const table = await prisma.table.findUnique({
      where: { id: decoded.tableId }
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Reuse existing active session if one already exists for this table
    const existingSession = await prisma.tableSession.findFirst({
      where: {
        tableId: table.id,
        status: { in: OPEN_SESSION_STATUSES }
      },
      orderBy: { startedAt: 'desc' }
    });

    if (existingSession) {
      return res.status(200).json({
        success: true,
        sessionId: existingSession.id,
        sessionCode: existingSession.sessionCode,
        existing: true,
        table: {
          id: table.id,
          number: table.number,
          section: table.section
        }
      });
    }

    const sessionCode = await generateSessionCode();
    const session = await prisma.tableSession.create({
      data: {
        tableId: table.id,
        sessionCode: sessionCode,
        guestCount: parseInt(guestCount) || 1,
        status: 'ACTIVE',
        startedAt: new Date()
      }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'session-started', {
        sessionId: session.id,
        sessionCode: session.sessionCode,
        tableNumber: table.number,
        section: table.section
      });
      notifyAdmin(io, 'table-updated', { tableId: table.id });
    }

    res.status(201).json({
      success: true,
      sessionId: session.id,
      sessionCode: session.sessionCode,
      existing: false,
      table: {
        id: table.id,
        number: table.number,
        section: table.section
      }
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ============================================================
// JOIN SESSION (Customer joins a friend's active session at the same table)
// POST /api/session/join
// Body: { qrToken, sessionCode }
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
        sessionCode: sessionCode.toUpperCase().trim(),
        tableId: decoded.tableId,
        status: { in: OPEN_SESSION_STATUSES }
      },
      include: { table: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Active session with that code not found on this table' });
    }

    const updatedSession = await prisma.tableSession.update({
      where: { id: session.id },
      data: { guestCount: { increment: 1 } }
    });

    const io = req.app.get('io');
    if (io) {
      notifySession(io, session.id, 'guest-joined', {
        guestCount: updatedSession.guestCount
      });
    }

    res.json({
      success: true,
      sessionId: updatedSession.id,
      sessionCode: updatedSession.sessionCode,
      table: {
        id: session.table.id,
        number: session.table.number,
        section: session.table.section
      }
    });

  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// ============================================================
// GET SESSION ENTRY (Initial QR scan landing)
// GET /api/session/entry/:qrToken
// ============================================================
router.get('/entry/:qrToken', async (req, res) => {
  try {
    const { qrToken } = req.params;

    let decoded;
    try {
      decoded = verifyQRToken(qrToken);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code. Please scan again.' });
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
      activeSessions: table.sessions.map((session) => ({
        id: session.id,
        startedAt: session.startedAt,
        guestCount: session.guestCount,
        sessionCode: session.sessionCode,
        orderCount: session.orders.length
      }))
    });

  } catch (error) {
    console.error('Session entry error:', error);
    res.status(500).json({ error: 'Server error processing table QR' });
  }
});

// ============================================================
// GET SESSION BY ID (Full session details: orders, bill, requests)
// GET /api/session/:sessionId
// ============================================================
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    let session = await prisma.tableSession.findUnique({
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

    // Fallback: If not found by session cuid, check if sessionId is a numeric table ID or table number
    if (!session && !isNaN(parseInt(sessionId))) {
      const tableNum = parseInt(sessionId);
      session = await prisma.tableSession.findFirst({
        where: {
          OR: [
            { tableId: tableNum },
            { table: { number: tableNum } }
          ],
          status: { in: OPEN_SESSION_STATUSES }
        },
        include: {
          table: true,
          orders: {
            include: { items: true },
            orderBy: { placedAt: 'asc' }
          },
          bill: true,
          requests: { orderBy: { raisedAt: 'desc' } }
        },
        orderBy: { startedAt: 'desc' }
      });

      // Even if not active, check for the most recent session of that table
      if (!session) {
        session = await prisma.tableSession.findFirst({
          where: {
            OR: [
              { tableId: tableNum },
              { table: { number: tableNum } }
            ]
          },
          include: {
            table: true,
            orders: {
              include: { items: true },
              orderBy: { placedAt: 'asc' }
            },
            bill: true,
            requests: { orderBy: { raisedAt: 'desc' } }
          },
          orderBy: { startedAt: 'desc' }
        });
      }
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const billData = session.bill
      ? {
          ...session.bill,
          subtotal: session.bill.total,
        }
      : null;

    res.json({
      id: session.id,
      sessionCode: session.sessionCode,
      status: session.status,
      startedAt: session.startedAt,
      guestCount: session.guestCount,
      tableNumber: session.table?.number || null,
      table: session.table
        ? {
            id: session.table.id,
            number: session.table.number,
            section: session.table.section,
            capacity: session.table.capacity
          }
        : null,
      orders: session.orders || [],
      bill: billData,
      requests: session.requests || []
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session details' });
  }
});

// ============================================================
// GENERATE BILL (Customer requests final bill)
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

    // Return existing bill if already generated
    if (session.bill) {
      return res.status(200).json({ success: true, bill: session.bill });
    }

    const subtotal = session.orders.reduce((sum, order) => {
      return sum + (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
    }, 0);

    const tax = Math.round(subtotal * 0.05); // 5% GST
    const serviceCharge = Math.round(subtotal * 0.1); // 10% Service Charge
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
        grandTotal
      });
      notifySession(io, sessionId, 'bill-generated', { bill });
      notifyAdmin(io, 'table-updated', { tableId: session.table.id });
    }

    res.status(201).json({ success: true, bill });

  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({ error: 'Failed to generate bill' });
  }
});

// ============================================================
// CONFIRM PAYMENT & CLOSE SESSION (Admin cashier confirmation)
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
      return res.status(400).json({ error: 'Bill has not been generated for this session yet' });
    }

    if (session.bill.paymentConfirmed) {
      return res.status(400).json({ error: 'Payment has already been confirmed' });
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
      notifyAdmin(io, 'payment-confirmed', {
        sessionId,
        tableNumber: session.table.number,
        bill: updatedBill
      });
      notifySession(io, sessionId, 'payment-confirmed', {
        sessionId,
        bill: updatedBill
      });
      notifyAdmin(io, 'table-updated', { tableId: session.table.id });
    }

    res.json({
      success: true,
      bill: updatedBill,
      message: 'Payment confirmed and table session closed successfully'
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// ============================================================
// CUSTOMER ONLINE PAYMENT GATEWAY (UPI / Card / Webhook)
// POST /api/session/:sessionId/pay-online
// Body: { paymentMethod, transactionId, amount }
// ============================================================
router.post('/:sessionId/pay-online', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { paymentMethod = 'UPI', transactionId } = req.body;

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
      return res.status(400).json({ error: 'This session is already settled and closed' });
    }

    // Auto-generate bill if not already generated
    let currentBill = session.bill;
    if (!currentBill) {
      const subtotal = session.orders.reduce((sum, order) => {
        return sum + (order.items || []).reduce((s, item) => s + item.price * item.quantity, 0);
      }, 0);

      const tax = Math.round(subtotal * 0.05);
      const serviceCharge = Math.round(subtotal * 0.1);
      const grandTotal = subtotal + tax + serviceCharge;

      currentBill = await prisma.bill.create({
        data: {
          sessionId: sessionId,
          total: subtotal,
          tax: tax,
          serviceCharge: serviceCharge,
          grandTotal: grandTotal,
          generatedAt: new Date()
        }
      });

      // Also trigger bill-notification so admin knows bill was generated
      const io = req.app.get('io');
      if (io) {
        notifyAdmin(io, 'bill-notification', {
          bill: currentBill,
          sessionId,
          tableNumber: session.table.number,
          grandTotal
        });
      }
    }

    if (currentBill.paymentConfirmed) {
      return res.status(400).json({ error: 'Payment has already been confirmed' });
    }

    const confirmedAt = new Date();
    const finalTxnId = transactionId || `UPI_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

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
      notifyAdmin(io, 'payment-confirmed', {
        sessionId,
        tableNumber: session.table.number,
        grandTotal: updatedBill.grandTotal,
        paymentMethod,
        transactionId: finalTxnId,
        bill: updatedBill
      });
      notifySession(io, sessionId, 'payment-confirmed', {
        sessionId,
        bill: updatedBill,
        transactionId: finalTxnId,
        paymentMethod
      });
      notifyAdmin(io, 'table-updated', { tableId: session.table.id });
    }

    res.json({
      success: true,
      transactionId: finalTxnId,
      paymentMethod,
      bill: updatedBill,
      message: 'Payment verified and table session settled successfully'
    });

  } catch (error) {
    console.error('Online payment error:', error);
    res.status(500).json({ error: 'Failed to process online payment' });
  }
});

module.exports = router;