export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Brak zapytania' });
  }

  try {
    const ytRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await ytRes.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?})\s*;/);
    let items = [];

    if (match) {
      const data = JSON.parse(match[1]);
      const videos = [];
      
      JSON.stringify(data, (key, val) => {
        if (key === 'videoRenderer' && val.videoId && val.title?.runs) {
          videos.push({
            title: val.title.runs[0].text,
            author: val.ownerText?.runs?.[0]?.text || 'YouTube',
            videoId: val.videoId
          });
        }
        return val;
      });

      const uniqueIds = new Set();
      for (const v of videos) {
        if (!uniqueIds.has(v.videoId)) {
          uniqueIds.add(v.videoId);
          items.push(v);
        }
        if (items.length >= 6) break; // Zbieramy do 6 unikalnych propozycji
      }
    }

    if (items.length > 0) {
      return res.status(200).json({ items });
    }
  } catch (err) {
    console.error('Błąd testowego API:', err);
  }

  return res.status(200).json({
    items: [
      {
        title: `▶️ Wyszukaj: ${query}`,
        author: 'Tryb awaryjny v2',
        videoId: 'kJQP7kiw5Fk'
      }
    ]
  });
}
