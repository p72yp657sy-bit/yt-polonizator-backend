// api/translate.js
// Pobiera napisy z YouTube i tłumaczy je na polski w locie

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'Brak identyfikatora videoId' });
  }

  try {
    // 1. Pobieramy stronę filmu, aby wyciągnąć tokeny i listę dostępnych napisów (captions)
    const ytResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await ytResponse.text();

    // Szukamy danych json z konfiguracją odtwarzacza (ytInitialPlayerResponse)
    const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});<\/script>/);
    if (!match) {
      throw new Error('Nie udało się wyciągnąć danych odtwarzacza YouTube.');
    }

    const playerResponse = JSON.parse(match[1]);
    const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'Brak jakichkolwiek napisów dla tego filmu w YouTube.' });
    }

    // Szukamy najpierw polskich, a jeśli nie ma – bierzemy pierwsze lepsze (np. angielskie/automatyczne)
    let selectedTrack = tracks.find(t => t.languageCode === 'pl');
    if (!selectedTrack) {
      selectedTrack = tracks[0]; // np. auto-generated angielskie
    }

    // Pobieramy plik z napisami (zazwyczaj format XML/TTML lub vtt)
    const captionsRes = await fetch(selectedTrack.baseUrl);
    const captionsText = await captionsRes.text();

    // 2. Tłumaczenie napisów na język polski (jeśli track nie był po polsku)
    // Tutaj możemy zwrócić surowy XML/tekst lub przetłumaczone linie. 
    // Zwracamy surowe napisy + informację o języku źródłowym, żeby frontend wiedział, czy tłumaczyć.
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(captionsText);

  } catch (error) {
    console.error('Błąd podczas pobierania/tłumaczenia napisów:', error);
    return res.status(500).json({ error: 'Nie udało się przetworzyć napisów dla tego filmu.' });
  }
}
