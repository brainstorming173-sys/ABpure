import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Check, Smartphone } from 'lucide-react';
import { api } from '../api.js';

const NETWORK_NAMES = { mtn: 'MTN MoMo', telecel: 'Telecel Cash', airteltigo: 'AirtelTigo Money' };
const input = 'w-full rounded-xl border border-brand-300 bg-white px-4 py-3';

function CopyNumber({ number }) {
  const [done, setDone] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(number); setDone(true); setTimeout(() => setDone(false), 1500); };
  return (
    <div className="flex items-center justify-between rounded-2xl border border-brand-300 bg-white px-5 py-4">
      <span className="text-xl font-extrabold">{number}</span>
      <button type="button" onClick={copy} className="flex items-center gap-1 font-bold text-brand-700">
        {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {done ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function Pay() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [form, setForm] = useState({ reference: '', transactionId: '', paidFrom: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    Promise.all([api.getOrder(id), api.getSettings()])
      .then(([o, s]) => {
        setOrder(o); setNumbers(s.paymentNumbers);
        setForm((f) => ({ ...f, reference: o.reference, paidFrom: o.momo_number || '' }));
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { await api.submitPayment(id, form); nav(`/order/${id}`); }
    catch (err) { setError(err.message); }
  };

  if (!order) return <p className="px-5 py-16 text-center">{error || 'Loading your order…'}</p>;
  const total = Number(order.total);

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4 px-5 py-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
        <Smartphone className="h-7 w-7 text-brand-700" />
      </div>
      <h1 className="text-center text-4xl font-black">Send GH₵{total}</h1>
      <p className="text-center text-brand-700">
        Send exactly <b>GH₵{total}</b> from your {NETWORK_NAMES[order.network]} to either number below.
        Use <b>{order.reference}</b> as the reference if your network asks for one.
      </p>
      {numbers.map((n) => <CopyNumber key={n} number={n} />)}

      <p className="pt-2 text-brand-700">
        Once the money is sent, enter the details from your confirmation SMS so we can match your payment.
      </p>
      <label className="block font-extrabold" htmlFor="ref">Reference</label>
      <input id="ref" required value={form.reference} onChange={set('reference')} className={input} />
      <label className="block font-extrabold" htmlFor="txn">Transaction ID</label>
      <input id="txn" required value={form.transactionId} onChange={set('transactionId')} className={input} />
      <label className="block font-extrabold" htmlFor="from">Number you sent from</label>
      <input id="from" required value={form.paidFrom} onChange={set('paidFrom')} className={input} />
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      <button className="w-full rounded-full bg-brand-700 py-4 font-bold text-white">I’ve sent the money</button>
    </form>
  );
}
