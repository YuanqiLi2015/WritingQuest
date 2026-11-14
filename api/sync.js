// Serverless API for Multi-Device Cloud Sync via Upstash Redis / Vercel KV

function sanitizeSyncCode(code) {
  if (typeof code !== 'string') return '';
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

async function runRedisCommand(kvUrl, kvToken, commandArray) {
  const baseUrl = kvUrl.replace(/\/$/, '');
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kvToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commandArray)
  });

  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Invalid response from Redis storage: ${rawText.slice(0, 100)}`);
  }

  if (data.error) {
    throw new Error(`Redis Error: ${data.error}`);
  }

  return data.result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (req.method === 'GET') {
    const rawCode = req.query.syncCode || '';
    const isCheckOnly = req.query.check === '1';

    if (isCheckOnly) {
      return res.status(200).json({
        ok: true,
        isConfigured: Boolean(kvUrl && kvToken),
        hasUrl: Boolean(kvUrl),
        hasToken: Boolean(kvToken)
      });
    }

    const syncCode = sanitizeSyncCode(rawCode);
    if (!syncCode || syncCode.length < 4) {
      return res.status(400).json({ ok: false, error: 'Invalid sync code. Must be at least 4 characters.' });
    }

    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        ok: false,
        isConfigured: false,
        error: 'STORAGE_NOT_CONFIGURED',
        message: 'Upstash Redis environment variables are not active. If you just connected Upstash in Vercel Storage, please click Deployments -> Redeploy in Vercel to activate them.'
      });
    }

    try {
      const redisKey = `wq_sync_${syncCode}`;
      let rawResult;

      try {
        rawResult = await runRedisCommand(kvUrl, kvToken, ['GET', redisKey]);
      } catch (cmdErr) {
        // Fallback to path-based endpoint if command array is not supported
        const fetchUrl = `${kvUrl.replace(/\/$/, '')}/get/${encodeURIComponent(redisKey)}`;
        const fbRes = await fetch(fetchUrl, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const fbData = await fbRes.json();
        if (fbData.error) throw new Error(fbData.error);
        rawResult = fbData.result;
      }

      if (rawResult === null || rawResult === undefined) {
        return res.status(200).json({
          ok: true,
          isConfigured: true,
          found: false,
          syncCode
        });
      }

      const parsed = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult;
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
        message: 'Upstash Redis environment variables are not active. If you just connected Upstash in Vercel Storage, please click Deployments -> Redeploy in Vercel to activate them.'
      });
    }

    try {
      const redisKey = `wq_sync_${syncCode}`;
      const record = {
        syncCode,
        updatedAt: body.updatedAt || Date.now(),
        payload: body.payload
      };

      const recordJson = JSON.stringify(record);
      let setSuccess = false;

      try {
        // Set with 90-day expiry (7776000 seconds)
        const result = await runRedisCommand(kvUrl, kvToken, [
          'SET',
          redisKey,
          recordJson,
          'EX',
          7776000
        ]);
        setSuccess = Boolean(result);
      } catch (cmdErr) {
        // Fallback to path-based endpoint
        const fetchUrl = `${kvUrl.replace(/\/$/, '')}/set/${encodeURIComponent(redisKey)}`;
        const fbRes = await fetch(fetchUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: recordJson
        });
        const fbData = await fbRes.json();
        if (fbData.error) throw new Error(fbData.error);
        setSuccess = true;
      }

      return res.status(200).json({
        ok: true,
        isConfigured: true,
        syncCode,
        updatedAt: record.updatedAt,
        success: setSuccess
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
