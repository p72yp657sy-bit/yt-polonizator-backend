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

  const apiKey = "TUTAJ_WKLEJ_SWOJ_KLUCZ_AQ";

  try {
    const prompt = `Podaj pełny tekst piosenki dla utworu: "${author ? author + ' - ' : ''}${title}". Odpowiedz po polsku, w czytelnej formie z podziałem na zwrotki.`;

    // Używamy klucza AQ jako tokenu w nagłówku x-goog-api-key lub Authorization
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
