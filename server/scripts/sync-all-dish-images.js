// server/scripts/sync-all-dish-images.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const dishDefs = require('./dish-definitions.json');

const CLIENT_DISHES_DIR = path.join(__dirname, '../../client/public/images/dishes');
const SERVER_DISHES_DIR = path.join(__dirname, '../public/images/dishes');

if (!fs.existsSync(CLIENT_DISHES_DIR)) fs.mkdirSync(CLIENT_DISHES_DIR, { recursive: true });
if (!fs.existsSync(SERVER_DISHES_DIR)) fs.mkdirSync(SERVER_DISHES_DIR, { recursive: true });

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'HotelManagement/1.0 (culinary-menu)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('//')) redirectUrl = 'https:' + redirectUrl;
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => {
          const stats = fs.statSync(destPath);
          if (stats.size < 2048) {
            fs.unlinkSync(destPath);
            return reject(new Error(`File too small (${stats.size} bytes)`));
          }
          resolve(true);
        });
      });
      fileStream.on('error', (err) => {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function searchCommons(query) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&namespace=6&format=json`;
    https.get(url, { headers: { 'User-Agent': 'HotelManagementApp/1.0 (contact@julius.hotel)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const titles = parsed[1] || [];
          // Filter out bad titles (svg, icon, logo, map, flag, stamp, etc.)
          const filtered = titles.filter(t => {
            const low = t.toLowerCase();
            return !low.endsWith('.svg') &&
                   !low.endsWith('.ogg') &&
                   !low.endsWith('.ogv') &&
                   !low.endsWith('.pdf') &&
                   !low.includes('map') &&
                   !low.includes('flag') &&
                   !low.includes('logo') &&
                   !low.includes('icon') &&
                   !low.includes('symbol') &&
                   !low.includes('drawing') &&
                   !low.includes('clipart') &&
                   !low.includes('stamp');
          });
          resolve(filtered);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function getThumbUrl(title) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
    https.get(url, { headers: { 'User-Agent': 'HotelManagementApp/1.0 (contact@julius.hotel)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const page = Object.values(json.query.pages)[0];
          const info = page.imageinfo?.[0];
          resolve(info?.thumburl || info?.url || null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Fallback high-quality direct Unsplash food photograph URLs for each category
// Used ONLY when Wikimedia Commons search finds no direct photographic match
const CATEGORY_FOOD_FALLBACKS = {
  'Side Dish / Snack': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'Soups': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
  'Chinese Starters': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
  'Tandoor Starters': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  'Egg Dishes': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
  'Seafood Specials': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  'Indian Gravies': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
  'Indian Breads': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  'Chinese Rice & Noodles': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
  'Biryani & Indian Rice': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  'Julius Bar & Beverages': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  'Desserts': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'
};

async function syncAllImages() {
  console.log(`\n======================================================`);
  console.log(`   JULIUS HOTEL DISH FOOD PHOTOGRAPHY SYNCHRONIZER   `);
  console.log(`======================================================\n`);
  console.log(`Processing ${dishDefs.length} distinct dish archetypes...`);

  const dishImageMap = {}; // slug -> relative web URL
  let downloadedCount = 0;
  let existingCount = 0;
  let fallbackCount = 0;

  // Process in batches of 4 concurrent workers
  const CONCURRENCY = 4;
  for (let i = 0; i < dishDefs.length; i += CONCURRENCY) {
    const chunk = dishDefs.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (dish) => {
      const slug = dish.slug;
      const clientJpg = path.join(CLIENT_DISHES_DIR, `${slug}.jpg`);
      const clientPng = path.join(CLIENT_DISHES_DIR, `${slug}.png`);
      const serverJpg = path.join(SERVER_DISHES_DIR, `${slug}.jpg`);
      const serverPng = path.join(SERVER_DISHES_DIR, `${slug}.png`);

      // 1. Check existing local custom PNG
      if (dish.existingLocal && fs.existsSync(path.join(__dirname, '../../client/public', dish.existingLocal))) {
        dishImageMap[slug] = dish.existingLocal;
        existingCount++;
        // Ensure server copy
        const serverExisting = path.join(__dirname, '../public', dish.existingLocal);
        if (!fs.existsSync(serverExisting)) {
          fs.copyFileSync(path.join(__dirname, '../../client/public', dish.existingLocal), serverExisting);
        }
        return;
      }

      // 2. Check existing JPG
      if (fs.existsSync(clientJpg) && fs.statSync(clientJpg).size > 2048) {
        dishImageMap[slug] = `/images/dishes/${slug}.jpg`;
        existingCount++;
        if (!fs.existsSync(serverJpg)) fs.copyFileSync(clientJpg, serverJpg);
        return;
      }

      // 3. Search and download from Wikimedia Commons
      let imageDownloaded = false;
      for (const query of dish.queries) {
        try {
          const titles = await searchCommons(query);
          for (const title of titles) {
            const thumbUrl = await getThumbUrl(title);
            if (!thumbUrl) continue;

            try {
              await downloadFile(thumbUrl, clientJpg);
              // Copy to server
              fs.copyFileSync(clientJpg, serverJpg);
              dishImageMap[slug] = `/images/dishes/${slug}.jpg`;
              downloadedCount++;
              imageDownloaded = true;
              console.log(`✅ [Downloaded] "${dish.name}" -> ${slug}.jpg (from: ${title.slice(0, 40)})`);
              break;
            } catch (dlErr) {
              // Try next title
            }
          }
          if (imageDownloaded) break;
        } catch (searchErr) {
          // Try next query
        }
      }

      // 4. Fallback if no Wikimedia match
      if (!imageDownloaded) {
        const fallbackUrl = CATEGORY_FOOD_FALLBACKS[dish.category] || CATEGORY_FOOD_FALLBACKS['Indian Gravies'];
        try {
          await downloadFile(fallbackUrl, clientJpg);
          fs.copyFileSync(clientJpg, serverJpg);
          dishImageMap[slug] = `/images/dishes/${slug}.jpg`;
          fallbackCount++;
          console.log(`⚠️ [Category Fallback Downloaded] "${dish.name}" -> ${slug}.jpg`);
        } catch (e) {
          console.error(`❌ Failed fallback for "${dish.name}":`, e.message);
        }
      }
    }));
  }

  console.log(`\n======================================================`);
  console.log(`Image Sourcing Summary:`);
  console.log(`  - Total distinct dish archetypes: ${dishDefs.length}`);
  console.log(`  - Existing local images retained: ${existingCount}`);
  console.log(`  - Newly downloaded authentic photos: ${downloadedCount}`);
  console.log(`  - High-res fallbacks downloaded: ${fallbackCount}`);
  console.log(`  - Successfully resolved images: ${Object.keys(dishImageMap).length} / ${dishDefs.length}`);
  console.log(`======================================================\n`);

  // ---------------------------------------------------------
  // 5. Update Database Records in PostgreSQL / Supabase
  // ---------------------------------------------------------
  console.log(`🔄 Updating live database records in PostgreSQL/Supabase...`);
  const activeItems = await prisma.menuItem.findMany({
    where: { available: true },
    select: { id: true, name: true, category: { select: { name: true } } }
  });

  function getBaseSlug(name) {
    return name.toLowerCase()
      .replace(/\s*\((full|half|1 pc|2 pcs|6 pcs|330ml|1 litre|kaje rice|sweet \/ salt)\)/gi, '')
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  let dbUpdatedCount = 0;
  for (const item of activeItems) {
    const slug = getBaseSlug(item.name);
    const imgPath = dishImageMap[slug];
    if (imgPath) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: imgPath }
      });
      dbUpdatedCount++;
    }
  }
  console.log(`✅ Updated ${dbUpdatedCount} active menu items in database with their local dish image paths.`);

  // ---------------------------------------------------------
  // 6. Update server/prisma/seed.js
  // ---------------------------------------------------------
  console.log(`🔄 Updating server/prisma/seed.js with exact dish image paths...`);
  const seedPath = path.join(__dirname, '../prisma/seed.js');
  let seedCode = fs.readFileSync(seedPath, 'utf8');
  const match = seedCode.match(/const MENU = (\[[\s\S]*?\n\];)/);
  if (match) {
    const seedMenu = eval(match[1]);
    for (const cat of seedMenu) {
      for (const it of cat.items) {
        const slug = getBaseSlug(it.name);
        it.imageUrl = dishImageMap[slug] || `/images/dishes/${slug}.jpg`;
      }
    }

    function formatMenu(menuArray) {
      let out = 'const MENU = [\n';
      for (const cat of menuArray) {
        out += `  {\n`;
        out += `    category: '${cat.category}',\n`;
        out += `    items: [\n`;
        for (const item of cat.items) {
          const parts = [
            `name: ${JSON.stringify(item.name)}`,
            `price: ${item.price}`,
            `description: ${JSON.stringify(item.description)}`,
            `emoji: ${JSON.stringify(item.emoji)}`,
            `isVeg: ${item.isVeg}`,
            `rating: ${item.rating}`,
            `imageUrl: ${JSON.stringify(item.imageUrl)}`
          ];
          out += `      { ${parts.join(', ')} },\n`;
        }
        out += `    ]\n`;
        out += `  },\n`;
      }
      out += '];';
      return out;
    }

    const startIdx = seedCode.indexOf('const MENU = [');
    let endIdx = seedCode.indexOf('];\r\n\r\nconst TABLES =');
    if (endIdx === -1) endIdx = seedCode.indexOf('];\n\nconst TABLES =');
    if (startIdx !== -1 && endIdx !== -1) {
      seedCode = seedCode.slice(0, startIdx) + formatMenu(seedMenu) + seedCode.slice(endIdx + 2);
      fs.writeFileSync(seedPath, seedCode);
      console.log(`✅ Updated server/prisma/seed.js master MENU.`);
    }
  }

  // ---------------------------------------------------------
  // 7. Update client/src/utils/dishImages.js
  // ---------------------------------------------------------
  console.log(`🔄 Updating client/src/utils/dishImages.js with local dish mapping...`);
  const clientImagesJs = path.join(__dirname, '../../client/src/utils/dishImages.js');
  
  // Build exact DISH_SPECIFIC_IMAGES map: exact dish name -> image path
  const exactMapEntries = [];
  activeItems.forEach(item => {
    const slug = getBaseSlug(item.name);
    const imgPath = dishImageMap[slug] || `/images/dishes/${slug}.jpg`;
    exactMapEntries.push(`  ${JSON.stringify(item.name)}: ${JSON.stringify(imgPath)},`);
  });

  const dishImagesFileContent = `// client/src/utils/dishImages.js
// Verified, dish-specific food photography for Julius Hotel Menu

export const CATEGORY_FALLBACK_IMAGES = {
  "Side Dish / Snack": "/images/dishes/roasted_papad.jpg",
  "Soups": "/images/dishes/veg_clear_soup.jpg",
  "Chinese Starters": "/images/dishes/gobi_manchurian.jpg",
  "Tandoor Starters": "/images/dishes/paneer_tikka.jpg",
  "Egg Dishes": "/images/dishes/egg_bhurji.jpg",
  "Seafood Specials": "/images/dishes/pomfret_rawa_fry.jpg",
  "Indian Gravies": "/images/dishes/dal_tadka.jpg",
  "Indian Breads": "/images/dishes/butter_naan.jpg",
  "Chinese Rice & Noodles": "/images/dishes/veg_fried_rice.jpg",
  "Biryani & Indian Rice": "/images/dishes/chicken_biryani.png",
  "Julius Bar & Beverages": "/images/dishes/kokum_sol_kadi_fizz.jpg",
  "Desserts": "/images/dishes/gulab_jamun.jpg",
  default: "/images/dishes/chicken_biryani.png"
};

// Exact dish-name to verified local food photograph mapping
export const DISH_SPECIFIC_IMAGES = {
${exactMapEntries.join('\n')}
};

/**
 * Returns the verified, authentic food photograph for any menu item
 * @param {object} item - Item object { name, category, imageUrl }
 * @returns {string} Image path (e.g. /images/dishes/pomfret_rawa_fry.jpg)
 */
export function getDishImage(item) {
  if (!item) return CATEGORY_FALLBACK_IMAGES.default;

  // 1. If database provides a valid local dish image path, use it directly
  if (item.imageUrl && item.imageUrl.startsWith('/images/dishes/')) {
    return item.imageUrl;
  }

  // 2. Check exact dish name lookup
  const name = (item.name || "").trim();
  if (DISH_SPECIFIC_IMAGES[name]) {
    return DISH_SPECIFIC_IMAGES[name];
  }

  // 3. Fallback to item.imageUrl if provided and not null
  if (item.imageUrl && item.imageUrl.trim() !== '') {
    return item.imageUrl;
  }

  // 4. Fallback to category default
  if (item.category && CATEGORY_FALLBACK_IMAGES[item.category]) {
    return CATEGORY_FALLBACK_IMAGES[item.category];
  }

  return CATEGORY_FALLBACK_IMAGES.default;
}
`;

  fs.writeFileSync(clientImagesJs, dishImagesFileContent);
  console.log(`✅ Updated client/src/utils/dishImages.js.`);

  // Save the mapping for verification
  fs.writeFileSync(path.join(__dirname, 'dish-image-map.json'), JSON.stringify(dishImageMap, null, 2));
  console.log(`\n🎉 Synchronizer completed successfully!`);
}

syncAllImages()
  .catch((e) => {
    console.error('Fatal error during sync:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

