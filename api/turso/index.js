import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

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

  const { sql, args } = req.body;
  if (!sql) return res.status(400).json({ error: 'Missing sql' });
  try {
    const result = await client.execute({ sql, args: args || [] });
    res.status(200).json({ success: true, rows: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
