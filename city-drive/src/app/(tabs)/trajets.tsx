import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { CityMap } from '@/components/CityMap';
import { TabHeader } from '@/components/headers';
import { AppText, CircleButton, Dot, Icon, PingDot, Pill, Touchable } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts, shadows } from '@/constants/theme';
import { departures, formatAmount } from '@/data/mock';

const CORRIDOR = 'M 20 330 C 100 318, 170 300, 225 272 C 285 242, 330 195, 380 110';

type Filter = 'all' | 'vip' | 'bus' | 'gbaka';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'vip', label: 'Cars VIP' },
  { id: 'bus', label: 'Bus SOTRA' },
  { id: 'gbaka', label: 'Gbaka Express' },
];

const LINE_STYLES = {
  vip: { chipBg: colors.primaryFixed, chipFg: colors.primary, badgeBg: colors.surfaceHigh, badgeFg: colors.onSurfaceVariant, accent: colors.primary, btn: colors.primary, btnFg: colors.onPrimary, seat: colors.secondary },
  gbaka: { chipBg: colors.transitYellowSoft, chipFg: colors.transitYellowInk, badgeBg: '#FFF4DC', badgeFg: colors.transitYellowInk, accent: colors.transitYellow, btn: colors.transitYellow, btnFg: colors.onSecondaryFixed, seat: '#8F5500' },
  bus: { chipBg: colors.surfaceHighest, chipFg: colors.onSurfaceVariant, badgeBg: colors.surfaceContainer, badgeFg: colors.onSurfaceVariant, accent: colors.outline, btn: colors.surfaceHighest, btnFg: colors.outline, seat: colors.outline },
};

function StopLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <G transform={`translate(${x}, ${y})`}>
      <Circle r={4} fill={colors.primary} />
      <Rect x={-40} y={-24} width={80} height={18} rx={9} fill="#fff" opacity={0.95} />
      <SvgText x={0} y={-11.5} fontSize={9} fontFamily={fonts.dm700} fill={colors.onSurface} textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );
}

export default function TransitScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');
  const list = departures.filter((d) => filter === 'all' || d.style === filter);

  return (
    <View style={styles.screen}>
      <TabHeader />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 76, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Sous-en-tête */}
        <View style={[styles.between, styles.px, { paddingBottom: 8 }]}>
          <View style={[styles.row, { gap: 8 }]}>
            <CircleButton icon="arrow-back" label="Retour" onPress={() => router.navigate('/')} />
            <View>
              <AppText variant="headlineSm" style={{ letterSpacing: -0.3 }}>
                Transports en commun
              </AppText>
              <View style={styles.row}>
                <Dot color={colors.secondaryContainer} />
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  Réseau {brand.city} · Temps réel
                </AppText>
              </View>
            </View>
          </View>
          <CircleButton icon="search" label="Rechercher un arrêt" color={colors.primary} />
        </View>

        {/* Carte du réseau */}
        <View style={[styles.px, { marginBottom: 16 }]}>
          <View style={styles.mapCard}>
            <CityMap style={StyleSheet.absoluteFill} animated={false}>
              <Path d={CORRIDOR} stroke={colors.transitYellow} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.35} />
              <Path d={CORRIDOR} stroke={colors.transitYellow} strokeWidth={8} strokeLinecap="round" fill="none" />
              <Path d={CORRIDOR} stroke="#fff" strokeWidth={2.5} strokeDasharray="6 6" strokeLinecap="round" fill="none" />
              <StopLabel x={62} y={323} label="Bassam · 18p" />
              <StopLabel x={345} y={158} label="Adjamé · 42p" />
              <G transform="translate(140, 303) rotate(-18)">
                <Rect x={-12} y={-6} width={24} height={12} rx={3} fill={colors.primary} />
                <Rect x={-8} y={-3} width={16} height={6} rx={2} fill={colors.secondaryContainer} />
              </G>
              <G transform="translate(300, 228) rotate(-40)">
                <Rect x={-9} y={-5} width={18} height={10} rx={3} fill={colors.transitYellow} stroke="#fff" strokeWidth={1} />
                <Circle cx={4} cy={-2} r={1.5} fill={colors.onSurface} />
              </G>
              <G transform="translate(225, 272)">
                <Circle r={20} fill={colors.primaryContainer} opacity={0.15} />
                <Circle r={7} fill={colors.primaryContainer} />
                <Circle r={3.5} fill={colors.secondaryContainer} />
              </G>
            </CityMap>

            <View style={styles.approach}>
              <PingDot color={colors.transitYellow} />
              <AppText variant="labelSm">Ligne 82 en approche · 3 min</AppText>
            </View>

            <View style={styles.nearest}>
              <View style={[styles.row, { gap: 10, flex: 1 }]}>
                <View style={styles.pinIcon}>
                  <Icon name="pin-drop" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="labelMd" numberOfLines={1}>
                    Arrêt St-Jean Cocody
                  </AppText>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                    à 120m · 2 min à pied
                  </AppText>
                </View>
              </View>
              <Touchable style={styles.itinerary}>
                <AppText variant="labelSm" color={colors.primary}>
                  Itinéraire
                </AppText>
                <Icon name="directions-walk" size={14} color={colors.primary} />
              </Touchable>
            </View>
          </View>
        </View>

        {/* Filtres */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.px, { gap: 8, paddingVertical: 4, marginBottom: 12 }]}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Touchable key={f.id} onPress={() => setFilter(f.id)} style={[styles.filter, active && styles.filterActive]}>
                {f.id === 'vip' && <Icon name="ac-unit" size={16} color={active ? colors.onPrimary : colors.primary} />}
                {f.id === 'bus' && <Icon name="directions-bus" size={16} color={active ? colors.onPrimary : colors.onSurfaceVariant} />}
                {f.id === 'gbaka' && <Dot color={colors.transitYellow} />}
                <AppText variant="labelMd" color={active ? colors.onPrimary : colors.onSurface}>
                  {f.label}
                </AppText>
                {f.id === 'all' && (
                  <View style={[styles.count, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : colors.surfaceHigh }]}>
                    <AppText variant="labelSm" color={active ? colors.onPrimary : colors.onSurfaceVariant}>
                      18
                    </AppText>
                  </View>
                )}
              </Touchable>
            );
          })}
        </ScrollView>

        {/* Prochains passages */}
        <View style={[styles.px, { gap: 8, marginBottom: 24 }]}>
          <View style={styles.between}>
            <AppText variant="headlineSm">Prochains passages</AppText>
            <View style={styles.row}>
              <Icon name="sync" size={14} color={colors.onSurfaceVariant} />
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                Actualisé il y a 10s
              </AppText>
            </View>
          </View>

          {list.map((d) => {
            const s = LINE_STYLES[d.style];
            return (
              <View key={d.id} style={[styles.departure, d.full && styles.departureFull]}>
                <View style={[styles.between, { alignItems: 'flex-start' }]}>
                  <View style={styles.row}>
                    <Pill background={s.chipBg} style={{ paddingVertical: 4 }}>
                      <AppText variant="labelMd" color={s.chipFg} style={{ fontFamily: fonts.sora600 }}>
                        {d.line}
                      </AppText>
                    </Pill>
                    <Pill background={s.badgeBg} style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
                      {d.style === 'vip' && <Icon name="ac-unit" size={12} color={colors.primary} />}
                      {d.style === 'gbaka' && <Icon name="bolt" size={12} color={s.badgeFg} />}
                      <AppText variant="labelSm" color={s.badgeFg}>
                        {d.badge}
                      </AppText>
                    </Pill>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText
                      variant="currency"
                      color={d.style === 'vip' ? colors.primary : d.full ? colors.onSurfaceVariant : colors.onSurface}
                      style={{ fontSize: d.full ? 20 : 22, lineHeight: 26 }}
                    >
                      {formatAmount(d.price)}{' '}
                      <AppText variant="labelMd" color={d.full ? colors.outline : colors.onSurfaceVariant} style={{ fontFamily: fonts.dm400 }}>
                        FCFA
                      </AppText>
                    </AppText>
                    {!d.full && (
                      <AppText variant="labelSm" color={d.style === 'vip' ? colors.secondary : colors.onSurfaceVariant}>
                        {d.style === 'vip' ? 'ou ' : ''}
                        {formatAmount(d.price)} {brand.walletUnit}
                      </AppText>
                    )}
                  </View>
                </View>

                <View style={styles.row}>
                  <Icon name="multiple-stop" size={18} color={s.accent} />
                  <AppText variant="labelMd" color={d.full ? colors.onSurfaceVariant : colors.onSurface} numberOfLines={1} style={{ flex: 1 }}>
                    {d.route}
                  </AppText>
                </View>

                <View style={[styles.between, { paddingTop: 4 }]}>
                  <View>
                    <View style={styles.row}>
                      <Icon name="schedule" size={16} color={d.style === 'vip' ? colors.primary : colors.onSurfaceVariant} />
                      <AppText variant="labelMd" color={d.full ? colors.onSurfaceVariant : colors.onSurface}>
                        Arrivée dans{' '}
                        <AppText variant="labelMd" style={{ fontFamily: d.full ? fonts.dm600 : fonts.dm700 }} color={d.full ? colors.onSurfaceVariant : colors.onSurface}>
                          {d.arrival}
                        </AppText>
                        {'time' in d ? ` (${d.time})` : ''}
                      </AppText>
                    </View>
                    <View style={[styles.row, { marginTop: 4 }]}>
                      <Dot color={d.style === 'vip' ? colors.secondaryContainer : s.accent} />
                      <AppText variant="labelSm" color={s.seat}>
                        {d.seats}
                      </AppText>
                    </View>
                  </View>
                  <Touchable disabled={d.full} style={[styles.book, { backgroundColor: s.btn }]}>
                    <AppText variant="labelMd" color={s.btnFg}>
                      {d.full ? 'Complet' : 'Réserver'}
                    </AppText>
                  </Touchable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bandeau paiement QR */}
        <View style={styles.px}>
          <View style={[styles.banner, { backgroundColor: '#1D4ED8' }]}>
            <View style={styles.qr}>
              <Icon name="qr-code-scanner" size={26} color={colors.secondaryContainer} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="headlineSm" color={colors.onPrimary} style={{ marginBottom: 4 }}>
                Paiement sans contact {brand.walletUnit}
              </AppText>
              <AppText variant="bodySm" color={colors.onPrimaryContainer}>
                Réglez votre place en {brand.walletName} et montez à bord directement avec votre QR Code sans monnaie physique.
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const glass = { backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  px: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  mapCard: { height: 288, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfaceContainer, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  approach: { ...glass, position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  nearest: {
    ...glass,
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    padding: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  pinIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17,24,39,0.1)', alignItems: 'center', justifyContent: 'center' },
  itinerary: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceHigh, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  filter: { height: 36, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceLowest, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  filterActive: { backgroundColor: colors.primary, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  count: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 12 },
  departure: { padding: 16, borderRadius: 16, backgroundColor: colors.surfaceLowest, gap: 12, boxShadow: shadows.card },
  departureFull: { backgroundColor: 'rgba(244,245,247,0.7)', opacity: 0.8, boxShadow: undefined },
  book: { height: 40, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  banner: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  qr: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
