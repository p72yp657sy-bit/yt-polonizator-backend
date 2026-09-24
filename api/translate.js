export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'Brak identyfikatora videoId' });
  }

  try {
    // 1. Pobieramy stronę filmu na YouTube, aby wyciągnąć tokeny i adresy napisów
    const ytPageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = await ytPageRes.text();
    
    // Szukamy danych o napisach wewnątrz strony (captionTracks)
    const match = html.match(/"captionTracks":\s*(\[.+?\])/);
    
    if (!match) {
      return res.status(404).json({ error: 'Brak napisów dla tego filmu w kodzie strony.' });
    }

    const tracks = JSON.parse(match[1]);
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'Brak dostępnych ścieżek napisów.' });
    }

    // Wybieramy polskie napisy lub pierwsze z brzegu
    let selectedTrack = tracks.find(t => t.languageCode && t.languageCode.toLowerCase().startsWith('pl'));
    if (!selectedTrack) {
      selectedTrack = tracks[0];
    }

    // Pobieramy faktyczny plik z napisami
    const captionsRes = await fetch(selectedTrack.baseUrl);
    const captionsText = await captionsRes.text();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(captionsText);

  } catch (error) {
    console.error('Błąd pobierania napisów:', error);
    return res.status(500).json({ error: 'Nie udało się pobrać napisów: ' + error.message });
  }
}
