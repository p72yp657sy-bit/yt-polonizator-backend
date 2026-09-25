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

    if (!apiKey) {
        return res.status(500).send("Brak skonfigurowanego klucza OPENAI_API_KEY w zmiennych Vercela.");
    }

    try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Jesteś inteligentnym, wszechstronnym asystentem AI (ChatGPT) wbudowanym w aplikację muzyczną. Użytkownik słucha aktualnie utworu: "${author} - ${title}". Odpowiadaj na jego pytania wyczerpująco i naturalnie po polsku.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await openAiRes.json();
        
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return res.status(200).send(data.choices[0].message.content);
        } else if (data.error) {
            console.error("OpenAI API Error:", data.error);
            return res.status(200).send(`Błąd OpenAI: ${data.error.message}`);
        } else {
            return res.status(200).send("Otrzymano pustą odpowiedź od modelu AI.");
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(200).send("Wystąpił błąd krytyczny po stronie serwera.");
    }
}
