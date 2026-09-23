export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Brak zapytania (parametr q)' });
  }

  try {
    // Odpytujemy stabilną instancję Piped API, która ma dostęp do całego YouTube bez ograniczeń
    const response = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      throw new Error('Błąd zewnętrznego API YouTube');
    }

    const data = await response.json();
    const rawItems = data.items || [];

    // Przetwarzamy wyniki z YouTube, wyciągając tytuł, wykonawcę i unikalne ID (co daje Ci remixy, lyrics, oryginały)
    const items = rawItems.slice(0, 6).map(item => {
      // Piped zwraca URL w formacie /watch?v=ID lub pełny link
      let videoId = '';
      if (item.url && item.url.includes('v=')) {
        videoId = item.url.split('v=')[1].split('&')[0];
      } else if (item.videoId) {
        videoId = item.videoId;
      }

      return {
        title: item.title || 'Brak tytułu',
        author: item.uploaderName || 'Nieznany wykonawca',
        videoId: videoId
      };
    }).filter(x => x.videoId); // Odrzucamy pozycje bez poprawnego ID

    return res.status(200).json({ items });

  } catch (err) {
    // Awaryjny fallback, gdyby zewnętrzny serwer miał chwilową przerwę
    return res.status(200).json({
      items: [
        { 
          title: `Szukaj "${query}" bezpośrednio na YouTube (Wpisz link poniżej)`, 
          author: 'System awaryjny', 
          videoId: '' 
        }
      ]
    });
  }
}
