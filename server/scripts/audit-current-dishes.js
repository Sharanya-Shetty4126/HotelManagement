// server/scripts/audit-current-dishes.js
const fs = require('fs');
const crypto = require('crypto');
const items = require('../../db_items_dump.json');

const dir = 'client/public/images/dishes';
const files = fs.readdirSync(dir);
const fileHashes = {};
files.forEach(f => {
  const buf = fs.readFileSync(dir + '/' + f);
  const h = crypto.createHash('md5').update(buf).digest('hex');
  fileHashes[f] = h;
});

// Count hash frequency
const hashCounts = {};
Object.values(fileHashes).forEach(h => {
  hashCounts[h] = (hashCounts[h] || 0) + 1;
});

const active = items.filter(x => x.available);
console.log(`Auditing ${active.length} active menu items...`);

const needUniquePhoto = [];
const alreadyUnique = [];

active.forEach(item => {
  // get slug from existing imageUrl or name
  let filename = null;
  if (item.imageUrl && item.imageUrl.startsWith('/images/dishes/')) {
    filename = item.imageUrl.replace('/images/dishes/', '');
  } else {
    // deduce slug
    const slug = item.name.toLowerCase()
      .replace(/\s*\((full|half|6 pcs|1 litre|sweet \/ salt|330ml|kaje rice)\)/gi, '')
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    filename = slug + '.jpg';
    if (!fs.existsSync(dir + '/' + filename) && fs.existsSync(dir + '/' + slug + '.png')) {
      filename = slug + '.png';
    }
  }

  const exists = fs.existsSync(dir + '/' + filename);
  const hash = exists ? fileHashes[filename] : null;
  const isDuplicateGroup = exists && hashCounts[hash] > 2; // more than full/half pair

  if (!exists || isDuplicateGroup) {
    needUniquePhoto.push({
      id: item.id,
      name: item.name,
      category: item.category?.name,
      isVeg: item.isVeg,
      filename,
      exists,
      hashCount: hash ? hashCounts[hash] : 0
    });
  } else {
    alreadyUnique.push({
      id: item.id,
      name: item.name,
      category: item.category?.name,
      filename
    });
  }
});

console.log(`Already unique / legitimate pair: ${alreadyUnique.length}`);
console.log(`Needs unique, authentic photo: ${needUniquePhoto.length}`);

// Group needUniquePhoto by category
const byCat = {};
needUniquePhoto.forEach(item => {
  byCat[item.category] = byCat[item.category] || [];
  byCat[item.category].push(item.name);
});

for (const [cat, list] of Object.entries(byCat)) {
  console.log(`\n=== Category: ${cat} (${list.length} items needing authentic photos) ===`);
  list.forEach(name => console.log(`  - ${name}`));
}

