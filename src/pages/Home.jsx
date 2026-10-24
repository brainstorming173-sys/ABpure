import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Clock, Droplet, Mail, MapPin, MessageCircle, Navigation, Phone, Settings, ShieldCheck, ShoppingCart, Smartphone, Truck, User, Users } from 'lucide-react';
import OfficeMap from '../components/OfficeMap.jsx';
import { api } from '../api.js';

const reasons = [
  [Droplet, 'Purity First', 'Advanced filtration for crystal clear water.'],
  [ShieldCheck, 'Safe & Reliable', 'Meets high quality and safety standards.'],
  [Settings, 'Consistent Quality', 'Every bottle, engineered for your trust.'],
  [Award, 'Health Focused', 'Pure water for better living.'],
  [Truck, 'Fast Delivery', 'Fresh water, when you need it.'],
  [Users, 'Customer Focused', 'Your satisfaction is our priority.'],
];

const steps = [
  [ShoppingCart, '1. Place Order', 'Choose your preferred product.'],
  [Settings, '2. Confirm', 'We process and prepare your order.'],
  [Truck, '3. We Deliver', 'Safe, on-time delivery to you.'],
  [Droplet, '4. Enjoy', 'Fresh, purified water, always.'],
];

const defaultTeam = [
  { name: 'Michael Mensah', title: 'Founder & CEO', tagline: 'Vision. Integrity. Impact.' },
  { name: 'Sarah Adjei', title: 'Operations Manager', tagline: 'Efficiency. Excellence. Service.' },
  { name: 'Daniel Mensah', title: 'Production Lead', tagline: 'Quality. Safety. Consistency.' },
  { name: 'Grace Boateng', title: 'Sales & Marketing', tagline: 'Growth. Customers. Community.' },
  { name: 'Kwame Asante', title: 'Customer Support', tagline: 'People. Support. Satisfaction.' },
];

function Eyebrow({ children, center, trail }) {
  const line = <span className="h-px w-6 bg-brand-300" />;
  return (
    <p className={`flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700 ${center ? 'justify-center' : ''}`}>
      {center && line}{children}{(center || trail) && line}
    </p>
  );
}

const IconCircle = ({ icon: Icon, size = 'h-16 w-16', dark }) => (
  <div className={`mx-auto flex ${size} items-center justify-center rounded-full ${dark ? 'border-2 border-white/60 text-white' : 'bg-brand-100 text-brand-500'}`}>
    <Icon className="h-7 w-7" strokeWidth={1.6} />
  </div>
);

function ProductCard({ p }) {
  return (
    <Link to={`/buy/${p.id}`}
      className="flex min-h-[320px] w-[300px] flex-col rounded-2xl border border-brand-300 bg-brand-100/60 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
      {p.image_url
        ? <img src={p.image_url} alt={p.name} className="h-44 w-full object-contain" />
        : <div className="flex h-44 items-center justify-center"><Droplet className="h-12 w-12 text-brand-300" /></div>}
      <h3 className="mt-3 text-xl font-extrabold text-brand-700">{p.name}</h3>
      <p className="text-sm text-brand-500">{p.size}</p>
      <p className="mt-auto pt-2 font-bold">GH₵ {Number(p.price).toFixed(2)}</p>
      <span className="mt-3 rounded-full bg-brand-700 px-5 py-2.5 text-center text-sm font-bold text-white">Order now</span>
    </Link>
  );
}

// Shows /mission.jpg from the public folder. If that file is missing, falls back to the droplet drawing.
function MissionImage() {
  const [broken, setBroken] = useState(false);
  if (!broken)
    return (
      <div className="h-[360px] overflow-hidden rounded-2xl bg-brand-100 md:h-[420px]">
        <img src="/mission.jpg" alt="Abpure purified water" onError={() => setBroken(true)} className="h-full w-full object-cover" />
      </div>
    );
  return (
    <div className="flex h-[360px] items-center justify-center rounded-2xl bg-brand-100 md:h-[420px]">
      <svg viewBox="0 0 400 320" className="h-full max-h-[340px] w-full max-w-[460px]" role="img" aria-label="Water droplet with ripples">
            <ellipse cx="200" cy="262" rx="165" ry="30" className="fill-brand-300/30 stroke-brand-300/60" strokeWidth="3" />
            <ellipse cx="200" cy="262" rx="115" ry="20" className="fill-brand-300/30 stroke-brand-300/60" strokeWidth="3" />
            <circle cx="200" cy="145" r="105" className="fill-brand-50/70" />
            <path d="M200 78 C190 108 150 132 150 180 a50 50 0 0 0 100 0 C250 132 210 108 200 78 Z"
              className="fill-none stroke-brand-500" strokeWidth="14" strokeLinejoin="round" />
            <path d="M176 182 a24 24 0 0 0 24 24" className="fill-none stroke-brand-500" strokeWidth="9" strokeLinecap="round" />
          </svg>
    </div>
  );
}

// ---- Fill these in with your real details. Anything left empty is simply not shown. ----
const CONTACT = {
  address: 'Accra, Ghana',
  lat: 5.6037, lng: -0.187,   // exact office pin: right-click your office on Google Maps and copy the two numbers
  phone: '',                  // e.g. '0201234567'
  whatsapp: '',               // e.g. '233201234567' (country code, no + or spaces)
  email: '',                  // e.g. 'hello@abpure.com'
  hours: '',                  // e.g. 'Mon to Sat, 7am to 7pm'
};

const orderSteps = [
  [ShoppingCart, 'Order online', 'Pick your product and how many bags.'],
  [Smartphone, 'Pay your way', 'Mobile money or pay on delivery.'],
  [Truck, 'We find you', 'Your map pin takes our rider to your door.'],
];

function FindUs() {
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${CONTACT.lat},${CONTACT.lng}`;
  const cards = [
    CONTACT.phone && [Phone, 'Call us', CONTACT.phone, `tel:${CONTACT.phone}`],
    CONTACT.email && [Mail, 'Email us', CONTACT.email, `mailto:${CONTACT.email}`],
    CONTACT.hours && [Clock, 'Opening hours', CONTACT.hours],
    [MapPin, 'Head office', CONTACT.address],
  ].filter(Boolean);

  return (
    <section id="contact" className="mx-auto max-w-[1400px] px-6 pb-24">
      <div className="overflow-hidden rounded-[2rem] border border-brand-300/60 bg-white shadow-[0_20px_60px_-20px_rgb(3_75_166/0.35)]">
        <div className="grid lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col p-8 md:p-12">
            <Eyebrow trail>Where to Find Us</Eyebrow>
            <h2 className="mt-3 text-4xl font-black leading-tight text-brand-700 md:text-5xl">We are always<br />within reach.</h2>
            <p className="mt-3 max-w-md text-brand-500">Visit us, call us, or order online and let us bring pure water to your door.</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {cards.map(([Icon, title, text, href]) => {
                const body = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white"><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-xs font-extrabold uppercase tracking-wider text-brand-500">{title}</span>
                      <span className="block break-words font-extrabold text-brand-700">{text}</span>
                    </span>
                  </>
                );
                const cls = 'flex items-center gap-3 rounded-2xl border border-brand-300/60 bg-brand-50 p-4';
                return href
                  ? <a key={title} href={href} className={`${cls} transition hover:-translate-y-0.5 hover:border-brand-500`}>{body}</a>
                  : <div key={title} className={cls}>{body}</div>;
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
              <a href={dir} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-white">
                <Navigation className="h-4 w-4" /> Get Directions <ArrowRight className="h-4 w-4" />
              </a>
              {CONTACT.whatsapp && (
                <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-brand-300 px-6 py-3 text-brand-700">
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              )}
              <a href="#products" className="flex items-center gap-2 rounded-full border border-brand-300 px-6 py-3 text-brand-700">
                <Droplet className="h-4 w-4" /> Order now
              </a>
            </div>
          </div>

          <div className="relative min-h-[360px] lg:min-h-full">
            <div className="absolute inset-0"><OfficeMap lat={CONTACT.lat} lng={CONTACT.lng} label="Abpure Head Office" /></div>
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 flex items-center gap-3 rounded-2xl bg-[#034ba6]/95 p-4 text-white shadow-xl backdrop-blur sm:right-auto sm:max-w-xs">
              <MapPin className="h-6 w-6 shrink-0" />
              <div className="text-sm"><p className="font-extrabold">Abpure Head Office</p><p className="text-white/80">{CONTACT.address}</p></div>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-white/15 bg-[#034ba6] text-white md:grid-cols-3 md:divide-x md:divide-y-0">
          {orderSteps.map(([Icon, title, text]) => (
            <div key={title} className="flex items-center gap-4 px-8 py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/60"><Icon className="h-5 w-5" /></span>
              <div><p className="font-extrabold">{title}</p><p className="text-sm text-white/80">{text}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [team, setTeam] = useState(defaultTeam);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
    api.getTeam().then((t) => t.length && setTeam(t)).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-10 flex min-h-[600px] items-center bg-brand-100 px-6 pb-20 pt-24"
        style={{
          backgroundImage: 'linear-gradient(90deg, var(--hero-from) 0%, var(--hero-to) 70%), linear-gradient(rgb(110 180 255), rgb(110 180 255)), url(/hero.jpg)',
          backgroundBlendMode: 'normal, multiply, normal',
          backgroundSize: 'cover', backgroundPosition: 'center right',
          borderBottomLeftRadius: '50% 50px', borderBottomRightRadius: '50% 50px',
        }}>
        <div className="mx-auto w-full max-w-[1400px]">
          <span className="inline-block rounded-full bg-brand-100/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-brand-700">
            Pure Water <span className="mx-2">•</span> Healthy Living
          </span>
          <h1 className="mt-6 text-6xl font-black leading-[0.95] text-brand-700 md:text-8xl">Clear.<br />Refreshing.</h1>
          <h2 className="mt-6 max-w-sm text-2xl font-extrabold text-brand-700">A Brighter, Healthier You with Abpure.</h2>
          <p className="mt-4 max-w-sm text-brand-900/80">
            Premium purified drinking water, crafted for your health and well-being. Clean, safe and great tasting — every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold">
            <a href="#products" className="flex items-center gap-2 rounded-full bg-brand-700 px-7 py-3.5 text-white">
              <Droplet className="h-4 w-4 fill-white" /> Our Products
            </a>
            <a href="#about" className="rounded-full border border-brand-300 bg-[#fff] px-7 py-3.5 text-[#034ba6]">Learn More</a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="about" className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-20 md:grid-cols-2">
        <MissionImage />
        <div>
          <Eyebrow trail>Our Mission</Eyebrow>
          <h2 className="mt-4 text-4xl font-black leading-tight text-brand-700 md:text-5xl">Quality Water<br />for a Healthier You</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed">
            At Abpure, we deliver trusted purified water because we believe clean water builds healthier lives. Our mission is to
            provide safe, great-tasting water through reliable production, consistent quality and exceptional service — for homes,
            businesses and communities.
          </p>
          <a href="#why" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-bold text-white">
            Learn More <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Why choose */}
      <section id="why" className="bg-gradient-to-b from-brand-100/60 to-brand-50 px-6 py-16">
        <div className="mx-auto max-w-[1400px] text-center">
          <Eyebrow center>Why Choose Abpure</Eyebrow>
          <h2 className="mt-3 text-4xl font-black text-brand-700 md:text-5xl">Why Choose Abpure?</h2>
          <p className="mt-3 text-brand-500">Because your health matters. And so does the water you drink.</p>
          <div className="mt-10 grid grid-cols-2 gap-y-8 md:grid-cols-6 md:divide-x md:divide-brand-300/60">
            {reasons.map(([Icon, title, text]) => (
              <div key={title} className="px-4">
                <IconCircle icon={Icon} />
                <h3 className="mt-3 text-sm font-extrabold text-brand-700">{title}</h3>
                <p className="mx-auto mt-1 max-w-[10rem] text-xs text-brand-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="px-6 py-20">
        <div className="mx-auto max-w-[1400px] text-center">
          <Eyebrow center>Our Products</Eyebrow>
          <h2 className="mt-3 text-4xl font-black text-brand-700 md:text-5xl">Our Product</h2>
          <p className="mt-3 text-brand-500">Pure, safe and refreshing water for every need.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {products.length === 0 ? (
              <div className="flex h-[320px] w-[280px] flex-col items-center justify-center rounded-2xl border border-brand-300 bg-brand-100/60 text-brand-500">
                <Droplet className="h-12 w-12 opacity-40" /> <span className="mt-2 text-sm">Products coming soon</span>
              </div>
            ) : products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#034ba6] px-6 py-14 text-white"
        style={{ borderRadius: '50% 50% 50% 50% / 30px 30px 40px 40px' }}>
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Our Process</p>
            <h2 className="mt-2 text-4xl font-black">Simple &amp; Fast</h2>
            <p className="mt-3 max-w-xs text-sm">From our advanced filtration to your doorstep, we make clean water easy and hassle-free.</p>
          </div>
          <div className="grid grid-cols-2 items-start gap-6 text-center md:grid-cols-4">
            {steps.map(([Icon, title, text], i) => (
              <div key={title} className="relative">
                <IconCircle icon={Icon} dark />
                <h3 className="mt-3 text-sm font-extrabold">{title}</h3>
                <p className="mx-auto mt-1 max-w-[9rem] text-xs text-white/80">{text}</p>
                {i < steps.length - 1 && <ArrowRight className="absolute -right-4 top-5 hidden h-5 w-5 md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="mx-auto max-w-[1400px] px-6 py-16">
        <Eyebrow trail>Our Leadership</Eyebrow>
        <h2 className="mt-3 text-4xl font-black text-brand-700">The People Behind Abpure</h2>
        <p className="mt-2 max-w-md text-brand-500">We’re a dedicated team committed to delivering pure water and a healthier tomorrow.</p>
        <div className="mt-10 grid grid-cols-2 gap-y-8 md:grid-cols-5 md:divide-x md:divide-brand-300/60">
          {team.map((m) => (
            <div key={m.name} className="px-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-300">
                {m.photo_url ? <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" /> : <User className="h-12 w-12" fill="currentColor" />}
              </div>
              <h3 className="mt-3 text-sm font-extrabold text-brand-700">{m.name}</h3>
              <p className="text-xs text-brand-500">{m.title}</p>
              <p className="mx-auto mt-0.5 max-w-[9rem] text-xs text-brand-500">{m.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Find us */}
      <FindUs />
    </>
  );
}
