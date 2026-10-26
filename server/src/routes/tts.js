// server/src/routes/tts.js
const express = require('express');
const https = require('https');
const router = express.Router();

/**
 * High-definition Text-To-Speech audio proxy
 * Streams native language audio (e.g. Kannada 'kn') without requiring
 * client operating systems to have regional speech packs installed.
 *
 * GET /api/tts?text=...&lang=kn
 */
router.get('/', (req, res) => {
  const { text, lang = 'kn' } = req.query;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text query parameter is required' });
  }

  const cleanText = text.trim().slice(0, 200);
  const targetLang = lang.toLowerCase() === 'en' ? 'en-IN' : 'kn';
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(targetLang)}&q=${encodeURIComponent(cleanText)}`;

  const googleReq = https.get(
    url,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: '*/*',
      },
      timeout: 8000,
    },
    (googleRes) => {
      if (googleRes.statusCode !== 200) {
        return res
          .status(googleRes.statusCode || 500)
          .json({ error: 'Upstream TTS service returned status ' + googleRes.statusCode });
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      googleRes.pipe(res);
    }
  );

  googleReq.on('timeout', () => {
    googleReq.destroy();
    res.status(504).json({ error: 'TTS request timed out' });
  });

  googleReq.on('error', (err) => {
    console.error('TTS route proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to synthesize speech audio' });
    }
  });
});

module.exports = router;
