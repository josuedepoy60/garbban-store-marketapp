import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Avatar, CircleButton, Icon, Touchable, useLayout } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts, shadows } from '@/constants/theme';
import { formatAmount, vehicles } from '@/data/mock';
import { useRide } from '@/data/ride';
import { shortName } from '@/logic/fleet';
import { BOOKING_FEE, quote, type Category } from '@/logic/pricing';
import { DISPATCH_LEAD_MIN, validateSchedule } from '@/logic/schedule';
import { formatWhen } from '@/logic/time';
import { bestRoute, periodOf, routeOptions } from '@/logic/traffic';

const WEEKDAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
type Slot = 'matin' | 'aprem' | 'soir';
const SLOTS: { id: Slot; label: string; from: number }[] = [
  { id: 'matin', label: 'Matin', from: 5 },
  { id: 'aprem', label: 'Après-midi', from: 11 },
  { id: 'soir', label: 'Soir', from: 17 },
];
/** 12 créneaux de 30 min à partir de l'heure donnée. */
const timesFrom = (h: number) => Array.from({ length: 12 }, (_, i) => `${String(h + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

const CHOICES: Category[] = ['eco', 'confort', 'van'];

function nextDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const label = i === 0 ? 'Auj.' : i === 1 ? 'Demain' : WEEKDAYS[d.getDay()];
    return { key: d.toDateString(), date: d, label };
  });
}

const at = (date: Date, time: string) => {
  const [h, m] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
};

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { gutter, compact } = useLayout();
  const ride = useRide();
  const { pickup, destination, stops, draft, favoriteDriver, history, scheduled } = ride;
  const days = useMemo(() => nextDays(7), []);
  const [day, setDay] = useState(days[1].key);
  const [slot, setSlot] = useState<Slot>('matin');
  const [time, setTime] = useState('07:30');
  const [preferDriver, setPreferDriver] = useState(true);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = days.find((d) => d.key === day) ?? days[0];
  const dayText = `${WEEKDAYS[selected.date.getDay()].toLowerCase()} ${selected.date.getDate()}`;
  const when = at(selected.date, time);
  const category = CHOICES.includes(draft.category) ? draft.category : 'eco';

  // Trafic et prix calculés pour l'heure choisie (pas pour maintenant).
  const route = bestRoute(routeOptions([pickup, ...stops, destination], when));
  const price = quote(category, route, { stops: stops.length, scheduled: true });
  const together = history.filter((h) => h.status === 'completed' && h.driver?.id === favoriteDriver.id).length;
  const vehicle = vehicles.find((v) => v.id === category);

  const confirm = () => {
    setError(null);
    if (category !== draft.category) ride.setCategory(category);
    const err = ride.schedule(when, preferDriver, category);
    if (err) return setError(err);
    setDone(`${dayText} à ${time}`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, gap: 24 }} showsVerticalScrollIndicator={false}>
        {/* Barre du modal */}
        <View style={{ paddingHorizontal: gutter }}>
          <View style={styles.modalBar}>
            <CircleButton icon="arrow-back" label="Retour" background={colors.surfaceLow} onPress={() => router.back()} />
            <View style={[styles.row, { flexShrink: 1 }]}>
              <Icon name="event" size={18} color={colors.primary} />
              <AppText variant="headlineSm" numberOfLines={1} style={{ flexShrink: 1, fontSize: compact ? 15 : 17 }}>
                Programmer une course
              </AppText>
            </View>
            <CircleButton icon="close" label="Fermer" background={colors.surfaceLow} onPress={() => router.back()} />
          </View>
        </View>

        {/* Résumé du trajet */}
        <View style={{ paddingHorizontal: gutter }}>
          <View style={styles.routeCard}>
            <View style={[styles.row, { gap: 16, alignItems: 'flex-start' }]}>
              <View style={{ alignItems: 'center', paddingTop: 6 }}>
                <View style={styles.fromDot}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
                </View>
                <View style={[styles.timeline, { backgroundColor: colors.outlineVariant }]} />
                <View style={styles.toDot}>
                  <View style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: colors.onSecondaryContainer }} />
                </View>
              </View>
              <View style={{ flex: 1, gap: 12 }}>
                <Touchable onPress={() => router.push({ pathname: '/destination', params: { mode: 'pickup' } })}>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    DÉPART
                  </AppText>
                  <AppText variant="headlineSm" numberOfLines={1}>
                    {pickup.name}, {pickup.area}
                  </AppText>
                </Touchable>
                <Touchable onPress={() => router.push('/destination')}>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    DESTINATION{stops.length ? ` · ${stops.length} ARRÊT${stops.length > 1 ? 'S' : ''}` : ''}
                  </AppText>
                  <AppText variant="headlineSm" numberOfLines={1}>
                    {destination.name}, {destination.area}
                  </AppText>
                </Touchable>
              </View>
            </View>
            <View style={styles.specs}>
              <View style={styles.row}>
                <Icon name="route" size={18} color={colors.primary} />
                <AppText variant="labelMd">
                  {route.minutes} min · {route.km.toString().replace('.', ',')} km
                </AppText>
              </View>
              <AppText variant="labelSm" color={colors.onSurfaceVariant} numberOfLines={1} style={{ flexShrink: 1 }}>
                {route.via}
              </AppText>
            </View>
            <View style={[styles.row, { gap: 8 }]}>
              {CHOICES.map((c) => {
                const on = c === category;
                return (
                  <Touchable key={c} onPress={() => ride.setCategory(c)} style={[styles.catChip, on && { backgroundColor: colors.primary }]}>
                    <AppText variant="labelMd" color={on ? colors.onPrimary : colors.onSurface}>
                      {vehicles.find((v) => v.id === c)?.name}
                    </AppText>
                  </Touchable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Jour */}
        <View style={{ gap: 8 }}>
          <View style={[styles.between, { paddingHorizontal: gutter }]}>
            <View style={styles.row}>
              <Icon name="calendar-today" size={18} color={colors.primary} />
              <AppText variant="headlineSm">Jour</AppText>
            </View>
            <View style={styles.month}>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {MONTHS[selected.date.getMonth()]} {selected.date.getFullYear()}
              </AppText>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: gutter, paddingVertical: 6 }}>
            {days.map((d) => {
              const active = d.key === day;
              return (
                <Touchable key={d.key} onPress={() => { setDay(d.key); setDone(null); }} style={[styles.day, compact && { minWidth: 60, height: 72 }, active && styles.dayActive]}>
                  <AppText variant="labelSm" color={active ? colors.primaryFixed : colors.onSurfaceVariant}>
                    {d.label}
                  </AppText>
                  <AppText variant="headlineMd" color={active ? colors.onPrimary : colors.onSurface}>
                    {d.date.getDate()}
                  </AppText>
                </Touchable>
              );
            })}
          </ScrollView>
        </View>

        {/* Heure */}
        <View style={{ paddingHorizontal: gutter, gap: 10 }}>
          <View style={styles.row}>
            <Icon name="schedule" size={18} color={colors.primary} />
            <AppText variant="headlineSm">Heure de prise en charge</AppText>
          </View>
          <View style={styles.segment}>
            {SLOTS.map((sl) => (
              <Touchable key={sl.id} onPress={() => setSlot(sl.id)} style={[styles.segmentItem, slot === sl.id && styles.segmentOn]}>
                <AppText variant="labelMd" color={slot === sl.id ? colors.onSurface : colors.onSurfaceVariant}>
                  {sl.label}
                </AppText>
              </Touchable>
            ))}
          </View>
          <View style={styles.grid}>
            {timesFrom(SLOTS.find((x) => x.id === slot)!.from).map((t) => {
              const active = t === time;
              const invalid = !!validateSchedule(at(selected.date, t));
              return (
                <Touchable
                  key={t}
                  disabled={invalid}
                  onPress={() => { setTime(t); setDone(null); }}
                  style={[styles.time, active && styles.timeActive, invalid && { opacity: 0.35 }]}
                >
                  <AppText variant="headlineSm" color={active ? colors.onPrimary : colors.onSurface} style={{ fontSize: compact ? 15 : 17 }}>
                    {t}
                  </AppText>
                </Touchable>
              );
            })}
          </View>
          {periodOf(when) === 'pointe' && (
            <AppText variant="bodySm" color="#92400E">
              Heure de pointe : trajet plus long, mais prix bloqué sans majoration.
            </AppText>
          )}
        </View>

        {/* Chauffeur préféré */}
        <View style={{ paddingHorizontal: gutter }}>
          <View style={styles.driverCard}>
            <View style={[styles.between, { alignItems: 'flex-start' }]}>
              <View style={[styles.row, { gap: 8, flex: 1 }]}>
                <View>
                  <Avatar name={favoriteDriver.fullName} size={52} radius={26} style={{ borderWidth: 2, borderColor: colors.primaryFixed }} />
                  <View style={styles.rating}>
                    <Icon name="star" size={11} color={colors.onSecondaryContainer} />
                    <AppText variant="labelSm" color={colors.onSecondaryContainer} style={{ fontSize: 10 }}>
                      {favoriteDriver.rating.toFixed(1).replace('.', ',')}
                    </AppText>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <AppText variant="headlineSm">{shortName(favoriteDriver)}</AppText>
                    {favoriteDriver.certified && <Icon name="verified" size={16} color={colors.primary} />}
                  </View>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                    Chauffeur préféré · {favoriteDriver.car}
                  </AppText>
                </View>
              </View>
              <Touchable
                accessibilityRole="switch"
                accessibilityState={{ checked: preferDriver }}
                onPress={() => setPreferDriver((v) => !v)}
                style={[styles.toggle, { backgroundColor: preferDriver ? colors.primary : colors.surfaceHighest }]}
              >
                <View style={[styles.knob, { alignSelf: preferDriver ? 'flex-end' : 'flex-start' }]} />
              </Touchable>
            </View>

            {together > 0 && (
              <View style={styles.trust}>
                <View style={styles.row}>
                  <Icon name="favorite" size={16} color={colors.primary} />
                  <AppText variant="labelMd">
                    {together} course{together > 1 ? 's' : ''} ensemble
                  </AppText>
                </View>
              </View>
            )}

            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <Icon name="info-outline" size={16} color={colors.onSurfaceVariant} style={{ marginTop: 1 }} />
              <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ flex: 1, fontSize: 12, lineHeight: 16 }}>
                La recherche démarre {DISPATCH_LEAD_MIN} min avant le départ. Si {shortName(favoriteDriver)} n’est pas libre, le chauffeur{' '}
                {vehicle?.name} le plus proche est attribué, au même prix.
              </AppText>
            </View>
          </View>
        </View>

        {/* Courses déjà programmées */}
        {scheduled.length > 0 && (
          <View style={{ paddingHorizontal: gutter, gap: 8 }}>
            <AppText variant="headlineSm">Vos courses programmées</AppText>
            {scheduled.map((sc) => (
              <View key={sc.id} style={styles.booked}>
                <Icon name="event" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <AppText variant="labelLg" numberOfLines={1}>
                    {formatWhen(sc.at)} · {sc.destination.name}
                  </AppText>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                    {vehicles.find((v) => v.id === sc.category)?.name} · {formatAmount(sc.quote.total)} F
                  </AppText>
                </View>
                <Touchable onPress={() => ride.cancelScheduled(sc.id)} style={styles.bookedCancel} accessibilityLabel="Annuler la réservation">
                  <AppText variant="labelSm" color="#B42318">
                    Annuler
                  </AppText>
                </Touchable>
              </View>
            ))}
          </View>
        )}

        {/* Dock prix + confirmation */}
        <View style={[styles.dock, { paddingBottom: insets.bottom + 12, paddingHorizontal: gutter }]}>
          <View style={[styles.between, { alignItems: 'flex-start', flexWrap: 'wrap', rowGap: 8 }]}>
            <View style={{ flexGrow: 1 }}>
              <View style={styles.row}>
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  TARIF GARANTI
                </AppText>
                <Icon name="lock" size={14} color={colors.secondary} />
              </View>
              <View style={[styles.row, { alignItems: 'baseline' }]}>
                <AppText variant="currency" color={colors.primary}>
                  {formatAmount(price.total)}
                </AppText>
                <AppText variant="headlineSm">FCFA</AppText>
              </View>
              <AppText variant="labelSm" color={colors.secondary} style={{ fontFamily: fonts.dm600 }}>
                Frais de réservation {formatAmount(BOOKING_FEE)} F inclus
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={styles.payBadge}>
                <Icon name="toll" size={16} color={colors.onSecondaryContainer} />
                <AppText variant="labelMd" color={colors.onSecondaryContainer} style={{ fontFamily: fonts.dm700 }}>
                  {brand.walletName}
                </AppText>
              </View>
              <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ fontSize: 11 }}>
                Débit à l’arrivée
              </AppText>
            </View>
          </View>

          <Touchable disabled={!!done} scale={0.98} onPress={confirm} style={[styles.cta, !!done && { backgroundColor: colors.secondary }]}>
            <Icon name={done ? 'check-circle' : 'calendar-today'} size={22} color={colors.onPrimary} />
            <AppText variant="headlineSm" color={colors.onPrimary} numberOfLines={1} style={{ flexShrink: 1, fontSize: compact ? 15 : 17 }}>
              {done ? `Programmée ${done}` : `Programmer ${dayText} à ${time}`}
            </AppText>
          </Touchable>
          {error && (
            <AppText variant="labelMd" color="#B42318" style={{ textAlign: 'center' }}>
              {error}
            </AppText>
          )}
          <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ textAlign: 'center', fontSize: 12 }}>
            Annulation gratuite jusqu’à {DISPATCH_LEAD_MIN} min avant le départ
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  px: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  modalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 4,
    boxShadow: shadows.soft,
  },
  routeCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: 16, gap: 16, overflow: 'hidden', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  blob: { position: 'absolute', right: -32, top: -32, width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(229,231,235,0.5)' },
  fromDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: `0px 0px 0px 4px ${colors.primaryFixed}` },
  timeline: { width: 2, height: 40, borderRadius: 1, marginVertical: 2 },
  toDot: { width: 14, height: 14, borderRadius: 6, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(244,245,247,0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  specCar: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLowest, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  month: { backgroundColor: colors.surfaceContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  day: {
    minWidth: 72,
    height: 82,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  dayActive: { minWidth: 76, backgroundColor: colors.primary, transform: [{ scale: 1.03 }], boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  dayDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  time: {
    width: '31.5%',
    flexGrow: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  timeActive: { backgroundColor: colors.primaryContainer, borderWidth: 2, borderColor: colors.secondaryContainer, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  driverCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: 16, gap: 8, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  rating: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surfaceLowest,
  },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center', marginTop: 4 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  trust: { backgroundColor: 'rgba(244,245,247,0.7)', borderRadius: 16, padding: 8, gap: 4 },
  dock: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 16,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  payBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.secondaryContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  catChip: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceLow },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceContainer, borderRadius: 12, padding: 3 },
  segmentItem: { flex: 1, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.surfaceLowest, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  booked: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceLowest, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  bookedCancel: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FEF3F2' },
  cta: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
});
