import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { AppText, Avatar, Icon, PingDot, Pulse, Touchable, type IconName } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';
import { favoriteDriver } from '@/data/mock';

const BAR_HEIGHTS = [12, 24, 16, 20, 8, 16, 20];

/** Barre d'égaliseur qui oscille, décalée selon son index. */
function EqBar({ max, index, active }: { max: number; index: number; active: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) {
      v.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 80),
        Animated.timing(v, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, index, active]);
  const height = v.interpolate({ inputRange: [0, 1], outputRange: [4, max] });
  return <Animated.View style={{ width: 4, height, borderRadius: 2, backgroundColor: index % 2 ? colors.secondary : colors.primary }} />;
}

function Control({ icon, label, onPress, bg, fg, badge }: { icon: IconName; label: string; onPress?: () => void; bg: string; fg: string; badge?: number }) {
  return (
    <Touchable accessibilityLabel={label} onPress={onPress} style={styles.control}>
      <View style={[styles.controlCircle, { backgroundColor: bg }]}>
        <Icon name={icon} size={26} color={fg} />
        {badge ? (
          <View style={styles.badge}>
            <AppText variant="labelSm" color={colors.onSecondaryFixed} style={{ fontSize: 10, lineHeight: 12 }}>
              {badge}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="labelSm" style={{ fontFamily: fonts.dm600 }}>
        {label}
      </AppText>
    </Touchable>
  );
}

export default function CallScreen() {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(84);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [sos, setSos] = useState<'idle' | 'confirm' | 'sent'>('idle');

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Touchable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
            <Icon name="arrow-back" size={24} />
          </Touchable>
          <View style={{ flex: 1 }}>
            <AppText variant="headlineSm" style={{ lineHeight: 20 }}>
              Appel en course
            </AppText>
            <View style={styles.row}>
              <View style={styles.dot} />
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                En course • {favoriteDriver.fullName}
              </AppText>
            </View>
          </View>
          <View style={styles.avatar}>
            <Icon name="person" size={18} color={colors.onPrimary} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Chiffrement */}
        <View style={styles.privacy}>
          <View style={styles.between}>
            <View style={styles.row}>
              <Icon name="enhanced-encryption" size={20} color={colors.primary} />
              <AppText variant="labelMd" color={colors.primary}>
                Appel chiffré de bout en bout
              </AppText>
            </View>
            <View style={styles.timer}>
              <PingDot color={colors.secondary} />
              <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                {timer}
              </AppText>
            </View>
          </View>
          <View style={[styles.between, { flexWrap: 'wrap', rowGap: 4 }]}>
            <View style={styles.row}>
              <Icon name="lock" size={16} color={colors.onSurfaceVariant} />
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Votre numéro réel est anonymisé
              </AppText>
            </View>
          </View>
        </View>

        {/* Scène de l'appel */}
        <View style={styles.stage}>
          <View style={styles.rings}>
            <Pulse style={[styles.ring, { width: 176, height: 176, backgroundColor: 'rgba(17,24,39,0.1)' }]} />
            <View style={[styles.ring, { width: 144, height: 144, backgroundColor: 'rgba(255,196,0,0.3)' }]} />
            <View style={[styles.ring, { width: 112, height: 112, backgroundColor: 'rgba(209,213,219,0.4)' }]} />
            <View style={styles.bigAvatar}>
              <Avatar name={favoriteDriver.fullName} size={96} radius={48} />
              <View style={styles.ratingBand}>
                <AppText variant="labelSm" color={colors.onPrimary}>
                  4.9 ★
                </AppText>
              </View>
            </View>
          </View>
          <View style={styles.eq}>
            {BAR_HEIGHTS.map((h, i) => (
              <EqBar key={i} max={h} index={i} active={!muted} />
            ))}
          </View>
          <AppText variant="headlineLg" style={{ textAlign: 'center' }}>
            {favoriteDriver.fullName}
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
            {favoriteDriver.shortCar} • {favoriteDriver.plate}
          </AppText>
          <View style={styles.eta}>
            <Icon name="near-me" size={18} color={colors.primary} />
            <AppText variant="labelMd" color="#7A2E00">
              Arrivée estimée dans 4 min
            </AppText>
          </View>
        </View>

        {/* Mini carte */}
        <View style={styles.mini}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <View style={[styles.dot, { width: 8, height: 8 }]} />
              <AppText variant="labelSm" color={colors.secondary}>
                VÉHICULE À 250M
              </AppText>
            </View>
            <AppText variant="headlineSm" numberOfLines={1}>
              Carrefour Riviera 2
            </AppText>
            <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
              En route vers CCIA Plateau
            </AppText>
          </View>
          <View style={styles.miniMap}>
            <CityMap style={StyleSheet.absoluteFill} animated={false} />
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,24,39,0.1)' }]}>
              <View style={styles.miniCar}>
                <Icon name="directions-car" size={18} color={colors.onPrimary} />
              </View>
            </View>
          </View>
        </View>

        {/* Commandes */}
        <View style={styles.controls}>
          <Control
            icon={muted ? 'mic-off' : 'mic'}
            label={muted ? 'Coupé' : 'Micro actif'}
            bg={muted ? '#ba1a1a' : colors.surfaceLowest}
            fg={muted ? '#fff' : colors.onSurface}
            onPress={() => setMuted((m) => !m)}
          />
          <Control
            icon={speaker ? 'volume-up' : 'hearing'}
            label={speaker ? 'HP allumé' : 'Écouteur'}
            bg={speaker ? colors.primary : colors.surfaceLowest}
            fg={speaker ? colors.onPrimary : colors.onSurface}
            onPress={() => setSpeaker((s) => !s)}
          />
          <Control icon="dialpad" label="Clavier" bg={colors.surfaceLowest} fg={colors.onSurface} />
          <Control icon="chat" label="Chat" bg={colors.surfaceLowest} fg={colors.onSurface} badge={1} onPress={() => router.replace('/chat')} />
        </View>

        {sos !== 'idle' && (
          <View style={[styles.sosBox, sos === 'sent' && { backgroundColor: colors.secondaryContainer }]}>
            {sos === 'confirm' ? (
              <>
                <AppText variant="labelMd" color="#93000a" style={{ flex: 1 }}>
                  Déclencher une assistance d'urgence pour cette course ?
                </AppText>
                <Touchable style={styles.sosNo} onPress={() => setSos('idle')}>
                  <AppText variant="labelSm">Non</AppText>
                </Touchable>
                <Touchable style={styles.sosYes} onPress={() => setSos('sent')}>
                  <AppText variant="labelSm" color="#fff">
                    Oui, alerter
                  </AppText>
                </Touchable>
              </>
            ) : (
              <>
                <Icon name="check-circle" size={20} color={colors.onSecondaryFixed} />
                <AppText variant="labelMd" color={colors.onSecondaryFixed} style={{ flex: 1 }}>
                  Alerte transmise au centre de sécurité {brand.appName} {brand.city}.
                </AppText>
              </>
            )}
          </View>
        )}

        {/* SOS + raccrocher */}
        <View style={[styles.row, { gap: 16 }]}>
          <Touchable accessibilityLabel="Assistance urgence SOS" style={styles.sos} onPress={() => setSos('confirm')}>
            <Icon name="health-and-safety" size={22} color="#ba1a1a" />
            <AppText variant="labelMd" color="#93000a">
              SOS
            </AppText>
          </Touchable>
          <Touchable accessibilityLabel="Terminer l'appel" style={styles.hangUp} scale={0.97} onPress={() => router.back()}>
            <Icon name="call-end" size={28} color="#fff" />
            <AppText variant="headlineSm" color="#fff">
              Terminer l'appel
            </AppText>
          </Touchable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  header: { backgroundColor: 'rgba(250,250,251,0.92)', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)', zIndex: 10 },
  headerInner: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00A676' },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  privacy: { borderRadius: 16, backgroundColor: colors.surfaceLow, padding: 16, gap: 6, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.secondaryContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  stage: { borderRadius: 16, backgroundColor: colors.surfaceContainer, alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 16, gap: 4, overflow: 'hidden' },
  rings: { width: 176, height: 176, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 100 },
  bigAvatar: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  ratingBand: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,24,39,0.75)' },
  eq: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, marginVertical: 8 },
  eta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: colors.primaryFixed, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  mini: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 16, backgroundColor: colors.surfaceLowest, padding: 16, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  miniMap: { width: 80, height: 80, borderRadius: 24, overflow: 'hidden' },
  miniCar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 16, backgroundColor: colors.surfaceHigh, padding: 16 },
  control: { flex: 1, alignItems: 'center', gap: 4 },
  controlCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  badge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  sosBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 24, backgroundColor: '#ffdad6' },
  sosNo: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#fff' },
  sosYes: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#ba1a1a' },
  sos: { height: 56, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#ffdad6', flexDirection: 'row', alignItems: 'center', gap: 4 },
  hangUp: { flex: 1, height: 56, borderRadius: 12, backgroundColor: '#ba1a1a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
});
