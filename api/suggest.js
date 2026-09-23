export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    // Odpytujemy oficjalny, lekki endpoint podpowiedzi YouTube
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Format odpowiedzi z tego endpointu to zazwyczaj [zapytanie, [podpowiedzi...]]
    const suggestions = data[1] || [];

    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('Błąd pobierania podpowiedzi:', err);
    return res.status(200).json({ suggestions: [] });
  }
}
