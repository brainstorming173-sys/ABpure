import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { api } from '../api.js';

function message(o) {
  if (o.status === 'cancelled') return 'This order was cancelled.';
  if (o.status === 'completed') return 'Delivered. Enjoy your water.';
  if (o.status === 'out_for_delivery') return 'Your order is out for delivery.';
  if (o.status === 'preparing') return 'Your order is being prepared.';
  if (o.status === 'confirmed') return 'Your order is confirmed.';
  if (o.payment_method === 'momo') {
    if (o.payment_status === 'unpaid') return 'We are still waiting for your payment details.';
    if (o.payment_status === 'paid') return 'Payment received. We will confirm your order shortly.';
    return 'Thanks. We are matching your payment and will confirm your order shortly.';
  }
  return 'Your order is placed. You will pay on delivery.';
}

export default function OrderDone() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { api.getOrder(id).then(setOrder).catch(() => {}); }, [id]);
  if (!order) return <p className="px-5 py-16 text-center">Loading your order…</p>;

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <CheckCircle className="mx-auto h-14 w-14 text-brand-500" />
      <h1 className="mt-4 text-3xl font-black">Order {order.reference}</h1>
      <p className="mt-3 text-brand-700">{message(order)}</p>
      {order.payment_method === 'momo' && order.payment_status === 'unpaid' && order.status === 'new' && (
        <Link to={`/pay/${order.id}`} className="mt-3 inline-block font-bold underline">Enter payment details</Link>
      )}
      <p className="mt-2 font-bold">Total: GH₵{Number(order.total)}</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 font-bold text-white">Back to home</Link>
    </div>
  );
}
