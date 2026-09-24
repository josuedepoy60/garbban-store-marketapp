import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type ComponentProps, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, shadows, type, type TypeVariant } from '@/constants/theme';
import { FILLED, PHOSPHOR } from './icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

/** Icône de l'app (Phosphor), avec repli sur Material si un nom n'est pas encore associé. */
export function Icon({ name, size = 20, color = colors.onSurface, weight, style }: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  style?: StyleProp<TextStyle>;
}) {
  const Phosphor = PHOSPHOR[name];
  if (Phosphor) {
    const w = weight ?? (FILLED.has(name) ? 'fill' : size <= 16 ? 'bold' : 'regular');
    return <Phosphor size={size} color={color} weight={w} style={style as StyleProp<ViewStyle>} />;
  }
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}

export function AppText({ variant = 'bodyMd', color = colors.onSurface, style, ...rest }: TextProps & {
  variant?: TypeVariant;
  color?: string;
}) {
  return <Text {...rest} style={[type[variant], { color }, style]} />;
}

/** Bouton avec léger effet d'écrasement au toucher (équivalent de `active:scale-95`). */
export function Touchable({ style, children, scale = 0.96, ...rest }: Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scale?: number;
  children?: ReactNode;
}) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [style, pressed && !rest.disabled && { transform: [{ scale }], opacity: 0.92 }]}
    >
      {children}
    </Pressable>
  );
}

export function CircleButton({ icon, onPress, color = colors.onSurface, background = colors.surfaceLowest, size = 40, label }: {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  background?: string;
  size?: number;
  label?: string;
}) {
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}
    >
      <Icon name={icon} size={20} color={color} />
    </Touchable>
  );
}

export function Pill({ children, background, style }: { children: ReactNode; background: string; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.pill, { backgroundColor: background }, style]}>{children}</View>;
}

export function Dot({ color, size = 8, style }: { color: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}

// Couleurs possibles des avatars ; chaque nom garde toujours la même.
const AVATAR_COLORS = [colors.primaryContainer, colors.blue, colors.green, colors.tertiary, '#7C4DFF', '#0E7490'];

export function initialsOf(name: string) {
  const parts = name.trim().split(/[\s-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
}

function colorOf(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** Avatar à initiales (en attendant les vraies photos de profil). */
export function Avatar({ name, size = 48, radius, style }: { name: string; size?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: colorOf(name), alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontFamily: type.labelLg.fontFamily, fontSize: Math.round(size * 0.38), lineHeight: Math.round(size * 0.46) }}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

export function SheetHandle({ color = colors.outlineVariant }: { color?: string }) {
  return <View style={[styles.handle, { backgroundColor: color }]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// --- États « en direct » ---------------------------------------------------
// Volontairement statiques : pas de rebonds ni de halos clignotants, comme dans
// les apps de VTC réelles. Les noms sont conservés pour ne pas toucher aux écrans.

/** Point d'état (en direct, disponible…). */
export function PingDot({ color, size = 8 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

/** Conteneur simple (ancien élément rebondissant). */
export function Bounce({ children, style }: { children: ReactNode; duration?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={style}>{children}</View>;
}

/** Ancien halo pulsé : n'affiche plus rien. */
export function Pulse(_: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return null;
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', boxShadow: shadows.soft },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  handle: { width: 48, height: 6, borderRadius: 3, alignSelf: 'center' },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: 16, padding: 16, boxShadow: shadows.card },
});

/** Vrai sur les petits téléphones (largeur < 360 px) : masque ou compacte les éléments secondaires. */
export function useCompact() {
  const { width } = useWindowDimensions();
  return width < 360;
}

/**
 * Gabarit d'écran selon la taille du téléphone :
 * - compact : petits Android et iPhone SE (largeur < 360) ;
 * - short : écrans peu hauts (< 700), où les cartes rétrécissent ;
 * - large : Plus / Max (≥ 414).
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const compact = width < 360;
  const short = height < 700;
  const large = width >= 414;
  return {
    width,
    height,
    compact,
    short,
    large,
    /** Marge latérale des écrans. */
    gutter: compact ? 12 : large ? 20 : 16,
    /** Hauteur d'une carte en proportion de l'écran, bornée. */
    mapHeight: (ratio: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, height * ratio))),
  };
}
