import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChat } from './lib/chat-core';
import { handleContact } from './lib/contact-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
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
app.listen(port, () => console.log('Server on ' + port));
