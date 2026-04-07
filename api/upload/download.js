import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Authorization');
    return res.status(200).end();
  }
  const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
  if (authHeader !== process.env.API_SECRET_KEY) return res.status(401).json({ error: 'Unauthorized' });
  const { file } = req.query;
  if (!file) return res.status(400).json({ error: 'Missing file name' });
  const filePath = path.join('/tmp', file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(filePath);
}
