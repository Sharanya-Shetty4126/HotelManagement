// server/src/routes/tables.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { generateQRToken } = require('../utils/qrToken');
const { generateSessionCode } = require('../utils/sessionCode');
const adminAuth = require('../middleware/adminAuth');
const { notifyAdmin } = require('../socket');

const router = express.Router();
const prisma = new PrismaClient();

const OPEN_SESSION_STATUSES = ['ACTIVE', 'BILL_GENERATED'];

// ============================================================
// GET all tables with occupancy status and active session info
// GET /api/tables
// ============================================================
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        sessions: {
          where: { status: { in: OPEN_SESSION_STATUSES } },
          include: {
            orders: { include: { items: true } },
            bill: true
          }
        }
      }
    });

    const tablesWithStatus = tables.map((table) => {
      const activeSession = table.sessions.length > 0 ? table.sessions[0] : null;
      let status = 'available';
      if (activeSession) {
        status = activeSession.status === 'BILL_GENERATED' ? 'bill_generated' : 'occupied';
      }

      return {
        id: table.id,
        number: table.number,
        section: table.section,
        capacity: table.capacity,
        qrToken: table.qrToken,
        status: status === 'bill_generated' ? 'occupied' : status,
        occupancyState: status, // 'available' | 'occupied' | 'bill_generated'
        sessionId: activeSession ? activeSession.id : null,
        activeSession: activeSession
          ? {
              id: activeSession.id,
              sessionCode: activeSession.sessionCode,
              status: activeSession.status,
              startedAt: activeSession.startedAt,
              guestCount: activeSession.guestCount,
              orderCount: activeSession.orders.length,
              bill: activeSession.bill
            }
          : null
      };
    });

    res.json(tablesWithStatus);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tables',
      message: error.message,
      code: error.code,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL)
    });
  }
});

// ============================================================
// GET single table by id
// GET /api/tables/:id
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid table ID' });

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        sessions: {
          where: { status: { in: OPEN_SESSION_STATUSES } },
          include: { orders: { include: { items: true } }, bill: true }
        }
      }
    });

    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ error: 'Failed to fetch table' });
  }
});

// ============================================================
// Admin: Create a new table
// POST /api/tables
// Body: { number, section, capacity }
// ============================================================
router.post('/', adminAuth, async (req, res) => {
  try {
    const { number, section, capacity } = req.body;

    if (!number || !section || !capacity) {
      return res.status(400).json({ error: 'number, section, and capacity are required' });
    }

    const tableNum = parseInt(number);
    const capNum = parseInt(capacity);

    const existing = await prisma.table.findUnique({
      where: { number: tableNum }
    });
    if (existing) {
      return res.status(409).json({ error: `Table ${tableNum} already exists` });
    }

    // Create table with placeholder token first
    const table = await prisma.table.create({
      data: {
        number: tableNum,
        section,
        capacity: capNum,
        qrToken: `pending-${tableNum}-${Date.now()}`
      }
    });

    // Sign permanent QR token containing tableId
    const qrToken = generateQRToken(table.id);

    const updatedTable = await prisma.table.update({
      where: { id: table.id },
      data: { qrToken }
    });

    res.status(201).json(updatedTable);
  } catch (error) {
    console.error('Create table error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Table number already exists' });
    }
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// ============================================================
// Admin: Update a table
// PUT /api/tables/:id
// ============================================================
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { number, section, capacity } = req.body;

    const data = {};
    if (number !== undefined) data.number = parseInt(number);
    if (section !== undefined) data.section = section;
    if (capacity !== undefined) data.capacity = parseInt(capacity);

    const table = await prisma.table.update({
      where: { id },
      data
    });
    res.json(table);
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// ============================================================
// Admin: Delete a table
// DELETE /api/tables/:id
// ============================================================
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const openSession = await prisma.tableSession.findFirst({
      where: {
        tableId: id,
        status: { in: OPEN_SESSION_STATUSES }
      }
    });

    if (openSession) {
      return res.status(400).json({ error: 'Cannot delete table with active or pending bill sessions' });
    }

    await prisma.table.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

// ============================================================
// Admin: Manually seat guests / start a session for walk-ins
// POST /api/tables/:id/session
// Body: { guestCount }
// ============================================================
router.post('/:id/session', adminAuth, async (req, res) => {
  try {
    const tableId = parseInt(req.params.id);
    const { guestCount = 2 } = req.body;

    const table = await prisma.table.findUnique({
      where: { id: tableId }
    });
    if (!table) return res.status(404).json({ error: 'Table not found' });

    // Check if table already has an active session
    const existingOpenSession = await prisma.tableSession.findFirst({
      where: {
        tableId,
        status: { in: OPEN_SESSION_STATUSES }
      }
    });

    if (existingOpenSession) {
      return res.status(200).json({
        success: true,
        sessionId: existingOpenSession.id,
        sessionCode: existingOpenSession.sessionCode,
        tableNumber: table.number,
        alreadyActive: true
      });
    }

    const sessionCode = await generateSessionCode();
    const session = await prisma.tableSession.create({
      data: {
        tableId,
        sessionCode,
        guestCount: parseInt(guestCount) || 1,
        status: 'ACTIVE',
        startedAt: new Date()
      }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'session-started', {
        sessionId: session.id,
        tableNumber: table.number,
        sessionCode: session.sessionCode
      });
    }

    res.status(201).json({
      success: true,
      sessionId: session.id,
      sessionCode: session.sessionCode,
      tableNumber: table.number
    });
  } catch (error) {
    console.error('Admin start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

module.exports = router;