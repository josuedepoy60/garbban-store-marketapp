import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import { colors } from '@/constants/theme';
import { Drift } from './ui';

// Coordonnées du dessin : 420 × 500. Les calques additionnels (itinéraires, lignes)
// passés en `children` utilisent ce même repère.
export const MAP_W = 420;
export const MAP_H = 500;

type Props = {
  children?: ReactNode;
  /** Affiche le repère « vous êtes ici » au carrefour central. */
  userMarker?: boolean;
  /** Nuages et petits véhicules animés. */
  animated?: boolean;
  /** Assombrit/éclaircit la carte (carte d'arrière-plan). */
  dimmed?: boolean;
  style?: StyleProp<ViewStyle>;
};

function Building({ x, y, left, right, roof, w = 70 }: { x: number; y: number; left: string; right: string; roof: string; w?: number }) {
  const k = w / 70;
  return (
    <G transform={`translate(${x}, ${y}) scale(${k})`}>
      <Polygon points="0,40 30,55 30,110 0,95" fill={left} />
      <Polygon points="30,55 70,35 70,90 30,110" fill={right} />
      <Polygon points="0,40 40,20 70,35 30,55" fill={roof} />
      <Line x1={38} y1={58} x2={62} y2={46} stroke="#fff" strokeWidth={2} opacity={0.7} />
      <Line x1={38} y1={72} x2={62} y2={60} stroke="#fff" strokeWidth={2} opacity={0.7} />
    </G>
  );
}

function Tree({ x, y, r = 14 }: { x: number; y: number; r?: number }) {
  return (
    <G>
      <Circle cx={x + 2} cy={y + 4} r={r} fill="#3410B3" opacity={0.08} />
      <Circle cx={x} cy={y} r={r} fill="#69B829" />
      <Circle cx={x - 2} cy={y - 3} r={r * 0.85} fill="#8CE041" />
      <Circle cx={x - 4} cy={y - 5} r={r * 0.42} fill="#BAF777" />
    </G>
  );
}

function Cloud({ width }: { width: number }) {
  return (
    <Svg width={width} height={width * 0.45} viewBox="0 0 90 40">
      <Path d="M 10 28 Q 14 12 32 16 Q 44 4 62 14 Q 80 14 82 28 Q 80 38 50 37 Q 12 38 10 28 Z" fill="#fff" opacity={0.9} />
    </Svg>
  );
}

function MiniTaxi() {
  return (
    <Svg width={26} height={16} viewBox="-8 -8 26 20">
      <Path d="M -6 3 L 10 -5 L 16 -2 L 0 6 Z" fill="#FFFFFF" />
      <Path d="M 0 6 L 16 -2 L 16 3 L 0 11 Z" fill="#DCD6F7" />
      <Path d="M -6 3 L 0 6 L 0 11 L -6 8 Z" fill="#EDE8FD" />
      <Circle cx={5} cy={0} r={2} fill="#FF7700" />
    </Svg>
  );
}

export function CityMap({ children, userMarker = false, animated = true, dimmed = false, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F2EEFB" />
            <Stop offset="1" stopColor="#E8E2FA" />
          </LinearGradient>
          <LinearGradient id="lagoon" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#C5E8FF" />
            <Stop offset="0.5" stopColor="#A7DCFD" />
            <Stop offset="1" stopColor="#80CEF7" />
          </LinearGradient>
          <LinearGradient id="park" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E2F7C2" />
            <Stop offset="1" stopColor="#D0F0A3" />
          </LinearGradient>
        </Defs>

        <Rect width={MAP_W} height={MAP_H} fill="url(#land)" />

        {/* Lagune Ébrié */}
        <Path d="M-20 330 C 80 320, 160 360, 240 340 C 320 320, 370 380, 440 370 L 440 520 L -20 520 Z" fill="url(#lagoon)" />
        <Path d="M 60 380 Q 90 375 120 380" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.6} />
        <Path d="M 180 410 Q 220 405 260 410" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.7} />
        <Path d="M 310 420 Q 340 416 380 422" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.5} />
        <Path d="M 100 450 Q 140 445 190 450" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />

        {/* Parcs */}
        <Path d="M 40 80 Q 90 50 140 70 Q 170 110 130 140 Q 70 160 30 120 Z" fill="url(#park)" opacity={0.9} />
        <Path d="M 280 180 Q 350 160 380 200 Q 390 260 330 270 Q 270 250 280 180 Z" fill="url(#park)" opacity={0.85} />
        <Tree x={75} y={95} />
        <Tree x={110} y={115} r={16} />
        <Tree x={330} y={210} r={15} />
        <Tree x={355} y={240} r={11} />

        {/* Routes : boulevard lagunaire, avenue Riviera, pont HKB */}
        <Path d="M-20 220 L 440 220" stroke="#fff" strokeWidth={32} strokeLinecap="round" />
        <Path d="M-20 220 L 440 220" stroke="#DCD6F7" strokeWidth={1.5} strokeDasharray="10 12" />
        <Path d="M 90 -20 L 350 490" stroke="#fff" strokeWidth={28} strokeLinecap="round" />
        <Path d="M 90 -20 L 350 490" stroke="#DCD6F7" strokeWidth={1.5} strokeDasharray="8 10" />
        <Path d="M 265 320 L 340 470" stroke="#fff" strokeWidth={24} />
        <Rect x={290} y={380} width={8} height={24} rx={3} fill={colors.primaryContainer} opacity={0.3} />

        {/* Immeubles isométriques */}
        <Building x={160} y={50} left="#8C7AE6" right="#6B52D9" roof="#DCD4FF" />
        <Building x={260} y={80} left="#F08CAE" right="#D95F87" roof="#FFD3DF" w={65} />
        <Building x={20} y={250} left="#A8D61A" right="#85B300" roof="#E0FA8E" w={75} />
        <Building x={130} y={260} left="#E6D3B3" right="#CCA87C" roof="#FFF4E0" w={54} />

        {userMarker && (
          <G transform="translate(210, 220)">
            <Circle r={24} fill="#00D2D3" opacity={0.18} />
            <Circle r={18} fill={colors.primaryContainer} opacity={0.25} />
            <Circle r={10} fill="#fff" />
            <Circle r={6} fill={colors.primary} />
            <Circle cx={-2} cy={-2} r={2} fill={colors.secondaryContainer} />
          </G>
        )}

        {children}
      </Svg>

      {animated && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Drift from={-140} to={460} duration={18000} style={{ position: 'absolute', top: '6%' }}>
            <Cloud width={90} />
          </Drift>
          <Drift from={-120} to={460} duration={26000} delay={4000} style={{ position: 'absolute', top: '2%' }}>
            <Cloud width={70} />
          </Drift>
          <Drift from={-40} to={460} duration={9000} style={{ position: 'absolute', top: '42%' }}>
            <MiniTaxi />
          </Drift>
        </View>
      )}

      {dimmed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(252,248,255,0.25)' }]} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', backgroundColor: colors.surfaceLow },
});
