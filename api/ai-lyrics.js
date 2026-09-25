export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { prompt, title, author } = req.query;

    if (!prompt) {
        return res.status(400).send("Brak zapytania.");
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).send(`Oto odpowiedź: "${prompt}". (Brak skonfigurowanego klucza GEMINI_API_KEY w Vercelu).`);
    }

    try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `Jesteś miłym asystentem AI w aplikacji muzycznej z polskim YouTube. Użytkownik słucha utworu: "${author} - ${title}". Odpowiadaj na pytania wprost, po polsku.\n\nPytanie użytkownika: ${prompt}`
                            }
                        ]
                    }
                ]
            })
        });

        const data = await geminiRes.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return res.status(200).send(data.candidates[0].content.parts[0].text);
        } else {
            console.error("Gemini Error:", data);
            return res.status(200).send("Nie udało się uzyskać odpowiedzi od modelu Gemini.");
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(200).send("Wystąpił błąd podczas komunikacji z API Gemini.");
    }
}
