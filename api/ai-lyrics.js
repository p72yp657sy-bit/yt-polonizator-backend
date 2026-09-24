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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send('DIAGNOSTYKA: Zmienna GEMINI_API_KEY jest pusta lub niezdefiniowana na Vercelu!');
  }

  try {
    const prompt = `Podaj pełny tekst piosenki lub transkrypt dla utworu: "${author ? author + ' - ' : ''}${title}". Odpowiedz po polsku, w czytelnej formie z podziałem na zwrotki.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
      // Zwracamy dokładny komunikat błędu z Google API na ekran!
      return res.status(200).send(`DIAGNOSTYKA GOOGLE API ERROR: ${JSON.stringify(data.error)}`);
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Model zwrócił pustą odpowiedź.';

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(aiText);

  } catch (error) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send('DIAGNOSTYKA CATCH ERROR: ' + error.message);
  }
}
