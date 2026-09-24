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
    // Próbujemy pobrać napisy bezpośrednio przez alternatywne endpointy Google
    const response = await fetch(`https://video.google.com/timedtext?lang=pl&v=${videoId}`);
    let text = await response.text();

    if (!text || text.includes('<error>') || text.trim() === '') {
      const responseEn = await fetch(`https://video.google.com/timedtext?lang=en&v=${videoId}`);
      text = await responseEn.text();
    }

    // Jeśli nadal brak lub blokada, zwracamy elegancką informację z linkiem do transkryptu
    if (!text || text.includes('<error>') || text.trim() === '') {
      const fallbackMsg = `[Informacja]\nBezpośrednie pobieranie napisów z serwerów chmurowych jest blokowane przez algorytmy YouTube.\n\nOtwórz film bezpośrednio, aby zobaczyć napisy i transkrypt:\nhttps://www.youtube.com/watch?v=${videoId}`;
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(fallbackMsg);
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(text);

  } catch (error) {
    console.error('Błąd:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(`Nie udało się pobrać napisów dla filmu o ID: ${videoId}.`);
  }
}
