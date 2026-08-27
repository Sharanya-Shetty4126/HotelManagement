// server/src/routes/tables.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ✅ GET all tables with status
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        sessions: {
          where: { status: 'ACTIVE' },
          include: { orders: true }
        }
      }
    });

    const tablesWithStatus = tables.map(table => ({
      ...table,
      status: table.sessions.length > 0 ? 'occupied' : 'available',
      sessionId: table.sessions.length > 0 ? table.sessions[0].id : null,
      activeSession: table.sessions.length > 0 ? table.sessions[0] : null
    }));

    res.json(tablesWithStatus);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// GET single table by id
router.get('/:id', async (req, res) => {
  try {
    const table = await prisma.table.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ error: 'Failed to fetch table' });
  }
});

// POST create a new table
router.post('/', async (req, res) => {
  try {
    const { number, section, capacity } = req.body;

    const existing = await prisma.table.findUnique({
      where: { number: parseInt(number) }
    });
    if (existing) {
      return res.status(409).json({ error: `Table ${number} already exists` });
    }

    const table = await prisma.table.create({
      data: {
        number: parseInt(number),
        section: section,
        capacity: parseInt(capacity),
        qrToken: `pending-${number}`
      }
    });

    const qrToken = jwt.sign(
      { tableId: table.id },
      process.env.QR_SECRET || 'fallback-secret-key',
      { expiresIn: '365d' }
    );

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

// PUT update a table
router.put('/:id', async (req, res) => {
  try {
    const { number, section, capacity } = req.body;
    const table = await prisma.table.update({
      where: { id: parseInt(req.params.id) },
      data: { number: parseInt(number), section, capacity: parseInt(capacity) }
    });
    res.json(table);
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// DELETE a table
router.delete('/:id', async (req, res) => {
  try {
    const activeSessions = await prisma.tableSession.findFirst({
      where: {
        tableId: parseInt(req.params.id),
        status: 'ACTIVE'
      }
    });

    if (activeSessions) {
      return res.status(400).json({ error: 'Cannot delete table with active sessions' });
    }

    await prisma.table.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

module.exports = router;