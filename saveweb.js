export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      status: '✅ API RUNNING',
      endpoints: {
        'GET /api/download?url=https://example.com': 'Ambil HTML source',
        'GET /api/download?url=https://example.com&type=links': 'Ambil semua link (CSS/JS/IMG)',
        'GET /api/download?url=https://example.com&type=full': 'Ambil HTML + semua assets'
      }
    });
  }

  const targetUrl = req.query.url || req.body?.url;
  const type = req.query.type || req.body?.type || 'html';

  if (!targetUrl) {
    return res.status(400).json({ error: '❌ Parameter url wajib diisi' });
  }

  // validasi URL
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: '❌ URL tidak valid' });
  }

  try {

    // ─── Ambil HTML utama ───
    const htmlRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = await htmlRes.text();
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    if (type === 'html') {
      return res.status(200).json({
        success: true,
        url: targetUrl,
        status: htmlRes.status,
        html
      });
    }

    // ─── Ekstrak semua links ───
    const extractLinks = (html) => {
      const assets = { css: [], js: [], images: [], links: [] };

      // CSS
      const cssMatches = html.matchAll(/href=["']([^"']*\.css[^"']*)/g);
      for (const m of cssMatches) assets.css.push(resolveUrl(m[1], baseUrl));

      // JS
      const jsMatches = html.matchAll(/src=["']([^"']*\.js[^"']*)/g);
      for (const m of jsMatches) assets.js.push(resolveUrl(m[1], baseUrl));

      // Images
      const imgMatches = html.matchAll(/src=["']([^"']*\.(png|jpg|jpeg|gif|svg|webp)[^"']*)/g);
      for (const m of imgMatches) assets.images.push(resolveUrl(m[1], baseUrl));

      // All href links
      const linkMatches = html.matchAll(/href=["']([^"'#][^"']*)/g);
      for (const m of linkMatches) assets.links.push(resolveUrl(m[1], baseUrl));

      return assets;
    };

    const resolveUrl = (url, base) => {
      if (url.startsWith('http')) return url;
      if (url.startsWith('//')) return 'https:' + url;
      if (url.startsWith('/')) return base + url;
      return base + '/' + url;
    };

    if (type === 'links') {
      const assets = extractLinks(html);
      return res.status(200).json({
        success: true,
        url: targetUrl,
        assets
      });
    }

    // ─── Full: HTML + download semua assets ───
    if (type === 'full') {
      const assets = extractLinks(html);

      const fetchAsset = async (url) => {
        try {
          const r = await fetch(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000)
          });
          const content = await r.text();
          return { url, status: r.status, size: content.length, content };
        } catch (e) {
          return { url, error: e.message };
        }
      };

      // Download CSS & JS (max 5 file masing-masing)
      const cssFiles = await Promise.all(assets.css.slice(0, 5).map(fetchAsset));
      const jsFiles = await Promise.all(assets.js.slice(0, 5).map(fetchAsset));

      return res.status(200).json({
        success: true,
        url: targetUrl,
        html,
        assets: {
          css: cssFiles,
          js: jsFiles,
          images: assets.images,
          links: assets.links
        }
      });
    }

  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message
    });
  }
}
