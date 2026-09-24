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
    // Pobieramy stronę wideo, aby wyciągnąć transkrypt za pomocą alternatywnego, publicznego źródła
    const response = await fetch(`https://video.google.com/timedtext?lang=pl&v=${videoId}`);
    let text = await response.text();

    // Jeśli brak polskiego, spróbujmy pobrać angielski
    if (!text || text.includes('<error>') || text.trim() === '') {
      const responseEn = await fetch(`https://video.google.com/timedtext?lang=en&v=${videoId}`);
      text = await responseEn.text();
    }

    if (!text || text.includes('<error>') || text.trim() === '') {
      return res.status(404).json({ error: 'Napisy są niedostępne dla tego filmu (zablokowane przez YouTube).' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(text);

  } catch (error) {
    console.error('Błąd:', error);
    return res.status(500).json({ error: 'Nie udało się pobrać napisów.' });
  }
}
