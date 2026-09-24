export default async function handler(req, res) {
    // Konfiguracja nagłówków CORS dla bezpieczeństwa i dostępu z frontendu
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { query } = req.body;
    
    if (query) {
        return res.status(400).json({ error: 'Brak parametru title' });
    }

    try {
        // Przykładowa struktura zwracanego tekstu dla żądanego utworu
        // Możesz tu podpiąć logikę pobierania tekstów z wybranego źródła
        const formattedLyrics = `Oryginalny / Przetłumaczony tekst dla: ${title}\n\n[Zwrotka 1]\nPrzykładowa linijka tekstu piosenki po polsku...\nKolejna linijka utworu...`;

        return res.status(200).json({
            success: true,
            title: title,
            lyrics: formattedLyrics
        });
    } catch (error) {
        return res.status(500).json({ error: 'Błąd podczas pobierania tekstu' });
    }
}
