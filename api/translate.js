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
    // Korzystamy z darmowego i stabilnego publicznego API do pobierania napisów z YouTube
    const timedTextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=pl`;
    let response = await fetch(timedTextUrl);
    
    let captionsText = await response.text();

    // Jeśli nie ma polskiego, spróbujmy pobrać listę dostępnych języków
    if (!captionsText || captionsText.trim() === '' || captionsText.includes('<error>')) {
      const listUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&type=list`;
      const listRes = await fetch(listUrl);
      const listText = await listRes.text();

      // Wyciągamy kod pierwszego lepszego dostępnego języka z XML-a
      const langMatch = listText.match(/lang_code="([^"]+)"/);
      if (langMatch && langMatch[1]) {
        const langCode = langMatch[1];
        const fallbackUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${langCode}`;
        const fallbackRes = await fetch(fallbackUrl);
        captionsText = await fallbackRes.text();
      }
    }

    if (!captionsText || captionsText.trim() === '' || captionsText.includes('<error>')) {
      return res.status(404).json({ error: 'Ten film nie udostępnia napisów w żadnym języku przez API.' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(captionsText);

  } catch (error) {
    console.error('Błąd pobierania napisów:', error);
    return res.status(500).json({ error: 'Nie udało się pobrać napisów: ' + error.message });
  }
}
