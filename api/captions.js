export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Brak videoId' });

  // Odcięcie ewentualnych śmieci z URL
  const cleanId = videoId.substring(0, 11);

  try {
    // Pobieramy stronę filmu, aby wyciągnąć oficjalne tracki napisów z YouTube
    const response = await fetch(`https://www.youtube.com/watch?v=${cleanId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await response.text();

    const match = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) {
      return res.status(404).json({ error: 'Brak napisów dla tego filmu.' });
    }

    const tracks = JSON.parse(match[1]);
    // Szukamy napisów: angielskich, polskich lub jakichkolwiek pierwszych dostępnych
    const track = tracks.find(t => t.languageCode === 'en') ||
                  tracks.find(t => t.languageCode === 'pl') ||
                  tracks[0];

    // Pobieramy treść napisów XML
    const xmlRes = await fetch(track.baseUrl);
    const xmlText = await xmlRes.text();

    return res.status(200).send(xmlText);
  } catch (err) {
    return res.status(500).json({ error: 'Błąd pobierania napisów' });
  }
}
