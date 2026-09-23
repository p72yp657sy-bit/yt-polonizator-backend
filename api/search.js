export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Brak zapytania (parametr q)' });
  }

  try {
    // Bezpieczne zapytanie przez alternatywne publiczne API
    const response = await fetch(`https://invidious.privacyredirect.com/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) throw new Error('Invidious error');
    
    const data = await response.json();
    
    const items = (data || []).slice(0, 5).map(item => ({
      title: item.title,
      author: item.author || 'Nieznany',
      videoId: item.videoId
    })).filter(x => x.videoId);

    return res.status(200).json({ items });
  } catch (err) {
    // Awaryjna lista, jeśli serwery wyszukiwania blokują zapytanie
    return res.status(200).json({
      items: [
        { title: `Szukany utwór: ${query} (Wklej bezpośredni link poniżej)`, author: 'Podpowiedź', videoId: '' }
      ]
    });
  }
}
