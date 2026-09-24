import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabHeader } from './headers';
import { AppText, Icon, type IconName } from './ui';
import { colors, shadows } from '@/constants/theme';

/** Écran provisoire pour les onglets dont la maquette n'est pas encore fournie. */
export function ComingSoon({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 88 }]}>
      <TabHeader />
      <View style={styles.body}>
        {children}
        <View style={styles.card}>
          <View style={styles.icon}>
            <Icon name={icon} size={28} color={colors.primary} />
          </View>
          <AppText variant="headlineMd">{title}</AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
            Cet écran sera construit dès réception de sa maquette.
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingHorizontal: 16, gap: 16 },
  card: { alignItems: 'center', gap: 8, padding: 24, borderRadius: 32, backgroundColor: colors.surfaceLowest, boxShadow: shadows.card },
  icon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surfaceHighest, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
});
