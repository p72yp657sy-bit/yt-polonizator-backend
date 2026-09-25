export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { title, author } = req.query;

    if (!title || !author) {
        return res.status(400).send("Brak tytułu lub autora utworu.");
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(200).send("Błąd: Brak klucza GROQ_API_KEY w zmiennych środowiskowych Vercela.");
    }

    try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Jesteś asystentem muzycznym. Podaj pełny tekst podanej piosenki po polsku lub w oryginale. Jeśli nie znasz dokładnego tekstu, napisz zwrotki, które pamiętasz, lub informację o jego braku. Formatuj tekst przejrzyście."
                    },
                    {
                        role: "user",
                        content: `Podaj tekst piosenki: ${author} - ${title}`
                    }
                ],
                max_tokens: 1000
            })
        });

        const data = await groqRes.json();
        
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return res.status(200).send(data.choices[0].message.content);
        } else {
            return res.status(200).send("Nie udało się pobrać tekstu tej piosenki.");
        }

    } catch (error) {
        return res.status(200).send("Wystąpił błąd techniczny podczas pobierania tekstu.");
    }
}
