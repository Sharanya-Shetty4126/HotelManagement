// server/scripts/test-batch-1.js
const fs = require('fs');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadImage(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

const batch1 = {
  "honnavar_toddy_punch.jpg": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
  "alphonso_mango_mule.jpg": "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop&q=80",
  "fresh_tender_coconut_elaneer.jpg": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
  "fresh_lime_soda.jpg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
  "cold_soft_drinks.jpg": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
  "chilli_fry.jpg": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
  "raja_masala.jpg": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  "g_p_dry.jpg": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "veg_noodle_soup.jpg": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
  "cream_of_veg_soup.jpg": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",
  "veg_sweet_corn_soup.jpg": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
  "chicken_hot_sour_soup.jpg": "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&auto=format&fit=crop&q=80",
  "chicken_lung_fung_soup.jpg": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
  "mutton_manchow_soup.jpg": "https://images.unsplash.com/photo-1548946526-f69e2424cf45?w=600&auto=format&fit=crop&q=80",
  "boiled_egg.jpg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
  "egg_half_fry.jpg": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "egg_omelette.jpg": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&auto=format&fit=crop&q=80",
  "egg_bhurji.jpg": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
};

async function run() {
  const hashes = new Set();
  for (const [filename, url] of Object.entries(batch1)) {
    try {
      const buf = await downloadImage(url);
      const h = crypto.createHash('md5').update(buf).digest('hex');
      console.log(`[OK] ${filename}: ${buf.length} bytes, hash=${h.slice(0, 8)}`);
      if (hashes.has(h)) {
        console.error(`DUPLICATE HASH for ${filename}!`);
      }
      hashes.add(h);
      fs.writeFileSync(`client/public/images/dishes/${filename}`, buf);
      fs.writeFileSync(`server/public/images/dishes/${filename}`, buf);
    } catch (e) {
      console.error(`[FAIL] ${filename}: ${e.message}`);
    }
  }
}
run();
