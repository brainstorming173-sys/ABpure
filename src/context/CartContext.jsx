import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('abpure_cart')) || []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('abpure_cart', JSON.stringify(items)); }, [items]);

  const add = (p) =>
    setItems((cur) =>
      cur.some((i) => i.id === p.id)
        ? cur.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...cur, { id: p.id, name: p.name, price: Number(p.price), qty: 1 }]
    );
  const setQty = (id, qty) =>
    setItems((cur) => (qty < 1 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, qty } : i))));
  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <CartContext.Provider value={{ items, add, setQty, clear, subtotal, count }}>{children}</CartContext.Provider>;
}
