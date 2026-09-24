// Courses programmées : règles de réservation et déclenchement de la recherche de chauffeur.

import type { Place } from './places.ts';
import type { Category, Quote } from './pricing.ts';

export type ScheduledRide = {
  id: string;
  /** Heure de prise en charge (ISO). */
  at: string;
  pickup: Place;
  stops: Place[];
  destination: Place;
  category: Category;
  quote: Quote;
  preferredDriverId: string | null;
};

/** Réservation au moins 1 h à l'avance, au plus 7 jours. */
export const MIN_LEAD_MIN = 60;
export const MAX_LEAD_DAYS = 7;
/** Chauffeur réservé confirmé ou remplacé au moins 30 min avant l'heure prévue. */
export const DISPATCH_LEAD_MIN = 30;

export function validateSchedule(at: Date, now = new Date()): string | null {
  const lead = (at.getTime() - now.getTime()) / 60_000;
  if (!Number.isFinite(lead)) return 'Date invalide';
  if (lead < MIN_LEAD_MIN) return `Réservez au moins ${MIN_LEAD_MIN} min à l'avance`;
  if (lead > MAX_LEAD_DAYS * 24 * 60) return `Réservation possible jusqu'à ${MAX_LEAD_DAYS} jours`;
  return null;
}

/** Première réservation dont la recherche de chauffeur doit commencer. */
export function dueScheduled(list: ScheduledRide[], now = new Date()): ScheduledRide | undefined {
  return [...list].sort((a, b) => a.at.localeCompare(b.at)).find((s) => new Date(s.at).getTime() - now.getTime() <= DISPATCH_LEAD_MIN * 60_000);
}

/** Deux réservations à moins d'une heure d'écart se chevauchent. */
export function overlaps(list: ScheduledRide[], at: Date): boolean {
  return list.some((s) => Math.abs(new Date(s.at).getTime() - at.getTime()) < 60 * 60_000);
}
