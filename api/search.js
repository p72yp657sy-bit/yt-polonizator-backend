export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Brak zapytania (parametr q)' });
  }

  try {
    const response = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`);
    const data = await response.json();
    
    const items = (data.items || []).slice(0, 5).map(item => ({
      title: item.title,
      author: item.uploaderName || 'Nieznany',
      videoId: item.url ? item.url.split('v=')[1] : null
    })).filter(x => x.videoId);

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ error: 'Błąd podczas wyszukiwania' });
  }
}
