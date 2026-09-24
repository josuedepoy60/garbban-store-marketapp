import { Circle, G, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';
import { lerp, toMap, type LatLng } from '@/logic/geo';

/** Tracé légèrement courbé entre les points, dans le repère de CityMap. */
export function routePath(points: LatLng[]): string {
  const p = points.map(toMap);
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1];
    const b = p[i];
    // Point de contrôle décalé perpendiculairement : la route ne file pas en ligne droite.
    const cx = (a.x + b.x) / 2 + (b.y - a.y) * 0.18;
    const cy = (a.y + b.y) / 2 - (b.x - a.x) * 0.18;
    d += ` Q ${Math.round(cx)} ${Math.round(cy)} ${b.x} ${b.y}`;
  }
  return d;
}

/** Position le long d'une suite de points (t de 0 à 1), segments de même poids. */
export function pointAlong(points: LatLng[], t: number): LatLng {
  if (points.length === 1) return points[0];
  const k = Math.min(0.9999, Math.max(0, t)) * (points.length - 1);
  const i = Math.floor(k);
  return lerp(points[i], points[i + 1], k - i);
}

type Props = {
  points: LatLng[];
  color?: string;
  /** Voiture à dessiner sur le trajet. */
  car?: LatLng | null;
  jam?: boolean;
};

/** Itinéraire, étapes et voiture, à placer en enfant de <CityMap>. */
export function RouteLayer({ points, color = colors.primary, car, jam }: Props) {
  const p = points.map(toMap);
  const c = car ? toMap(car) : null;
  return (
    <G>
      <Path d={routePath(points)} stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" />
      <Path d={routePath(points)} stroke={jam ? '#DC2626' : color} strokeWidth={5} strokeLinecap="round" fill="none" />
      {p.slice(1, -1).map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={6} fill="#fff" stroke={color} strokeWidth={3} />
      ))}
      <Circle cx={p[0].x} cy={p[0].y} r={8} fill={colors.blue} stroke="#fff" strokeWidth={3} />
      <Rect x={p[p.length - 1].x - 7} y={p[p.length - 1].y - 7} width={14} height={14} rx={2} fill={colors.primary} stroke="#fff" strokeWidth={3} />
      {c && (
        <G transform={`translate(${c.x}, ${c.y})`}>
          <Circle r={13} fill={colors.primary} stroke="#fff" strokeWidth={3} />
          <Rect x={-4} y={-6} width={8} height={12} rx={2.5} fill="#fff" />
        </G>
      )}
    </G>
  );
}
