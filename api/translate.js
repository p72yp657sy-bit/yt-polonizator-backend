// api/translate.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'Brak identyfikatora videoId' });
  }

  try {
    const ytResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8'
      }
    });
    const html = await ytResponse.text();

    const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});<\/script>/);
    if (!match) {
      throw new Error('Nie udało się wyciągnąć danych odtwarzacza YouTube.');
    }

    const playerResponse = JSON.parse(match[1]);
    const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'Brak napisów dla tego filmu.' });
    }

    // Szukamy napisów po polsku (ignorując wielkość liter: pl, PL, pl-PL itp.)
    let selectedTrack = tracks.find(t => t.languageCode && t.languageCode.toLowerCase().startsWith('pl'));
    
    // Jeśli nie ma polskiego, szukamy angielskiego, a w ostateczności bierzemy pierwszy z brzegu
    if (!selectedTrack) {
      selectedTrack = tracks.find(t => t.languageCode && t.languageCode.toLowerCase().startsWith('en')) || tracks[0];
    }


    const captionsRes = await fetch(selectedTrack.baseUrl);
    const captionsText = await captionsRes.text();

    // Zwracamy surowy tekst napisów
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(captionsText);

  } catch (error) {
    console.error('Błąd:', error);
    return res.status(500).json({ error: 'Błąd pobierania napisów.' });
  }
}
