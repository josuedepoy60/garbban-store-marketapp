import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { StackHeader } from '@/components/headers';
import { RouteLayer } from '@/components/RouteLayer';
import { AppText, Avatar, Icon, Pill, SheetHandle, Touchable, useLayout } from '@/components/ui';
import { colors, fonts, shadows } from '@/constants/theme';
import { formatAmount } from '@/data/mock';
import { MAX_STOPS, useRide } from '@/data/ride';
import { FREE_WAIT_MIN, splitFare, STOP_FEE } from '@/logic/pricing';

const STOP_COLORS = [colors.blue, colors.tertiary, colors.green];

export default function StopsScreen() {
  const insets = useSafeAreaInsets();
  const { gutter, mapHeight } = useLayout();
  const ride = useRide();
  const { pickup, destination, stops, route, offer } = ride;
  const [carpool, setCarpool] = useState(stops.length > 0);

  const total = offer.quote.total;
  const passengers = 1 + stops.length;
  const full = stops.length >= MAX_STOPS;

  return (
    <View style={styles.screen}>
      <StackHeader title="Trajet à plusieurs arrêts" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: mapHeight(0.3, 190, 280) }}>
          <CityMap style={StyleSheet.absoluteFill}>
            <RouteLayer points={[pickup, ...stops, destination]} jam={!!route.jam} />
          </CityMap>
          <View style={[styles.eta, { right: gutter }]}>
            <Icon name="schedule" size={18} color={colors.primary} />
            <AppText variant="labelSm" style={{ fontFamily: fonts.sora600 }}>
              {route.minutes} min · {route.km.toString().replace('.', ',')} km
            </AppText>
          </View>
        </View>

        <View style={[styles.sheet, { paddingHorizontal: gutter }]}>
          <SheetHandle />
          <View style={styles.between}>
            <View style={{ flex: 1 }}>
              <AppText variant="headlineSm">Étapes du trajet</AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Jusqu’à {MAX_STOPS} arrêts · {formatAmount(STOP_FEE)} F et {FREE_WAIT_MIN} min d’attente offertes par arrêt
              </AppText>
            </View>
            <Pill background={colors.secondaryContainer}>
              <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                {stops.length + 2} POINTS
              </AppText>
            </Pill>
          </View>

          <View style={styles.stops}>
            <View style={styles.rail} />

            <Touchable style={[styles.stop, styles.stopFixed]} onPress={() => router.push({ pathname: '/destination', params: { mode: 'pickup' } })}>
              <View style={styles.stopLeft}>
                <View style={[styles.node, { backgroundColor: colors.secondaryContainer }]}>
                  <Icon name="my-location" size={16} color={colors.onSecondaryFixed} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    DÉPART
                  </AppText>
                  <AppText variant="labelLg" numberOfLines={1}>
                    {pickup.name} · {pickup.area}
                  </AppText>
                </View>
              </View>
              <View style={[styles.stopAction, { backgroundColor: colors.surfaceContainer }]}>
                <Icon name="edit" size={16} color={colors.onSurfaceVariant} />
              </View>
            </Touchable>

            {stops.map((s, i) => {
              const color = STOP_COLORS[i % STOP_COLORS.length];
              return (
                <View key={s.id} style={[styles.stop, styles.stopEditable]}>
                  <View style={styles.stopLeft}>
                    <View style={[styles.node, { backgroundColor: color }]}>
                      <AppText variant="labelSm" color={colors.onPrimary} style={{ fontFamily: fonts.sora600 }}>
                        {i + 1}
                      </AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="labelSm" color={color}>
                        {`ARRÊT ${i + 1}`}
                      </AppText>
                      <AppText variant="labelLg" numberOfLines={1}>
                        {s.name} · {s.area}
                      </AppText>
                    </View>
                  </View>
                  <View style={[styles.row, { gap: 4 }]}>
                    {stops.length > 1 && (
                      <Touchable
                        accessibilityLabel={i === 0 ? 'Descendre l’arrêt' : 'Monter l’arrêt'}
                        style={styles.stopAction}
                        onPress={() => ride.moveStop(s.id, i === 0 ? 1 : -1)}
                      >
                        <Icon name={i === 0 ? 'arrow-downward' : 'arrow-upward'} size={16} color={colors.onSurfaceVariant} />
                      </Touchable>
                    )}
                    <Touchable accessibilityLabel="Supprimer l’arrêt" style={styles.stopAction} onPress={() => ride.removeStop(s.id)}>
                      <Icon name="close" size={16} color={colors.onSurfaceVariant} />
                    </Touchable>
                  </View>
                </View>
              );
            })}

            <Touchable style={[styles.stop, styles.stopFixed]} onPress={() => router.push('/destination')}>
              <View style={styles.stopLeft}>
                <View style={[styles.node, { backgroundColor: colors.primary }]}>
                  <Icon name="flag" size={18} color={colors.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="labelSm" color={colors.primary}>
                    ARRIVÉE FINALE
                  </AppText>
                  <AppText variant="labelLg" numberOfLines={1}>
                    {destination.name} · {destination.area}
                  </AppText>
                </View>
              </View>
              <View style={[styles.stopAction, { backgroundColor: colors.surfaceContainer }]}>
                <Icon name="edit" size={16} color={colors.onSurfaceVariant} />
              </View>
            </Touchable>
          </View>

          <Touchable
            style={[styles.addStop, full && { opacity: 0.5 }]}
            disabled={full}
            scale={0.98}
            onPress={() => router.push({ pathname: '/destination', params: { mode: 'stop' } })}
          >
            <Icon name="add-circle" size={20} color={colors.primary} />
            <AppText variant="headlineSm" color={colors.primary}>
              {full ? `${MAX_STOPS} arrêts maximum` : 'Ajouter un arrêt'}
            </AppText>
          </Touchable>

          {/* Covoiturage */}
          <View style={styles.carpool}>
            <Touchable style={styles.between} scale={0.99} onPress={() => setCarpool((v) => !v)}>
              <View style={[styles.row, { gap: 12, flex: 1 }]}>
                <View style={[styles.check, !carpool && styles.checkOff]}>
                  {carpool && <Icon name="check" size={18} color={colors.onSecondaryFixed} />}
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="labelLg">Covoiturage partagé</AppText>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                    Un passager par arrêt, frais partagés
                  </AppText>
                </View>
              </View>
              <Pill background={carpool ? colors.secondaryContainer : colors.surfaceHighest}>
                <AppText variant="labelSm" color={carpool ? colors.onSecondaryFixed : colors.onSurfaceVariant}>
                  {carpool ? 'Actif' : 'Inactif'}
                </AppText>
              </Pill>
            </Touchable>
            <View style={styles.between}>
              <View style={styles.row}>
                <View style={[styles.face, { backgroundColor: colors.primaryContainer, marginLeft: 0 }]}>
                  <AppText variant="labelSm" color={colors.onPrimary} style={{ fontFamily: fonts.sora600 }}>
                    Moi
                  </AppText>
                </View>
                {stops.map((s) => (
                  <Avatar key={s.id} name={s.name} size={40} radius={20} style={styles.face} />
                ))}
              </View>
              <View style={styles.row}>
                <Icon name="group" size={18} color={colors.onSurfaceVariant} />
                <AppText variant="labelMd" color={colors.onSurfaceVariant}>
                  {passengers} passager{passengers > 1 ? 's' : ''}
                </AppText>
              </View>
            </View>
          </View>

          {/* Prix */}
          <View style={styles.price}>
            <View style={[styles.between, { alignItems: 'baseline' }]}>
              <AppText variant="labelMd" color={colors.onPrimaryContainer}>
                Prix total estimé
              </AppText>
              <View style={[styles.row, { alignItems: 'baseline', gap: 6 }]}>
                <AppText variant="currency" color={colors.onPrimary}>
                  {formatAmount(total)}
                </AppText>
                <AppText variant="headlineSm" color={colors.secondaryContainer}>
                  FCFA
                </AppText>
              </View>
            </View>
            <View style={styles.split}>
              <View style={[styles.row, { gap: 8, flex: 1 }]}>
                <Icon name="payments" size={18} color={colors.secondaryContainer} />
                <AppText variant="labelMd" color={colors.onPrimary}>
                  {carpool && passengers > 1 ? `Soit ${formatAmount(splitFare(total, passengers))} FCFA / pers.` : 'Payé par vous'}
                </AppText>
              </View>
              {carpool && passengers > 1 && (
                <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 8 }}>
                  <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                    Demande groupée
                  </AppText>
                </Pill>
              )}
            </View>
          </View>

          <Touchable style={styles.cta} scale={0.98} onPress={() => router.push('/vehicules')}>
            <AppText variant="headlineMd" color={colors.onSecondaryFixed} style={{ fontFamily: fonts.sora700 }}>
              Choisir le véhicule
            </AppText>
            <Icon name="arrow-forward" size={24} color={colors.onSecondaryFixed} />
          </Touchable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pinWrap: { position: 'absolute', alignItems: 'center' },
  pin: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  pinBadge: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pinTail: { width: 6, height: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, marginTop: -2 },
  eta: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
    boxShadow: shadows.sheet,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  stops: { gap: 8, paddingLeft: 8 },
  rail: { position: 'absolute', left: 29, top: 24, bottom: 28, width: 4, borderRadius: 2, backgroundColor: colors.surfaceHighest },
  stop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 16 },
  stopFixed: { backgroundColor: colors.surfaceLow, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  stopEditable: { backgroundColor: colors.surfaceLowest, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  stopLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, paddingRight: 8 },
  node: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stopAction: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  addStop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.surfaceLow },
  carpool: { padding: 16, borderRadius: 16, backgroundColor: colors.surfaceLow, gap: 12, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  check: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  checkOff: { backgroundColor: colors.surfaceLowest, borderWidth: 2, borderColor: colors.outlineVariant, boxShadow: undefined },
  face: { width: 40, height: 40, borderRadius: 20, marginLeft: -8, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  price: { padding: 16, borderRadius: 16, backgroundColor: colors.ink, gap: 8, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  split: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 12, backgroundColor: 'rgba(17,24,39,0.2)' },
  cta: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
    marginTop: 4,
  },
});
