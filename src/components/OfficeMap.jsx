import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

const pin = L.icon({
  iconUrl: icon, iconRetinaUrl: icon2x, shadowUrl: shadow,
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});

// Read-only map with one marker. Scroll-zoom is off so the page still scrolls normally.
export default function OfficeMap({ lat, lng, zoom = 15, label }) {
  const box = useRef(null);
  useEffect(() => {
    const map = L.map(box.current, { scrollWheelZoom: false }).setView([lat, lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    const m = L.marker([lat, lng], { icon: pin }).addTo(map);
    if (label) m.bindPopup(label);
    return () => map.remove();
  }, [lat, lng, zoom, label]);
  return <div ref={box} className="isolate z-0 h-full min-h-[360px] w-full" />;
}
