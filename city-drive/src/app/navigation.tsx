import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import { AppText, Dot, Icon, PingDot, Pulse, Touchable, type IconName } from '@/components/ui';
import { brand } from '@/constants/brand';
import { fonts } from '@/constants/theme';

// Palette sombre du mode conduite (tokens de la maquette « cockpit »).
const dark = {
  surface: '#131316',
  lowest: '#0e0e11',
  low: '#1b1b1e',
  container: '#1f1f22',
  high: '#2a2a2d',
  highest: '#353438',
  onSurface: '#e4e1e6',
  onSurfaceVariant: '#c4c9ae',
  lime: '#FFC400',
  onLime: '#283500',
  violet: '#FF9A3C',
  pink: '#ffb1c5',
  pinkContainer: '#8e1347',
  onPinkContainer: '#ff9bb7',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  outline: '#8e937b',
};

const ROUTE = 'M 85 540 L 170 360 L 225 210 L 290 80';
const SPEED_LIMIT = 80;
const ARC = 188.4; // 2π × 30

function CockpitMap() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 620" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="lagoon" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF7A1A" stopOpacity={0.35} />
          <Stop offset="0.5" stopColor="#14161A" stopOpacity={0.7} />
          <Stop offset="1" stopColor="#E8590C" stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="gps" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor={dark.lime} />
          <Stop offset="0.6" stopColor={dark.lime} />
          <Stop offset="1" stopColor={dark.violet} />
        </LinearGradient>
      </Defs>
      <Rect width={400} height={620} fill={dark.lowest} />
      <Path d="M-40 280 Q 90 230 220 290 T 440 250 L 440 450 L -40 450 Z" fill="url(#lagoon)" />
      <Path d="M-40 330 Q 110 270 240 340 T 440 310" stroke={dark.violet} strokeDasharray="6 8" strokeOpacity={0.3} strokeWidth={1.5} fill="none" />

      {/* Silhouettes du Plateau */}
      <G opacity={0.35} transform="translate(260, 90)">
        <Polygon points="50,40 85,25 85,110 50,125" fill="#1F2937" />
        <Polygon points="15,25 50,40 50,125 15,110" fill="#474554" />
        <Polygon points="15,25 50,10 85,25 50,40" fill={dark.violet} />
        <Line x1={50} y1={10} x2={50} y2={-12} stroke={dark.lime} strokeWidth={2} />
        <Circle cx={50} cy={-12} r={3} fill={dark.lime} />
      </G>
      <G opacity={0.25} transform="translate(190, 115)">
        <Polygon points="35,28 60,16 60,80 35,90" fill="#1F2937" />
        <Polygon points="10,16 35,28 35,90 10,80" fill="#474554" />
        <Polygon points="10,16 35,5 60,16 35,28" fill="#c8c4d7" />
      </G>

      {/* Haubans du pont HKB */}
      <G opacity={0.4} stroke="#c8c4d7" strokeWidth={1.5}>
        <Line x1={165} y1={230} x2={165} y2={390} stroke="#E8EBEF" strokeWidth={4} />
        {[80, 120, 220, 260].map((x) => (
          <Line key={x} x1={165} y1={230} x2={x} y2={370} strokeDasharray="3 3" />
        ))}
      </G>

      {/* Chaussée + tracé GPS */}
      <Path d="M 60 590 L 170 360 L 225 210 L 290 80" stroke={dark.container} strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M 60 590 L 170 360 L 225 210 L 290 80" stroke={dark.highest} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={ROUTE} stroke={dark.lime} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.2} />
      <Path d={ROUTE} stroke="url(#gps)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Destination : tour CCIA */}
      <G transform="translate(290, 80)">
        <Circle r={14} fill="#FF7A1A" opacity={0.3} />
        <Circle r={8} fill={dark.lime} />
        <Circle r={4} fill="#14161A" />
      </G>

      {/* Véhicule */}
      <G transform="translate(142, 420)">
        <Circle r={28} fill={dark.lime} opacity={0.12} />
        <Circle r={18} fill={dark.violet} opacity={0.25} />
        <G rotation={-30}>
          <Polygon points="-7,-18 7,-18 16,-44 -16,-44" fill={dark.lime} opacity={0.35} />
          <Rect x={-10} y={-18} width={20} height={36} rx={7} fill="#14161A" />
          <Rect x={-8} y={-12} width={16} height={24} rx={4} fill="#E8590C" />
          <Line x1={-5} y1={0} x2={5} y2={0} stroke={dark.lime} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={-6} cy={17} r={2} fill="#ba1a1a" />
          <Circle cx={6} cy={17} r={2} fill="#ba1a1a" />
        </G>
      </G>
    </Svg>
  );
}

function Speedometer({ speed }: { speed: number }) {
  const over = speed >= SPEED_LIMIT - 5;
  const offset = ARC * (1 - Math.min(speed / SPEED_LIMIT, 1));
  return (
    <View style={styles.speedPod}>
      <View style={{ width: 80, height: 80 }}>
        <Svg width={80} height={80} viewBox="0 0 72 72">
          <G rotation={-90} origin="36, 36">
            <Circle cx={36} cy={36} r={30} stroke="#EEF0F3" strokeOpacity={0.15} strokeWidth={5} fill="none" />
            <Circle
              cx={36}
              cy={36}
              r={30}
              stroke={over ? '#ba1a1a' : dark.lime}
              strokeWidth={5}
              strokeDasharray={`${ARC}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        </Svg>
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <AppText variant="headlineXl" color={dark.onSurface} style={{ fontSize: 30, lineHeight: 32, letterSpacing: -0.6 }}>
            {speed}
          </AppText>
          <AppText variant="labelSm" color={dark.onSurfaceVariant} style={{ fontSize: 9, lineHeight: 10 }}>
            KM/H
          </AppText>
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <View style={styles.row}>
          <View style={styles.limitOuter}>
            <View style={styles.limitInner}>
              <AppText variant="headlineSm" color={dark.onErrorContainer} style={{ fontSize: 13, lineHeight: 15, fontFamily: fonts.sora700 }}>
                {SPEED_LIMIT}
              </AppText>
            </View>
          </View>
          <AppText variant="labelSm" color={dark.onSurfaceVariant} style={{ fontSize: 9 }}>
            MAX AUTORISÉ
          </AppText>
        </View>
        <View style={styles.row}>
          <Dot color="#ffd9e1" size={7} />
          <AppText variant="labelSm" color={dark.onSurface} style={{ fontSize: 10 }}>
            Pont HKB fluide
          </AppText>
        </View>
      </View>
    </View>
  );
}

function RoundTool({ icon, color, bg, label }: { icon: IconName; color: string; bg: string; label: string }) {
  return (
    <Touchable accessibilityLabel={label} style={[styles.roundTool, { backgroundColor: bg }]} scale={0.9}>
      <Icon name={icon} size={22} color={color} />
    </Touchable>
  );
}

export default function NavigationScreen() {
  const insets = useSafeAreaInsets();
  const [speed, setSpeed] = useState(68);
  const [voice, setVoice] = useState(true);
  const { height } = useWindowDimensions();
  const mapHeight = Math.round(Math.min(620, Math.max(480, height * 0.72)));

  // Simule une vitesse qui varie autour de 68 km/h sur le pont.
  useEffect(() => {
    const id = setInterval(() => {
      setSpeed((s) => Math.min(76, Math.max(62, Math.round(s + (Math.random() * 4 - 2)))));
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const actions: { icon: IconName; label: string; color: string; danger?: boolean; onPress?: () => void }[] = [
    { icon: 'warning', label: 'Signaler', color: dark.error },
    { icon: voice ? 'volume-up' : 'volume-off', label: voice ? 'Guidage' : 'Muet', color: voice ? dark.lime : dark.outline, onPress: () => setVoice((v) => !v) },
    { icon: 'alt-route', label: 'Évitement', color: dark.pink },
    { icon: 'emergency', label: 'SOS', color: dark.onErrorContainer, danger: true },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        {/* Carte de conduite */}
        <View style={[styles.mapWrap, { height: mapHeight }]}>
          <CockpitMap />

          <View style={styles.hud}>
            <View style={styles.turnCard}>
              <View style={[styles.row, { gap: 12, flex: 1 }]}>
                <View style={styles.turnIcon}>
                  <Icon name="turn-right" size={34} color={dark.onLime} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[styles.row, { flexWrap: 'wrap' }]}>
                    <AppText variant="headlineSm" color={dark.onSurface} style={{ fontSize: 16 }}>
                      Dans 150 m
                    </AppText>
                    <View style={styles.lanePill}>
                      <AppText variant="labelSm" color={dark.onPinkContainer} style={{ fontSize: 9 }}>
                        2 voies de droite
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="bodyMd" color={dark.onSurface} numberOfLines={1} style={{ fontFamily: fonts.dm600 }}>
                    Pont HKB • Direction Plateau CCIA
                  </AppText>
                  <AppText variant="bodySm" color={dark.onSurfaceVariant} numberOfLines={1}>
                    Puis continuer tout droit sur 1.8 km
                  </AppText>
                </View>
              </View>
              <View style={{ alignItems: 'center', paddingLeft: 8 }}>
                <View style={styles.nextIcon}>
                  <Icon name="straight" size={20} color={dark.lime} />
                </View>
                <AppText variant="labelSm" color={dark.onSurfaceVariant} style={{ fontSize: 10, marginTop: 2 }}>
                  1.8 km
                </AppText>
              </View>
            </View>

            {voice && (
              <View style={styles.voiceCard}>
                <View style={styles.between}>
                  <View style={styles.row}>
                    <PingDot color="#10b981" size={6} />
                    <AppText variant="labelSm" color={dark.lime} style={{ fontSize: 9 }}>
                      GUIDAGE VOCAL EN DIRECT
                    </AppText>
                  </View>
                  <Touchable style={styles.row}>
                    <Icon name="replay" size={12} color={dark.onSurfaceVariant} />
                    <AppText variant="labelSm" color={dark.onSurfaceVariant} style={{ fontSize: 9 }}>
                      Répéter
                    </AppText>
                  </Touchable>
                </View>
                <AppText variant="bodySm" color={dark.onSurface} style={{ fontStyle: 'italic', fontSize: 12, lineHeight: 16 }}>
                  « Dans 150 mètres, serrez à droite puis prenez la rampe d'accès Pont HKB. Voie dégagée. »
                </AppText>
              </View>
            )}

            <View style={styles.between}>
              <Touchable style={styles.glassPill} onPress={() => setVoice((v) => !v)}>
                {voice ? <PingDot color="#ffb1c5" /> : <Dot color={dark.outline} />}
                <AppText variant="labelSm" color={dark.onSurface}>
                  {voice ? 'Guidage vocal actif' : 'Guidage coupé'}
                </AppText>
                <Icon name={voice ? 'volume-up' : 'volume-off'} size={16} color={voice ? dark.lime : dark.outline} />
              </Touchable>
              <Touchable style={styles.glassPill} onPress={() => router.back()} accessibilityLabel="Réduire navigation">
                <Icon name="close-fullscreen" size={16} color={dark.onSurface} />
                <AppText variant="labelSm" color={dark.onSurface}>
                  Réduire
                </AppText>
              </Touchable>
            </View>
          </View>

          <View style={styles.speedWrap}>
            <Speedometer speed={speed} />
          </View>

          <View style={styles.tools}>
            <RoundTool icon="view-in-ar" label="Vue 3D" color={dark.onSurface} bg="rgba(14,14,17,0.9)" />
            <RoundTool icon="traffic" label="Afficher le trafic" color={dark.lime} bg="rgba(14,14,17,0.9)" />
            <View>
              <Pulse style={[StyleSheet.absoluteFill, { borderRadius: 22, backgroundColor: 'rgba(255,196,0,0.35)' }]} />
              <RoundTool icon="my-location" label="Recentrer le GPS" color={dark.onLime} bg={dark.lime} />
            </View>
          </View>
        </View>

        {/* Progression du trajet */}
        <View style={{ paddingHorizontal: 12, paddingTop: 12, gap: 12 }}>
          <View style={styles.etaCard}>
            <View style={[styles.between, { alignItems: 'flex-end' }]}>
              <View style={[styles.row, { alignItems: 'baseline', gap: 8 }]}>
                <AppText variant="currency" color={dark.onSurface} style={{ fontSize: 32, lineHeight: 38 }}>
                  12:42
                </AppText>
                <AppText variant="labelLg" color={dark.onSurfaceVariant} style={{ fontFamily: fonts.dm600, fontSize: 14 }}>
                  Heure d'arrivée
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="headlineSm" color={dark.pink} style={{ fontFamily: fonts.sora700, fontSize: 16 }}>
                  8 min
                </AppText>
                <AppText variant="labelSm" color={dark.onSurfaceVariant} style={{ fontFamily: fonts.dm600 }}>
                  4.2 km restants
                </AppText>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <View style={styles.track}>
                <View style={styles.trackFill}>
                  <View style={styles.trackHead} />
                </View>
              </View>
              <View style={styles.between}>
                <View style={styles.row}>
                  <Dot color={dark.lime} size={6} />
                  <AppText variant="labelSm" color={dark.onSurfaceVariant} style={{ fontSize: 10 }}>
                    Cocody St-Jean
                  </AppText>
                </View>
                <View style={styles.row}>
                  <Dot color={dark.pink} size={6} />
                  <AppText variant="labelSm" color={dark.onSurfaceVariant} style={{ fontSize: 10 }}>
                    Plateau CCIA
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.trafficPill}>
              <View style={[styles.row, { flex: 1 }]}>
                <Icon name="speed" size={18} color={dark.onPinkContainer} />
                <AppText variant="labelSm" color={dark.onPinkContainer} numberOfLines={1} style={{ flexShrink: 1 }}>
                  Trafic très fluide sur le Pont HKB
                </AppText>
              </View>
              <View style={styles.gainPill}>
                <AppText variant="labelSm" color={dark.onSurface} style={{ fontSize: 10 }}>
                  +10 min vs Adjamé
                </AppText>
              </View>
            </View>
          </View>

          {/* Actions pendant la conduite */}
          <View style={styles.actions}>
            {actions.map((a) => (
              <Touchable
                key={a.icon}
                onPress={a.onPress}
                style={[styles.action, a.danger && { backgroundColor: dark.errorContainer }]}
                accessibilityLabel={a.label}
              >
                <Icon name={a.icon} size={22} color={a.color} />
                <AppText variant="labelSm" color={a.danger ? dark.onErrorContainer : dark.onSurface} numberOfLines={1} style={{ fontSize: 10 }}>
                  {a.danger ? `${a.label} ${brand.appName}` : a.label}
                </AppText>
              </Touchable>
            ))}
          </View>

          <View style={[styles.row, { gap: 8 }]}>
            <Touchable style={styles.parking} scale={0.98}>
              <Icon name="local-parking" size={22} color={dark.onPinkContainer} />
              <AppText variant="headlineSm" color={dark.onPinkContainer} style={{ fontSize: 16 }}>
                Trouver Parking CCIA
              </AppText>
            </Touchable>
            <Touchable style={styles.call} accessibilityLabel="Contacter le support">
              <Icon name="phone-in-talk" size={24} color={dark.onLime} />
            </Touchable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const glass = { backgroundColor: 'rgba(14,14,17,0.92)' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: dark.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  mapWrap: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', backgroundColor: dark.lowest },
  hud: { position: 'absolute', top: 12, left: 12, right: 12, gap: 8 },
  turnCard: {
    ...glass,
    borderRadius: 32,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.4)',
  },
  turnIcon: { width: 56, height: 56, borderRadius: 24, backgroundColor: dark.lime, alignItems: 'center', justifyContent: 'center' },
  lanePill: { backgroundColor: dark.pinkContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  nextIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: dark.container, alignItems: 'center', justifyContent: 'center' },
  voiceCard: { ...glass, borderRadius: 20, padding: 10, gap: 4, borderWidth: 1, borderColor: 'rgba(255,196,0,0.15)' },
  glassPill: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  speedWrap: { position: 'absolute', left: 12, bottom: 20 },
  speedPod: { ...glass, borderRadius: 32, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.4)' },
  limitOuter: { width: 32, height: 32, borderRadius: 16, backgroundColor: dark.lowest, alignItems: 'center', justifyContent: 'center' },
  limitInner: { width: 28, height: 28, borderRadius: 14, backgroundColor: dark.errorContainer, alignItems: 'center', justifyContent: 'center' },
  tools: { position: 'absolute', right: 12, bottom: 20, gap: 8 },
  roundTool: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 10px rgba(0,0,0,0.4)' },
  etaCard: { backgroundColor: dark.low, borderRadius: 32, padding: 16, gap: 12 },
  track: { height: 12, borderRadius: 6, backgroundColor: dark.high, overflow: 'hidden' },
  trackFill: { width: '65%', height: '100%', borderRadius: 6, backgroundColor: dark.lime },
  trackHead: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 12, borderRadius: 6, backgroundColor: '#ffd9e1' },
  trafficPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    backgroundColor: dark.pinkContainer,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gainPill: { backgroundColor: dark.lowest, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, height: 56, borderRadius: 32, backgroundColor: dark.container, alignItems: 'center', justifyContent: 'center', gap: 2 },
  parking: {
    flex: 1,
    height: 56,
    borderRadius: 999,
    backgroundColor: dark.pinkContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  call: { width: 56, height: 56, borderRadius: 28, backgroundColor: dark.lime, alignItems: 'center', justifyContent: 'center' },
});
