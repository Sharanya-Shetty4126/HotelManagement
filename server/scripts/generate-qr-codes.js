// server/scripts/generate-qr-codes.js
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ⚠️ Change this to your actual frontend URL
// For local network testing:
const BASE_URL = 'http://192.168.0.144:5173';  // <-- your IP here
// For deployment: 'https://yourdomain.com'

async function generateQRCodes() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' }
    });

    const outputDir = path.join(__dirname, '../../qr-codes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const table of tables) {
      const url = `${BASE_URL}/table/${table.qrToken}`;
      const filePath = path.join(outputDir, `table-${table.number}.png`);

      await QRCode.toFile(filePath, url, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });

      console.log(`✅ Table ${table.number}: ${url}`);
    }

    console.log(`\n📁 QR codes saved in: ${outputDir}`);
  } catch (error) {
    console.error('Error generating QR codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateQRCodes();