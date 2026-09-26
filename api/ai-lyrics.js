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

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(200).send("Błąd: Brak klucza OPENROUTER_API_KEY w zmiennych środowiskowych Vercela.");
    }

    try {
        const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`,
                "HTTP-Referer": "https://github.com",
                "X-Title": "YT Polonizator"
            },
            body: JSON.stringify({
                model: "openrouter/free", // Automatyczny router wybierający darmowe modele
                messages: [
                    {
                        role: "system",
                        content: "Jesteś miłym, wszechstronnym asystentem AI. Odpowiadaj na pytania użytkownika w naturalny sposób, pomagaj mu w codziennych sprawach i prowadź konwersację po polsku. Jeśli użytkownik poprosi Cię o włączenie jakiejś piosenki lub utworu muzycznego, w swojej odpowiedzi uwzględnij jasną komendę w formacie: WŁĄCZ: [Tytuł i Wykonawca], aby system mógł ją odtworzyć."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await openRouterRes.json();
        
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return res.status(200).send(data.choices[0].message.content);
        } else if (data.error) {
            return res.status(200).send(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
        } else {
            return res.status(200).send(`Otrzymano odpowiedź bez choices: ${JSON.stringify(data)}`);
        }

    } catch (error) {
        return res.status(200).send(`Błąd techniczny: ${error.message}`);
    }
}
