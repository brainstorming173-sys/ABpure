import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export const field = 'w-full rounded-xl border border-brand-300 bg-white px-4 py-3';
export const primaryBtn =
  'w-full rounded-full bg-[#034ba6] py-3 font-bold text-white hover:bg-[#03398a] disabled:opacity-60';

export function PasswordInput({ value, onChange, placeholder = 'Password', autoComplete, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} required minLength={minLength} autoComplete={autoComplete}
        placeholder={placeholder} value={value} onChange={onChange} className={`${field} pr-12`} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500">
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

const TITLES = { signin: 'Sign in', register: 'Create account', forgot: 'Reset your password' };
const SUBMIT = { signin: 'Sign in', register: 'Create account', forgot: 'Send reset link' };

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const switchTo = (m) => { setMode(m); setError(''); setNotice(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (mode === 'register' && form.password !== form.confirm) return setError('The two passwords do not match.');
    setBusy(true);
    try {
      if (mode === 'signin') {
        const u = await login(form.email, form.password);
        nav(u.role === 'admin' ? '/admin' : '/');
      } else if (mode === 'register') {
        await register(form.name, form.email, form.password);
        nav('/');
      } else {
        await api.forgotPassword(form.email);
        setNotice('If that email has an account, a reset link is on its way.');
      }
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="text-3xl font-black text-brand-700">{TITLES[mode]}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'register' && (
          <input required placeholder="Full name" autoComplete="name" value={form.name} onChange={set('name')} className={field} />
        )}
        <input type="email" required placeholder="Email" autoComplete="email" value={form.email} onChange={set('email')} className={field} />
        {mode !== 'forgot' && (
          <PasswordInput value={form.password} onChange={set('password')} minLength={mode === 'register' ? 8 : undefined}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
        )}
        {mode === 'register' && (
          <PasswordInput value={form.confirm} onChange={set('confirm')} placeholder="Confirm password" minLength={8} autoComplete="new-password" />
        )}
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        {notice && <p className="text-sm font-semibold text-green-600">{notice}</p>}
        <button disabled={busy} className={primaryBtn}>{busy ? 'Please wait…' : SUBMIT[mode]}</button>
      </form>

      <div className="mt-5 space-y-2 text-center text-sm font-semibold text-brand-700">
        {mode === 'signin' && (
          <>
            <button onClick={() => switchTo('forgot')} className="block w-full underline">Forgot password?</button>
            <button onClick={() => switchTo('register')} className="block w-full underline">New here? Create an account</button>
          </>
        )}
        {mode !== 'signin' && <button onClick={() => switchTo('signin')} className="underline">Back to sign in</button>}
      </div>
    </div>
  );
}
