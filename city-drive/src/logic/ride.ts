// Cycle de vie d'une course, sous forme de machine à états pure (testable sans interface).
//
//   recherche ──► acceptée ──► chauffeur arrivé ──► en course ──► terminée
//       │             │               │
//       └─────────────┴───────────────┴──► annulée        recherche ──► aucun chauffeur
//
// Pendant la recherche, la mission est proposée au chauffeur le plus proche ; sans réponse
// sous 20 s ou en cas de refus, elle passe au suivant (statuts de Vela : recherche, acceptee…).
// Le temps avance par « ticks » d'une minute simulée, envoyés par le RideProvider.

import type { Candidate, Driver } from './fleet.ts';
import type { Place } from './places.ts';
import { cancellationFee, FREE_WAIT_MIN, waitingFee, type Category, type Quote } from './pricing.ts';
import type { RouteOption } from './traffic.ts';

export type RideStatus = 'searching' | 'accepted' | 'arrived' | 'ongoing' | 'completed' | 'cancelled' | 'no_driver';
export type PaymentMethod = 'wallet' | 'mobile_money' | 'cash';

export type Ride = {
  id: string;
  createdAt: string;
  pickup: Place;
  stops: Place[];
  destination: Place;
  category: Category;
  route: RouteOption;
  quote: Quote;
  payment: PaymentMethod;
  /** Opérateur Mobile Money choisi (Wave, Orange, MTN, Moov). */
  operator: string | null;
  /** Chauffeur demandé (favori, « Reprendre avec… ») : prioritaire s'il est assez proche. */
  preferredDriverId: string | null;
  status: RideStatus;
  driver: Driver | null;
  /** Offre en attente de réponse (20 s), pendant la recherche. */
  offer: Candidate | null;
  /** Chauffeurs ayant refusé ou laissé expirer l'offre : on passe au suivant. */
  declined: string[];
  /** Minutes simulées écoulées depuis la demande. */
  clock: number;
  acceptedAt: number | null;
  arrivedAt: number | null;
  startedAt: number | null;
  endedAt: number | null;
  /** Minutes restantes : approche du chauffeur, puis trajet jusqu'à destination. */
  eta: number;
  /** Durée d'approche annoncée à l'acceptation (pour situer le chauffeur sur la carte). */
  approachTotal: number;
  /** Avancement du trajet, de 0 à 1. */
  progress: number;
  waited: number;
  fare: number | null;
  cancelFee: number;
  /** Moyen réellement utilisé une fois la course réglée. */
  paidWith: PaymentMethod | null;
  settled: boolean;
  /** Commission Garbban, net chauffeur et dette espèces, fixés au règlement. */
  commission: number;
  driverNet: number;
  driverDebt: number;
  rating: number | null;
  tip: number;
};

export type RideEvent =
  | { type: 'tick' }
  | { type: 'offer'; candidate: Candidate | null }
  | { type: 'respond'; accepted: boolean }
  | { type: 'board' }
  | { type: 'cancel' }
  | { type: 'setPayment'; method: PaymentMethod; operator?: string | null }
  | { type: 'settle'; paidWith: PaymentMethod; commission?: number; driverNet?: number; driverDebt?: number }
  | { type: 'rate'; rating: number; tip: number };

/** Le passager monte seul au bout de 2 min d'attente si personne n'appuie sur « Je suis à bord ». */
export const AUTO_BOARD_MIN = 2;

export type NewRide = Pick<Ride, 'pickup' | 'stops' | 'destination' | 'category' | 'route' | 'quote' | 'payment'> & {
  preferredDriverId?: string | null;
  operator?: string | null;
};

export function createRide(input: NewRide, now = new Date()): Ride {
  return {
    ...input,
    preferredDriverId: input.preferredDriverId ?? null,
    operator: input.operator ?? null,
    offer: null,
    declined: [],
    commission: 0,
    driverNet: 0,
    driverDebt: 0,
    id: `CD-${String(now.getTime()).slice(-6)}`,
    createdAt: now.toISOString(),
    status: 'searching',
    driver: null,
    clock: 0,
    acceptedAt: null,
    arrivedAt: null,
    startedAt: null,
    endedAt: null,
    eta: 0,
    approachTotal: 0,
    progress: 0,
    waited: 0,
    fare: null,
    cancelFee: 0,
    paidWith: null,
    settled: false,
    rating: null,
    tip: 0,
  };
}

export const isActive = (r: Ride | null): r is Ride => !!r && ['searching', 'accepted', 'arrived', 'ongoing'].includes(r.status);
export const isFinished = (r: Ride) => r.status === 'completed' || r.status === 'cancelled' || r.status === 'no_driver';

/** Frais que coûterait une annulation maintenant. */
export function cancelFeeNow(r: Ride): number {
  if (r.status === 'searching') return 0;
  if (r.status === 'accepted' || r.status === 'arrived') return cancellationFee(r.clock - (r.acceptedAt ?? r.clock));
  return 0;
}

export const canCancel = (r: Ride) => r.status === 'searching' || r.status === 'accepted' || r.status === 'arrived';

export function transition(r: Ride, e: RideEvent): Ride {
  switch (e.type) {
    case 'tick': {
      const clock = r.clock + 1;
      if (r.status === 'accepted') {
        const eta = Math.max(0, r.eta - 1);
        return eta === 0 ? { ...r, clock, eta: 0, status: 'arrived', arrivedAt: clock } : { ...r, clock, eta };
      }
      if (r.status === 'arrived') {
        const waited = r.waited + 1;
        const next = { ...r, clock, waited };
        return waited >= AUTO_BOARD_MIN ? transition(next, { type: 'board' }) : next;
      }
      if (r.status === 'ongoing') {
        const eta = Math.max(0, r.eta - 1);
        const progress = r.route.minutes ? Math.min(1, 1 - eta / r.route.minutes) : 1;
        if (eta > 0) return { ...r, clock, eta, progress };
        return { ...r, clock, eta: 0, progress: 1, status: 'completed', endedAt: clock, fare: r.quote.total + waitingFee(r.waited) };
      }
      return r.status === 'searching' ? { ...r, clock } : r;
    }
    case 'offer': {
      if (r.status !== 'searching' || r.offer) return r;
      // Plus aucun chauffeur à solliciter dans le rayon : la recherche échoue.
      if (!e.candidate) return { ...r, status: 'no_driver', endedAt: r.clock };
      return { ...r, offer: e.candidate };
    }
    case 'respond': {
      if (r.status !== 'searching' || !r.offer) return r;
      if (!e.accepted) return { ...r, offer: null, declined: [...r.declined, r.offer.driver.id] };
      const { driver, eta } = r.offer;
      // Chauffeur non certifié : ni Vela Monnaie ni Mobile Money, seulement les espèces.
      const payment = driver.certified ? r.payment : 'cash';
      return { ...r, status: 'accepted', offer: null, driver, eta, approachTotal: eta, acceptedAt: r.clock, payment };
    }
    case 'board':
      if (r.status !== 'arrived') return r;
      return { ...r, status: 'ongoing', startedAt: r.clock, eta: r.route.minutes, progress: 0 };
    case 'cancel':
      if (!canCancel(r)) return r;
      return { ...r, status: 'cancelled', endedAt: r.clock, cancelFee: cancelFeeNow(r) };
    case 'setPayment':
      if (isFinished(r)) return r;
      if (e.method !== 'cash' && r.driver && !r.driver.certified) return r;
      return { ...r, payment: e.method, operator: e.method === 'mobile_money' ? (e.operator ?? r.operator) : r.operator };
    case 'settle':
      if (r.settled || (r.status !== 'completed' && r.status !== 'cancelled')) return r;
      return { ...r, settled: true, paidWith: e.paidWith, commission: e.commission ?? 0, driverNet: e.driverNet ?? 0, driverDebt: e.driverDebt ?? 0 };
    case 'rate':
      if (r.status !== 'completed') return r;
      return { ...r, rating: Math.min(5, Math.max(1, Math.round(e.rating))), tip: Math.max(0, Math.round(e.tip)) };
  }
}

/** Minutes d'attente restantes avant facturation (affichage « attente offerte »). */
export const freeWaitLeft = (r: Ride) => Math.max(0, FREE_WAIT_MIN - r.waited);
