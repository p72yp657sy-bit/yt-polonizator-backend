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

    // Używamy zmiennej GROQ_API_KEY
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
                model: "llama3-8b-8192",


                messages: [
                    {
                        role: "system",
                        content: `Jesteś inteligentnym asystentem AI w aplikacji muzycznej. Użytkownik słucha utworu: "${author || 'Nieznany'} - ${title || 'Nieznany'}". Odpowiadaj naturalnie i po polsku.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await groqRes.json();
        
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return res.status(200).send(data.choices[0].message.content);
        } else if (data.error) {
            return res.status(200).send(`Groq Error: ${data.error.message}`);
        } else {
            return res.status(200).send("Otrzymano pustą odpowiedź od Groq.");
        }

    } catch (error) {
        return res.status(200).send("Wystąpił błąd techniczny podczas łączenia z Groq.");
    }
}
