import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Authorization, Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
  if (authHeader !== process.env.API_SECRET_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const { command, key, value, ttl } = req.body;
  try {
    let result;
    switch (command) {
      case 'get': result = await redis.get(key); break;
      case 'set': result = await redis.set(key, value); if (ttl) await redis.expire(key, ttl); break;
      case 'del': result = await redis.del(key); break;
      case 'incr': result = await redis.incr(key); break;
      default: return res.status(400).json({ error: 'Unsupported command' });
    }
    res.status(200).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
