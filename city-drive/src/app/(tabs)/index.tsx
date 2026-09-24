import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { TabHeader } from '@/components/headers';
import { AppText, Avatar, Bounce, Dot, Icon, PingDot, Pill, SheetHandle, Touchable, type IconName } from '@/components/ui';
import { colors, fonts, shadows } from '@/constants/theme';
import { favoriteDriver, photos, quickPlaces, user } from '@/data/mock';

const SHORTCUTS: { icon: IconName; label: string; bg: string; fg: string; to: '/arrets' | '/programmer' | '/trajets' | '/vehicules' }[] = [
  { icon: 'alt-route', label: 'Plusieurs arrêts', bg: colors.surfaceHighest, fg: colors.primary, to: '/arrets' },
  { icon: 'calendar-month', label: 'Plus tard', bg: colors.secondaryContainer, fg: colors.onSecondaryFixed, to: '/programmer' },
  { icon: 'directions-bus', label: 'Car / Bus', bg: colors.busSoft, fg: colors.busInk, to: '/trajets' },
  { icon: 'badge', label: 'Chauffeur perso', bg: colors.tertiaryFixed, fg: colors.tertiary, to: '/vehicules' },
];

const ROUTES = [
  { id: 'hkb', tag: 'Le plus rapide', time: '12 min', via: 'Pont HKB', detail: 'Fluide · Péage 500 F', price: '1 400 F' },
  { id: 'adj', tag: 'Sans péage · Éco', time: '22 min', via: 'Via Adjamé', detail: 'Ralentissements', price: '900 F', extra: '+10 min' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState('hkb');
  const mapTop = insets.top + 72;

  return (
    <View style={styles.screen}>
      <TabHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        {/* Carte */}
        <View style={{ height: 470 + mapTop }}>
          <CityMap userMarker style={StyleSheet.absoluteFill} />

          <View style={[styles.mapBar, { top: mapTop }]}>
            <Touchable style={styles.glassPill}>
              <Icon name="location-on" size={18} color={colors.primary} />
              <AppText variant="labelMd" style={{ fontFamily: fonts.sora600 }}>
                {user.location}
              </AppText>
              <Icon name="expand-more" size={16} color={colors.onSurfaceVariant} />
            </Touchable>
            <View style={styles.glassPill}>
              <PingDot color={colors.secondary} />
              <AppText variant="labelSm" color={colors.primary}>
                HKB FLUIDE
              </AppText>
            </View>
          </View>

          <View style={[styles.here, { top: mapTop + 112 }]}>
            <Dot color={colors.primary} />
            <AppText variant="labelSm">Vous êtes ici</AppText>
          </View>

          <Bounce style={[styles.mapChip, { top: mapTop + 90, right: 16 }]}>
            <View style={[styles.chipIcon, { backgroundColor: colors.secondaryContainer }]}>
              <Icon name="local-taxi" size={14} color={colors.onSecondaryFixed} />
            </View>
            <View>
              <AppText variant="labelSm">Taxi Eco</AppText>
              <AppText variant="labelSm" color={colors.secondary} style={{ fontFamily: fonts.dm600 }}>
                2 min · 1 200 F
              </AppText>
            </View>
          </Bounce>

          <View style={[styles.mapChip, { top: mapTop + 262, left: 12 }]}>
            <View style={[styles.chipIcon, { backgroundColor: '#FFE58F' }]}>
              <Icon name="directions-bus" size={14} color="#664600" />
            </View>
            <View>
              <AppText variant="labelSm">Gbaka Adjamé</AppText>
              <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontFamily: fonts.dm600 }}>
                6 min · 14 places
              </AppText>
            </View>
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
            <Icon name="my-location" size={20} color={colors.primary} />
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
                  <Touchable key={r.id} onPress={() => setRoute(r.id)} style={[styles.routeCard, active ? styles.routeActive : styles.routeIdle]}>
                    <View style={styles.between}>
                      <Pill background={active ? '#10b981' : '#fef3c7'} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                        <AppText variant="labelSm" color={active ? '#fff' : '#92400e'} style={{ fontSize: 8 }}>
                          {r.tag.toUpperCase()}
                        </AppText>
                      </Pill>
                      {active ? (
                        <Dot color={colors.primaryContainer} />
                      ) : (
                        <AppText variant="labelSm" color="#d97706" style={{ fontSize: 9 }}>
                          {r.extra}
                        </AppText>
                      )}
                    </View>
                    <View style={[styles.row, { alignItems: 'baseline' }]}>
                      <AppText variant="headlineSm" style={{ fontFamily: fonts.sora700, fontSize: 14 }}>
                        {r.time}
                      </AppText>
                      <AppText variant="labelSm" color={active ? '#059669' : colors.onSurfaceVariant} style={{ fontSize: 10 }}>
                        {r.via}
                      </AppText>
                    </View>
                    <View style={styles.between}>
                      <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ fontSize: 9, lineHeight: 12 }} numberOfLines={1}>
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
              <AppText variant="headlineSm" color={colors.onPrimary}>
                Reprendre avec Koffi
              </AppText>
              <View style={styles.rebookPrice}>
                <AppText variant="labelMd" color={colors.onPrimary}>
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

const glass = { backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0px 10px 24px -4px rgba(75,54,201,0.16)' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mapBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  glassPill: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  here: { ...glass, position: 'absolute', left: '30%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  mapChip: { ...glass, position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 6, paddingRight: 12, paddingVertical: 6, borderRadius: 999 },
  chipIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  driverChip: { bottom: 24, right: 16 },
  recenter: { ...glass, position: 'absolute', bottom: 24, left: 16, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    marginTop: -16,
    marginHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 28,
    padding: 20,
    gap: 16,
    boxShadow: shadows.sheet,
  },
  search: { height: 56, borderRadius: 999, backgroundColor: colors.surfaceLow, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  searchIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(51,16,179,0.1)', alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontFamily: fonts.sora600, fontSize: 17, color: colors.onSurface, paddingVertical: 0 },
  mic: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(229,222,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-between' },
  shortcut: { flex: 1, alignItems: 'center', gap: 6, padding: 4 },
  shortcutTile: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)' },
  shortcutLabel: { fontFamily: fonts.dm600, textAlign: 'center', letterSpacing: 0 },
  routeRow: { flexDirection: 'row', gap: 8 },
  routeCard: { flex: 1, borderRadius: 16, padding: 10, gap: 4 },
  routeActive: { backgroundColor: '#EEF2FF', borderWidth: 2, borderColor: colors.primaryContainer },
  routeIdle: { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: '#fcd34d' },
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
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    boxShadow: shadows.primary,
  },
  rebookPrice: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceHigh, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
});
