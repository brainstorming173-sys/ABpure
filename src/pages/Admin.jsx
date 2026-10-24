import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Droplet, ExternalLink, LayoutDashboard, LogOut, Navigation, ShoppingBag, User, Users } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS = {
  new: 'New', confirmed: 'Confirmed', preparing: 'Preparing',
  out_for_delivery: 'Out for delivery', completed: 'Completed', cancelled: 'Cancelled',
};
const PAYMENT = { unpaid: 'Not paid yet', awaiting_confirmation: 'Payment to check', paid: 'Paid' };
const METHOD = { momo: 'Mobile money', cod: 'Cash on delivery', momo_delivery: 'MoMo on delivery' };
const NETWORK = { mtn: 'MTN', telecel: 'Telecel', airteltigo: 'AirtelTigo' };
const field = 'w-full rounded-xl border border-brand-300 bg-white px-4 py-3';
const btn = 'rounded-full px-4 py-2 text-sm font-bold';

const payLabel = (o) =>
  o.payment_status === 'unpaid' && o.payment_method !== 'momo' ? 'Pay on delivery' : PAYMENT[o.payment_status];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => { api.allOrders().then(setOrders).catch((e) => setError(e.message)); }, []);

  const patch = (id, fields) => setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...fields } : o)));
  const run = async (fn) => { setError(''); try { await fn(); } catch (e) { setError(e.message); } };
  const changeStatus = (id, status) => run(async () => patch(id, { status: (await api.setOrderStatus(id, status)).status }));
  const changePayment = (id, status) =>
    run(async () => patch(id, { payment_status: (await api.setPaymentStatus(id, status)).payment_status }));

  const toCheck = orders.filter((o) => o.payment_status === 'awaiting_confirmation');
  const shown =
    filter === 'all' ? orders
    : filter === 'check' ? toCheck
    : orders.filter((o) => o.status === filter);
  const chips = [['all', 'All'], ['check', `Payment to check${toCheck.length ? ` (${toCheck.length})` : ''}`], ...Object.entries(STATUS)];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {chips.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`${btn} border ${filter === id ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-300'}`}>
            {label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {shown.length === 0 && <p className="text-brand-500">No orders here yet.</p>}

      {shown.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-brand-300/60 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-300/60 text-base font-semibold text-brand-500">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status'].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const mismatch = o.payment_ref_entered && o.payment_ref_entered.trim().toLowerCase() !== o.reference.toLowerCase();
                const pinned = o.lat != null && o.lng != null;
                const dest = pinned ? `${o.lat},${o.lng}` : encodeURIComponent(o.address || '');
                return (
                  <tr key={o.id} className="border-b border-brand-300/40 align-top last:border-0">
                    <td className="px-5 py-5">
                      <p className="text-base font-extrabold">{o.reference}</p>
                      <p className="text-brand-500">{new Date(o.created_at).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-base font-semibold">{o.customer_name || 'Customer'}</p>
                      <p className="text-brand-500">{o.phone}</p>
                      <p className="text-brand-500">{o.address}</p>
                      {(pinned || o.address) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${dest}`} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-1.5 text-xs font-bold text-white">
                            <Navigation className="h-3.5 w-3.5" /> {pinned ? 'Get directions' : 'Directions (from address)'}
                          </a>
                          <a href={pinned ? `https://waze.com/ul?ll=${dest}&navigate=yes` : `https://waze.com/ul?q=${dest}&navigate=yes`} target="_blank" rel="noreferrer"
                            className="inline-flex items-center rounded-full border border-brand-300 px-4 py-1.5 text-xs font-bold">
                            Waze
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-5 text-base">
                      {o.items.map((i, n) => <p key={n}>{i.qty} × {i.name}</p>)}
                    </td>
                    <td className="px-5 py-5 text-base font-extrabold">GH₵{Number(o.total)}</td>
                    <td className="px-5 py-5">
                      <p className="text-base">
                        {METHOD[o.payment_method]}{o.payment_method === 'momo' ? ' (pay now)' : ''}{' '}
                        <span className={`text-sm ${o.payment_status === 'paid' ? 'font-bold text-green-600' : 'text-brand-500'}`}>
                          ({o.payment_status === 'paid' ? 'paid' : o.payment_status === 'awaiting_confirmation' ? 'to check' : 'pending'})
                        </span>
                      </p>
                      {o.network && <p className="text-brand-500">{NETWORK[o.network]}</p>}
                      {o.txn_id ? (
                        <div className="mt-2 space-y-0.5 rounded-xl bg-brand-100 p-3">
                          <p><b>Transaction ID:</b> {o.txn_id}</p>
                          <p><b>Sent from:</b> {o.paid_from}</p>
                          <p><b>Reference entered:</b> {o.payment_ref_entered}</p>
                          {mismatch && <p className="font-bold text-red-600">Does not match {o.reference}. Check the SMS before marking paid.</p>}
                        </div>
                      ) : o.payment_method === 'momo' && o.payment_status !== 'paid' ? (
                        <p className="mt-2 text-brand-500">No transaction ID submitted yet</p>
                      ) : null}
                      <div className="mt-2">
                        {o.payment_status === 'paid'
                          ? <button onClick={() => changePayment(o.id, 'unpaid')} className="rounded-full border border-brand-300 px-4 py-1.5 text-xs font-bold">Undo paid</button>
                          : <button onClick={() => changePayment(o.id, 'paid')} className="rounded-full bg-brand-700 px-4 py-1.5 text-xs font-bold text-white">Mark paid</button>}
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <select aria-label="Order status" value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}
                        className="w-full min-w-[150px] rounded-full border border-brand-300 bg-white px-4 py-2.5 text-base">
                        {Object.entries(STATUS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const empty = { name: '', size: '', price: '', description: '', image_url: '' };

function Products() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const load = () => api.getAllProducts().then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const guard = async (fn) => { setError(''); try { await fn(); await load(); } catch (e) { setError(e.message); } };

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    try { const { url } = await api.uploadImage(file); setForm((f) => ({ ...f, image_url: url })); }
    catch (err) { setError(err.message); }
    setBusy(false);
  };

  const save = (e) => {
    e.preventDefault();
    guard(async () => {
      const body = { ...form, price: Number(form.price) };
      editing ? await api.updateProduct(editing, body) : await api.createProduct(body);
      setForm(empty); setEditing(null);
    });
  };

  const edit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, size: p.size || '', price: String(p.price), description: p.description || '', image_url: p.image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-brand-300 bg-white p-5">
        <h2 className="text-xl font-black">{editing ? 'Edit product' : 'Add a product'}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input required placeholder="Name" value={form.name} onChange={set('name')} className={field} />
          <input placeholder="Size (e.g. 500ml)" value={form.size} onChange={set('size')} className={field} />
          <input required type="number" min="0" step="0.01" placeholder="Price (GH₵)" value={form.price} onChange={set('price')} className={field} />
        </div>
        <textarea placeholder="Description" rows={2} value={form.description} onChange={set('description')} className={field} />
        <div className="flex items-center gap-4">
          {form.image_url && <img src={form.image_url} alt="" className="h-16 w-16 rounded-xl object-contain" />}
          <input type="file" accept="image/*" onChange={upload} aria-label="Product image" />
          {busy && <span className="text-sm">Uploading…</span>}
        </div>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button disabled={busy} className={`${btn} bg-brand-700 text-white disabled:opacity-50`}>{editing ? 'Save changes' : 'Add product'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className={`${btn} border border-brand-300`}>Cancel</button>}
        </div>
      </form>

      <div className="space-y-3">
        {list.length === 0 && <p className="text-brand-500">No products yet.</p>}
        {list.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-300 bg-white p-4">
            {p.image_url ? <img src={p.image_url} alt="" className="h-16 w-16 rounded-xl object-contain" /> : <div className="h-16 w-16 rounded-xl bg-brand-100" />}
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{p.name} <span className="font-normal text-brand-500">{p.size}</span></p>
              <p className="text-sm">GH₵{Number(p.price)} · {p.active ? 'Visible' : 'Hidden'}</p>
            </div>
            <button onClick={() => edit(p)} className={`${btn} border border-brand-300`}>Edit</button>
            <button onClick={() => guard(() => api.updateProduct(p.id, { active: !p.active }))} className={`${btn} border border-brand-300`}>{p.active ? 'Hide' : 'Show'}</button>
            <button onClick={() => confirm(`Delete ${p.name}?`) && guard(() => api.deleteProduct(p.id))} className={`${btn} border border-red-400 text-red-600`}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyMember = { name: '', title: '', tagline: '', photo_url: '', sort_order: '' };
const DEFAULT_TEAM = [
  ['Michael Mensah', 'Founder & CEO', 'Vision. Integrity. Impact.'],
  ['Sarah Adjei', 'Operations Manager', 'Efficiency. Excellence. Service.'],
  ['Daniel Mensah', 'Production Lead', 'Quality. Safety. Consistency.'],
  ['Grace Boateng', 'Sales & Marketing', 'Growth. Customers. Community.'],
  ['Kwame Asante', 'Customer Support', 'People. Support. Satisfaction.'],
];

function Team() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyMember);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const load = () => api.getTeam().then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const guard = async (fn) => { setError(''); try { await fn(); await load(); } catch (e) { setError(e.message); } };

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    try { const { url } = await api.uploadImage(file); setForm((f) => ({ ...f, photo_url: url })); }
    catch (err) { setError(err.message); }
    setBusy(false);
  };

  const save = (e) => {
    e.preventDefault();
    guard(async () => {
      const body = { ...form, sort_order: form.sort_order === '' ? undefined : Number(form.sort_order) };
      editing ? await api.updateTeamMember(editing, body) : await api.createTeamMember(body);
      setForm(emptyMember); setEditing(null);
    });
  };

  const edit = (m) => {
    setEditing(m.id);
    setForm({ name: m.name, title: m.title, tagline: m.tagline || '', photo_url: m.photo_url || '', sort_order: String(m.sort_order) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addDefaults = () => guard(async () => {
    for (const [i, [name, title, tagline]] of DEFAULT_TEAM.entries())
      await api.createTeamMember({ name, title, tagline, sort_order: i + 1 });
  });

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-brand-300 bg-white p-5">
        <h2 className="text-xl font-black">{editing ? 'Edit team member' : 'Add a team member'}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input required placeholder="Name" value={form.name} onChange={set('name')} className={field} />
          <input required placeholder="Title (e.g. Founder & CEO)" value={form.title} onChange={set('title')} className={field} />
          <input placeholder="Tagline (e.g. Vision. Integrity. Impact.)" value={form.tagline} onChange={set('tagline')} className={field} />
          <input type="number" min="0" placeholder="Order (1 shows first)" value={form.sort_order} onChange={set('sort_order')} className={field} />
        </div>
        <div className="flex items-center gap-4">
          {form.photo_url && <img src={form.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />}
          <input type="file" accept="image/*" onChange={upload} aria-label="Photo" />
          {busy && <span className="text-sm">Uploading…</span>}
        </div>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button disabled={busy} className={`${btn} bg-brand-700 text-white disabled:opacity-50`}>{editing ? 'Save changes' : 'Add member'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyMember); }} className={`${btn} border border-brand-300`}>Cancel</button>}
        </div>
      </form>

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="space-y-3">
            <p className="text-brand-500">No team members saved yet, so the website shows the default five.</p>
            <button onClick={addDefaults} className={`${btn} border border-brand-300`}>Add the default five so I can edit them</button>
          </div>
        )}
        {list.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-300 bg-white p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-300">
              {m.photo_url ? <img src={m.photo_url} alt="" className="h-full w-full object-cover" /> : <User className="h-9 w-9" fill="currentColor" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{m.name}</p>
              <p className="text-sm">{m.title} · {m.tagline}</p>
            </div>
            <button onClick={() => edit(m)} className={`${btn} border border-brand-300`}>Edit</button>
            <button onClick={() => confirm(`Remove ${m.name}?`) && guard(() => api.deleteTeamMember(m.id))} className={`${btn} border border-red-400 text-red-600`}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_COLOR = {
  new: 'text-orange-600', confirmed: 'text-brand-500', preparing: 'text-brand-500',
  out_for_delivery: 'text-brand-500', completed: 'text-green-600', cancelled: 'text-red-600',
};

function Overview({ go }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.allOrders().then(setOrders).catch((e) => setError(e.message)); }, []);

  const list = orders || [];
  const waiting = list.filter((o) => o.payment_status === 'awaiting_confirmation');

  const Row = ({ o }) => (
    <div className="rounded-xl border border-brand-300/60 p-4 text-sm">
      <p><b>{o.customer_name || 'Customer'}</b> <span className="text-brand-500">— {o.customer_email}</span></p>
      <p>{o.items.map((i) => `× ${i.qty} ${i.name}`).join(', ')}</p>
      <p>GH₵ {Number(o.total).toFixed(2)} — <span className={`font-semibold ${STATUS_COLOR[o.status]}`}>{STATUS[o.status].toLowerCase()}</span></p>
    </div>
  );

  const Card = ({ title, rows, empty }) => (
    <div className="space-y-4 rounded-3xl border border-brand-300/60 bg-white p-6">
      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-brand-700">
        <ShoppingBag className="h-6 w-6" /> {title} ({rows.length})
      </h2>
      {rows.length === 0 && <p className="text-brand-500">{empty}</p>}
      {rows.slice(0, 5).map((o) => <Row key={o.id} o={o} />)}
      {rows.length > 0 && <button onClick={() => go('orders')} className={`${btn} border border-brand-300`}>Open orders</button>}
    </div>
  );

  return (
    <>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Awaiting payment check" rows={waiting} empty="Nothing to check right now." />
        <Card title="Recent orders" rows={list} empty="No orders yet." />
      </div>
    </>
  );
}

const NAV = [
  ['overview', 'Overview', LayoutDashboard],
  ['orders', 'Orders', ShoppingBag],
  ['products', 'Products', Droplet],
  ['team', 'Team', Users],
];

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  if (loading) return null;
  if (user?.role !== 'admin') return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-brand-50 md:flex-row">
      <aside className="bg-[#052a66] text-white md:flex md:w-64 md:shrink-0 md:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15"><Droplet className="h-5 w-5" /></span>
          <div>
            <p className="text-xl font-black leading-none">Abpure</p>
            <p className="text-sm text-white/70">Admin</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:p-4">
          {NAV.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-left font-semibold ${tab === id ? 'bg-white/15' : 'text-white/80 hover:bg-white/10'}`}>
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
        </nav>
        <div className="flex gap-1 border-t border-white/10 p-3 md:flex-col md:p-4">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
            <ExternalLink className="h-5 w-5" /> View site
          </Link>
          <button onClick={logout} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12">
        <div className={`mx-auto space-y-6 ${tab === 'orders' ? 'max-w-7xl' : 'max-w-5xl'}`}>
          <h1 className="text-4xl font-black text-brand-700">{NAV.find(([id]) => id === tab)[1]}</h1>
          {tab === 'overview' && <Overview go={setTab} />}
          {tab === 'orders' && <Orders />}
          {tab === 'products' && <Products />}
          {tab === 'team' && <Team />}
        </div>
      </main>
    </div>
  );
}
