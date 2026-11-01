// server/scripts/test-batch-breads.js
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

// Curated authentic photography for each Indian Bread
const breads = {
  // Plain teardrop naan
  "naan.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Naan_shiva.jpg",
  // Butter naan with glossy butter brush
  "butter_naan.jpg": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  // Garlic naan with minced garlic and coriander
  "garlic_naan.jpg": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  // Butter garlic naan rich golden herbs
  "butter_garlic_naan.jpg": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  // Cheese garlic naan with melted cheese
  "cheese_butter_garlic_naan.jpg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80",
  // Tandoori roti with char blisters
  "tandoori_roti.jpg": "https://upload.wikimedia.org/wikipedia/commons/0/05/Tandoori_Roti_in_clay_oven.JPG",
  // Butter roti
  "butter_roti.jpg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80",
  // Chapati / Phulka
  "chapathi.jpg": "https://upload.wikimedia.org/wikipedia/commons/f/fe/2_Chapati_on_plate.jpg",
  // Plain Kulcha with kalonji seeds
  "kulcha.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Amritsari_Kulcha_with_Chana.jpg/600px-Amritsari_Kulcha_with_Chana.jpg",
  // Butter Kulcha
  "butter_kulcha.jpg": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
  // Flaky spiral Malabar parotta
  "parota.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/10/Parotta_and_Beef.jpg",
  // Butter parota
  "butter_parota.jpg": "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80",
  // Garlic parota
  "garlic_parota.jpg": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80",
  // Cheese parota
  "cheese_parota.jpg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
  // Methi roti with fenugreek greens
  "methi_roti.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Methi_Thepla.jpg/600px-Methi_Thepla.jpg",
  // Aloo paratha with spiced potato filling
  "aloo_stuffed_parota.jpg": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Aloo_Paratha_North_Indian.jpg",
  // Paneer paratha with grated cottage cheese
  "paneer_stuffed_parota.jpg": "https://upload.wikimedia.org/wikipedia/commons/3/37/Awadhi_palak_paneer_paratha_dahi.jpg",
  // Veg stuffed paratha
  "veg_stuffed_parota.jpg": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80",
  // Chicken stuffed keema paratha
  "chicken_stuffed_parota.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Mughlai_Paratha_-_Kolkata_2015-02-14_4111.JPG/600px-Mughlai_Paratha_-_Kolkata_2015-02-14_4111.JPG"
};

async function run() {
  console.log(`Downloading and verifying ${Object.keys(breads).length} Indian Breads...`);
  for (const [filename, url] of Object.entries(breads)) {
    try {
      const buf = await downloadImage(url);
      const h = crypto.createHash('md5').update(buf).digest('hex');
      console.log(`[OK] ${filename}: ${buf.length} bytes, hash=${h.slice(0, 8)}`);
      fs.writeFileSync(`client/public/images/dishes/${filename}`, buf);
      fs.writeFileSync(`server/public/images/dishes/${filename}`, buf);
    } catch (e) {
      console.error(`[FAIL] ${filename}: ${e.message}`);
    }
  }
}
run();

