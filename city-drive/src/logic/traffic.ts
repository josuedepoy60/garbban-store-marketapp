// Modèle de trafic d'Abidjan : vitesse moyenne selon l'heure, points noirs connus
// et choix du pont pour traverser la lagune. À remplacer par un flux temps réel.

import { distanceToSegmentKm, haversineKm, type LatLng } from './geo.ts';
import type { Place } from './places.ts';

export type TrafficLevel = 'fluide' | 'dense' | 'sature';
export type Period = 'nuit' | 'pointe' | 'journee' | 'soiree';

export function periodOf(date: Date): Period {
  const h = date.getHours();
  if (h < 6) return 'nuit';
  if ((h >= 7 && h < 10) || (h >= 17 && h < 20)) return 'pointe';
  if (h >= 21) return 'soiree';
  return 'journee';
}

/** Vitesse moyenne en ville (km/h). */
const SPEED: Record<Period, number> = { nuit: 42, soiree: 32, journee: 26, pointe: 16 };

export const levelOf = (p: Period): TrafficLevel => (p === 'pointe' ? 'sature' : p === 'journee' ? 'dense' : 'fluide');

/** Les distances routières sont ~30 % plus longues qu'à vol d'oiseau. */
export const ROAD_FACTOR = 1.3;

export type Hotspot = { id: string; name: string; at: LatLng; radiusKm: number; delay: Record<Period, number> };

export const HOTSPOTS: Hotspot[] = [
  { id: 'adjame', name: 'Carrefour Adjamé', at: { lat: 5.3505, lng: -4.0205 }, radiusKm: 2.2, delay: { pointe: 10, journee: 5, soiree: 2, nuit: 0 } },
  { id: 'riviera', name: 'Carrefour Riviera 2', at: { lat: 5.3605, lng: -3.9735 }, radiusKm: 0.8, delay: { pointe: 4, journee: 2, soiree: 0, nuit: 0 } },
];

/** Traversée de la lagune par les ponts du Plateau (gratuits, souvent bouchés). */
const OLD_BRIDGES_DELAY: Record<Period, number> = { pointe: 12, journee: 5, soiree: 2, nuit: 0 };
export const HKB_TOLL = 500;

export type RouteKind = 'express' | 'direct';

export type RouteOption = {
  id: RouteKind;
  /** Par où passe l'itinéraire : « Pont HKB », « Via Adjamé »… */
  via: string;
  km: number;
  minutes: number;
  toll: number;
  /** Minutes perdues dans les bouchons sur cet itinéraire. */
  jamDelay: number;
  jam: Hotspot | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

function hotspotsOn(a: LatLng, b: LatLng) {
  return HOTSPOTS.filter((h) => distanceToSegmentKm(h.at, a, b) <= h.radiusKm);
}

/**
 * Deux itinéraires pour un trajet à étapes :
 * - express : voies rapides et Pont HKB (péage), un peu plus long mais évite les points noirs ;
 * - direct : le plus court, gratuit, mais traverse les bouchons.
 */
export function routeOptions(points: Place[], date = new Date()): [RouteOption, RouteOption] {
  if (points.length < 2) throw new Error('Un itinéraire demande au moins deux points');
  const period = periodOf(date);
  const speed = SPEED[period];

  let km = 0;
  let crossings = 0;
  const jams = new Map<string, Hotspot>();
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    km += haversineKm(a, b) * ROAD_FACTOR;
    if (a.side !== b.side) crossings++;
    hotspotsOn(a, b).forEach((h) => jams.set(h.id, h));
  }

  const directJams = [...jams.values()];
  const directDelay = directJams.reduce((s, h) => s + h.delay[period], 0) + crossings * OLD_BRIDGES_DELAY[period];
  const worst = directJams.sort((x, y) => y.delay[period] - x.delay[period])[0] ?? null;

  const direct: RouteOption = {
    id: 'direct',
    via: crossings ? 'Pont FHB' : worst ? `Via ${worst.name.replace('Carrefour ', '')}` : 'Itinéraire direct',
    km: round1(km),
    minutes: Math.max(3, Math.round((km / speed) * 60 + directDelay)),
    toll: 0,
    jamDelay: directDelay,
    jam: directDelay >= 5 ? (worst ?? null) : null,
  };

  // Voies rapides : +12 % de distance, 40 % plus rapides, points noirs contournés.
  const expressKm = km * 1.12;
  const express: RouteOption = {
    id: 'express',
    via: crossings ? 'Pont HKB' : 'Voie express',
    km: round1(expressKm),
    minutes: Math.max(3, Math.round((expressKm / (speed * 1.4)) * 60)),
    toll: crossings ? HKB_TOLL * crossings : 0,
    jamDelay: 0,
    jam: null,
  };

  return [express, direct];
}

/** Itinéraire conseillé : le plus rapide, sauf s'il ne fait gagner que 2 min pour un péage. */
export function bestRoute([express, direct]: [RouteOption, RouteOption]): RouteOption {
  if (express.toll > 0 && direct.minutes - express.minutes <= 2) return direct;
  return express.minutes <= direct.minutes ? express : direct;
}

/** Temps d'approche d'un chauffeur situé en `from` vers `to` (minutes, au moins 1). */
export function approachMinutes(from: LatLng, to: LatLng, date = new Date()): number {
  const km = haversineKm(from, to) * ROAD_FACTOR;
  return Math.max(1, Math.round((km / SPEED[periodOf(date)]) * 60) + 1);
}
