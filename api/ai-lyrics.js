export default async function handler(req, res) {
    const { title, author } = req.query;

    if (!title) {
        return res.status(400).send("Brak tytułu utworu.");
    }

    try {
        // 1. Czyszczenie tytułu i autora ze śmieci YouTube (VEVO, Official, nawiasy, wytwórnie)
        let cleanTitle = title
            .replace(/\(Official.*?\)/gi, '')
            .replace(/\[Official.*?\]/gi, '')
            .replace(/official music video/gi, '')
            .replace(/lyrics/gi, '')
            .trim();

        let cleanAuthor = author ? author
            .replace(/VEVO/gi, '')
            .replace(/- Topic/gi, '')
            .replace(/Records/gi, '')
            .replace(/Hollywood/gi, '') // usuwa problematyczne słowa jak Hollywood
            .trim() : '';

        // 2. Przygotowanie kilku wariantów zapytań do YouTube, żeby uniknąć zacięcia
        const searchQueries = [
            `${cleanAuthor} ${cleanTitle} lyrics`,
            `${cleanTitle} ${cleanAuthor}`,
            cleanTitle // Ostatnia deska ratunku - sam tytuł
        ];

        let lyricsFound = null;

        // Próbujemy kolejnych wariantów zapytania, dopóki któryś nie zadziała
        for (const query of searchQueries) {
            if (!query.trim()) continue;
            
            try {
                // Tutaj wywołujesz swoją logikę pobierania z YouTube / serwisu z tekstami
                // np. szukanie filmiku lub napisu pasującego do zapytania `query`
                lyricsFound = await fetchLyricsFromProvider(query);
                if (lyricsFound) break; // Jeśli znaleziono, przerywamy pętlę
            } catch (e) {
                // Ignorujemy błąd pojedynczej próby i lecimy do kolejnego wariantu
            }
        }

        if (lyricsFound) {
            res.status(200).send(lyricsFound);
        } else {
            res.status(404).send("Nie udało się znaleźć tekstu dla podanego utworu. Spróbuj wybrać inny wynik z listy.");
        }

    } catch (error) {
        res.status(500).send("Błąd serwera AI. Spróbuj ponownie.");
    }
}
