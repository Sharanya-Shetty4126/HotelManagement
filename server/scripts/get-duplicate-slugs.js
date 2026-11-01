// server/scripts/get-duplicate-slugs.js
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

// We keep ONE file from each group (the one that best matches the original category)
// and all the OTHER files in the group MUST get their own unique image!
const slugsToReplace = [];
for (const [h, list] of Object.entries(hashes)) {
  if (list.length > 1) {
    // If it's a legitimate pair (e.g. curd_rice and special_curd_rice, or gadbad and special_gadbad), keep both
    if (list.length === 2 && list[0].includes('curd_rice') && list[1].includes('curd_rice')) continue;
    if (list.length === 2 && list[0].includes('gadbad') && list[1].includes('gadbad')) continue;

    // Keep the first one, replace all others!
    for (let i = 1; i < list.length; i++) {
      slugsToReplace.push(list[i].replace(/\.(jpg|png)$/, ''));
    }
  }
}

// Also add the 4 failed rice dishes from earlier
const additional = [
  'chicken_fried_rice',
  'chicken_schezwan_fried_rice',
  'chicken_singapore_fried_rice',
  'chicken_schezwan_triple_fried_rice'
];
additional.forEach(a => {
  if (!slugsToReplace.includes(a)) slugsToReplace.push(a);
});

console.log(`Total slugs requiring unique dish photography: ${slugsToReplace.length}`);
fs.writeFileSync('server/scripts/slugs-to-replace.json', JSON.stringify(slugsToReplace, null, 2));
