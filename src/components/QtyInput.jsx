import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const MAX = 9999;

// Stepper with a typeable number box. The text is kept locally so the field can be cleared while typing;
// a valid whole number (1 or more) is sent up straight away, and the box resets to the last good value on blur.
export default function QtyInput({ value, onChange, size = 'md' }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const clamp = (n) => Math.min(MAX, Math.max(1, n));
  const type = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setText(raw);
    const n = parseInt(raw, 10);
    if (n >= 1) onChange(clamp(n));
  };

  const btn = size === 'sm' ? 'h-7 w-7' : 'h-10 w-10';
  const box = size === 'sm' ? 'h-7 w-14 text-sm' : 'h-10 w-20 text-base';
  return (
    <div className="inline-flex items-center gap-1.5">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(clamp(value - 1))}
        className={`${btn} flex items-center justify-center rounded-full border border-brand-300 text-brand-700`}>
        <Minus className="h-4 w-4" />
      </button>
      <input type="text" inputMode="numeric" aria-label="Quantity" value={text} onChange={type}
        onFocus={(e) => e.target.select()} onBlur={() => setText(String(value))}
        className={`${box} rounded-xl border border-brand-300 bg-white text-center font-bold`} />
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(clamp(value + 1))}
        className={`${btn} flex items-center justify-center rounded-full border border-brand-300 text-brand-700`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
