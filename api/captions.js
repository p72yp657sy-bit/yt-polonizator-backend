export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Brak videoId' });

  const cleanId = videoId.substring(0, 11);

  try {
    const listRes = await fetch(`https://video.google.com/timedtext?type=list&v=${cleanId}`);
    const listText = await listRes.text();

    if (!listText.includes('lang_code')) {
      return res.status(404).json({ error: 'Brak napisów dla tego filmu.' });
    }

    let lang = 'en';
    if (!listText.includes('lang_code="en"')) {
      if (listText.includes('lang_code="pl"')) {
        lang = 'pl';
      } else {
        const matchLang = listText.match(/lang_code="([^"]+)"/);
        if (matchLang) lang = matchLang[1];
      }
    }

    const subRes = await fetch(`https://www.google.com/timedtext?lang=${lang}&v=${cleanId}`);
    const subText = await subRes.text();

    if (!subText || subText.trim() === '') {
      return res.status(404).json({ error: 'Pusty plik napisów.' });
    }

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(subText);

  } catch (err) {
    return res.status(500).json({ error: 'Błąd serwera: ' + err.message });
  }
}
