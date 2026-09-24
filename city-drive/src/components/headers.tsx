import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand } from '@/constants/brand';
import { colors, shadows } from '@/constants/theme';
import { formatAmount } from '@/data/mock';
import { useWallet } from '@/data/wallet';
import { AppText, CircleButton, Icon, Touchable } from './ui';

/** En-tête flottant des onglets : logo, solde et profil. */
export function TabHeader() {
  const insets = useSafeAreaInsets();
  const { balance } = useWallet();
  return (
    <View style={[styles.tabHeader, { paddingTop: insets.top + 12 }]} pointerEvents="box-none">
      <View style={styles.logoPill}>
        <View style={styles.logoMark}>
          <Icon name="near-me" size={18} color={colors.onPrimary} />
        </View>
        <View>
          <AppText variant="headlineSm" color={colors.primary} style={{ lineHeight: 18, letterSpacing: -0.3 }}>
            {brand.appName}
          </AppText>
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {brand.city}
          </AppText>
        </View>
      </View>
      <View style={styles.row}>
        <Touchable style={styles.balance} onPress={() => router.navigate('/portefeuille')}>
          <Icon name="toll" size={16} color={colors.onSecondaryFixed} />
          <AppText variant="labelMd" color={colors.onSecondaryFixed}>
            {formatAmount(balance)} {brand.walletUnit}
          </AppText>
        </Touchable>
        <Touchable style={styles.profile} onPress={() => router.navigate('/compte')} accessibilityLabel="Profil">
          <Icon name="person" size={18} color={colors.onPrimary} />
        </Touchable>
      </View>
    </View>
  );
}

/** En-tête des écrans empilés : retour + titre + profil. */
export function StackHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.stackHeader, { paddingTop: insets.top }]}>
      <View style={styles.stackInner}>
        <View style={[styles.row, { flex: 1 }]}>
          <CircleButton icon="arrow-back" label="Retour" background={colors.surfaceLow} size={44} onPress={() => router.back()} />
          <AppText variant="headlineSm" numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </AppText>
        </View>
        <View style={styles.profile}>
          <Icon name="person" size={18} color={colors.onPrimary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tabHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingLeft: 6,
    paddingRight: 16,
    paddingVertical: 4,
    borderRadius: 12,
    boxShadow: shadows.soft,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    boxShadow: shadows.soft,
  },
  profile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackHeader: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
    zIndex: 50,
  },
  stackInner: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
