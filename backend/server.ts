import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChat } from './lib/chat-core.js';
import { handleContact } from './lib/contact-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (corsOrigins.length === 0 || corsOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

app.post('/api/chat', async (req, res) => {
  try {
    const out = await handleChat(req.body || {}, process.env);
    res.json(out);
  } catch {
    res.status(400).json({ error: 'bad request' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const out = await handleContact(req.body || {}, process.env);
    res.status(out.ok ? 200 : 400).json(out);
  } catch {
    res.status(400).json({ ok: false, error: 'bad request' });
  }
});

const dist = path.resolve(__dirname, '../dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`Server on ${host}:${port}`));
