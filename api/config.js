import { normalizeModel } from './_shared.js';

export default async function handler(req, res) {
  const envKey = process.env.GEMINI_API_KEY || '';
  const envModel = normalizeModel(process.env.GEMINI_MODEL);

  if (req.method === 'GET') {
    const hasServerKey = Boolean(envKey && envKey.trim().length > 8);
    const maskedKey = hasServerKey
      ? `${envKey.slice(0, 4)}••••••${envKey.slice(-4)}`
      : '';
    return res.status(200).json({
      hasServerKey,
      maskedKey,
      model: envModel
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const chosenModel = normalizeModel(body.model || envModel);
    const activeKey = (body.apiKey || envKey || '').trim();
    const hasServerKey = Boolean(activeKey.length > 8);
    const maskedKey = hasServerKey
      ? `${activeKey.slice(0, 4)}••••••${activeKey.slice(-4)}`
      : '';
    return res.status(200).json({
      ok: true,
      hasServerKey,
      maskedKey,
      model: chosenModel
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
