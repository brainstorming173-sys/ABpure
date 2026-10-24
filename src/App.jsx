import { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Droplet, Sun, Moon, ShoppingCart, ChevronRight, Facebook, Instagram, Youtube } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { useCart } from './context/CartContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Checkout from './pages/Checkout.jsx';
import Pay from './pages/Pay.jsx';
import OrderDone from './pages/OrderDone.jsx';
import Admin from './pages/Admin.jsx';

const links = [
  ['/', 'Home'],
  ['/#about', 'About Us'],
  ['/#products', 'Our Products'],
  ['/#why', 'Why Choose Us'],
  ['/#contact', 'Contact'],
];

function Logo() {
  const [broken, setBroken] = useState(false);
  if (!broken)
    return <img src="/logo.png" alt="Abpure, purified drinking water" onError={() => setBroken(true)} className="h-16 w-auto" />;
  return (
    <span className="block leading-none">
      <span className="flex items-start text-4xl font-black italic tracking-tight">Abpure<Droplet className="h-5 w-5" /></span>
      <span className="mt-1 block text-xs font-bold italic">Purified Drinking Water</span>
    </span>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('abpure_theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('abpure_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button onClick={() => setDark(!dark)}
      className="flex items-center gap-2 rounded-full bg-[#fff] px-4 py-2 text-xs font-bold text-[#034ba6]">
      {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {dark ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  return (
    <header className="relative z-20 bg-[#034ba6] pb-8 text-white"
      style={{ borderBottomLeftRadius: '50% 40px', borderBottomRightRadius: '50% 40px' }}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 pt-3 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="Abpure home"><Logo /></Link>
        <nav className="hidden items-center gap-7 text-[13px] font-extrabold uppercase md:flex">
          <NavLink to="/" end className={({ isActive }) => `border-b-2 pb-1 ${isActive ? 'border-white' : 'border-transparent hover:text-brand-300'}`}>Home</NavLink>
          {links.slice(1).map(([to, label]) => (
            <Link key={label} to={to} className="pb-1 hover:text-brand-300">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-3">
          {user?.role === 'admin' && <Link to="/admin" className="hidden text-xs font-bold sm:block">Admin</Link>}
          {user ? (
            <button onClick={logout} className="hidden text-xs font-bold sm:block">Sign out</button>
          ) : (
            <Link to="/login" className="hidden text-xs font-bold sm:block">Sign in</Link>
          )}
          <ThemeToggle />
          <Link to="/checkout" className="flex items-center gap-2 rounded-full border border-white/80 px-4 py-2 text-xs font-bold">
            <ShoppingCart className="h-4 w-4" /> Order Now{count > 0 && ` (${count})`} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#034ba6] px-6 pb-6 pt-14 text-white"
      style={{ borderTopLeftRadius: '50% 40px', borderTopRightRadius: '50% 40px' }}>
      <div className="mx-auto grid max-w-[1400px] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <div><Logo /></div>
        <nav className="flex flex-wrap items-center justify-center text-xs font-semibold">
          {links.map(([to, label], i) => (
            <span key={label} className="flex items-center">
              {i > 0 && <span className="mx-4 h-4 w-px bg-white/40" />}
              <Link to={to}>{label}</Link>
            </span>
          ))}
        </nav>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex gap-3">
            {[[Facebook, 'Facebook'], [Instagram, 'Instagram'], [null, 'X'], [Youtube, 'YouTube']].map(([Icon, name]) => (
              <a key={name} href="#" aria-label={name}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-[#034ba6]">
                {Icon ? <Icon className="h-4 w-4" /> : 'X'}
              </a>
            ))}
          </div>
          <p className="text-2xl italic" style={{ fontFamily: "'Dancing Script', cursive" }}>Pure Water, Healthier You.</p>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-[1400px] text-xs">© {new Date().getFullYear()} Abpure. All rights reserved.</p>
    </footer>
  );
}

export default function App() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pay/:id" element={<Pay />} />
          <Route path="/order/:id" element={<OrderDone />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
