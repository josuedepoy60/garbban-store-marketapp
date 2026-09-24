import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { TabHeader } from '@/components/headers';
import { AppText, Avatar, Dot, Icon, Pill, SheetHandle, Touchable, useLayout, type IconName } from '@/components/ui';
import { colors, fonts, shadows } from '@/constants/theme';
import { formatAmount, quickPlaces } from '@/data/mock';
import { useRide } from '@/data/ride';
import { shortName } from '@/logic/fleet';
import { toMap } from '@/logic/geo';
import { quote } from '@/logic/pricing';
import { isActive } from '@/logic/ride';
import { HOTSPOTS, type RouteOption } from '@/logic/traffic';

const SHORTCUTS: { icon: IconName; label: string; bg: string; fg: string; to: '/arrets' | '/programmer' | '/trajets' | '/vehicules' }[] = [
  { icon: 'alt-route', label: 'Plusieurs arrêts', bg: colors.blueSoft, fg: colors.blue, to: '/arrets' },
  { icon: 'calendar-month', label: 'Plus tard', bg: colors.secondaryContainer, fg: colors.onSecondaryFixed, to: '/programmer' },
  { icon: 'directions-bus', label: 'Car / Bus', bg: colors.greenSoft, fg: colors.green, to: '/trajets' },
  { icon: 'badge', label: 'Chauffeur perso', bg: colors.pinkSoft, fg: colors.tertiary, to: '/vehicules' },
];

const JAM_RED = '#DC2626';

const STATUS_TEXT: Record<string, string> = {
  searching: 'Recherche d\u2019un chauffeur…',
  accepted: 'Votre chauffeur arrive',
  arrived: 'Votre chauffeur est arrivé',
  ongoing: 'Course en cours',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { mapHeight, gutter, compact } = useLayout();
  const ride = useRide();
  const { pickup, destination, routes, route, offer, fleet, favoriteDriver, current, draft } = ride;
  const [alertOpen, setAlertOpen] = useState(true);
  const mapTop = insets.top + 72;
  const mapH = mapHeight(0.5, 280, 460);

  const [express] = routes;
  const jammed = routes.find((r) => r.jam);
  const price = (r: RouteOption) => quote(draft.category, r, { stops: ride.stops.length, majoration: offer.quote.majoration }).total;
  const fastest = routes.reduce((a, b) => (b.minutes < a.minutes ? b : a));
  // Taxis libres autour du départ, dessinés à leur position réelle.
  const cars = fleet
    .filter((d) => d.status === 'available')
    .map((d, i) => ({ ...toMap(d.position), angle: (i * 67) % 180 - 90 }));
  const open = ride.offers.filter((o) => o.available);
  const cheapest = open.length ? Math.min(...open.map((o) => o.quote.total)) : offer.quote.total;
  const favFirst = favoriteDriver.fullName.split(' ')[0];
  const favPrice = ride.quoteFor(favoriteDriver.category).total;
  const favFree = favoriteDriver.status === 'available';
  const active = isActive(current) ? current : null;

  const goVehicles = (placeId?: string) => {
    if (placeId) ride.setDestination(placeId);
    router.push('/vehicules');
  };

  function rebook() {
    ride.preferDriver(favoriteDriver.id);
    ride.setCategory(favoriteDriver.category);
    router.push('/vehicules');
  }

  return (
    <View style={styles.screen}>
      <TabHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Carte */}
        <View style={{ height: mapH + mapTop }}>
          <CityMap userMarker={toMap(pickup)} cars={cars} style={StyleSheet.absoluteFill}>
            {jammed && <Circle {...circleAt(jammed)} fill="rgba(220,38,38,0.16)" stroke={JAM_RED} strokeWidth={2} />}
          </CityMap>

          <View style={[styles.mapBar, { top: mapTop, left: gutter, right: gutter }]}>
            <Touchable style={styles.glassPill} onPress={() => router.push({ pathname: '/destination', params: { mode: 'pickup' } })} accessibilityLabel="Changer le point de départ">
              <Icon name="location-on" size={18} color={colors.primary} />
              <AppText variant="labelMd" numberOfLines={1} style={{ fontFamily: fonts.dm700, flexShrink: 1 }}>
                {pickup.area}, {pickup.name}
              </AppText>
              <Icon name="expand-more" size={16} color={colors.onSurfaceVariant} />
            </Touchable>
          </View>

          <View style={[styles.jamBadge, { top: mapTop + 48, left: gutter }]}>
            <Icon name="traffic" size={14} color={jammed ? JAM_RED : colors.green} />
            <AppText variant="labelSm" color={colors.onSurface} numberOfLines={1}>
              {jammed?.jam ? `Bouchon ${jammed.jam.name.replace('Carrefour ', 'à ')} · +${jammed.jamDelay} min` : `Trafic ${trafficWord(route.minutes, route.km)}`}
            </AppText>
          </View>

          {!compact && (
            <Touchable style={[styles.mapChip, styles.driverChip, { right: gutter }]} onPress={() => rebook()}>
              <Avatar name={favoriteDriver.fullName} size={28} radius={14} />
              <View>
                <View style={styles.row}>
                  <Icon name="star" size={13} color={colors.star} />
                  <AppText variant="labelSm">{shortName(favoriteDriver)}</AppText>
                </View>
                <AppText variant="labelSm" color={colors.primary} style={{ fontSize: 10, fontFamily: fonts.dm600 }}>
                  Votre chauffeur favori
                </AppText>
              </View>
            </Touchable>
          )}

          <View style={[styles.recenter, { left: gutter }]}>
            <AppText variant="labelSm" color={colors.onSurface}>
              {cars.length}
            </AppText>
            <Icon name="local-taxi" size={16} color={colors.onSurface} />
          </View>
        </View>

        {/* Feuille d'actions */}
        <View style={[styles.sheet, { marginHorizontal: compact ? 8 : 12, padding: compact ? 14 : 20 }]}>
          <SheetHandle color="rgba(200,196,215,0.6)" />

          {active && (
            <Touchable style={styles.activeRide} onPress={() => router.push('/course')}>
              <View style={styles.activeIcon}>
                <Icon name="local-taxi" size={20} color={colors.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="labelLg" color={colors.onPrimary} numberOfLines={1}>
                  {STATUS_TEXT[active.status]}
                </AppText>
                <AppText variant="bodySm" color={colors.onPrimaryContainer} numberOfLines={1}>
                  {active.driver ? `${shortName(active.driver)} · ` : ''}
                  {active.status === 'accepted' || active.status === 'ongoing' ? `${active.eta} min · ` : ''}vers {active.destination.name}
                </AppText>
              </View>
              <Icon name="chevron-right" size={20} color={colors.onPrimary} />
            </Touchable>
          )}

          <Touchable style={styles.search} onPress={() => router.push('/destination')} scale={0.99} accessibilityRole="search">
            <View style={styles.searchIcon}>
              <Icon name="search" size={20} color={colors.primary} />
            </View>
            <AppText style={styles.searchInput} color="rgba(71,69,84,0.7)" numberOfLines={1}>
              Où allez-vous ?
            </AppText>
            <View style={styles.mic}>
              <Icon name="schedule" size={16} color={colors.onSurfaceVariant} />
            </View>
          </Touchable>

          <View style={styles.shortcuts}>
            {SHORTCUTS.map((s) => (
              <Touchable key={s.label} style={styles.shortcut} onPress={() => (s.to === '/vehicules' ? rebook() : router.push(s.to))}>
                <View style={[styles.shortcutTile, compact && { width: 48, height: 48, borderRadius: 14 }, { backgroundColor: s.bg }]}>
                  <Icon name={s.icon} size={compact ? 20 : 24} color={s.fg} />
                </View>
                <AppText variant="labelSm" numberOfLines={2} style={styles.shortcutLabel}>
                  {s.label}
                </AppText>
              </Touchable>
            ))}
          </View>

          {/* Alerte trafic en direct */}
          {alertOpen && jammed?.jam && route.id === jammed.id && (
            <View style={styles.alert}>
              <View style={[styles.between, { alignItems: 'flex-start' }]}>
                <View style={[styles.row, { gap: 8, flex: 1 }]}>
                  <View style={styles.alertIcon}>
                    <Icon name="warning" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <AppText variant="labelMd" color="#b91c1c" style={{ fontFamily: fonts.sora600, flexShrink: 1 }}>
                        Bouchon sur votre trajet
                      </AppText>
                      <Pill background={JAM_RED} style={{ paddingHorizontal: 6, paddingVertical: 1 }}>
                        <AppText variant="labelSm" color="#fff" style={{ fontSize: 8 }}>
                          DIRECT
                        </AppText>
                      </Pill>
                    </View>
                    <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ fontSize: 11, lineHeight: 15 }}>
                      {jammed.jam.name} saturé (+{jammed.jamDelay} min). Basculez sur {express.via}.
                    </AppText>
                  </View>
                </View>
                <Touchable accessibilityLabel="Fermer l'alerte" onPress={() => setAlertOpen(false)} style={styles.alertClose}>
                  <Icon name="close" size={14} color={colors.outline} />
                </Touchable>
              </View>
              <View style={[styles.between, styles.alertFooter]}>
                <View style={styles.row}>
                  <Dot color="#10b981" size={6} />
                  <AppText variant="labelSm" color="#059669">
                    Gain estimé : {Math.max(0, jammed.minutes - express.minutes)} min
                  </AppText>
                </View>
                <View style={styles.row}>
                  <Touchable onPress={() => setAlertOpen(false)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                    <AppText variant="labelSm" color={colors.outline}>
                      Ignorer
                    </AppText>
                  </Touchable>
                  <Touchable
                    style={styles.alertCta}
                    onPress={() => {
                      ride.setRoute('express');
                      setAlertOpen(false);
                    }}
                  >
                    <AppText variant="labelSm" color={colors.onSecondaryFixed} style={{ fontFamily: fonts.sora700 }}>
                      Prendre {express.via}
                    </AppText>
                    <Icon name="arrow-forward" size={12} color={colors.onSecondaryFixed} />
                  </Touchable>
                </View>
              </View>
            </View>
          )}

          {/* Comparateur d'itinéraires */}
          <View style={{ gap: 6 }}>
            <View style={styles.between}>
              <View style={[styles.row, { flex: 1 }]}>
                <Icon name="call-split" size={16} color={colors.primaryContainer} />
                <AppText variant="labelMd" numberOfLines={1} style={{ fontFamily: fonts.sora600, flexShrink: 1 }}>
                  Vers {destination.name}
                </AppText>
              </View>
              <Touchable onPress={() => router.push('/destination')} style={{ paddingVertical: 4, paddingLeft: 8 }}>
                <AppText variant="labelSm" color={colors.primaryContainer}>
                  Changer
                </AppText>
              </Touchable>
            </View>
            <View style={styles.routeRow}>
              {routes.map((r) => {
                const on = route.id === r.id;
                const tag = r.jam ? `Bouchon · +${r.jamDelay} min` : r.id === fastest.id ? 'Le plus rapide' : r.toll ? `Péage ${r.toll} F` : 'Sans péage';
                return (
                  <Touchable
                    key={r.id}
                    onPress={() => ride.setRoute(r.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    style={[styles.routeCard, r.jam ? styles.routeJam : styles.routeIdle, on && styles.routeActive]}
                  >
                    <View style={[styles.row, { flexWrap: 'wrap' }]}>
                      <Pill background={r.jam ? JAM_RED : '#10b981'} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                        {r.jam && <Dot color="#fff" size={5} />}
                        <AppText variant="labelSm" color="#fff" style={{ fontSize: 8 }}>
                          {tag.toUpperCase()}
                        </AppText>
                      </Pill>
                      {on && <Dot color={colors.primaryContainer} />}
                    </View>
                    <View style={[styles.row, { alignItems: 'baseline', flexWrap: 'wrap' }]}>
                      <AppText variant="headlineSm" style={{ fontFamily: fonts.sora700, fontSize: 14 }}>
                        {r.minutes} min
                      </AppText>
                      <AppText variant="labelSm" color={r.jam ? JAM_RED : '#059669'} style={{ fontSize: 10 }} numberOfLines={1}>
                        {r.via}
                      </AppText>
                    </View>
                    <View style={styles.between}>
                      <AppText variant="bodySm" color={r.jam ? JAM_RED : colors.onSurfaceVariant} style={{ fontSize: 9, lineHeight: 12 }} numberOfLines={1}>
                        {r.km.toString().replace('.', ',')} km{r.toll ? ` · péage ${r.toll} F` : ''}
                      </AppText>
                      <AppText variant="labelSm" color={on ? colors.primaryContainer : '#047857'} style={{ fontSize: 9 }}>
                        {formatAmount(price(r))} F
                      </AppText>
                    </View>
                  </Touchable>
                );
              })}
            </View>
            <Touchable style={styles.chooseCta} onPress={() => goVehicles()} scale={0.98}>
              <AppText variant="labelLg" color={colors.onPrimary}>
                Choisir un véhicule
              </AppText>
              <AppText variant="labelMd" color={colors.onPrimaryContainer}>
                dès {formatAmount(cheapest)} F
              </AppText>
            </Touchable>
          </View>

          {/* Dernier chauffeur */}
          <View style={styles.rebook}>
            <View style={styles.between}>
              <View style={styles.row}>
                <Icon name="history" size={16} color={colors.primary} />
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  CHAUFFEUR FAVORI
                </AppText>
              </View>
              <Pill background={favFree ? colors.secondaryContainer : colors.surfaceHigh}>
                <AppText variant="labelSm" color={favFree ? colors.onSecondaryFixed : colors.onSurfaceVariant}>
                  {favFree ? 'Disponible' : favoriteDriver.status === 'busy' ? 'En course' : 'Hors ligne'}
                </AppText>
              </Pill>
            </View>
            <View style={[styles.row, { gap: 12 }]}>
              <View>
                <Avatar name={favoriteDriver.fullName} size={48} />
                {favFree && <View style={styles.onlineDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { flexWrap: 'wrap' }]}>
                  <AppText variant="headlineSm">{shortName(favoriteDriver)}</AppText>
                  <Icon name="star" size={14} color={colors.star} />
                  <AppText variant="labelSm">{favoriteDriver.rating.toFixed(1).replace('.', ',')}</AppText>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontFamily: fonts.dm400 }}>
                    ({favoriteDriver.trips} courses)
                  </AppText>
                </View>
                <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                  {favoriteDriver.car}
                </AppText>
              </View>
            </View>
            <Touchable style={[styles.rebookCta, !favFree && { opacity: 0.5 }]} disabled={!favFree} scale={0.98} onPress={rebook}>
              <AppText variant="headlineSm" color={colors.onPrimary} numberOfLines={1} style={{ flexShrink: 1, fontSize: 14, letterSpacing: -0.2 }}>
                Reprendre avec {favFirst}
              </AppText>
              <View style={styles.rebookPrice}>
                <AppText variant="labelSm" color={colors.onPrimary}>
                  {formatAmount(favPrice)} F
                </AppText>
                <Icon name="arrow-forward" size={16} color={colors.onPrimary} />
              </View>
            </Touchable>
          </View>

        {/* Destinations rapides */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {quickPlaces.map((p) => (
              <Touchable key={p.label} style={styles.place} onPress={() => goVehicles(p.placeId)}>
                <Icon name={p.icon} size={18} color={colors[p.tone]} />
                <View>
                  <AppText variant="labelMd" style={{ fontFamily: fonts.dm700 }}>
                    {p.label}
                  </AppText>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontSize: 10, fontFamily: fonts.dm600 }}>
                    {p.address}
                  </AppText>
                </View>
              </Touchable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

/** Zone du bouchon principal sur la carte. */
function circleAt(r: RouteOption) {
  const h = r.jam ?? HOTSPOTS[0];
  const c = toMap(h.at);
  return { cx: c.x, cy: c.y, r: Math.round(h.radiusKm * 10) };
}

/** Qualifie le trafic selon la vitesse moyenne de l'itinéraire. */
function trafficWord(minutes: number, km: number) {
  const kmh = (km / minutes) * 60;
  return kmh >= 30 ? 'fluide' : kmh >= 20 ? 'dense' : 'chargé';
}

const glass = { backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mapBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'flex-start' },
  glassPill: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, maxWidth: '100%' },
  here: { ...glass, position: 'absolute', left: '30%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  mapChip: { ...glass, position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 6, paddingRight: 12, paddingVertical: 6, borderRadius: 12 },
  chipIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  driverChip: { bottom: 24, right: 16 },
  recenter: { ...glass, position: 'absolute', bottom: 24, left: 16, height: 36, paddingHorizontal: 12, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 4 },
  sheet: {
    marginTop: -16,
    marginHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    boxShadow: shadows.sheet,
  },
  search: { height: 56, borderRadius: 12, backgroundColor: colors.surfaceLow, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  searchIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(17,24,39,0.1)', alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontFamily: fonts.sora600, fontSize: 17 },
  mic: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(229,222,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-between' },
  shortcut: { flex: 1, alignItems: 'center', gap: 6, padding: 4 },
  shortcutTile: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  shortcutLabel: { fontFamily: fonts.dm600, textAlign: 'center', letterSpacing: 0 },
  routeRow: { flexDirection: 'row', gap: 8 },
  routeCard: { flex: 1, borderRadius: 16, padding: 10, gap: 4 },
  routeActive: { backgroundColor: '#EEF2FF', borderColor: colors.primaryContainer },
  routeIdle: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 2, borderColor: colors.outlineVariant },
  routeJam: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 2, borderColor: '#f87171' },
  jamBadge: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.12)',
  },
  alert: { borderRadius: 16, padding: 12, gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(254,202,202,0.9)', boxShadow: shadows.float },
  alertIcon: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  alertClose: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  alertFooter: { paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(226,232,240,0.6)', flexWrap: 'wrap', rowGap: 6 },
  alertCta: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.secondaryContainer, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, boxShadow: shadows.lime },
  rebook: { backgroundColor: colors.surfaceLow, borderRadius: 16, padding: 14, gap: 12 },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.secondaryContainer,
    borderWidth: 2,
    borderColor: colors.surfaceLowest,
  },
  rebookCta: {
    height: 48,
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 8,
    boxShadow: shadows.primary,
  },
  rebookPrice: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  activeRide: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: colors.primary },
  activeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  chooseCta: { height: 48, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 4 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceHigh, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
});
