// server/scripts/generate-qr-codes.js
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Live Render deployment URL or custom BASE_URL
const BASE_URL = process.env.BASE_URL || "https://hotelmanagement-2qak.onrender.com";

async function generateQRCodes() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' }
    });

    const outputDir = path.join(__dirname, '../../qr-codes');
    const publicDir = path.join(__dirname, '../public/qr-codes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    for (const table of tables) {
      const url = `${BASE_URL}/table/${table.qrToken}`;
      const filePath = path.join(outputDir, `table-${table.number}.png`);
      const publicFilePath = path.join(publicDir, `table-${table.number}.png`);

      await QRCode.toFile(filePath, url, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });

      // Also copy to public directory for direct download/viewing in web app
      fs.copyFileSync(filePath, publicFilePath);

      console.log(`✅ Table ${table.number}: ${url}`);
    }

    console.log(`\n📁 QR codes saved in: ${outputDir} and ${publicDir}`);
  } catch (error) {
    console.error('Error generating QR codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateQRCodes();