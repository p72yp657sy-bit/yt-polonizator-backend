export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title, author } = req.query;
  if (!title) {
    return res.status(400).json({ error: 'Brak tytułu utworu' });
  }

  // Pobieranie klucza bezpiecznie ze zmiennej środowiskowej Vercela
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).send('BŁĄD: Brak skonfigurowanego klucza GEMINI_API_KEY w zmiennych środowiskowych Vercela.');
  }

  try {
    const prompt = `Podaj pełny tekst piosenki oraz jego polskie tłumaczenie dla utworu: "${author ? author + ' - ' : ''}${title}". Podziel odpowiedź czytelnie na oryginalny tekst oraz tłumaczenie.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(`BŁĄD GOOGLE API: ${JSON.stringify(data.error)}`);
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Model zwrócił pustą odpowiedź.';

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(aiText);

  } catch (error) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send('BŁĄD CATCH: ' + error.message);
  }
}
