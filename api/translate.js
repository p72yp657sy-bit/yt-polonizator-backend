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
    // Próbujemy standardowego pobrania napisów
    const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=pl`);
    let text = await response.text();

    if (!text || text.includes('<error>') || text.trim() === '') {
      // Próba z językiem angielskim jako alternatywa
      const responseEn = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
      text = await responseEn.text();
    }

    // Jeśli YouTube nadal blokuje zapytanie z serwera Vercel, zwracamy pomocny komunikat 
    // oraz bezpośredni link do otwarcia napisów/transkryptu w przeglądarce.
    if (!text || text.includes('<error>') || text.trim() === '') {
      const fallbackMessage = `[Informacja systemu]\n\nYouTube zabezpiecza swoje wewnętrzne API przed pobieraniem z serwerów chmurowych (Vercel).\n\nMożesz wyświetlić napisy i transkrypt tego filmu bezpośrednio na YouTube, korzystając z poniższego linku:\nhttps://www.youtube.com/watch?v=${videoId}\n(Opcja "Pokaż transkrypt" pod filmem).`;
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(fallbackMessage);
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(text);

  } catch (error) {
    console.error('Błąd:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(`Nie udało się pobrać napisów automatycznie dla ID: ${videoId}. YouTube blokuje ruch z serwerów zewnętrznych.`);
  }
}
