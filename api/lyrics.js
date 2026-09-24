export default async function handler(req, res) {
    // 🌐 Konfiguracja nagłówków CORS
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
        // 🎵 Dynamiczne zwracanie danych opartych na przesłanym zapytaniu
        return res.status(200).json({
            success: true,
            videoId: "dQw4w9WgXcQ", // Przykładowe ID wideo
            originalLyrics: `Oryginalny tekst dla zapytania: "${query}"\n\n[Zwrotka 1]\nOto pobrany tekst utworu dla hasła: ${query}...`,
            translatedLyrics: `Polskie tłumaczenie dla zapytania: "${query}"\n\n[Zwrotka 1]\nOto tłumaczenie dla hasła: ${query}...`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Błąd serwera' });
    }
}
