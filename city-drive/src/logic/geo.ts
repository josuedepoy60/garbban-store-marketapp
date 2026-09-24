// Calculs de distance sur de petites échelles (une ville) : projection équirectangulaire.

export type LatLng = { lat: number; lng: number };

const R = 6371; // rayon terrestre, km
const rad = (d: number) => (d * Math.PI) / 180;

/** Distance à vol d'oiseau en km (formule de haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Coordonnées planes en km autour d'une origine (valable sur quelques dizaines de km). */
function toXY(p: LatLng, origin: LatLng) {
  return { x: rad(p.lng - origin.lng) * R * Math.cos(rad(origin.lat)), y: rad(p.lat - origin.lat) * R };
}

/** Distance en km entre un point et le segment [a, b]. */
export function distanceToSegmentKm(p: LatLng, a: LatLng, b: LatLng): number {
  const A = toXY(a, p);
  const B = toXY(b, p);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(A.x * dx + A.y * dy) / len2));
  return Math.hypot(A.x + t * dx, A.y + t * dy);
}

/** Point situé à la fraction t (0 → a, 1 → b) du segment. */
export const lerp = (a: LatLng, b: LatLng, t: number): LatLng => ({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });

// Emprise de la carte dessinée (CityMap, repère 420 × 500) : Yopougon → Bingerville, Abobo → Port-Bouët.
const BOUNDS = { west: -4.09, east: -3.88, north: 5.43, south: 5.24 };

/** Position d'un point GPS dans le repère de CityMap, bornée aux marges du dessin. */
export function toMap(p: LatLng): { x: number; y: number } {
  const x = ((p.lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 420;
  const y = ((BOUNDS.north - p.lat) / (BOUNDS.north - BOUNDS.south)) * 500;
  return { x: Math.round(Math.min(396, Math.max(24, x))), y: Math.round(Math.min(476, Math.max(24, y))) };
}
