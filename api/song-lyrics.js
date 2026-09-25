export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { title, author } = req.query;

    if (!title || title === "Nieznany") {
        return res.status(200).send("Nie wybrano jeszcze żadnego utworu do odtworzenia.");
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(200).send("Błąd: Brak klucza GROQ_API_KEY na Vercelu.");
    }

    try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "Jesteś asystentem muzycznym. Podaj pełny tekst podanej piosenki. Jeśli nie znasz dokładnego tekstu, napisz zwrotki, które znasz, lub informację o braku tekstu."
                    },
                    {
                        role: "user",
                        content: `Podaj tekst piosenki: ${author} - ${title}`
                    }
                ],
                max_tokens: 800
            })
        });

        const data = await groqRes.json();
        
        if (data.choices && data.choices[0]?.message?.content) {
            return res.status(200).send(data.choices[0].message.content);
        } else if (data.error) {
            return res.status(200).send(`Błąd Groq: ${data.error.message}`);
        } else {
            return res.status(200).send("Nie udało się odczytać tekstu.");
        }

    } catch (error) {
        return res.status(200).send("Błąd techniczny połączenia z API.");
    }
}
