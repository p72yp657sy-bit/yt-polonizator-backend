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

    const apiKey = process.env.OPENAI_API_KEY;

    // Jeśli klucz OpenAI nie jest skonfigurowany, asystent odpowie inteligentnym fallbackiem,
    // żeby aplikacja działała bezbłędnie pod każdym adresem.
    if (!apiKey) {
        return res.status(200).send(`Oto odpowiedź na Twoje pytanie: "${prompt}". (Aktualnie słuchasz: ${author} - ${title}). Aby odblokować pełną inteligencję ChatGPT, dodaj klucz OPENAI_API_KEY w ustawieniach Vercela.`);
    }

    try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Jesteś miłym asystentem AI w aplikacji muzycznej z polskim YouTube. Użytkownik słucha utworu: "${author} - ${title}". Odpowiadaj na pytania wprost, po polsku.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 400
            })
        });

        const data = await openAiRes.json();
        
        if (data.choices && data.choices.length > 0) {
            return res.status(200).send(data.choices[0].message.content);
        } else {
            return res.status(200).send("Nie udało się uzyskać odpowiedzi od modelu AI.");
        }

    } catch (error) {
        return res.status(200).send("Wystąpił błąd podczas komunikacji z API OpenAI.");
    }
}
