import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Smartphone } from 'lucide-react';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const METHODS = [
  ['momo', 'Pay now with mobile money', 'MTN, Telecel or AirtelTigo: send money to our number, then confirm with your transaction ID.'],
  ['cod', 'Cash on delivery', 'Pay the rider or at pickup.'],
  ['momo_delivery', 'MoMo on delivery', 'Send MoMo to the rider when your order arrives.'],
];
const NETWORKS = [['mtn', 'MTN', 'MoMo'], ['telecel', 'Telecel', 'Cash'], ['airteltigo', 'AirtelTigo', 'Money']];
const input = 'w-full rounded-xl border border-brand-300 bg-white px-4 py-3';

export default function Checkout() {
  const { user } = useAuth();
  const { items, setQty, clear, subtotal } = useCart();
  const nav = useNavigate();
  const [method, setMethod] = useState('momo');
  const [network, setNetwork] = useState('');
  const [form, setForm] = useState({ phone: '', address: '', momoNumber: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const total = subtotal;

  if (!items.length)
    return <p className="px-5 py-16 text-center">Your cart is empty. <Link to="/#products" className="font-bold underline">Browse products</Link></p>;
  if (!user)
    return <p className="px-5 py-16 text-center"><Link to="/login" className="font-bold underline">Sign in</Link> to place your order.</p>;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { order } = await api.createOrder({
        items: items.map((i) => ({ productId: i.id, qty: i.qty })),
        paymentMethod: method, network, ...form,
      });
      clear();
      nav(method === 'momo' ? `/pay/${order.id}` : `/order/${order.id}`);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-6 px-5 py-12">
      <h1 className="text-3xl font-black">Checkout</h1>

      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-xl bg-white p-3">
            <span className="font-bold">{i.name}</span>
            <span className="flex items-center gap-3">
              <button type="button" aria-label="Decrease" onClick={() => setQty(i.id, i.qty - 1)}><Minus className="h-4 w-4" /></button>
              {i.qty}
              <button type="button" aria-label="Increase" onClick={() => setQty(i.id, i.qty + 1)}><Plus className="h-4 w-4" /></button>
              <span className="w-20 text-right">GH₵{i.price * i.qty}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <input required placeholder="Phone number" value={form.phone} onChange={set('phone')} className={input} />
        <textarea required placeholder="Delivery address" value={form.address} onChange={set('address')} className={input} rows={2} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-extrabold">Payment</h2>
        {METHODS.map(([id, title, text]) => (
          <button type="button" key={id} onClick={() => setMethod(id)}
            className={`w-full rounded-2xl border p-4 text-left ${method === id ? 'border-brand-700 bg-brand-100' : 'border-brand-300 bg-white'}`}>
            <span className="block font-extrabold">{title}</span>
            <span className="text-sm text-brand-700">{text}</span>
          </button>
        ))}
      </div>

      {method === 'momo' && (
        <div className="space-y-3 rounded-2xl bg-white p-4">
          <h3 className="font-extrabold">Network</h3>
          <div className="grid grid-cols-3 gap-2">
            {NETWORKS.map(([id, name, sub]) => (
              <button type="button" key={id} onClick={() => setNetwork(id)}
                className={`rounded-xl border p-3 text-center ${network === id ? 'border-brand-700 bg-brand-100' : 'border-brand-300'}`}>
                <span className="block font-extrabold">{name}</span><span className="text-sm">{sub}</span>
              </button>
            ))}
          </div>
          <label className="block font-extrabold" htmlFor="momo">Mobile money number</label>
          <input id="momo" placeholder="024 000 0000" value={form.momoNumber} onChange={set('momoNumber')} className={input} />
          <p className="text-sm text-brand-700">Leave blank to use your phone number above.</p>
        </div>
      )}

      <div className="space-y-1 border-t border-brand-300 pt-4">
        <div className="flex justify-between pt-2 text-xl font-black"><span>Total</span><span>GH₵{total}</span></div>
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button disabled={busy || (method === 'momo' && !network)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-4 font-bold text-white disabled:opacity-50">
        {method === 'momo' && <Smartphone className="h-4 w-4" />}
        {method === 'momo' ? `Pay GH₵${total}` : 'Place order'}
      </button>
    </form>
  );
}
