import formidable from 'formidable-serverless';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

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

  const form = new formidable.IncomingForm();
  form.uploadDir = '/tmp';
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const file = files.file || Object.values(files)[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const fileInfo = {
      originalName: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
      tempPath: file.filepath,
      downloadUrl: `/api/upload/download?file=${encodeURIComponent(path.basename(file.filepath))}`
    };
    res.status(200).json({ success: true, file: fileInfo });
  });
}
