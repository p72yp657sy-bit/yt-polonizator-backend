(function() {
    const extensionBox = document.createElement('div');
    extensionBox.id = "ai-extension-container";
    extensionBox.style.cssText = "margin: 15px auto; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 12px; color: #fff; font-family: sans-serif; max-width: 600px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
    
    extensionBox.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; color: #a78bfa; display: flex; align-items: center; gap: 8px;">
            <span>✨ Moduł Dodatkowy AI</span>
        </div>
        <button id="fetch-song-lyrics-btn" style="background: #7c3aed; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%;">📜 Pokaż tekst piosenki</button>
        <div id="ai-song-lyrics-box" style="margin-top: 12px; white-space: pre-wrap; max-height: 250px; overflow-y: auto; font-size: 14px; line-height: 1.5; display: none; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);"></div>
    `;

    window.addEventListener('DOMContentLoaded', () => {
        const chatElement = document.querySelector('textarea, input[type="text"]') || document.body;
        if (chatElement && chatElement !== document.body) {
            chatElement.parentNode.insertBefore(extensionBox, chatElement.nextSibling);
        } else {
            document.body.appendChild(extensionBox);
        }
    });

    document.addEventListener('click', async (e) => {
        if (e.target && e.target.id === 'fetch-song-lyrics-btn') {
            const box = document.getElementById('ai-song-lyrics-box');
            box.style.display = 'block';
            box.innerText = "Pobieranie tekstu piosenki...";

            // Próbujemy wyciągnąć tytuł z zielonego paska statusu na stronie
            let songInfo = "Nieznany";
            const statusElements = document.querySelectorAll('*');
            for (let el of statusElements) {
                if (el.innerText && el.innerText.includes("Odtwarzam")) {
                    songInfo = el.innerText.replace("Odtwarzam -", "").trim();
                    break;
                }
            }

            try {
                const res = await fetch(`/api/song-lyrics?title=${encodeURIComponent(songInfo)}&author=`);
                const text = await res.text();
                box.innerText = text;
            } catch (err) {
                box.innerText = "Błąd podczas pobierania tekstu.";
            }
        }
    });
})();
