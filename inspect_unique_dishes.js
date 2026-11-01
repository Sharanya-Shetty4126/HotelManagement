// inspect_unique_dishes.js
const fs = require('fs');
const crypto = require('crypto');
const dir = 'client/public/images/dishes';
const files = fs.readdirSync(dir);
const hashes = {};
files.forEach(f => {
  const buf = fs.readFileSync(dir + '/' + f);
  const h = crypto.createHash('md5').update(buf).digest('hex');
  hashes[h] = hashes[h] || [];
  hashes[h].push(f);
});

const uniques = Object.entries(hashes).filter(([h, list]) => list.length === 1);
console.log(`Found ${uniques.length} completely unique dish images:`);
uniques.forEach(([h, list], i) => {
  console.log(`  ${i+1}. ${list[0]}`);
});
