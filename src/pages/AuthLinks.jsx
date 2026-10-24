import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { PasswordInput, primaryBtn } from './Login.jsx';

export function ResetPassword() {
  const [params] = useSearchParams();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (pw !== confirm) return setError('The two passwords do not match.');
    try { await api.resetPassword(params.get('token') || '', pw); setDone(true); }
    catch (err) { setError(err.message); }
  };

  if (done)
    return (
      <div className="mx-auto max-w-sm px-5 py-16 text-center">
        <h1 className="text-3xl font-black text-brand-700">Password updated</h1>
        <Link to="/login" className="mt-4 inline-block font-bold underline">Sign in</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="text-3xl font-black text-brand-700">Choose a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" minLength={8} autoComplete="new-password" />
        <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" minLength={8} autoComplete="new-password" />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button className={primaryBtn}>Update password</button>
      </form>
    </div>
  );
}

export function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: '' });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    api.verifyEmail(params.get('token') || '')
      .then(() => setState({ loading: false, error: '' }))
      .catch((e) => setState({ loading: false, error: e.message }));
  }, [params]);

  return (
    <div className="mx-auto max-w-sm px-5 py-16 text-center">
      <h1 className="text-3xl font-black text-brand-700">
        {state.loading ? 'Verifying…' : state.error ? 'Could not verify' : 'Email verified'}
      </h1>
      {state.error && <p className="mt-3 text-red-600">{state.error}</p>}
      {!state.loading && <Link to="/" className="mt-4 inline-block font-bold underline">Go to home</Link>}
    </div>
  );
}
