import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

// Plan de ville plat, dans le style des cartes routières (Google Maps / Apple Plans).
// Repère du dessin : 420 × 500. Les calques passés en `children` (itinéraires…)
// utilisent ce même repère.
export const MAP_W = 420;
export const MAP_H = 500;

const LAND = '#F1EFEA';
const BLOCK = '#E6E3DC';
const PARK = '#CFE7C4';
const WATER = '#AAD3F2';
const ROAD = '#FFFFFF';
const ROAD_EDGE = '#DAD6CD';
const LABEL = '#8B8E95';

// Voies principales (mêmes tracés qu'avant : les itinéraires des écrans s'y superposent).
const MAIN_ROADS = ['M -20 220 L 440 220', 'M 90 -20 L 350 490', 'M 265 320 L 340 470'];

// Petites rues du quadrillage.
const STREETS = [
  'M -20 70 L 440 60',
  'M -20 150 L 440 140',
  'M -20 290 L 250 280',
  'M 40 -20 L 30 320',
  'M 180 -20 L 175 320',
  'M 300 -20 L 310 320',
  'M 380 -20 L 395 330',
];

// Îlots bâtis (rectangles plats entre les rues).
const BLOCKS: [number, number, number, number][] = [
  [48, 10, 40, 48], [48, 80, 40, 58], [48, 160, 40, 48],
  [100, 10, 60, 48], [100, 80, 55, 58],
  [190, 10, 50, 44], [190, 76, 30, 56], [230, 160, 60, 50], [190, 235, 40, 40],
  [318, 10, 55, 44], [318, 74, 55, 60], [318, 236, 60, 40],
  [48, 232, 50, 44], [110, 232, 50, 40], [240, 232, 40, 40],
  [-10, 80, 40, 58], [-10, 160, 40, 48], [-10, 236, 40, 40],
];

/** Petite voiture vue du dessus (taxis disponibles autour de l'utilisateur). */
export function Car({ x, y, angle, color = colors.primaryContainer }: { x: number; y: number; angle: number; color?: string }) {
  return (
    <G transform={`translate(${x}, ${y}) rotate(${angle})`}>
      <Rect x={-6} y={-11} width={12} height={22} rx={4} fill="#fff" />
      <Rect x={-5} y={-10} width={10} height={20} rx={3.5} fill={color} />
      <Rect x={-4} y={-5} width={8} height={5} rx={1.5} fill="#1F2937" opacity={0.75} />
    </G>
  );
}

type Props = {
  children?: ReactNode;
  /** Point bleu « ma position » : au carrefour central, ou à la position donnée. */
  userMarker?: boolean | { x: number; y: number };
  /** Taxis disponibles : quelques voitures décoratives, ou les positions données. */
  cars?: boolean | { x: number; y: number; angle: number }[];
  /** Conservé pour compatibilité : la carte n'est plus animée. */
  animated?: boolean;
  dimmed?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CityMap({ children, userMarker = false, cars = false, dimmed = false, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice">
        <Rect width={MAP_W} height={MAP_H} fill={LAND} />

        {/* Îlots et parcs */}
        {BLOCKS.map(([x, y, w, h], i) => (
          <Rect key={i} x={x} y={y} width={w} height={h} rx={3} fill={BLOCK} />
        ))}
        <Path d="M 100 150 L 160 148 L 162 205 L 100 208 Z" fill={PARK} />
        <Path d="M 320 150 L 380 146 L 386 208 L 324 212 Z" fill={PARK} />
        <Path d="M 100 290 L 160 286 L 150 318 L 96 322 Z" fill={PARK} />

        {/* Lagune Ébrié */}
        <Path d="M -20 330 C 80 320, 160 360, 240 340 C 320 320, 370 380, 440 370 L 440 520 L -20 520 Z" fill={WATER} />

        {/* Rues : bordure puis chaussée */}
        {STREETS.map((d) => (
          <Path key={`e${d}`} d={d} stroke={ROAD_EDGE} strokeWidth={8} fill="none" />
        ))}
        {STREETS.map((d) => (
          <Path key={`r${d}`} d={d} stroke={ROAD} strokeWidth={6} fill="none" />
        ))}
        {MAIN_ROADS.map((d) => (
          <Path key={`E${d}`} d={d} stroke={ROAD_EDGE} strokeWidth={17} strokeLinecap="round" fill="none" />
        ))}
        {MAIN_ROADS.map((d) => (
          <Path key={`R${d}`} d={d} stroke={ROAD} strokeWidth={14} strokeLinecap="round" fill="none" />
        ))}

        {/* Noms de quartiers */}
        <SvgText x={214} y={40} fontSize={10} fontFamily={fonts.dm700} fill={LABEL} letterSpacing={1.5}>
          COCODY
        </SvgText>
        <SvgText x={12} y={306} fontSize={10} fontFamily={fonts.dm700} fill={LABEL} letterSpacing={1.5}>
          PLATEAU
        </SvgText>
        <SvgText x={120} y={420} fontSize={10} fontFamily={fonts.dm600} fill="#5E8DB4" fontStyle="italic" letterSpacing={1}>
          Lagune Ébrié
        </SvgText>
        <SvgText x={330} y={214} fontSize={8} fontFamily={fonts.dm600} fill={LABEL}>
          Bd Latrille
        </SvgText>
        <SvgText x={292} y={436} fontSize={8} fontFamily={fonts.dm600} fill={LABEL}>
          Pont HKB
        </SvgText>

        {Array.isArray(cars) && cars.map((c, i) => <Car key={i} {...c} />)}
        {cars === true && (
          <>
            <Car x={132} y={214} angle={90} />
            <Car x={268} y={226} angle={-90} />
            <Car x={176} y={148} angle={-27} />
            <Car x={318} y={62} angle={95} />
          </>
        )}

        {userMarker && (
          <G transform={typeof userMarker === 'object' ? `translate(${userMarker.x}, ${userMarker.y})` : 'translate(210, 220)'}>
            <Circle r={22} fill={colors.blue} opacity={0.14} />
            <Circle r={9} fill="#fff" />
            <Circle r={6.5} fill={colors.blue} />
          </G>
        )}

        {children}
      </Svg>

      {dimmed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(250,250,251,0.25)' }]} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', backgroundColor: LAND },
});
