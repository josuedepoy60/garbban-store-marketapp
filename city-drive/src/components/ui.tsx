import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Image,
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

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export function Icon({ name, size = 20, color = colors.onSurface, style }: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
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

export function Avatar({ uri, size = 48, radius = 16, style }: { uri: string; size?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: colors.primaryContainer }, style]}>
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
  );
}

export function SheetHandle({ color = colors.outlineVariant }: { color?: string }) {
  return <View style={[styles.handle, { backgroundColor: color }]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// --- Animations -----------------------------------------------------------

function useLoop(duration: number, delay = 0) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [value, duration, delay]);
  return value;
}

/** Point qui émet un halo (équivalent de `animate-ping`). */
export function PingDot({ color, size = 8 }: { color: string; size?: number }) {
  const t = useLoop(1400);
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: size, backgroundColor: color },
          { opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }] },
        ]}
      />
      <View style={{ width: size, height: size, borderRadius: size, backgroundColor: color }} />
    </View>
  );
}

/** Élément qui rebondit doucement (équivalent de `animate-bounce`). */
export function Bounce({ children, duration = 2800, style }: { children: ReactNode; duration?: number; style?: StyleProp<ViewStyle> }) {
  const t = useLoop(duration);
  const translateY = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -6, 0] });
  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Glisse horizontalement de `from` à `to` en boucle (clouds, véhicules). */
export function Drift({ children, from, to, duration, delay = 0, style }: {
  children: ReactNode;
  from: number;
  to: number;
  duration: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useLoop(duration, delay);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  return <Animated.View style={[style, { transform: [{ translateX }] }]}>{children}</Animated.View>;
}

export function Pulse({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useLoop(2200);
  return (
    <Animated.View
      style={[
        style,
        { opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', boxShadow: shadows.soft },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  handle: { width: 48, height: 6, borderRadius: 3, alignSelf: 'center' },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: 16, padding: 16, boxShadow: shadows.card },
});

/** Vrai sur les petits téléphones (largeur < 360 px) : masque ou compacte les éléments secondaires. */
export function useCompact() {
  const { width } = useWindowDimensions();
  return width < 360;
}
