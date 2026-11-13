// Serverless API for Multi-Device Cloud Sync via Vercel KV (Upstash Redis)

function sanitizeSyncCode(code) {
  if (typeof code !== 'string') return '';
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (req.method === 'GET') {
    const rawCode = req.query.syncCode || '';
    const syncCode = sanitizeSyncCode(rawCode);

    if (!syncCode || syncCode.length < 4) {
      return res.status(400).json({ ok: false, error: 'Invalid sync code. Must be at least 4 characters.' });
    }

    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        ok: false,
        isConfigured: false,
        error: 'KV_NOT_CONFIGURED',
        message: 'Vercel KV is not linked yet in your Vercel Project Dashboard.'
      });
    }

    try {
      const fetchUrl = `${kvUrl.replace(/\/$/, '')}/get/wq_sync_${encodeURIComponent(syncCode)}`;
      const kvRes = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await kvRes.json();

      if (!data || data.result === null || data.result === undefined) {
        return res.status(200).json({
          ok: true,
          isConfigured: true,
          found: false,
          syncCode
        });
      }

      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      return res.status(200).json({
        ok: true,
        isConfigured: true,
        found: true,
        syncCode,
        payload: parsed.payload || parsed,
        updatedAt: parsed.updatedAt || Date.now()
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err.message || 'Failed to read from cloud storage.'
      });
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const syncCode = sanitizeSyncCode(body.syncCode);

    if (!syncCode || syncCode.length < 4) {
      return res.status(400).json({ ok: false, error: 'Invalid sync code. Must be at least 4 characters.' });
    }

    if (!body.payload) {
      return res.status(400).json({ ok: false, error: 'Missing sync payload.' });
    }

    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        ok: false,
        isConfigured: false,
        error: 'KV_NOT_CONFIGURED',
        message: 'Vercel KV is not linked yet in your Vercel Project Dashboard.'
      });
    }

    try {
      const record = {
        syncCode,
        updatedAt: body.updatedAt || Date.now(),
        payload: body.payload
      };

      // Set key with 90-day expiry (7776000 seconds)
      const fetchUrl = `${kvUrl.replace(/\/$/, '')}/set/wq_sync_${encodeURIComponent(syncCode)}?ex=7776000`;
      const kvRes = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });
      const kvData = await kvRes.json();

      return res.status(200).json({
        ok: true,
        isConfigured: true,
        syncCode,
        updatedAt: record.updatedAt,
        kvStatus: kvData.result || 'OK'
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err.message || 'Failed to save to cloud storage.'
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
