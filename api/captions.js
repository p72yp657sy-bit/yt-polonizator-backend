export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Brak videoId' });

  const cleanId = videoId.substring(0, 11);

  try {
    const ytRes = await fetch(`https://www.youtube.com/watch?v=${cleanId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await ytRes.text();

    const match = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) {
      return res.status(404).json({ error: 'Brak napisów dla tego filmu.' });
    }

    const tracks = JSON.parse(match[1]);
    const track = tracks.find(t => t.languageCode === 'en') ||
                  tracks.find(t => t.languageCode === 'pl') ||
                  tracks[0];

    if (!track || !track.baseUrl) {
      return res.status(404).json({ error: 'Nie znaleziono ścieżki napisów.' });
    }

    const xmlRes = await fetch(track.baseUrl);
    const xmlText = await xmlRes.text();

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(xmlText);
  } catch (err) {
    return res.status(500).json({ error: 'Błąd pobierania napisów: ' + err.message });
  }
}
