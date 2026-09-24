import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { CityMap } from '@/components/CityMap';
import { StackHeader } from '@/components/headers';
import { AppText, Avatar, Bounce, Icon, Pill, SheetHandle, Touchable } from '@/components/ui';
import { colors, fonts, shadows } from '@/constants/theme';
import { formatAmount, photos } from '@/data/mock';

const ROUTE = 'M 60 170 C 110 150, 150 215, 192 205 C 235 196, 255 280, 310 262 C 345 250, 362 292, 372 330';

type StopItem = { id: string; label: string; place: string; color: string; tag: string };

const INITIAL_STOPS: StopItem[] = [
  { id: '1', label: 'Arrêt 1', place: 'Prendre Awa · Angré 8e', color: colors.primaryContainer, tag: 'Angré 8e' },
  { id: '2', label: 'Arrêt 2', place: 'Prendre Maman · Deux Plateaux', color: colors.tertiary, tag: '2 Plateaux' },
];

function MapPin({ label, badge, bg, fg, style }: { label: string; badge: ReactNode; bg: string; fg: string; style: object }) {
  return (
    <Bounce style={[styles.pinWrap, style]} duration={3000}>
      <View style={[styles.pin, { backgroundColor: bg }]}>
        {badge}
        <AppText variant="labelSm" color={fg} style={{ fontFamily: fonts.sora600, letterSpacing: -0.2 }}>
          {label}
        </AppText>
      </View>
      <View style={[styles.pinTail, { backgroundColor: bg }]} />
    </Bounce>
  );
}

function PinBadge({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View style={[styles.pinBadge, { backgroundColor: bg }]}>
      <AppText variant="labelSm" color={fg} style={{ fontSize: 10, lineHeight: 12 }}>
        {text}
      </AppText>
    </View>
  );
}

export default function StopsScreen() {
  const insets = useSafeAreaInsets();
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [carpool, setCarpool] = useState(true);

  const total = 4800;
  const passengers = 1 + stops.length;

  return (
    <View style={styles.screen}>
      <StackHeader title="Suivi de course active" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 290 }}>
          <CityMap style={StyleSheet.absoluteFill} animated={false}>
            <Defs>
              <LinearGradient id="route" x1="0" y1="0.1" x2="1" y2="0.9">
                <Stop offset="0" stopColor="#C8F53A" />
                <Stop offset="0.35" stopColor="#FF7A1A" />
                <Stop offset="0.7" stopColor="#991E50" />
                <Stop offset="1" stopColor="#E8590C" />
              </LinearGradient>
            </Defs>
            <Path d={ROUTE} stroke="url(#route)" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.3} />
            <Path d={ROUTE} stroke="url(#route)" strokeWidth={4.5} strokeLinecap="round" fill="none" />
          </CityMap>

          <MapPin
            style={{ left: 20, top: 44 }}
            label="Riviera 2"
            bg={colors.secondaryContainer}
            fg={colors.onSecondaryFixed}
            badge={<PinBadge text="D" bg={colors.onSecondaryFixed} fg={colors.secondaryContainer} />}
          />
          {stops.map((s, i) => (
            <MapPin
              key={s.id}
              style={i === 0 ? { left: '38%', top: 70 } : { right: 56, top: 132 }}
              label={s.tag}
              bg={s.color}
              fg={colors.onPrimary}
              badge={<PinBadge text={String(i + 1)} bg={colors.surfaceLowest} fg={s.color} />}
            />
          ))}
          <MapPin
            style={{ right: 12, bottom: 40 }}
            label="Plateau CCIA"
            bg={colors.primary}
            fg={colors.onPrimary}
            badge={<Icon name="flag" size={14} color={colors.onPrimary} />}
          />

          <View style={styles.eta}>
            <Icon name="schedule" size={18} color={colors.primary} />
            <AppText variant="labelSm" style={{ fontFamily: fonts.sora600 }}>
              34 min · 14.8 km
            </AppText>
          </View>
        </View>

        <View style={styles.sheet}>
          <SheetHandle />
          <View style={styles.between}>
            <View style={{ flex: 1 }}>
              <AppText variant="headlineSm">Étapes planifiées</AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Modifiez ou réorganisez l'ordre des arrêts
              </AppText>
            </View>
            <Pill background={colors.secondaryContainer}>
              <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                {stops.length + 2} ARRÊTS
              </AppText>
            </Pill>
          </View>

          <View style={styles.stops}>
            <View style={styles.rail} />

            <View style={[styles.stop, styles.stopFixed]}>
              <View style={styles.stopLeft}>
                <View style={[styles.node, { backgroundColor: colors.secondaryContainer, boxShadow: '0px 0px 12px rgba(200,245,58,0.8)' }]}>
                  <Icon name="my-location" size={16} color={colors.onSecondaryFixed} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    DÉPART
                  </AppText>
                  <AppText variant="labelLg" numberOfLines={1}>
                    Ma position · Riviera 2
                  </AppText>
                </View>
              </View>
              <View style={[styles.stopAction, { backgroundColor: colors.surfaceContainer }]}>
                <Icon name="lock" size={18} color={colors.outline} />
              </View>
            </View>

            {stops.map((s, i) => (
              <View key={s.id} style={[styles.stop, styles.stopEditable]}>
                <View style={styles.stopLeft}>
                  <View style={[styles.node, { backgroundColor: s.color }]}>
                    <AppText variant="labelSm" color={colors.onPrimary} style={{ fontFamily: fonts.sora600 }}>
                      {i + 1}
                    </AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="labelSm" color={s.color}>
                      {`ARRÊT ${i + 1}`}
                    </AppText>
                    <AppText variant="labelLg" numberOfLines={1}>
                      {s.place}
                    </AppText>
                  </View>
                </View>
                <View style={styles.row}>
                  <Touchable
                    accessibilityLabel="Supprimer arrêt"
                    style={styles.stopAction}
                    onPress={() => setStops((prev) => prev.filter((x) => x.id !== s.id))}
                  >
                    <Icon name="close" size={16} color={colors.onSurfaceVariant} />
                  </Touchable>
                  <View style={styles.stopAction}>
                    <Icon name="drag-indicator" size={18} color={colors.outline} />
                  </View>
                </View>
              </View>
            ))}

            <View style={[styles.stop, styles.stopFixed]}>
              <View style={styles.stopLeft}>
                <View style={[styles.node, { backgroundColor: colors.primary, boxShadow: '0px 4px 12px rgba(232,89,12,0.3)' }]}>
                  <Icon name="flag" size={18} color={colors.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="labelSm" color={colors.primary}>
                    ARRIVÉE FINALE
                  </AppText>
                  <AppText variant="labelLg" numberOfLines={1}>
                    Plateau · Bd de la République
                  </AppText>
                </View>
              </View>
              <View style={styles.stopAction}>
                <Icon name="drag-indicator" size={18} color={colors.outline} />
              </View>
            </View>
          </View>

          <Touchable style={styles.addStop} scale={0.98}>
            <Icon name="add-circle" size={20} color={colors.primary} />
            <AppText variant="headlineSm" color={colors.primary}>
              Ajouter un arrêt
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
                    Diviser les frais automatiquement
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
                {stops.some((s) => s.id === '1') && <Avatar uri={photos.awa} size={40} radius={20} style={styles.face} />}
                {stops.some((s) => s.id === '2') && <Avatar uri={photos.maman} size={40} radius={20} style={styles.face} />}
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
                  {carpool ? `Soit ${formatAmount(Math.round(total / passengers))} FCFA / pers.` : 'Payé par vous'}
                </AppText>
              </View>
              {carpool && (
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
  pin: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, boxShadow: '0px 8px 18px rgba(255,122,26,0.3)' },
  pinBadge: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pinTail: { width: 6, height: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, marginTop: -2 },
  eta: {
    position: 'absolute',
    right: 16,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    boxShadow: '0px 10px 24px -4px rgba(22,19,43,0.14)',
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.97)',
    boxShadow: shadows.sheet,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  stops: { gap: 8, paddingLeft: 8 },
  rail: { position: 'absolute', left: 29, top: 24, bottom: 28, width: 4, borderRadius: 2, backgroundColor: colors.surfaceHighest },
  stop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 16 },
  stopFixed: { backgroundColor: colors.surfaceLow, boxShadow: '0px 4px 16px rgba(17,24,39,0.04)' },
  stopEditable: { backgroundColor: colors.surfaceLowest, boxShadow: '0px 4px 18px rgba(17,24,39,0.06)' },
  stopLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, paddingRight: 8 },
  node: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stopAction: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  addStop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.surfaceLow },
  carpool: { padding: 16, borderRadius: 16, backgroundColor: colors.surfaceLow, gap: 12, boxShadow: '0px 6px 20px rgba(17,24,39,0.05)' },
  check: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 2px 8px rgba(200,245,58,0.5)' },
  checkOff: { backgroundColor: colors.surfaceLowest, borderWidth: 2, borderColor: colors.outlineVariant, boxShadow: undefined },
  face: { width: 40, height: 40, borderRadius: 20, marginLeft: -8, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 8px rgba(0,0,0,0.12)' },
  price: { padding: 16, borderRadius: 16, backgroundColor: colors.ink, gap: 8, boxShadow: '0px 12px 28px rgba(17,24,39,0.22)' },
  split: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 12, backgroundColor: 'rgba(232,89,12,0.2)' },
  cta: {
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0px 14px 30px rgba(200,245,58,0.35)',
    marginTop: 4,
  },
});
