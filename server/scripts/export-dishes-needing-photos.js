// server/scripts/export-dishes-needing-photos.js
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

const hashCounts = {};
Object.values(fileHashes).forEach(h => {
  hashCounts[h] = (hashCounts[h] || 0) + 1;
});

const active = items.filter(x => x.available);

const needUniquePhoto = [];

active.forEach(item => {
  let filename = null;
  if (item.imageUrl && item.imageUrl.startsWith('/images/dishes/')) {
    filename = item.imageUrl.replace('/images/dishes/', '');
  } else {
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
  // If not exists or part of a fallback duplicate group (>2 files share the hash)
  const isDuplicateGroup = exists && hashCounts[hash] > 2;

  if (!exists || isDuplicateGroup) {
    needUniquePhoto.push({
      id: item.id,
      name: item.name,
      category: item.category?.name,
      isVeg: item.isVeg,
      filename,
      hash: hash || 'MISSING'
    });
  }
});

fs.writeFileSync('server/scripts/dishes_needing_photos.json', JSON.stringify(needUniquePhoto, null, 2));
console.log(`Exported ${needUniquePhoto.length} items to server/scripts/dishes_needing_photos.json`);
