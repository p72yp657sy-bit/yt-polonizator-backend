export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Brak videoId' });

  const cleanId = videoId.substring(0, 11);

  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${cleanId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await pageRes.text();

    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionsMatch) {
      return res.status(404).json({ error: 'Brak napisów dla tego filmu.' });
    }

    const tracks = JSON.parse(captionsMatch[1]);
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'Brak dostępnych ścieżek napisów.' });
    }

    // Szukamy napisów po angielsku lub bierzemy pierwsze z brzegu
    let selectedTrack = tracks.find(t => t.languageCode === 'en') || tracks[0];
    const subRes = await fetch(selectedTrack.baseUrl);
    const subText = await subRes.text();

    if (!subText || subText.trim() === '') {
      return res.status(404).json({ error: 'Pusty plik napisów.' });
    }

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(subText);

  } catch (err) {
    return res.status(500).json({ error: 'Błąd serwera: ' + err.message });
  }
}
