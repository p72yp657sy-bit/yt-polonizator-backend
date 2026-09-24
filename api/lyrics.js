export default async function handler(req, res) {
    // 🌐 Konfiguracja nagłówków CORS dla dostępu z frontendu
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Brak parametru query' });
    }

    try {
        // 🎵 Przygotowanie przykładowej odpowiedzi dla frontendu
        const formattedOriginal = `Oryginalny tekst utworu dla zapytania: ${query}\n\n[Zwrotka 1]\nPrzykładowy tekst w oryginale...`;
        const formattedTranslated = `Polskie tłumaczenie dla zapytania: ${query}\n\n[Zwrotka 1]\nPrzykładowe tłumaczenie...`;

        return res.status(200).json({
            success: true,
            videoId: "dQw4w9WgXcQ", // Przykładowe ID filmu z YouTube do odtwarzacza
            originalLyrics: formattedOriginal,
            translatedLyrics: formattedTranslated
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Błąd podczas pobierania tekstu' });
    }
}
