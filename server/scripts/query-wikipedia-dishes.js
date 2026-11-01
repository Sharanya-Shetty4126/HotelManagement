// server/scripts/query-wikipedia-dishes.js
const https = require('https');

function getWikiPageImages(titles) {
  return new Promise((resolve) => {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=800&titles=' + encodeURIComponent(titles.join('|'));
    https.get(url, { headers: { 'User-Agent': 'JuliusHotelBot/1.0 (contact@hoteljulius.in)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages || {};
          const result = {};
          for (const p of Object.values(pages)) {
            result[p.title] = p.thumbnail?.source || null;
          }
          resolve(result);
        } catch (e) { resolve({}); }
      });
    }).on('error', () => resolve({}));
  });
}

async function run() {
  const titles = [
    'Tandoori chicken', 'Chicken tikka', 'Seekh kebab', 'Chicken 65',
    'Paneer tikka', 'Naan', 'Chapati', 'Paratha', 'Kulcha',
    'Dal makhani', 'Rogan josh', 'Palak paneer', 'Aloo gobi',
    'Biryani', 'Pulao', 'Khichdi', 'Kheer', 'Gulab jamun',
    'Manchurian (dish)', 'Spring roll', 'Pakora', 'Samosa',
    'Chilli chicken', 'Fried rice', 'Hakka noodles', 'Hot and sour soup'
  ];
  const res = await getWikiPageImages(titles);
  for (const [title, url] of Object.entries(res)) {
    console.log(`${title} -> ${url ? 'FOUND: ' + url.slice(0, 70) + '...' : 'NOT FOUND'}`);
  }
}
run();

