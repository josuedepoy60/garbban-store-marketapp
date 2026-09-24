// Formatage des dates en français, sans dépendre d'Intl (absent de certains moteurs JS).

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const pad = (n: number) => String(n).padStart(2, '0');
export const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** « Aujourd'hui 12:45 », « Hier 18:30 », « Dimanche 21:10 » ou « 3 sept. 09:00 ». */
export function formatWhen(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return `Aujourd'hui ${hhmm(d)}`;
  if (days === 1) return `Hier ${hhmm(d)}`;
  if (days === -1) return `Demain ${hhmm(d)}`;
  if (days > 1 && days < 7) return `${DAYS[d.getDay()]} ${hhmm(d)}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hhmm(d)}`;
}

/** Heure d'arrivée estimée dans `minutes`. */
export const arrivalTime = (minutes: number, now = new Date()) => hhmm(new Date(now.getTime() + minutes * 60_000));

export const minutesAgo = (m: number, now = new Date()) => new Date(now.getTime() - m * 60_000).toISOString();
