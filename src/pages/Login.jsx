import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try { await login(form.email, form.password); nav('/'); }
    catch (err) { setError(err.message); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="text-3xl font-black">Sign in</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input type="email" required placeholder="Email" value={form.email} onChange={set('email')}
          className="w-full rounded-xl border border-brand-300 bg-white px-4 py-3" />
        <input type="password" required placeholder="Password" value={form.password} onChange={set('password')}
          className="w-full rounded-xl border border-brand-300 bg-white px-4 py-3" />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button className="w-full rounded-full bg-brand-700 py-3 font-bold text-white">Sign in</button>
      </form>
    </div>
  );
}
