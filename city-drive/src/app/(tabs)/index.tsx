import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { TabHeader } from '@/components/headers';
import { AppText, Avatar, Dot, Icon, Pill, SheetHandle, Touchable, type IconName } from '@/components/ui';
import { colors, fonts, shadows } from '@/constants/theme';
import { favoriteDriver, photos, quickPlaces, user } from '@/data/mock';

const SHORTCUTS: { icon: IconName; label: string; bg: string; fg: string; to: '/arrets' | '/programmer' | '/trajets' | '/vehicules' }[] = [
  { icon: 'alt-route', label: 'Plusieurs arrêts', bg: colors.blueSoft, fg: colors.blue, to: '/arrets' },
  { icon: 'calendar-month', label: 'Plus tard', bg: colors.secondaryContainer, fg: colors.onSecondaryFixed, to: '/programmer' },
  { icon: 'directions-bus', label: 'Car / Bus', bg: colors.greenSoft, fg: colors.green, to: '/trajets' },
  { icon: 'badge', label: 'Chauffeur perso', bg: colors.pinkSoft, fg: colors.tertiary, to: '/vehicules' },
];

const ROUTES = [
  { id: 'hkb', tag: 'Le plus rapide', time: '12 min', via: 'Pont HKB', detail: 'Fluide · Péage 500 F', price: '1 400 F', jam: false },
  { id: 'adj', tag: 'Bouchon sévère · +10 min', time: '22 min', via: 'Via Adjamé', detail: 'Trafic saturé', price: '900 F', extra: 'Sans péage', jam: true },
];

const JAM_RED = '#DC2626';
// Tronçon saturé autour du carrefour Adjamé (repère de CityMap).
const JAM_PATH = 'M 380 150 Q 395 115 330 80 Q 255 82 205 120';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState('hkb');
  const [alertOpen, setAlertOpen] = useState(true);
  const mapTop = insets.top + 72;
  const { height } = useWindowDimensions();
  // La carte occupe ~55 % de la hauteur d'écran, entre 320 et 470 px.
  const mapH = Math.round(Math.min(470, Math.max(320, height * 0.55)));

  return (
    <View style={styles.screen}>
      <TabHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Carte */}
        <View style={{ height: mapH + mapTop }}>
          <CityMap userMarker cars style={StyleSheet.absoluteFill}>
            <Path d={JAM_PATH} stroke={JAM_RED} strokeWidth={6} strokeLinecap="round" fill="none" />
          </CityMap>

          <View style={[styles.mapBar, { top: mapTop }]}>
            <Touchable style={styles.glassPill}>
              <Icon name="location-on" size={18} color={colors.primary} />
              <AppText variant="labelMd" style={{ fontFamily: fonts.dm700 }}>
                {user.location}
              </AppText>
              <Icon name="expand-more" size={16} color={colors.onSurfaceVariant} />
            </Touchable>
          </View>

          <View style={[styles.jamBadge, { top: mapTop + 48 }]}>
            <Icon name="traffic" size={14} color={JAM_RED} />
            <AppText variant="labelSm" color={colors.onSurface}>
              Bouchon à Adjamé · +10 min
            </AppText>
          </View>

          <Touchable style={[styles.mapChip, styles.driverChip]} onPress={() => router.push('/course')}>
            <Avatar uri={photos.koffi} size={28} radius={14} />
            <View>
              <View style={styles.row}>
                <Icon name="star" size={13} color={colors.star} />
                <AppText variant="labelSm">{favoriteDriver.name}</AppText>
              </View>
              <AppText variant="labelSm" color={colors.primary} style={{ fontSize: 10, fontFamily: fonts.dm600 }}>
                Votre chauffeur favori
              </AppText>
            </View>
          </Touchable>

          <Touchable style={styles.recenter} accessibilityLabel="Centrer la position">
            <Icon name="my-location" size={20} color={colors.onSurface} />
          </Touchable>
        </View>

        {/* Feuille d'actions */}
        <View style={styles.sheet}>
          <SheetHandle color="rgba(200,196,215,0.6)" />

          <View style={styles.search}>
            <View style={styles.searchIcon}>
              <Icon name="search" size={20} color={colors.primary} />
            </View>
            <TextInput
              placeholder="Où allez-vous ?"
              placeholderTextColor="rgba(71,69,84,0.7)"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => router.push('/vehicules')}
            />
            <Touchable style={styles.mic} accessibilityLabel="Recherche vocale">
              <Icon name="mic" size={18} color={colors.onSurfaceVariant} />
            </Touchable>
          </View>

          <View style={styles.shortcuts}>
            {SHORTCUTS.map((s) => (
              <Touchable key={s.label} style={styles.shortcut} onPress={() => router.push(s.to)}>
                <View style={[styles.shortcutTile, { backgroundColor: s.bg }]}>
                  <Icon name={s.icon} size={24} color={s.fg} />
                </View>
                <AppText variant="labelSm" numberOfLines={2} style={styles.shortcutLabel}>
                  {s.label}
                </AppText>
              </Touchable>
            ))}
          </View>

          {/* Alerte trafic en direct */}
          {alertOpen && (
            <View style={styles.alert}>
              <View style={[styles.between, { alignItems: 'flex-start' }]}>
                <View style={[styles.row, { gap: 8, flex: 1 }]}>
                  <View style={styles.alertIcon}>
                    <Icon name="warning" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <AppText variant="labelMd" color="#b91c1c" style={{ fontFamily: fonts.sora600 }}>
                        Bouchon imminent à 650m
                      </AppText>
                      <Pill background={JAM_RED} style={{ paddingHorizontal: 6, paddingVertical: 1 }}>
                        <AppText variant="labelSm" color="#fff" style={{ fontSize: 8 }}>
                          DIRECT
                        </AppText>
                      </Pill>
                    </View>
                    <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ fontSize: 11, lineHeight: 15 }}>
                      Carrefour Adjamé saturé (+10 min). Basculez sur Pont HKB.
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
                    Gain estimé : +10 min
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
                      setRoute('hkb');
                      setAlertOpen(false);
                    }}
                  >
                    <AppText variant="labelSm" color={colors.onSecondaryFixed} style={{ fontFamily: fonts.sora700 }}>
                      Prendre Pont HKB
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
              <View style={styles.row}>
                <Icon name="call-split" size={16} color={colors.primaryContainer} />
                <AppText variant="labelMd" style={{ fontFamily: fonts.sora600 }}>
                  Itinéraires disponibles
                </AppText>
              </View>
              <AppText variant="labelSm" color={colors.primaryContainer}>
                Comparer (2)
              </AppText>
            </View>
            <View style={styles.routeRow}>
              {ROUTES.map((r) => {
                const active = route === r.id;
                return (
                  <Touchable
                    key={r.id}
                    onPress={() => setRoute(r.id)}
                    style={[styles.routeCard, r.jam ? styles.routeJam : styles.routeIdle, active && styles.routeActive]}
                  >
                    <View style={[styles.row, { flexWrap: 'wrap' }]}>
                      <Pill background={r.jam ? JAM_RED : '#10b981'} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                        {r.jam && <Dot color="#fff" size={5} />}
                        <AppText variant="labelSm" color="#fff" style={{ fontSize: 8 }}>
                          {r.tag.toUpperCase()}
                        </AppText>
                      </Pill>
                      {active ? (
                        <Dot color={colors.primaryContainer} />
                      ) : (
                        r.extra && (
                          <AppText variant="labelSm" color={JAM_RED} style={{ fontSize: 9 }}>
                            {r.extra}
                          </AppText>
                        )
                      )}
                    </View>
                    <View style={[styles.row, { alignItems: 'baseline' }]}>
                      <AppText variant="headlineSm" style={{ fontFamily: fonts.sora700, fontSize: 14 }}>
                        {r.time}
                      </AppText>
                      <AppText variant="labelSm" color={r.jam ? JAM_RED : '#059669'} style={{ fontSize: 10 }}>
                        {r.via}
                      </AppText>
                    </View>
                    <View style={styles.between}>
                      <AppText variant="bodySm" color={r.jam ? JAM_RED : colors.onSurfaceVariant} style={{ fontSize: 9, lineHeight: 12 }} numberOfLines={1}>
                        {r.detail}
                      </AppText>
                      <AppText variant="labelSm" color={active ? colors.primaryContainer : '#047857'} style={{ fontSize: 9 }}>
                        {r.price}
                      </AppText>
                    </View>
                  </Touchable>
                );
              })}
            </View>
          </View>

          {/* Dernier chauffeur */}
          <View style={styles.rebook}>
            <View style={styles.between}>
              <View style={styles.row}>
                <Icon name="history" size={16} color={colors.primary} />
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  DERNIER CHAUFFEUR
                </AppText>
              </View>
              <Pill background={colors.secondaryContainer}>
                <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                  Disponible
                </AppText>
              </Pill>
            </View>
            <View style={[styles.row, { gap: 12 }]}>
              <View>
                <Avatar uri={photos.koffi} size={48} />
                <View style={styles.onlineDot} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <AppText variant="headlineSm">{favoriteDriver.name}</AppText>
                  <Icon name="star" size={14} color={colors.star} />
                  <AppText variant="labelSm">{favoriteDriver.rating}</AppText>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontFamily: fonts.dm400 }}>
                    ({favoriteDriver.trips})
                  </AppText>
                </View>
                <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                  {favoriteDriver.car}
                </AppText>
                <AppText variant="labelSm" color={colors.primary} style={{ fontFamily: fonts.dm600, marginTop: 2 }}>
                  Conduit souvent avec vous ({favoriteDriver.ridesTogether} courses)
                </AppText>
              </View>
            </View>
            <Touchable style={styles.rebookCta} scale={0.98} onPress={() => router.push('/vehicules')}>
              <AppText variant="headlineSm" color={colors.onPrimary} numberOfLines={1} style={{ flexShrink: 1, fontSize: 14, letterSpacing: -0.2 }}>
                Reprendre avec Koffi
              </AppText>
              <View style={styles.rebookPrice}>
                <AppText variant="labelSm" color={colors.onPrimary}>
                  Dès {favoriteDriver.fromPrice}
                </AppText>
                <Icon name="arrow-forward" size={16} color={colors.onPrimary} />
              </View>
            </Touchable>
          </View>

          {/* Destinations rapides */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {quickPlaces.map((p) => (
              <Touchable key={p.label} style={styles.place} onPress={() => router.push('/vehicules')}>
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

const glass = { backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mapBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  glassPill: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  here: { ...glass, position: 'absolute', left: '30%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  mapChip: { ...glass, position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 6, paddingRight: 12, paddingVertical: 6, borderRadius: 12 },
  chipIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  driverChip: { bottom: 24, right: 16 },
  recenter: { ...glass, position: 'absolute', bottom: 24, left: 16, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
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
  searchIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(232,89,12,0.1)', alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontFamily: fonts.sora600, fontSize: 17, color: colors.onSurface, paddingVertical: 0 },
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
  place: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceHigh, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
});
