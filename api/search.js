import { searchYouTubeTracks } from './lib/youtube.js';

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

  const results = await searchYouTubeTracks(query);
  return res.status(200).json({ items: results });
}
