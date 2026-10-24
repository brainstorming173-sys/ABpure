import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
import { LocateFixed } from 'lucide-react';

const pin = L.icon({
  iconUrl: icon, iconRetinaUrl: icon2x, shadowUrl: shadow,
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});
const ACCRA = [5.6037, -0.187];

// Map where the customer taps (or drags the pin) to mark exactly where the water should be delivered.
export default function LocationPicker({ value, onChange }) {
  const box = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const cb = useRef(onChange);
  cb.current = onChange;
  const [msg, setMsg] = useState('');

  const place = (lat, lng, zoom) => {
    if (!marker.current) {
      marker.current = L.marker([lat, lng], { icon: pin, draggable: true }).addTo(map.current);
      marker.current.on('dragend', () => {
        const p = marker.current.getLatLng();
        cb.current({ lat: p.lat, lng: p.lng });
      });
    } else marker.current.setLatLng([lat, lng]);
    if (zoom) map.current.setView([lat, lng], zoom);
    cb.current({ lat, lng });
  };

  useEffect(() => {
    map.current = L.map(box.current).setView(value ? [value.lat, value.lng] : ACCRA, value ? 16 : 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current);
    if (value) place(value.lat, value.lng);
    map.current.on('click', (e) => { setMsg(''); place(e.latlng.lat, e.latlng.lng); });
    return () => { map.current.remove(); map.current = null; marker.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return setMsg('Your browser cannot share your location. Tap the map instead.');
    setMsg('Finding you…');
    navigator.geolocation.getCurrentPosition(
      (p) => { setMsg(''); place(p.coords.latitude, p.coords.longitude, 17); },
      () => setMsg('Could not get your location. Tap the map to drop the pin instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <button type="button" onClick={locate}
        className="flex items-center gap-2 rounded-full border border-brand-300 px-4 py-2 text-sm font-bold text-brand-700">
        <LocateFixed className="h-4 w-4" /> Use my current location
      </button>
      <div ref={box} className="isolate z-0 h-72 w-full overflow-hidden rounded-2xl border border-brand-300" />
      <p className={`text-sm ${value ? 'font-semibold text-green-600' : 'text-brand-500'}`}>
        {msg || (value ? 'Pin set. Drag it or tap elsewhere to move it.' : 'Tap the map to drop a pin where we should deliver.')}
      </p>
    </div>
  );
}
