import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import miscRoutes from './routes/misc.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET) console.warn('JWT_SECRET is not set.');

app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', miscRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// One Node process serves the built frontend in production.
if (isProd) {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side.' });
});

// Delivery pin columns. Safe to run on every start; does nothing once they exist.
query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION; ALTER TABLE orders ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;')
  .catch((e) => console.warn('Could not add lat/lng columns:', e.message));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
