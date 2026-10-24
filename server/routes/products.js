import { Router } from 'express';
import { products } from '../store.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();

router.get('/', async (_req, res) => res.json(await products.list()));

router.get('/all', requireAuth, requireAdmin, async (_req, res) => res.json(await products.list(true)));

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  if (!req.body.name || req.body.price == null) return res.status(400).json({ error: 'Name and price are required.' });
  res.status(201).json(await products.create(req.body));
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const p = await products.update(req.params.id, req.body);
  p ? res.json(p) : res.status(404).json({ error: 'Product not found.' });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await products.remove(req.params.id);
  res.json({ ok: true });
});

export default router;
