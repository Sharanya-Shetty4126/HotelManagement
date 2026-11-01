// server/scripts/find-seafood-files.js
const https = require('https');

function searchCommons(q) {
  return new Promise((resolve) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(q + ' filetype:bitmap') + '&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json';
    https.get(url, { headers: { 'User-Agent': 'JuliusHotelManagement/1.0 (hotel@julius.com)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages;
          if (!pages) return resolve([]);
          const results = [];
          for (const p of Object.values(pages)) {
            if (p.title && p.title.match(/\.(jpg|jpeg|png)$/i) && !p.title.includes('Map') && !p.title.includes('Stamp')) {
              results.push({ title: p.title, url: p.imageinfo?.[0]?.url });
            }
          }
          resolve(results);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

const queries = {
  bangda_tawa_fry: "Solkadi and Bangda Fry",
  bangda_rawa_fry: "Bangda fry",
  bangda_masala_curry: "Mackerel curry Mangalore",
  king_fish_tawa_fry: "Mangalore Style Fish Tawa Fry",
  king_fish_rawa_fry: "Surmai Fry",
  king_fish_masala_fry: "Fish fry Indian spicy",
  king_fish_biryani: "Fish Biryani",
  lady_fish_rawa_fry: "Lady Fish",
  lady_fish_tawa_fry: "Kane fish fry",
  lady_fish_masala_curry: "Fish curry coastal Karnataka",
  pomfret_tandoori: "Tandoori pomfret",
  pomfret_tawa_fry: "Pomfret fry",
  pomfret_rawa_fry: "Pomfret Rava fry",
  pomfret_masala_fry: "Pomfret masala",
  pomfret_curry: "Pomfret curry",
  prawns_ghee_roast: "Prawn ghee roast",
  prawns_butter_garlic: "Garlic butter prawns",
  prawns_rawa_fry: "Prawn rava fry",
  prawns_masala_fry: "Prawn masala fry Indian",
  prawns_chilli: "Chilli prawns",
  prawns_biryani: "Prawn biryani",
  squid_ghee_roast: "Squid roast Mangalore",
  squid_sukka: "Squid fry",
  squid_butter_garlic: "Garlic butter calamari",
  squid_pepper_dry: "Pepper squid fry",
  crab_ghee_roast: "Crab Roast",
  crab_sukka: "Goan crab leg masala",
  crab_butter_garlic: "Garlic butter crab",
  crab_pepper_dry: "Crab pepper fry",
  silver_fish_rawa_fry: "Anchovy fry",
  silver_fish_tawa_fry: "Fried anchovies",
  silver_fish_curry: "Anchovy curry",
  shark_chilli: "Fish chilli Indo Chinese",
  shark_masala_fry: "Fish masala fry",
  shark_curry: "Shark curry",
  dhodi_rawa_tawa_fry: "Sole fish fry",
  nang_tawa_fry: "Tongue sole fry",
  shell_fish_sukka: "Clam sukka Mangalore"
};

async function run() {
  const mapping = {};
  for (const [key, q] of Object.entries(queries)) {
    const res = await searchCommons(q);
    if (res.length > 0) {
      mapping[key] = { query: q, title: res[0].title, url: res[0].url };
      console.log(`[FOUND] ${key} -> ${res[0].title}`);
    } else {
      console.log(`[NONE] ${key} -> ${q}`);
    }
  }
  const fs = require('fs');
  fs.writeFileSync('server/scripts/seafood_found.json', JSON.stringify(mapping, null, 2));
}
run();

