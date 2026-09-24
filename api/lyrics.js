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
        // 🎵 Dynamiczna odpowiedź dopasowana do wpisanego zapytania
        return res.status(200).json({
            success: true,
            videoId: "9bZkp7q19f0", // Domyślne wideo testowe
            originalLyrics: `Oryginalny tekst utworu dla: ${query}\n\n[Zwrotka 1]\nTekst w oryginale...`,
            translatedLyrics: `Polskie tłumaczenie dla utworu: ${query}\n\n[Zwrotka 1]\nPrzetłumaczony tekst...`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Błąd serwera' });
    }
}
