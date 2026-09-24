import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { StackHeader } from '@/components/headers';
import { RouteLayer } from '@/components/RouteLayer';
import { OperatorBadge } from '@/components/OperatorBadge';
import { AppText, Dot, Icon, Touchable, useLayout, type IconName } from '@/components/ui';
import { VehicleIcon } from '@/components/VehicleIcon';
import { brand } from '@/constants/brand';
import { colors, shadows } from '@/constants/theme';
import { formatAmount, vehicles } from '@/data/mock';
import { useRide } from '@/data/ride';
import { OPERATORS, useWallet } from '@/data/wallet';
import { shortName } from '@/logic/fleet';
import { FREE_CANCEL_MIN, FREE_WAIT_MIN, MAJORATION, WAIT_FEE_PER_MIN } from '@/logic/pricing';
import type { PaymentMethod } from '@/logic/ride';
import { arrivalTime } from '@/logic/time';

const PAYMENTS: { id: PaymentMethod; name: string; icon: IconName }[] = [
  { id: 'wallet', name: brand.walletName, icon: 'toll' },
  { id: 'mobile_money', name: 'Mobile Money', icon: 'phone-iphone' },
  { id: 'cash', name: 'Espèces', icon: 'payments' },
];

const F = (n: number) => `${formatAmount(n)} F`;

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { gutter, mapHeight, compact } = useLayout();
  const ride = useRide();
  const { pickup, destination, stops, route, offers, offer, draft, fleet } = ride;
  const { balance, canPay } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const q = offer.quote;
  const walletShort = draft.payment === 'wallet' && !canPay(q.total);
  const preferred = draft.preferredDriverId ? fleet.find((d) => d.id === draft.preferredDriverId) : undefined;

  const order = () => {
    const err = ride.request();
    if (err) return setError(err);
    router.replace('/course');
  };

  const pct = (n: number) => `×${n.toString().replace('.', ',')}`;
  const breakdown: [string, string][] = [
    ['Prise en charge', F(q.base)],
    [`Distance · ${route.km.toString().replace('.', ',')} km`, F(q.distance)],
    [`Durée estimée · ${route.minutes} min`, F(q.time)],
    ...(q.coefficient !== 1 ? ([[`Catégorie ${vehicles.find((v) => v.id === q.category)?.name}`, pct(q.coefficient)]] as [string, string][]) : []),
    ...(q.majoration > 1 ? ([[`Nuit ou heure de pointe`, `+${Math.round(MAJORATION * 100)} %`]] as [string, string][]) : []),
    ...(q.stops ? ([[`${stops.length} arrêt${stops.length > 1 ? 's' : ''}`, F(q.stops)]] as [string, string][]) : []),
    ...(q.toll ? ([[`Péage ${route.via}`, F(q.toll)]] as [string, string][]) : []),
  ];

  return (
    <View style={styles.screen}>
      <StackHeader title="Choisir un véhicule" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* Mini carte */}
        <View style={{ height: mapHeight(0.22, 150, 210) }}>
          <CityMap style={StyleSheet.absoluteFill}>
            <RouteLayer points={[pickup, ...stops, destination]} jam={!!route.jam} />
          </CityMap>
          <Touchable style={[styles.routePill, { left: gutter, right: gutter }]} onPress={() => router.push('/destination')} scale={0.99}>
            <View style={[styles.row, { flex: 1 }]}>
              <Dot color={colors.blue} size={10} />
              <AppText variant="labelMd" numberOfLines={1} style={{ flexShrink: 1 }}>
                {pickup.name} → {destination.name}
                {stops.length > 0 && (
                  <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                    {' '}
                    (via {stops.length} arrêt{stops.length > 1 ? 's' : ''})
                  </AppText>
                )}
              </AppText>
            </View>
            <View style={styles.timePill}>
              <Icon name="schedule" size={15} color={colors.primary} />
              <AppText variant="labelSm" color={colors.primary}>
                {route.minutes} min
              </AppText>
            </View>
          </Touchable>
        </View>

        <View style={[styles.content, { paddingHorizontal: gutter }]}>
          <View>
            <AppText variant="headlineMd">Véhicules disponibles</AppText>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              {route.via} · arrivée vers {arrivalTime(route.minutes + (offer.eta ?? 0))}
            </AppText>
          </View>

          {preferred && (
            <View style={styles.notice}>
              <Icon name="favorite" size={16} color={colors.tertiary} />
              <AppText variant="bodySm" style={{ flex: 1 }}>
                {shortName(preferred)} sera sollicité en priorité s’il est à moins de 5 min de plus que le plus proche.
              </AppText>
            </View>
          )}

          <View style={{ gap: 12 }}>
            {offers.map((o) => {
              const v = vehicles.find((x) => x.id === o.category)!;
              const active = o.category === draft.category;
              const none = o.available === 0;
              return (
                <Touchable
                  key={o.category}
                  scale={0.98}
                  disabled={none}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active, disabled: none }}
                  onPress={() => {
                    ride.setCategory(o.category);
                    setError(null);
                  }}
                  style={[styles.vehicle, active && styles.vehicleActive, none && { opacity: 0.45 }]}
                >
                  <View style={[styles.row, { gap: compact ? 10 : 14, flex: 1 }]}>
                    <View style={[styles.vehicleArt, compact && { width: 52, height: 46 }]}>
                      <VehicleIcon kind={v.kind} color={active ? colors.primary : colors.onSurface} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={[styles.row, { flexWrap: 'wrap' }]}>
                        <AppText variant="headlineSm">{v.name}</AppText>
                        <Icon name="person" size={14} color={colors.onSurfaceVariant} />
                        <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ marginLeft: -4 }}>
                          {v.seats}
                        </AppText>
                        {v.airCon && <Icon name="ac-unit" size={15} color={colors.primary} />}
                      </View>
                      <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                        {v.description}
                      </AppText>
                      <View style={[styles.row, { gap: 4, marginTop: 2, flexWrap: 'wrap' }]}>
                        <Icon name={none ? 'block' : 'schedule'} size={13} color={none ? colors.outline : colors.secondary} />
                        <AppText variant="labelSm" color={none ? colors.outline : colors.secondary}>
                          {none ? 'Aucun chauffeur proche' : `Dans ${o.eta} min · ${o.available} libre${o.available > 1 ? 's' : ''}`}
                        </AppText>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText variant="headlineSm" color={active ? colors.primary : colors.onSurface}>
                      {formatAmount(o.quote.total)}
                      <AppText variant="labelSm" color={active ? colors.primary : colors.onSurface}>
                        {' '}F
                      </AppText>
                    </AppText>
                  </View>
                </Touchable>
              );
            })}
          </View>

          {/* Détail du prix */}
          <View style={styles.breakdown}>
            <View style={styles.between}>
              <AppText variant="labelLg">Détail du prix</AppText>
              <AppText variant="labelSm" color={colors.secondary}>
                Prix garanti
              </AppText>
            </View>
            {breakdown.map(([label, amount]) => (
              <View key={label} style={styles.between}>
                <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1} style={{ flex: 1 }}>
                  {label}
                </AppText>
                <AppText variant="labelMd">{amount}</AppText>
              </View>
            ))}
            <View style={[styles.between, styles.totalRow]}>
              <AppText variant="labelLg">Total</AppText>
              <AppText variant="headlineSm">{F(q.total)}</AppText>
            </View>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              Attente offerte {FREE_WAIT_MIN} min, puis {WAIT_FEE_PER_MIN} F/min.
            </AppText>
          </View>

          {/* Paiement + action */}
          <View style={styles.checkout}>
            <View style={styles.payRow}>
              {PAYMENTS.map((m) => {
                const on = draft.payment === m.id;
                return (
                  <Touchable
                    key={m.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => {
                      ride.setPayment(m.id);
                      setError(null);
                    }}
                    style={[styles.payOption, on && styles.payOn]}
                  >
                    <Icon name={m.icon} size={18} color={on ? colors.onPrimary : colors.onSurface} />
                    <View style={{ flexShrink: 1 }}>
                      <AppText variant="labelMd" color={on ? colors.onPrimary : colors.onSurface} numberOfLines={1}>
                        {m.name}
                      </AppText>
                      <AppText variant="labelSm" color={on ? colors.onPrimaryContainer : colors.onSurfaceVariant} numberOfLines={1} style={{ fontSize: 10 }}>
                        {m.id === 'wallet'
                          ? `${formatAmount(balance)} ${brand.walletUnit}`
                          : m.id === 'mobile_money'
                            ? (OPERATORS.find((o) => o.id === draft.operator)?.label ?? 'Wave')
                            : 'Au chauffeur'}
                      </AppText>
                    </View>
                  </Touchable>
                );
              })}
            </View>

            {draft.payment === 'mobile_money' && (
              <View style={styles.operators}>
                {OPERATORS.map((op) => {
                  const on = draft.operator === op.id;
                  return (
                    <Touchable
                      key={op.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      onPress={() => ride.setPayment('mobile_money', op.id)}
                      style={[styles.operator, on && styles.operatorOn]}
                    >
                      <OperatorBadge id={op.id} size={28} />
                      <AppText variant="labelSm" numberOfLines={1}>
                        {op.label}
                      </AppText>
                    </Touchable>
                  );
                })}
              </View>
            )}

            {walletShort && (
              <Touchable style={styles.short} onPress={() => router.push('/portefeuille')}>
                <Icon name="warning" size={16} color="#B42318" />
                <AppText variant="bodySm" color="#B42318" style={{ flex: 1 }}>
                  Il manque {F(q.total - balance)}. Rechargez ou payez en espèces.
                </AppText>
                <AppText variant="labelSm" color={colors.primary}>
                  Recharger
                </AppText>
              </Touchable>
            )}

            <Touchable style={[styles.cta, (walletShort || !offer.available) && { opacity: 0.5 }]} scale={0.98} onPress={order}>
              <Icon name="lock" size={20} color={colors.onPrimary} />
              <AppText variant="headlineSm" color={colors.onPrimary} numberOfLines={1} style={{ flexShrink: 1, fontSize: compact ? 15 : 17 }}>
                Commander {vehicles.find((x) => x.id === draft.category)?.name} · {F(q.total)}
              </AppText>
            </Touchable>
            {error && (
              <AppText variant="labelMd" color="#B42318" style={{ textAlign: 'center' }}>
                {error}
              </AppText>
            )}
            <View style={[styles.row, { justifyContent: 'center' }]}>
              <Icon name="verified-user" size={13} color={colors.secondary} />
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                Débité uniquement à l’arrivée · annulation gratuite {FREE_CANCEL_MIN} min
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  routePill: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    boxShadow: shadows.float,
  },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  enRoute: {
    position: 'absolute',
    bottom: 24,
    left: '33%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLowest,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    boxShadow: shadows.card,
  },
  content: { gap: 16, marginTop: 12 },
  vehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleActive: { borderColor: colors.primary, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  recommended: {
    position: 'absolute',
    top: -11,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  vehicleArt: { width: 64, height: 56, borderRadius: 16, backgroundColor: colors.surfaceLow, padding: 6 },
  modelChip: { height: 38, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.surfaceLowest, justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  perk: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: colors.surfaceLow },
  perkIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.pinkSoft },
  breakdown: { backgroundColor: colors.surfaceLowest, padding: 16, borderRadius: 16, gap: 8, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.surfaceHigh, paddingTop: 8, marginTop: 2 },
  payRow: { gap: 8 },
  operators: { flexDirection: 'row', gap: 6 },
  operator: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.surfaceLow },
  operatorOn: { borderColor: colors.primary, backgroundColor: colors.surfaceLowest },
  payOption: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceLow },
  payOn: { backgroundColor: colors.primary },
  short: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, backgroundColor: '#FEF3F2' },
  checkout: { backgroundColor: colors.surfaceLowest, padding: 16, borderRadius: 24, gap: 14, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)', marginTop: 4 },
  payIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  change: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.surfaceLow },
  cta: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: shadows.primary,
  },
});
