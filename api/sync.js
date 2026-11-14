// Serverless API for Multi-Device Cloud Sync via Upstash Redis / Vercel KV

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

  const kvUrl = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
  const kvToken = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim();

  if (req.method === 'GET') {
    if (req.query.check === '1') {
      return res.status(200).json({
        ok: true,
        isConfigured: Boolean(kvUrl && kvToken),
        hasUrl: Boolean(kvUrl),
        hasToken: Boolean(kvToken)
      });
    }

    const syncCode = sanitizeSyncCode(req.query.syncCode || '');
    if (!syncCode || syncCode.length < 4) {
      return res.status(400).json({ ok: false, error: 'Invalid sync code. Must be at least 4 characters.' });
    }

    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        ok: false,
        isConfigured: false,
        error: 'STORAGE_NOT_CONFIGURED',
        message: 'Upstash Redis environment variables are not active. In Vercel, please click Deployments -> Redeploy to activate them.'
      });
    }

    try {
      const redisKey = `wq_sync_${syncCode}`;
      const fetchUrl = `${kvUrl}/get/${encodeURIComponent(redisKey)}`;
      const kvRes = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });

      if (!kvRes.ok) {
        const text = await kvRes.text();
        return res.status(500).json({
          ok: false,
          isConfigured: true,
          error: `Upstash HTTP ${kvRes.status}: ${text}`
        });
      }

      const data = await kvRes.json();
      if (data.error) {
        return res.status(500).json({
          ok: false,
          isConfigured: true,
          error: `Redis Error: ${data.error}`
        });
      }

      if (data.result === null || data.result === undefined) {
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
        isConfigured: true,
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
        error: 'STORAGE_NOT_CONFIGURED',
        message: 'Upstash Redis environment variables are not active. In Vercel, please click Deployments -> Redeploy to activate them.'
      });
    }

    try {
      const redisKey = `wq_sync_${syncCode}`;
      const record = {
        syncCode,
        updatedAt: body.updatedAt || Date.now(),
        payload: body.payload
      };

      const fetchUrl = `${kvUrl}/set/${encodeURIComponent(redisKey)}`;
      const kvRes = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });

      if (!kvRes.ok) {
        const text = await kvRes.text();
        return res.status(500).json({
          ok: false,
          isConfigured: true,
          error: `Upstash HTTP ${kvRes.status}: ${text}`
        });
      }

      const data = await kvRes.json();
      if (data.error) {
        return res.status(500).json({
          ok: false,
          isConfigured: true,
          error: `Redis Error: ${data.error}`
        });
      }

      return res.status(200).json({
        ok: true,
        isConfigured: true,
        syncCode,
        updatedAt: record.updatedAt,
        status: data.result || 'OK'
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        isConfigured: true,
        error: err.message || 'Failed to save to cloud storage.'
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
