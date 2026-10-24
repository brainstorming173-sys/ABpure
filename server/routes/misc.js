import { Router } from 'express';
import { team } from '../store.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { settings } from '../config.js';
import { upload, uploadToCloudinary } from '../cloudinary.js';

const router = Router();

router.get('/settings', (_req, res) => res.json(settings));
router.get('/team', async (_req, res) => res.json(await team.list()));

router.post('/upload', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Attach an image file (max 5 MB).' });
  const result = await uploadToCloudinary(req.file.buffer);
  res.status(201).json({ url: result.secure_url });
});

export default router;
