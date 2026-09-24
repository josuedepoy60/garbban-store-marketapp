import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { colors } from '@/constants/theme';

// L'app cible les téléphones. Sur un grand écran (aperçu web), elle s'affiche
// dans une colonne centrée de la largeur d'un téléphone.
const WIDE = 700;

export function ResponsiveShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  if (width < WIDE) return <View style={styles.full}>{children}</View>;
  return (
    <View style={styles.backdrop}>
      <View style={styles.column}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  backdrop: { flex: 1, alignItems: 'center', backgroundColor: '#2B2F36' },
  column: { flex: 1, width: 430, overflow: 'hidden', backgroundColor: colors.surface },
});
