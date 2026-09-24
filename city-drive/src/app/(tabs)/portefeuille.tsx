import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { ComingSoon } from '@/components/ComingSoon';
import { AppText } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors } from '@/constants/theme';
import { formatAmount, user } from '@/data/mock';

export default function WalletScreen() {
  return (
    <ComingSoon icon="account-balance-wallet" title="Portefeuille">
      <LinearGradient colors={[colors.primaryContainer, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balance}>
        <AppText variant="labelMd" color={colors.onPrimaryContainer}>
          Solde {brand.walletName}
        </AppText>
        <AppText variant="displayLg" color={colors.onPrimary}>
          {formatAmount(user.balance)}{' '}
          <AppText variant="headlineMd" color={colors.secondaryContainer}>
            {brand.walletUnit}
          </AppText>
        </AppText>
        <AppText variant="bodySm" color={colors.onPrimaryContainer}>
          1 {brand.walletUnit} = 1 FCFA
        </AppText>
      </LinearGradient>
    </ComingSoon>
  );
}

const styles = StyleSheet.create({
  balance: { borderRadius: 32, padding: 20, gap: 4, boxShadow: '0px 12px 28px -6px rgba(75,54,201,0.28)' },
});
