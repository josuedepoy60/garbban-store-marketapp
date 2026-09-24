import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';
import type { VehicleKind } from '@/data/mock';

/** Illustrations vectorielles des catégories de véhicules (reprises des maquettes). */
export function VehicleIcon({ kind, color }: { kind: VehicleKind; color: string }) {
  const wheel = { fill: colors.surface, stroke: color, strokeWidth: 2.5 };
  return (
    <Svg width="100%" height="100%" viewBox="0 0 64 36" fill="none">
      {kind === 'sedan' && (
        <>
          <Path d="M6 24L10 14C11 11.5 13.5 10 16 10H40C43 10 45.5 11.5 47 14L54 20L58 22C60 23 61 24.5 61 26.5V28H3V26C3 24.5 4.5 24 6 24Z" fill={color} fillOpacity={0.15} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={16} cy={27} r={5} {...wheel} />
          <Circle cx={46} cy={27} r={5} {...wheel} />
          <Path d="M22 13H36V20H18L22 13Z" fill={color} fillOpacity={0.3} />
          <Path d="M38 13H45L49 20H38V13Z" fill={color} fillOpacity={0.3} />
        </>
      )}
      {kind === 'suv' && (
        <>
          <Path d="M5 24L8 11C8.8 8.5 11 7 14 7H43C45.5 7 47.5 8.5 49 11L57 18L60 21C61 22 62 23.5 62 25.5V28H2V25.5C2 24.5 3.5 24 5 24Z" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={16} cy={27} r={5.5} {...wheel} />
          <Circle cx={47} cy={27} r={5.5} {...wheel} />
          <Path d="M19 10H34V18H15L19 10Z" fill={color} fillOpacity={0.3} />
          <Path d="M37 10H47L51 18H37V10Z" fill={color} fillOpacity={0.3} />
        </>
      )}
      {kind === 'van' && (
        <>
          <Path d="M4 25L5 9C5.2 7.5 6.5 6.5 8 6.5H47C49 6.5 51 7.8 52 9.5L58 17L60 21C61.2 22.5 61.5 24 61.5 25.5V28H2V26.5C2 25.5 3 25 4 25Z" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={16} cy={27} r={5} {...wheel} />
          <Circle cx={47} cy={27} r={5} {...wheel} />
          <Rect x={11} y={9.5} width={10} height={8} rx={1.5} fill={color} fillOpacity={0.3} />
          <Rect x={24} y={9.5} width={10} height={8} rx={1.5} fill={color} fillOpacity={0.3} />
          <Path d="M37 9.5H46L50 17.5H37V9.5Z" fill={color} fillOpacity={0.3} />
        </>
      )}
      {kind === 'moto' && (
        <>
          <Circle cx={15} cy={25} r={7} stroke={color} strokeWidth={2.5} />
          <Circle cx={49} cy={25} r={7} stroke={color} strokeWidth={2.5} />
          <Path d="M15 25L25 18L35 18L44 25" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M25 18L32 10L42 10" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={35} cy={7} r={3.5} fill={color} fillOpacity={0.3} />
          <Path d="M42 10L45 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M28 15L35 25" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
