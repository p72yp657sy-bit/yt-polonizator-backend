import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default function handler(req, res) {
    // Ustawienie nagłówków CORS, żeby strona mogła swobodnie pytać serwer
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { prompt, title, author } = req.query;

    if (!prompt) {
        return res.status(400).send("Brak zapytania do AI.");
    }

    // Uruchomienie prawdziwego OpenAI (ChatGPT) z kontekstem utworu
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Jesteś zaawansowanym, miłym asystentem AI w aplikacji muzycznej. Użytkownik aktualnie słucha utworu: "${author || 'Nieznany'} - ${title || 'Nieznany'}". Odpowiadaj na jego pytania w sposób wyczerpujący (jak prawdziwy ChatGPT), po polsku.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 500,
        });

        const reply = response.choices[0].message.content;
        res.status(200).send(reply);

    } catch (error) {
        // Fallback, jeśli klucz OpenAI nie jest skonfigurowany, żeby aplikacja nie padła
        res.status(200).send(`Oto odpowiedź AI na Twoje pytanie: "${prompt}". (Upewnij się, że w zmiennych środowiskowych Vercela dodano klucz OPENAI_API_KEY, aby AI odpowiadało w pełni autonomicznie na każdy temat!)`);
    }
}
