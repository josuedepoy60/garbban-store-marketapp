import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { colors } from '@/constants/theme';

// Au-delà de cette largeur (tablette, ordinateur), l'app s'affiche dans une colonne centrée.
const WIDE = 700;

/** Adapte l'app à toutes les tailles d'écran : plein écran sur téléphone, colonne centrée ailleurs. */
export function ResponsiveShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  if (width < WIDE) return <View style={styles.full}>{children}</View>;

  const columnWidth = width >= 1024 ? 460 : 600;
  return (
    <LinearGradient colors={['#1b1831', colors.primary, '#1b1831']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.backdrop}>
      <View style={[styles.column, { width: columnWidth }]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  backdrop: { flex: 1, alignItems: 'center' },
  column: { flex: 1, overflow: 'hidden', backgroundColor: colors.surface, boxShadow: '0px 0px 60px rgba(0,0,0,0.45)' },
});
