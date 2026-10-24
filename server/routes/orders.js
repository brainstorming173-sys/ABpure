import { Router } from 'express';
import crypto from 'crypto';
import { orders, products } from '../store.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const METHODS = ['momo', 'cod', 'momo_delivery'];
const STATUSES = ['new', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];
const NETWORKS = ['mtn', 'telecel', 'airteltigo'];

// Create an order. Prices are calculated here, never trusted from the browser.
router.post('/', requireAuth, async (req, res) => {
  const { items, phone, address, paymentMethod, network, momoNumber } = req.body;
  const lat = Number(req.body.lat), lng = Number(req.body.lng);
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Your cart is empty.' });
  if (!phone || !address) return res.status(400).json({ error: 'Enter your phone number and delivery address.' });
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return res.status(400).json({ error: 'Pin your delivery location on the map.' });
  if (!METHODS.includes(paymentMethod)) return res.status(400).json({ error: 'Choose a payment option.' });
  if (paymentMethod === 'momo' && !NETWORKS.includes(network))
    return res.status(400).json({ error: 'Choose your mobile money network.' });

  const found = await products.byIds(items.map((i) => i.productId));
  const lines = items.map((i) => {
    const p = found.find((x) => x.id === i.productId);
    return p && { productId: p.id, name: p.name, price: Number(p.price), qty: Math.min(9999, Math.max(1, Math.floor(+i.qty) || 1)) };
  });
  if (lines.includes(undefined)) return res.status(400).json({ error: 'A product is no longer available.' });

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const order = await orders.create({
    userId: req.user.id, items: lines, total,
    phone, address, paymentMethod, lat, lng,
    network: paymentMethod === 'momo' ? network : null,
    momoNumber: paymentMethod === 'momo' ? momoNumber || phone : null,
    reference: `ABP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
  });
  res.status(201).json({ order });
});

router.get('/mine', requireAuth, async (req, res) => res.json(await orders.forUser(req.user.id)));
router.get('/', requireAuth, requireAdmin, async (_req, res) => res.json(await orders.all()));

router.get('/:id', requireAuth, async (req, res) => {
  const order = await orders.byId(req.params.id);
  if (!order || (order.user_id !== req.user.id && req.user.role !== 'admin'))
    return res.status(404).json({ error: 'Order not found.' });
  res.json(order);
});

// Customer says they've sent the money. An admin matches it against the mobile money SMS, then marks it paid.
router.post('/:id/payment', requireAuth, async (req, res) => {
  const order = await orders.byId(req.params.id);
  if (!order || order.user_id !== req.user.id) return res.status(404).json({ error: 'Order not found.' });
  if (order.payment_method !== 'momo') return res.status(400).json({ error: 'This order is paid on delivery.' });
  if (order.payment_status !== 'unpaid') return res.status(400).json({ error: 'Payment details were already submitted.' });

  const { reference, transactionId, paidFrom } = req.body;
  if (!reference || !transactionId || !paidFrom)
    return res.status(400).json({ error: 'Fill in the reference, transaction ID and the number you sent from.' });
  res.json(await orders.submitPayment(order.id, { reference, transactionId, paidFrom }));
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status.' });
  res.json(await orders.setStatus(req.params.id, req.body.status));
});

router.patch('/:id/payment-status', requireAuth, requireAdmin, async (req, res) => {
  if (!['paid', 'unpaid'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid payment status.' });
  res.json(await orders.setPaymentStatus(req.params.id, req.body.status));
});

export default router;
