import { Router } from 'express';
import { team } from '../store.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { settings } from '../config.js';
import { upload, uploadToCloudinary } from '../cloudinary.js';

const router = Router();

router.get('/settings', (_req, res) => res.json(settings));
router.get('/team', async (_req, res) => res.json(await team.list()));

router.post('/team', requireAuth, requireAdmin, async (req, res) => {
  if (!req.body.name || !req.body.title) return res.status(400).json({ error: 'Name and title are required.' });
  res.status(201).json(await team.create(req.body));
});

router.put('/team/:id', requireAuth, requireAdmin, async (req, res) => {
  const m = await team.update(req.params.id, req.body);
  m ? res.json(m) : res.status(404).json({ error: 'Team member not found.' });
});

router.delete('/team/:id', requireAuth, requireAdmin, async (req, res) => {
  await team.remove(req.params.id);
  res.json({ ok: true });
});

router.post('/upload', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Attach an image file (max 5 MB).' });
  const result = await uploadToCloudinary(req.file.buffer);
  res.status(201).json({ url: result.secure_url });
});

export default router;
