// api/translate.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'Brak identyfikatora videoId' });
  }

  try {
    // Pobieramy dane o filmie bezpośrednio przez oficjalny player API YouTube
    const playerApiUrl = `https://www.youtube.com/youtubei/v1/player`;
    const response = await fetch(playerApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'pl',
            gl: 'PL'
          }
        },
        videoId: videoId
      })
    });

    const data = await response.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'Brak napisów dla tego filmu.' });
    }

    // Szukamy najpierw napisów po polsku, a jeśli nie ma, bierzemy pierwsze lepsze
    let selectedTrack = tracks.find(t => t.languageCode && t.languageCode.toLowerCase().startsWith('pl'));
    if (!selectedTrack) {
      selectedTrack = tracks[0];
    }

    // Pobieramy plik z napisami pod wskazanym linkiem baseUrl
    const captionsRes = await fetch(selectedTrack.baseUrl);
    const captionsText = await captionsRes.text();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(captionsText);

  } catch (error) {
    console.error('Błąd pobierania napisów przez API:', error);
    return res.status(500).json({ error: 'Nie udało się pobrać napisów.' });
  }
}
