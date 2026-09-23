import { getSubtitles } from 'youtube-caption-extractor';

export default async function handler(req, res) {
  // Włączenie nagłówków CORS (bardzo ważne dla urządzeń iOS / Safari)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Brak parametru videoId' });
  }

  try {
    const subtitles = await getSubtitles({ videoID: videoId, lang: 'en' });
    
    // Formatowanie danych pod nasz odtwarzacz
    const formatted = subtitles.map(sub => ({
      start: parseFloat(sub.start),
      dur: parseFloat(sub.dur),
      text: sub.text
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Nie udało się pobrać napisów z YouTube.' });
  }
}
