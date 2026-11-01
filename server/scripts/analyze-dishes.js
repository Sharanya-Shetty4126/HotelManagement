// server/scripts/analyze-dishes.js
const items = require('../../db_items_dump.json');
const active = items.filter(i => i.available);

console.log(`Analyzing ${active.length} active menu items...`);

function getBaseSlug(name) {
  let clean = name.toLowerCase()
    .replace(/\s*\((full|half|1 pc|2 pcs|6 pcs|330ml|1 litre|kaje rice|sweet \/ salt)\)/gi, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean;
}

const dishes = new Map();
active.forEach(item => {
  const slug = getBaseSlug(item.name);
  if (!dishes.has(slug)) {
    dishes.set(slug, {
      slug,
      sampleName: item.name,
      category: item.category.name,
      isVeg: item.isVeg,
      items: []
    });
  }
  dishes.get(slug).items.push(item.name);
});

console.log(`Found ${dishes.size} distinct dish archetypes from ${active.length} items:`);
for (const [slug, d] of dishes.entries()) {
  if (d.items.length > 1) {
    console.log(`  [Portion group: ${d.items.length}] ${slug} -> ${d.items.join(', ')}`);
  }
}
console.log(`\nSingle items: ${[...dishes.values()].filter(d => d.items.length === 1).length}`);

