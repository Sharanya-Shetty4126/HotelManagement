// server/src/routes/requests.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adminAuth = require('../middleware/adminAuth');
const { notifyAdmin, notifySession } = require('../socket');

const VALID_TYPES = ['WATER', 'CUTLERY', 'NAPKINS', 'EXTRA_PLATES', 'COMPLAINT', 'ASSISTANCE'];

// ============================================================
// Customer: Create a service request / call waiter
// POST /api/requests
// Body: { sessionId, type, description }
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { sessionId, type, description } = req.body;

    if (!sessionId || !type) {
      return res.status(400).json({ error: 'sessionId and type are required' });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid request type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }

    const session = await prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { table: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'CLOSED') {
      return res.status(400).json({ error: 'Cannot raise request for a closed session' });
    }

    const request = await prisma.customerRequest.create({
      data: {
        sessionId,
        type,
        description: description || null,
        raisedAt: new Date(),
        resolved: false
      }
    });

    const payload = {
      ...request,
      tableNumber: session.table.number,
      section: session.table.section
    };

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'customer-request', payload);
    }

    res.status(201).json({ success: true, request: payload });

  } catch (error) {
    console.error('Create customer request error:', error);
    res.status(500).json({ error: 'Failed to submit service request' });
  }
});

// ============================================================
// Customer: Get active requests for current session
// GET /api/requests/session/:sessionId
// ============================================================
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const requests = await prisma.customerRequest.findMany({
      where: { sessionId },
      orderBy: { raisedAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Get session requests error:', error);
    res.status(500).json({ error: 'Failed to get session requests' });
  }
});

// ============================================================
// Admin: Get all requests (active / unresolved first)
// GET /api/requests
// ============================================================
router.get('/', adminAuth, async (req, res) => {
  try {
    const requests = await prisma.customerRequest.findMany({
      include: {
        session: {
          include: { table: true }
        }
      },
      orderBy: [
        { resolved: 'asc' },
        { raisedAt: 'desc' }
      ],
      take: 50
    });

    const shaped = requests.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      tableNumber: r.session.table.number,
      section: r.session.table.section,
      type: r.type,
      description: r.description,
      raisedAt: r.raisedAt,
      resolved: r.resolved,
      resolvedAt: r.resolvedAt
    }));

    res.json(shaped);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// ============================================================
// Admin: Mark request as resolved
// PUT /api/requests/:id/resolve
// ============================================================
router.put('/:id/resolve', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.customerRequest.findUnique({
      where: { id },
      include: { session: { include: { table: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updated = await prisma.customerRequest.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date()
      }
    });

    const io = req.app.get('io');
    if (io) {
      notifyAdmin(io, 'request-resolved', {
        requestId: updated.id,
        tableNumber: existing.session.table.number
      });
      notifySession(io, existing.sessionId, 'request-resolved', {
        requestId: updated.id,
        type: updated.type
      });
    }

    res.json({ success: true, request: updated });

  } catch (error) {
    console.error('Resolve request error:', error);
    res.status(500).json({ error: 'Failed to resolve request' });
  }
});

module.exports = router;
