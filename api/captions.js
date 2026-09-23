import { fetchSubtitles } from 'youtube-caption-extractor';

export default async function handler(req, res) {
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

  const { videoId, lang = 'pl' } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Brak videoId' });
  }

  try {
    let subtitles = await fetchSubtitles({ videoID: videoId, lang: lang });

    if (!subtitles || subtitles.length === 0) {
      subtitles = await fetchSubtitles({ videoID: videoId, lang: 'en' });
    }

    if (!subtitles || subtitles.length === 0) {
      return res.status(404).json({ error: 'Brak dostępnych napisów dla tego filmu.' });
    }

    const formatted = subtitles.map(sub => ({
      start: parseFloat(sub.start),
      end: parseFloat(sub.start) + parseFloat(sub.dur),
      text: sub.text
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ error: 'Nie udało się pobrać napisów z YouTube.' });
  }
}
