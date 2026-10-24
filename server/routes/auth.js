import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { users } from '../store.js';
import { signToken, publicUser, requireAuth } from '../auth.js';
import { sendVerifyEmail, sendResetEmail } from '../email.js';

const router = Router();
const token = () => crypto.randomBytes(32).toString('hex');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8)
    return res.status(400).json({ error: 'Enter your name, email and a password of 8+ characters.' });
  if (await users.byEmail(email)) return res.status(409).json({ error: 'That email is already registered.' });

  const verifyToken = token();
  const user = await users.create({ name, email, passwordHash: await bcrypt.hash(password, 10), verifyToken });
  sendVerifyEmail(email, verifyToken);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const user = await users.byEmail(req.body.email || '');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash)))
    return res.status(401).json({ error: 'Incorrect email or password.' });
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.post('/verify-email', async (req, res) => {
  const user = await users.verifyEmail(req.body.token || '');
  if (!user) return res.status(400).json({ error: 'This verification link is invalid or already used.' });
  res.json({ ok: true });
});

router.post('/forgot-password', async (req, res) => {
  const user = await users.byEmail(req.body.email || '');
  if (user) {
    const t = token();
    await users.setReset(user.id, t, new Date(Date.now() + 60 * 60 * 1000));
    sendResetEmail(user.email, t);
  }
  res.json({ ok: true }); // same response either way
});

router.post('/reset-password', async (req, res) => {
  const { token: t, password } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ error: 'Use a password of 8+ characters.' });
  const user = await users.resetPassword(t || '', await bcrypt.hash(password, 10));
  if (!user) return res.status(400).json({ error: 'This reset link is invalid or expired.' });
  res.json({ ok: true });
});

export default router;
