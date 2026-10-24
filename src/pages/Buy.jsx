import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Droplet, Smartphone } from 'lucide-react';
import QtyInput from '../components/QtyInput.jsx';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const METHODS = [
  ['momo', 'Pay now with mobile money', 'MTN, Telecel or AirtelTigo: send money to our number, then confirm with your transaction ID.'],
  ['cod', 'Cash on delivery', 'Pay the rider or at pickup.'],
  ['momo_delivery', 'MoMo on delivery', 'Send MoMo to the rider when your order arrives.'],
];
const NETWORKS = [['mtn', 'MTN', 'MoMo'], ['telecel', 'Telecel', 'Cash'], ['airteltigo', 'AirtelTigo', 'Money']];
const input = 'w-full rounded-xl border border-brand-300 bg-white px-4 py-3';

const QUICK = [10, 50, 100];

export default function Buy() {
  const { productId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [product, setProduct] = useState(undefined); // undefined = loading, null = not found
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState('momo');
  const [network, setNetwork] = useState('');
  const [form, setForm] = useState({ phone: '', address: '', momoNumber: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api.getProducts().then((list) => setProduct(list.find((p) => p.id === productId) || null)).catch(() => setProduct(null));
  }, [productId]);

  if (product === undefined) return <p className="px-5 py-16 text-center">Loading…</p>;
  if (product === null)
    return <p className="px-5 py-16 text-center">That product is not available. <Link to="/#products" className="font-bold underline">Browse products</Link></p>;

  const price = Number(product.price);
  const total = price * qty;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { order } = await api.createOrder({
        items: [{ productId: product.id, qty }],
        paymentMethod: method, network, ...form,
      });
      nav(method === 'momo' ? `/pay/${order.id}` : `/order/${order.id}`);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-6 px-5 py-12">
      <h1 className="text-3xl font-black text-brand-700">Place your order</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-brand-300 bg-brand-100/60 p-4">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="h-24 w-24 rounded-xl object-contain" />
          : <div className="flex h-24 w-24 items-center justify-center"><Droplet className="h-10 w-10 text-brand-300" /></div>}
        <div>
          <p className="text-xl font-extrabold text-brand-700">{product.name}</p>
          <p className="text-sm text-brand-500">{product.size}</p>
          <p className="font-bold">GH₵ {price.toFixed(2)} each</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-extrabold">How many bags?</h2>
        <QtyInput value={qty} onChange={setQty} />
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK.map((n) => (
            <button key={n} type="button" onClick={() => setQty(n)}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold ${qty === n ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-300 text-brand-700'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {!user ? (
        <p className="rounded-2xl bg-brand-100 p-4 text-center">
          <Link to="/login" state={{ from: loc.pathname }} className="font-bold underline">Sign in</Link> to fill in your details and place this order.
        </p>
      ) : (
        <>
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
            <div className="flex justify-between text-sm"><span>{qty} × GH₵{price.toFixed(2)}</span></div>
            <div className="flex justify-between pt-1 text-xl font-black"><span>Total</span><span>GH₵{total.toFixed(2)}</span></div>
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button disabled={busy || (method === 'momo' && !network)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-4 font-bold text-white disabled:opacity-50">
            {method === 'momo' && <Smartphone className="h-4 w-4" />}
            {method === 'momo' ? `Pay GH₵${total.toFixed(2)}` : 'Place order'}
          </button>
        </>
      )}
    </form>
  );
}
