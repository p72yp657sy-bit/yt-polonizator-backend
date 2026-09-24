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
    return res.status(500).json({ error: 'Brak skonfigurowanego klucza GEMINI_API_KEY na Vercelu.' });
  }

  try {
    const prompt = `Podaj pełny tekst piosenki lub transkrypt/napisy dla utworu: "${author ? author + ' - ' : ''}${title}". Odpowiedz po polsku, w czytelnej formie z podziałem na zwrotki lub fragmenty czasowe, jeśli to możliwe.`;

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
      throw new Error(data.error.message || 'Błąd API Gemini');
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nie udało się wygenerować tekstu.';

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(aiText);

  } catch (error) {
    console.error('Błąd AI:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send('Przepraszam, wystąpił błąd podczas generowania tekstu przez AI: ' + error.message);
  }
}
