import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fonts } from '@/constants/theme';

// Couleurs des opérateurs Mobile Money ivoiriens (badges texte, pas de logos officiels).
const BRANDS: Record<string, { bg: string; fg: string; text: string }> = {
  wave: { bg: '#1DC8FF', fg: '#FFFFFF', text: 'W' },
  orange: { bg: '#FF7900', fg: '#FFFFFF', text: 'OM' },
  mtn: { bg: '#FFCB05', fg: '#004F71', text: 'MoMo' },
  moov: { bg: '#0055A5', fg: '#FFFFFF', text: 'moov' },
};

/** Pastille aux couleurs d'un opérateur Mobile Money. */
export function OperatorBadge({ id, size = 44, radius, style }: { id: string; size?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const brand = BRANDS[id] ?? BRANDS.wave;
  const long = brand.text.length > 2;
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: brand.bg, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Text style={{ color: brand.fg, fontFamily: fonts.dm700, fontSize: Math.round(size * (long ? 0.26 : 0.4)), letterSpacing: long ? -0.3 : 0 }}>
        {brand.text}
      </Text>
    </View>
  );
}
