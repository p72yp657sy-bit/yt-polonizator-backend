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
    // Tworzymy adres docelowy do napisów YouTube (najpierw polskie)
    const targetUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=pl`;
    
    // Przepuszczamy zapytanie przez corsproxy.io bezpośrednio w naszym kodzie backendu
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl);
    let text = await response.text();

    // Jeśli po polsku nie ma, spróbujmy pobrać angielskie napisy przez proxy
    if (!text || text.includes('<error>') || text.trim() === '') {
      const targetUrlEn = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
      const proxyUrlEn = `https://corsproxy.io/?${encodeURIComponent(targetUrlEn)}`;
      
      const responseEn = await fetch(proxyUrlEn);
      text = await responseEn.text();
    }

    // Jeśli nadal brak lub błąd
    if (!text || text.includes('<error>') || text.trim() === '') {
      return res.status(404).json({ error: 'Ten film nie posiada dostępnych napisów.' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(text);

  } catch (error) {
    console.error('Błąd proxy:', error);
    return res.status(500).json({ error: 'Nie udało się pobrać napisów przez proxy: ' + error.message });
  }
}
