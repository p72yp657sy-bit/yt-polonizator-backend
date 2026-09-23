import { getSubtitles } from 'youtube-captions-scraper';

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Brak videoId' });
  }

  // Wymuszamy poprawne 11-znakowe ID (odcinamy śmieci z URL)
  const cleanId = videoId.substring(0, 11);

  // Lista języków do sprawdzenia po kolei
  const languages = ['en', 'pl', 'de', 'es', 'fr'];

  for (const lang of languages) {
    try {
      const subtitles = await getSubtitles({
        videoID: cleanId,
        lang: lang
      });
      if (subtitles && subtitles.length > 0) {
        return res.status(200).json(subtitles);
      }
    } catch (e) {
      // Szukaj dalej w kolejnym języku/formacie
    }
  }

  return res.status(404).json({ error: 'Nie znaleziono napisów dla tego filmu.' });
}
