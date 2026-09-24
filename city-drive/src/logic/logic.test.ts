/// <reference types="node" />
// Tests de la logique métier : `npm test` (runner natif de Node, sans dépendance).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { haversineKm, toMap } from './geo.ts';
import { availability, dispatch, INITIAL_FLEET, nextRating, shortName, updateDriver } from './fleet.ts';
import { getPlace, searchPlaces } from './places.ts';
import { cancellationFee, quote, roundFare, splitFare, surgeFor, waitingFee } from './pricing.ts';
import { cancelFeeNow, createRide, transition, type Ride } from './ride.ts';
import { dueScheduled, overlaps, validateSchedule } from './schedule.ts';
import { bestRoute, periodOf, routeOptions } from './traffic.ts';

const at = (h: number, m = 0) => new Date(2026, 8, 24, h, m);
const riviera = getPlace('riviera2');
const plateau = getPlace('plateau-ccia');
const marcory = getPlace('marcory-z4');

describe('géographie', () => {
  it('mesure Riviera 2 → Plateau à environ 7 km à vol d’oiseau', () => {
    const km = haversineKm(riviera, plateau);
    assert.ok(km > 6 && km < 8, `${km}`);
  });
  it('place les points dans le cadre de la carte', () => {
    const p = toMap({ lat: 0, lng: 0 });
    assert.ok(p.x <= 396 && p.y >= 24);
  });
  it('trouve un lieu sans accents ni majuscules', () => {
    assert.equal(searchPlaces('adjame')[0].id, 'adjame-gare');
    assert.equal(searchPlaces('zone 4 marcory')[0].id, 'marcory-z4');
    assert.equal(
      searchPlaces('riviera', ['riviera2']).some((p) => p.id === 'riviera2'),
      false,
    );
  });
});

describe('trafic', () => {
  it('reconnaît les heures de pointe', () => {
    assert.equal(periodOf(at(8)), 'pointe');
    assert.equal(periodOf(at(18, 30)), 'pointe');
    assert.equal(periodOf(at(14)), 'journee');
    assert.equal(periodOf(at(3)), 'nuit');
  });
  it('fait payer le péage HKB pour traverser la lagune par la voie express', () => {
    const [express, direct] = routeOptions([riviera, marcory], at(14));
    assert.equal(express.via, 'Pont HKB');
    assert.equal(express.toll, 500);
    assert.equal(direct.toll, 0);
    assert.ok(express.km > direct.km);
  });
  it('ralentit la route directe aux heures de pointe', () => {
    const [, calm] = routeOptions([riviera, plateau], at(3));
    const [, rush] = routeOptions([riviera, plateau], at(8));
    assert.ok(rush.minutes > calm.minutes * 1.5);
  });
  it('signale le bouchon d’Adjamé sur le trajet qui y passe', () => {
    const [, direct] = routeOptions([riviera, getPlace('yop-siporex')], at(8));
    assert.equal(direct.jam?.id, 'adjame');
    assert.ok(direct.jamDelay >= 10);
  });
  it('conseille la voie gratuite quand le péage fait gagner 2 min ou moins', () => {
    const r = bestRoute([
      { id: 'express', via: 'Pont HKB', km: 10, minutes: 20, toll: 500, jamDelay: 0, jam: null },
      { id: 'direct', via: 'Pont FHB', km: 9, minutes: 22, toll: 0, jamDelay: 0, jam: null },
    ]);
    assert.equal(r.id, 'direct');
  });
});

describe('tarifs', () => {
  const route = { km: 10, minutes: 25, toll: 0 };
  it('arrondit aux 50 F supérieurs', () => {
    assert.equal(roundFare(1401), 1450);
    assert.equal(roundFare(1400), 1400);
  });
  it('calcule un prix Eco réaliste', () => {
    // 500 + 10 × 150 + 25 × 20 = 2 500
    assert.equal(quote('eco', route).total, 2500);
  });
  it('applique le minimum de course', () => {
    assert.equal(quote('confort', { km: 1, minutes: 3, toll: 0 }).total, 1500);
  });
  it('ajoute arrêts, réservation et péage (sauf moto)', () => {
    const q = quote('eco', { ...route, toll: 500 }, { stops: 2, scheduled: true });
    assert.equal(q.total, 2500 + 600 + 200 + 500);
    assert.equal(quote('moto', { ...route, toll: 500 }).toll, 0);
  });
  it('majore quand les chauffeurs manquent, plafonné à ×1,5', () => {
    assert.equal(surgeFor(5, 1), 1);
    assert.equal(surgeFor(0, 1), 1.5);
    const s = surgeFor(1, 1);
    assert.ok(s > 1 && s < 1.5);
    assert.equal(quote('eco', route, { surge: 3 }).surge, 1.5);
  });
  it('facture l’attente après 3 min et l’annulation après 2 min', () => {
    assert.equal(waitingFee(3), 0);
    assert.equal(waitingFee(5), 100);
    assert.equal(cancellationFee(null), 0);
    assert.equal(cancellationFee(1), 0);
    assert.equal(cancellationFee(2), 500);
  });
  it('partage le prix en covoiturage', () => {
    assert.equal(splitFare(4800, 3), 1600);
    assert.equal(splitFare(4800, 0), 4800);
  });
});

describe('logistique', () => {
  it('attribue le chauffeur libre le plus proche de la bonne catégorie', () => {
    const c = dispatch(INITIAL_FLEET, riviera, 'confort', { date: at(14) });
    assert.equal(c?.driver.id, 'serge');
  });
  it('privilégie le chauffeur favori s’il est assez proche', () => {
    const c = dispatch(INITIAL_FLEET, riviera, 'eco', { preferredId: 'awa', date: at(14) });
    assert.equal(c?.driver.id, 'awa');
  });
  it('ignore les chauffeurs occupés, hors ligne ou non certifiés si besoin', () => {
    const fleet = updateDriver(INITIAL_FLEET, 'koffi', { status: 'busy' });
    assert.notEqual(dispatch(fleet, riviera, 'eco')?.driver.id, 'koffi');
    const c = dispatch(INITIAL_FLEET, plateau, 'eco', { requireCertified: true });
    assert.equal(c?.driver.certified, true);
    assert.equal(availability(INITIAL_FLEET, riviera, 'confort').count, 3);
  });
  it('ne trouve personne trop loin', () => {
    assert.equal(dispatch(INITIAL_FLEET, { lat: 5.6, lng: -4.3 }, 'eco'), null);
  });
  it('met à jour la note moyenne', () => {
    const d = { ...INITIAL_FLEET[0], rating: 4, trips: 3 };
    assert.equal(nextRating(d, 5), 4.25);
    assert.equal(shortName(d), 'Koffi T.');
  });
});

describe('cycle de vie d’une course', () => {
  const [express] = routeOptions([riviera, plateau], at(14));
  const base = () =>
    createRide(
      { pickup: riviera, stops: [], destination: plateau, category: 'eco', route: { ...express, minutes: 3 }, quote: quote('eco', express), payment: 'wallet' },
      at(14),
    );
  const run = (r: Ride, n: number) => Array.from({ length: n }).reduce<Ride>((acc) => transition(acc, { type: 'tick' }), r);
  const koffi = INITIAL_FLEET[0];

  it('va de la recherche jusqu’à l’arrivée', () => {
    let r = transition(base(), { type: 'assign', candidate: { driver: koffi, eta: 2 } });
    assert.equal(r.status, 'accepted');
    r = run(r, 2);
    assert.equal(r.status, 'arrived');
    r = transition(r, { type: 'board' });
    assert.equal(r.status, 'ongoing');
    r = run(r, 2);
    assert.ok(r.progress > 0.6 && r.progress < 1);
    r = run(r, 1);
    assert.equal(r.status, 'completed');
    assert.equal(r.fare, r.quote.total);
  });
  it('fait monter le passager tout seul après 2 min d’attente', () => {
    const r = run(transition(base(), { type: 'assign', candidate: { driver: koffi, eta: 1 } }), 3);
    assert.equal(r.status, 'ongoing');
  });
  it('passe en espèces si le chauffeur n’est pas certifié', () => {
    const r = transition(base(), { type: 'assign', candidate: { driver: { ...koffi, certified: false }, eta: 3 } });
    assert.equal(r.payment, 'cash');
    assert.equal(transition(r, { type: 'setPayment', method: 'wallet' }).payment, 'cash');
  });
  it('facture l’annulation tardive seulement', () => {
    assert.equal(transition(base(), { type: 'cancel' }).cancelFee, 0);
    const late = run(transition(base(), { type: 'assign', candidate: { driver: koffi, eta: 10 } }), 3);
    assert.equal(cancelFeeNow(late), 500);
    assert.equal(transition(late, { type: 'cancel' }).status, 'cancelled');
  });
  it('termine sans chauffeur disponible', () => {
    assert.equal(transition(base(), { type: 'assign', candidate: null }).status, 'no_driver');
  });
  it('ne règle et ne note qu’une course terminée', () => {
    const r = base();
    assert.equal(transition(r, { type: 'settle', paidWith: 'wallet' }).settled, false);
    assert.equal(transition(r, { type: 'rate', rating: 5, tip: 200 }).rating, null);
  });
});

describe('courses programmées', () => {
  const now = at(14);
  const later = (min: number) => new Date(now.getTime() + min * 60_000);
  const item = (min: number, id = 's') => ({
    id,
    at: later(min).toISOString(),
    pickup: riviera,
    stops: [],
    destination: plateau,
    category: 'eco' as const,
    quote: quote('eco', { km: 10, minutes: 25, toll: 0 }),
    preferredDriverId: null,
  });
  it('exige 30 min d’avance et au plus 7 jours', () => {
    assert.match(validateSchedule(later(10), now) ?? '', /30 min/);
    assert.equal(validateSchedule(later(45), now), null);
    assert.match(validateSchedule(later(8 * 24 * 60), now) ?? '', /7 jours/);
  });
  it('lance la recherche 15 min avant l’heure prévue', () => {
    assert.equal(dueScheduled([item(60)], now), undefined);
    assert.equal(dueScheduled([item(60, 'a'), item(10, 'b')], now)?.id, 'b');
  });
  it('détecte deux réservations trop proches', () => {
    assert.equal(overlaps([item(120)], later(150)), true);
    assert.equal(overlaps([item(120)], later(200)), false);
  });
});
