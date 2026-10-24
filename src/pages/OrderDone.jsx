import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { api } from '../api.js';

const MESSAGES = {
  pending: 'Your order is placed. You will pay on delivery.',
  awaiting_confirmation: 'Thanks. We are matching your payment and will confirm your order shortly.',
  paid: 'Payment confirmed. Your water is being prepared.',
  confirmed: 'Your order is confirmed and being prepared.',
  delivered: 'Delivered. Enjoy your water.',
  cancelled: 'This order was cancelled.',
};

export default function OrderDone() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { api.getOrder(id).then(setOrder).catch(() => {}); }, [id]);
  if (!order) return <p className="px-5 py-16 text-center">Loading your order…</p>;

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <CheckCircle className="mx-auto h-14 w-14 text-brand-500" />
      <h1 className="mt-4 text-3xl font-black">Order {order.reference}</h1>
      <p className="mt-3 text-brand-700">{MESSAGES[order.status]}</p>
      <p className="mt-2 font-bold">Total: GH₵{Number(order.total)}</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 font-bold text-white">Back to home</Link>
    </div>
  );
}
