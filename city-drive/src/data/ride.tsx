import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { availability, demandAt, dispatch, INITIAL_FLEET, nextRating, shortName, updateDriver, type Driver } from '@/logic/fleet';
import { getPlace, placeById, type Place } from '@/logic/places';
import { loyaltyPoints, quote, surgeFor, type Category, type Quote } from '@/logic/pricing';
import { createRide, isActive, transition, type PaymentMethod, type Ride, type RideEvent } from '@/logic/ride';
import { dueScheduled, overlaps, validateSchedule, type ScheduledRide } from '@/logic/schedule';
import { bestRoute, routeOptions, type RouteKind, type RouteOption } from '@/logic/traffic';
import { user } from './mock';
import { usePersistentState } from './storage';
import { useWallet } from './wallet';

/** Simulation : une minute de course passe en une seconde. */
export const TICK_MS = 1000;
/** Durée de la recherche de chauffeur avant attribution (minutes simulées). */
const SEARCH_TICKS = 2;
const MAX_HISTORY = 50;
export const CATEGORIES: Category[] = ['eco', 'confort', 'van', 'moto'];

export type Draft = {
  pickupId: string;
  destinationId: string;
  stopIds: string[];
  category: Category;
  routeId: RouteKind | null; // null = itinéraire conseillé
  payment: PaymentMethod;
  preferredDriverId: string | null;
};

export type Offer = { category: Category; available: number; eta: number | null; surge: number; quote: Quote };

const INITIAL_DRAFT: Draft = {
  pickupId: 'riviera2',
  destinationId: 'plateau-ccia',
  stopIds: [],
  category: 'eco',
  routeId: null,
  payment: 'wallet',
  preferredDriverId: null,
};

export const MAX_STOPS = 3;

type RideStore = {
  draft: Draft;
  pickup: Place;
  destination: Place;
  stops: Place[];
  routes: [RouteOption, RouteOption];
  route: RouteOption;
  offers: Offer[];
  offer: Offer;
  fleet: Driver[];
  favoriteDriver: Driver;
  current: Ride | null;
  history: Ride[];
  scheduled: ScheduledRide[];
  loyalty: number;
  setDestination: (id: string) => void;
  setPickup: (id: string) => void;
  addStop: (id: string) => string | null;
  removeStop: (id: string) => void;
  moveStop: (id: string, dir: -1 | 1) => void;
  setCategory: (c: Category) => void;
  setRoute: (r: RouteKind) => void;
  setPayment: (m: PaymentMethod) => void;
  preferDriver: (id: string | null) => void;
  /** Commande la course ; renvoie un message d'erreur si elle est refusée. */
  request: () => string | null;
  send: (e: RideEvent) => void;
  cancel: () => void;
  rate: (rating: number, tip: number, favorite: boolean) => string | null;
  dismiss: () => void;
  schedule: (at: Date, preferFavorite: boolean, category?: Category) => string | null;
  cancelScheduled: (id: string) => void;
  quoteFor: (category: Category, opts?: { scheduled?: boolean }) => Quote;
};

const RideContext = createContext<RideStore | null>(null);

/** Réveille les composants chaque minute pour recalculer trafic et tarifs. */
function useMinute() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function RideProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const now = useMinute();
  const [draft, setDraft] = usePersistentState<Draft>('draft', INITIAL_DRAFT);
  const [fleet, setFleet] = usePersistentState<Driver[]>('fleet', INITIAL_FLEET);
  const [current, setCurrent] = usePersistentState<Ride | null>('current', null);
  const [history, setHistory] = usePersistentState<Ride[]>('history', []);
  const [scheduled, setScheduled] = usePersistentState<ScheduledRide[]>('scheduled', []);
  const [favoriteId, setFavoriteId] = usePersistentState<string>('favorite', 'koffi');

  // Références pour le minuteur de simulation (évite de le recréer à chaque tick).
  const ref = useRef({ current, fleet, wallet, favoriteId });
  ref.current = { current, fleet, wallet, favoriteId };

  const pickup = placeById(draft.pickupId) ?? getPlace(INITIAL_DRAFT.pickupId);
  const destination = placeById(draft.destinationId) ?? getPlace(INITIAL_DRAFT.destinationId);
  const stops = draft.stopIds.map(placeById).filter((p): p is Place => !!p);

  const routes = useMemo(() => routeOptions([pickup, ...stops, destination], now), [pickup, stops.map((s) => s.id).join(), destination, now]); // eslint-disable-line react-hooks/exhaustive-deps
  const route = (draft.routeId && routes.find((r) => r.id === draft.routeId)) || bestRoute(routes);

  const quoteFor = (category: Category, opts: { scheduled?: boolean } = {}) => {
    const a = availability(fleet, pickup, category, now);
    return quote(category, route, { stops: stops.length, scheduled: opts.scheduled, surge: opts.scheduled ? 1 : surgeFor(a.count, demandAt(now)) });
  };

  const offers: Offer[] = CATEGORIES.map((category) => {
    const a = availability(fleet, pickup, category, now);
    return { category, available: a.count, eta: a.eta, surge: surgeFor(a.count, demandAt(now)), quote: quoteFor(category) };
  });
  const offer = offers.find((o) => o.category === draft.category) ?? offers[0];
  const favoriteDriver = fleet.find((d) => d.id === favoriteId) ?? INITIAL_FLEET[0];

  // Moteur de simulation : fait avancer la course active d'une minute par tick.
  useEffect(() => {
    if (!isActive(current)) return;
    const id = setInterval(() => {
      const { current: r, fleet: f, favoriteId: fav } = ref.current;
      if (!isActive(r)) return;
      if (r.status === 'searching' && r.clock + 1 >= SEARCH_TICKS) {
        const opts = { preferredId: r.preferredDriverId ?? fav };
        // Paiement portefeuille : on cherche d'abord un chauffeur certifié.
        const cand =
          (r.payment === 'wallet' && dispatch(f, r.pickup, r.category, { ...opts, requireCertified: true })) || dispatch(f, r.pickup, r.category, opts);
        const next = transition(transition(r, { type: 'tick' }), { type: 'assign', candidate: cand || null });
        if (cand) setFleet((fl) => updateDriver(fl, cand.driver.id, { status: 'busy' }));
        setCurrent(next);
        return;
      }
      setCurrent(transition(r, { type: 'tick' }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [current?.id, isActive(current)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Règlement à la fin de la course (ou frais d'annulation), puis libération du chauffeur.
  useEffect(() => {
    const r = current;
    if (!r || r.settled || (r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'no_driver')) return;
    const trip = `${r.pickup.name} ➔ ${r.destination.name}`;
    const who = r.driver ? `Chauffeur ${shortName(r.driver)}` : 'Aucun chauffeur';
    let paidWith: PaymentMethod = 'cash';
    if (r.status === 'completed' && r.fare && r.payment === 'wallet' && wallet.pay(r.fare, trip, who, 'course')) paidWith = 'wallet';
    if (r.status === 'cancelled' && r.cancelFee > 0 && wallet.pay(r.cancelFee, 'Frais d’annulation', trip, 'annulation')) paidWith = 'wallet';
    const settled = r.status === 'no_driver' ? { ...r, settled: true } : transition(r, { type: 'settle', paidWith });
    if (r.driver) {
      const d = r.driver;
      setFleet((fl) =>
        updateDriver(
          fl,
          d.id,
          r.status === 'completed'
            ? { status: 'available', position: { lat: r.destination.lat, lng: r.destination.lng }, trips: d.trips + 1 }
            : { status: 'available' },
        ),
      );
    }
    setCurrent(settled);
    setHistory((h) => [settled, ...h.filter((x) => x.id !== settled.id)].slice(0, MAX_HISTORY));
  }, [current?.status, current?.settled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Réservations : la recherche démarre 15 min avant l'heure prévue.
  useEffect(() => {
    if (isActive(current)) return;
    const due = dueScheduled(scheduled, now);
    if (!due) return;
    setScheduled((s) => s.filter((x) => x.id !== due.id));
    const [express, direct] = routeOptions([due.pickup, ...due.stops, due.destination], now);
    const payment: PaymentMethod = wallet.canPay(due.quote.total) ? 'wallet' : 'cash';
    setCurrent(
      createRide({
        pickup: due.pickup,
        stops: due.stops,
        destination: due.destination,
        category: due.category,
        quote: due.quote,
        route: bestRoute([express, direct]),
        payment,
        preferredDriverId: due.preferredDriverId,
      }),
    );
  }, [now, scheduled.length, isActive(current)]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const store: RideStore = {
    draft,
    pickup,
    destination,
    stops,
    routes,
    route,
    offers,
    offer,
    fleet,
    favoriteDriver,
    current,
    history,
    scheduled,
    loyalty: user.loyaltyPoints + history.filter((r) => r.status === 'completed').reduce((s, r) => s + loyaltyPoints(r.fare ?? 0), 0),
    setDestination: (id) => setDraft((d) => (id === d.pickupId ? d : { ...d, destinationId: id, stopIds: d.stopIds.filter((s) => s !== id), routeId: null })),
    setPickup: (id) => setDraft((d) => (id === d.destinationId ? d : { ...d, pickupId: id, stopIds: d.stopIds.filter((s) => s !== id), routeId: null })),
    addStop: (id) => {
      if (draft.stopIds.length >= MAX_STOPS) return `${MAX_STOPS} arrêts maximum`;
      if (id === draft.pickupId || id === draft.destinationId || draft.stopIds.includes(id)) return 'Ce lieu est déjà dans le trajet';
      patch({ stopIds: [...draft.stopIds, id], routeId: null });
      return null;
    },
    removeStop: (id) => patch({ stopIds: draft.stopIds.filter((s) => s !== id), routeId: null }),
    moveStop: (id, dir) => {
      const i = draft.stopIds.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= draft.stopIds.length) return;
      const next = [...draft.stopIds];
      [next[i], next[j]] = [next[j], next[i]];
      patch({ stopIds: next });
    },
    setCategory: (category) => patch({ category }),
    setRoute: (routeId) => patch({ routeId }),
    setPayment: (payment) => {
      patch({ payment });
      if (isActive(current)) setCurrent(transition(current, { type: 'setPayment', method: payment }));
    },
    preferDriver: (preferredDriverId) => patch({ preferredDriverId }),
    request: () => {
      if (isActive(current)) return 'Une course est déjà en cours';
      if (pickup.id === destination.id) return 'Choisissez une destination différente du départ';
      if (!offer.available) return 'Aucun chauffeur disponible dans cette catégorie pour le moment';
      if (draft.payment === 'wallet' && !wallet.canPay(offer.quote.total)) return 'Solde insuffisant : rechargez votre portefeuille ou payez en espèces';
      setCurrent(
        createRide({
          pickup,
          stops,
          destination,
          category: draft.category,
          route,
          quote: offer.quote,
          payment: draft.payment,
          preferredDriverId: draft.preferredDriverId,
        }),
      );
      patch({ preferredDriverId: null });
      return null;
    },
    send: (e) => current && setCurrent(transition(current, e)),
    cancel: () => current && setCurrent(transition(current, { type: 'cancel' })),
    rate: (rating, tip, favorite) => {
      const r = current?.status === 'completed' && current.rating === null ? current : history.find((h) => h.status === 'completed' && h.rating === null);
      if (!r || !r.driver) return 'Aucune course à noter';
      if (tip > 0 && !wallet.pay(tip, `Pourboire ${shortName(r.driver)}`, 'Reversé à 100 % au chauffeur', 'pourboire'))
        return 'Solde insuffisant pour ce pourboire';
      const rated = transition(r, { type: 'rate', rating, tip });
      const d = fleet.find((x) => x.id === r.driver!.id);
      if (d) setFleet((fl) => updateDriver(fl, d.id, { rating: nextRating(d, rated.rating ?? rating) }));
      if (favorite) setFavoriteId(r.driver.id);
      else if (favoriteId === r.driver.id) setFavoriteId('');
      setHistory((h) => h.map((x) => (x.id === rated.id ? rated : x)));
      if (current?.id === rated.id) setCurrent(rated);
      return null;
    },
    dismiss: () => {
      if (!isActive(current)) setCurrent(null);
    },
    schedule: (at, preferFavorite, category = draft.category) => {
      const err = validateSchedule(at);
      if (err) return err;
      if (pickup.id === destination.id) return 'Choisissez une destination différente du départ';
      if (overlaps(scheduled, at)) return 'Vous avez déjà une course prévue à moins d’une heure d’écart';
      const item: ScheduledRide = {
        id: `S-${String(Date.now()).slice(-6)}`,
        at: at.toISOString(),
        pickup,
        stops,
        destination,
        category,
        // Prix bloqué au trafic prévu à l'heure du départ, sans majoration de demande.
        quote: quote(category, bestRoute(routeOptions([pickup, ...stops, destination], at)), { stops: stops.length, scheduled: true }),
        preferredDriverId: preferFavorite ? favoriteId : null,
      };
      setScheduled((s) => [...s, item].sort((a, b) => a.at.localeCompare(b.at)));
      return null;
    },
    cancelScheduled: (id) => setScheduled((s) => s.filter((x) => x.id !== id)),
    quoteFor,
  };

  return <RideContext.Provider value={store}>{children}</RideContext.Provider>;
}

export function useRide() {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error('useRide doit être utilisé dans <RideProvider>');
  return ctx;
}
