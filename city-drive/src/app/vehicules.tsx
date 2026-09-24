import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path } from 'react-native-svg';

import { CityMap } from '@/components/CityMap';
import { StackHeader } from '@/components/headers';
import { AppText, Bounce, Dot, Icon, Pill, PingDot, Touchable, type IconName } from '@/components/ui';
import { VehicleIcon } from '@/components/VehicleIcon';
import { brand } from '@/constants/brand';
import { colors, fonts, shadows } from '@/constants/theme';
import { carModels, formatAmount, user, vehicles } from '@/data/mock';

const PAYMENT_METHODS: { name: string; icon: IconName; detail: string }[] = [
  { name: brand.walletName, icon: 'toll', detail: `Solde disponible : ${formatAmount(user.balance)} ${brand.walletUnit}` },
  { name: 'Wave', icon: 'phone-iphone', detail: 'Paiement mobile' },
  { name: 'Orange Money', icon: 'phone-android', detail: 'Paiement mobile' },
  { name: 'Espèces', icon: 'payments', detail: 'À régler au chauffeur' },
];

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(vehicles[0].id);
  const [model, setModel] = useState(carModels[0]);
  const [payment, setPayment] = useState(0);

  const vehicle = vehicles.find((v) => v.id === selected) ?? vehicles[0];
  const method = PAYMENT_METHODS[payment];

  return (
    <View style={styles.screen}>
      <StackHeader title="Confirmation de course" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* Mini carte */}
        <View style={{ height: 176 }}>
          <CityMap style={StyleSheet.absoluteFill} animated={false}>
            <Path d="M 60 190 C 130 170, 170 240, 230 225 S 330 260, 380 300" stroke={colors.primaryContainer} strokeWidth={5} strokeLinecap="round" fill="none" />
          </CityMap>
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(252,248,255,0.2)', 'rgba(252,248,255,0)', colors.surface]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.routePill}>
            <View style={[styles.row, { flex: 1 }]}>
              <PingDot color={colors.primary} size={10} />
              <AppText variant="labelMd" numberOfLines={1} style={{ flexShrink: 1 }}>
                Riviera 2 → Plateau{' '}
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  (via 2 arrêts)
                </AppText>
              </AppText>
            </View>
            <View style={styles.timePill}>
              <Icon name="schedule" size={15} color={colors.primary} />
              <AppText variant="labelSm" color={colors.primary}>
                34 min
              </AppText>
            </View>
          </View>
          <Bounce style={styles.enRoute} duration={1600}>
            <Dot color={colors.secondaryContainer} />
            <AppText variant="labelSm">En route</AppText>
            <Icon name="local-taxi" size={16} color={colors.secondary} />
          </Bounce>
        </View>

        <View style={styles.content}>
          <View style={styles.between}>
            <View style={{ flex: 1 }}>
              <AppText variant="headlineMd">Véhicules disponibles</AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Trajet direct avec chauffeur vérifié
              </AppText>
            </View>
            <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
              <AppText variant="labelSm" color={colors.onSecondaryContainer}>
                {brand.city} Live
              </AppText>
            </Pill>
          </View>

          <View style={{ gap: 12 }}>
            {vehicles.map((v) => {
              const active = v.id === selected;
              return (
                <Touchable key={v.id} scale={0.98} onPress={() => setSelected(v.id)} style={[styles.vehicle, active && styles.vehicleActive]}>
                  {v.recommended && active && (
                    <View style={styles.recommended}>
                      <Icon name="verified" size={12} color={colors.onPrimary} />
                      <AppText variant="labelSm" color={colors.onPrimary}>
                        Recommandé
                      </AppText>
                    </View>
                  )}
                  <View style={[styles.row, { gap: 14, flex: 1 }]}>
                    <View style={styles.vehicleArt}>
                      <VehicleIcon kind={v.kind} color={active ? colors.primary : colors.onSurface} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
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
                      <View style={[styles.row, { gap: 2, marginTop: 2 }]}>
                        <Icon name={v.fast ? 'bolt' : 'schedule'} size={13} color={v.fast ? colors.secondary : colors.onSurfaceVariant} />
                        <AppText variant="labelSm" color={v.fast ? colors.secondary : colors.onSurfaceVariant}>
                          {v.eta}
                        </AppText>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText variant="headlineSm" color={active ? colors.primary : colors.onSurface}>
                      {formatAmount(v.price)}{' '}
                      <AppText variant="labelSm" color={active ? colors.primary : colors.onSurface}>
                        FCFA
                      </AppText>
                    </AppText>
                    {active ? (
                      <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 }}>
                        <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                          {formatAmount(v.price)} {brand.walletUnit}
                        </AppText>
                      </Pill>
                    ) : (
                      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                        {formatAmount(v.price)} {brand.walletUnit}
                      </AppText>
                    )}
                  </View>
                </Touchable>
              );
            })}
          </View>

          {/* Choix du modèle */}
          <View style={{ gap: 10, paddingTop: 4 }}>
            <View style={styles.between}>
              <View style={styles.row}>
                <Icon name="auto-awesome" size={19} color={colors.primary} />
                <AppText variant="headlineSm">Choisir un modèle précis</AppText>
              </View>
              <Pill background={colors.primaryFixed} style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
                <AppText variant="labelSm" color={colors.primary}>
                  Exclusivité
                </AppText>
              </Pill>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {carModels.map((m) => {
                const active = m === model;
                return (
                  <Touchable key={m} onPress={() => setModel(m)} style={[styles.modelChip, active && { backgroundColor: colors.primary }]}>
                    <AppText variant="labelMd" color={active ? colors.onPrimary : colors.onSurface}>
                      {m}
                    </AppText>
                  </Touchable>
                );
              })}
            </ScrollView>
          </View>

          {/* Avantages */}
          <View style={[styles.row, { gap: 12 }]}>
            <View style={styles.perk}>
              <View style={[styles.perkIcon, { backgroundColor: colors.surfaceLowest }]}>
                <Icon name="security" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="labelMd" numberOfLines={1}>
                  Trajet sécurisé
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                  Assurance AXA incluse
                </AppText>
              </View>
            </View>
            <View style={styles.perk}>
              <View style={[styles.perkIcon, { backgroundColor: colors.secondaryContainer }]}>
                <Icon name="price-check" size={18} color={colors.onSecondaryFixed} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="labelMd" numberOfLines={1}>
                  Prix garanti
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                  Zéro surcoût trafic
                </AppText>
              </View>
            </View>
          </View>

          {/* Paiement + action */}
          <View style={styles.checkout}>
            <View style={styles.between}>
              <View style={[styles.row, { gap: 12, flex: 1 }]}>
                <View style={styles.payIcon}>
                  <Icon name={method.icon} size={20} color={colors.onSecondaryFixed} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <AppText variant="labelMd">{method.name}</AppText>
                    <View style={styles.tick}>
                      <Icon name="check" size={11} color={colors.onPrimary} />
                    </View>
                  </View>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                    {method.detail}
                  </AppText>
                </View>
              </View>
              <Touchable style={styles.change} onPress={() => setPayment((p) => (p + 1) % PAYMENT_METHODS.length)}>
                <AppText variant="labelSm" color={colors.primary}>
                  Changer
                </AppText>
              </Touchable>
            </View>

            <Touchable
              style={styles.cta}
              scale={0.98}
              onPress={() => router.push({ pathname: '/course', params: { price: String(vehicle.price) } })}
            >
              <Icon name="lock" size={20} color={colors.onPrimary} />
              <AppText variant="headlineSm" color={colors.onPrimary}>
                Commander {vehicle.name} · {formatAmount(vehicle.price)} FCFA
              </AppText>
            </Touchable>
            <View style={[styles.row, { justifyContent: 'center' }]}>
              <Icon name="verified-user" size={13} color={colors.secondary} />
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                Paiement débité uniquement à l'arrivée
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
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    boxShadow: shadows.float,
  },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
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
    borderRadius: 999,
    boxShadow: shadows.card,
  },
  content: { paddingHorizontal: 16, gap: 16, marginTop: -8 },
  vehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 14,
    borderRadius: 32,
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleActive: { borderColor: colors.primary, boxShadow: '0px 4px 12px rgba(51,16,179,0.12)' },
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
    borderRadius: 999,
  },
  vehicleArt: { width: 64, height: 56, borderRadius: 16, backgroundColor: colors.surfaceLow, padding: 6 },
  modelChip: { height: 38, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.surfaceLowest, justifyContent: 'center', boxShadow: '0px 1px 2px rgba(0,0,0,0.06)' },
  perk: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: colors.surfaceLow },
  perkIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 2px rgba(0,0,0,0.06)' },
  checkout: { backgroundColor: colors.surfaceLowest, padding: 16, borderRadius: 24, gap: 14, boxShadow: '0px 10px 30px -6px rgba(22,19,43,0.14)', marginTop: 4 },
  payIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  change: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surfaceLow },
  cta: {
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: shadows.primary,
  },
});
