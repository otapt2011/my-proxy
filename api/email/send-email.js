import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const { to, subject, html, from } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'Missing to/subject' });
  try {
    const { data, error } = await resend.emails.send({
      from: from || 'onboarding@resend.dev',
      to,
      subject,
      html: html || `<p>${subject}</p>`,
    });
    if (error) throw new Error(error.message);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
