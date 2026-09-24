import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Bounce, Icon, PingDot, Pill, Pulse, Touchable } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts, shadows } from '@/constants/theme';
import { formatAmount, user } from '@/data/mock';
import { OPERATORS, bonusOf, useWallet } from '@/data/wallet';

// Largeurs des barres du code-barres décoratif (reprises de la maquette).
const BARS = [6, 2, 10, 4, 2, 12, 4, 8, 2, 8, 6, 2, 12, 4, 2, 8];

function Line({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: string }) {
  return (
    <View style={styles.between}>
      <AppText variant="bodySm" color={colors.onSurfaceVariant}>
        {label}
      </AppText>
      <AppText variant={strong ? 'headlineSm' : 'labelMd'} color={accent ?? colors.onSurface} style={{ textAlign: 'right', flexShrink: 1 }}>
        {value}
      </AppText>
    </View>
  );
}

export default function ReceiptScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ amount?: string; operator?: string; ref?: string; old?: string }>();
  const amount = Number(params.amount) || 10000;
  const op = OPERATORS.find((o) => o.id === params.operator) ?? OPERATORS[0];
  const bonus = bonusOf(amount);
  const total = amount + bonus;
  const { balance } = useWallet();
  const oldBalance = Number(params.old) || balance - total;
  const reference = params.ref ?? `${op.label.slice(0, 2).toUpperCase()}-${Date.now()}`;
  const [notice, setNotice] = useState<string | null>(null);

  const time = useMemo(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }, []);

  const receiptText =
    `Reçu ${brand.appName} — Recharge ${op.name}\n` +
    `Réf : ${reference}\n` +
    `Montant débité : ${formatAmount(amount)} FCFA\n` +
    `Total crédité : +${formatAmount(total)} ${brand.walletUnit} (dont +${formatAmount(bonus)} ${brand.walletUnit} bonus)\n` +
    `Nouveau solde : ${formatAmount(balance)} ${brand.walletUnit}`;

  const share = async () => {
    try {
      await Share.share({ message: receiptText, title: `Reçu ${reference}` });
    } catch {
      setNotice("Le partage n'est pas disponible sur cet appareil.");
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {/* Barre du haut */}
        <View style={styles.between}>
          <Touchable accessibilityLabel="Fermer et aller au portefeuille" style={styles.roundBtn} onPress={() => router.navigate('/portefeuille')}>
            <Icon name="close" size={22} />
          </Touchable>
          <View style={styles.statusChip}>
            <PingDot color={colors.secondaryContainer} />
            <AppText variant="labelSm" color={colors.primary}>
              RECHARGE RÉUSSIE
            </AppText>
          </View>
          <Touchable accessibilityLabel="Assistance" style={styles.roundBtn} onPress={() => router.push('/chat')}>
            <Icon name="support-agent" size={22} />
          </Touchable>
        </View>

        {/* Célébration */}
        <View style={styles.celebrate}>
          <Icon name="auto-awesome" size={20} color={colors.secondaryContainer} style={{ position: 'absolute', top: 0, left: 48 }} />
          <Icon name="hotel-class" size={24} color={colors.primaryContainer} style={{ position: 'absolute', top: 16, right: 40, opacity: 0.8 }} />
          <Bounce style={{ position: 'absolute', bottom: 70, left: 60 }} duration={1400}>
            <Icon name="auto-awesome" size={18} color={colors.secondaryContainer} />
          </Bounce>
          <Icon name="star" size={20} color={colors.tertiaryFixed} style={{ position: 'absolute', bottom: 80, right: 56 }} />

          <View style={styles.badgeWrap}>
            <Pulse style={[StyleSheet.absoluteFill, { borderRadius: 48, backgroundColor: 'rgba(198,243,56,0.4)' }]} />
            <View style={[StyleSheet.absoluteFill, { borderRadius: 48, backgroundColor: 'rgba(198,243,56,0.4)', transform: [{ scale: 1.1 }] }]} />
            <View style={styles.badge}>
              <Icon name="check-circle" size={44} color={colors.onSecondaryFixed} />
            </View>
          </View>
          <AppText variant="headlineXl" style={{ marginTop: 8, textAlign: 'center' }}>
            Paiement confirmé !
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={{ textAlign: 'center', maxWidth: 300 }}>
            Votre compte {brand.appName} a été rechargé instantanément via {op.label} CI.
          </AppText>
          <View style={styles.metaPill}>
            <Icon name="schedule" size={16} color={colors.primary} />
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              Aujourd'hui à {time} • Réf: {reference}
            </AppText>
          </View>
        </View>

        {/* Nouveau solde */}
        <LinearGradient colors={[colors.primary, colors.primaryContainer, '#302d47']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.between}>
            <View style={styles.row}>
              <AppText variant="labelSm" color={colors.primaryFixed}>
                NOUVEAU SOLDE PORTEFEUILLE
              </AppText>
              <PingDot color={colors.secondaryContainer} />
            </View>
            <Pill background="rgba(255,255,255,0.2)" style={{ paddingHorizontal: 8 }}>
              <Icon name="verified" size={14} color={colors.secondaryContainer} />
              <AppText variant="labelSm" color={colors.onPrimary}>
                Actif
              </AppText>
            </Pill>
          </View>
          <View style={[styles.row, { alignItems: 'baseline', gap: 8, marginVertical: 4 }]}>
            <AppText variant="displayLg" color={colors.onPrimary}>
              {formatAmount(balance)}
            </AppText>
            <AppText variant="headlineMd" color={colors.secondaryContainer} style={{ fontFamily: fonts.sora700 }}>
              {brand.walletUnit}
            </AppText>
          </View>
          <AppText variant="bodySm" color={colors.primaryFixed}>
            ≈ {formatAmount(balance)} FCFA
          </AppText>
          <View style={styles.bonusTag}>
            <View style={styles.bolt}>
              <Icon name="bolt" size={16} color={colors.onSecondaryFixed} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" color={colors.onPrimary}>
                +{formatAmount(total)} {brand.walletUnit} crédités au total
              </AppText>
              <AppText variant="bodySm" color={colors.secondaryContainer}>
                Dont +{formatAmount(bonus)} {brand.walletUnit} bonus Gold Club ⚡
              </AppText>
            </View>
          </View>
          <View style={styles.evolution}>
            <AppText variant="bodySm" color={colors.primaryFixed}>
              Ancien : {formatAmount(oldBalance)} {brand.walletUnit}
            </AppText>
            <Icon name="east" size={16} color={colors.secondaryContainer} />
            <AppText variant="labelMd" color={colors.secondaryContainer}>
              Nouveau : {formatAmount(balance)} {brand.walletUnit}
            </AppText>
          </View>
        </LinearGradient>

        {/* Reçu détachable */}
        <View style={styles.receipt}>
          <View style={[styles.between, styles.receiptHead]}>
            <View style={[styles.row, { gap: 8 }]}>
              <View style={[styles.logo, { backgroundColor: colors.primary }]}>
                <Icon name="local-taxi" size={20} color={colors.onPrimary} />
              </View>
              <AppText variant="headlineSm">×</AppText>
              <View style={[styles.logo, { backgroundColor: 'rgba(29,161,242,0.15)' }]}>
                <AppText variant="headlineSm" color="#0099ff" style={{ fontFamily: fonts.sora700 }}>
                  {op.label[0]}
                </AppText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 10 }}>
                <Icon name="check" size={14} color={colors.onSecondaryFixed} />
                <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                  Validé instantané
                </AppText>
              </Pill>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {op.label} Côte d'Ivoire
              </AppText>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 2 }}>
            <AppText variant="labelSm" color={colors.outline}>
              REÇU DE TRANSACTION ÉLECTRONIQUE
            </AppText>
            <AppText variant="headlineSm">N° {reference}</AppText>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 10 }}>
            <Line label="Opérateur" value={`${op.label} CI (${user.maskedPhone})`} />
            <Line label={`Montant débité ${op.label}`} value={`${formatAmount(amount)} FCFA`} strong />
            <Line label="Frais de recharge" value={`0 FCFA (Offert par ${brand.appName})`} accent={colors.secondary} />
            <Line label="Recharge de base" value={`${formatAmount(amount)} ${brand.walletUnit}`} />
            <View style={[styles.between, styles.bonusRow]}>
              <View style={styles.row}>
                <Icon name="workspace-premium" size={16} color={colors.tertiary} />
                <AppText variant="labelMd" color={colors.primary}>
                  Bonus Fidélité Gold (+5%)
                </AppText>
              </View>
              <AppText variant="headlineSm" color={colors.primary}>
                +{formatAmount(bonus)} {brand.walletUnit}
              </AppText>
            </View>
            <View style={styles.between}>
              <AppText variant="headlineSm">Total net crédité</AppText>
              <AppText variant="currency" color={colors.primary}>
                +{formatAmount(total)} {brand.walletUnit}
              </AppText>
            </View>
            <Line label="Réf. d'autorisation BCEAO" value={`BCEAO-CI-${reference}`} accent={colors.outline} />
          </View>

          {/* Découpe pointillée */}
          <View style={styles.cut}>
            <View style={[styles.notch, { marginLeft: -12 }]} />
            <View style={styles.dashes} />
            <View style={[styles.notch, { marginRight: -12 }]} />
          </View>

          <View style={{ paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' }}>
            <View style={styles.barcode}>
              {BARS.map((w, i) => (
                <View key={i} style={{ width: w, height: 32, borderRadius: 3, backgroundColor: colors.onSurface }} />
              ))}
            </View>
            <AppText variant="labelSm" color={colors.outline} style={{ marginTop: 6, letterSpacing: 2 }}>
              {reference.split('-').join(' • ')} • CI
            </AppText>
          </View>
        </View>

        {/* Reçu PDF / Partager */}
        <View style={[styles.row, { gap: 8 }]}>
          <Touchable style={styles.halfBtn} onPress={() => setNotice(`Reçu PDF envoyé à ${user.email}`)}>
            <Icon name="download" size={20} color={colors.primary} />
            <AppText variant="labelMd">Reçu PDF</AppText>
          </Touchable>
          <Touchable style={styles.halfBtn} onPress={share}>
            <Icon name="share" size={20} color={colors.primary} />
            <AppText variant="labelMd">Partager</AppText>
          </Touchable>
        </View>

        <View style={styles.mail}>
          <Icon name="mark-email-read" size={20} color={colors.secondary} />
          <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={2} style={{ flex: 1 }}>
            {notice ?? (
              <>
                Reçu officiel envoyé à{' '}
                <AppText variant="labelMd" color={colors.onSurface}>
                  {user.email}
                </AppText>
              </>
            )}
          </AppText>
        </View>

        {/* Actions */}
        <Touchable style={styles.primary} scale={0.98} onPress={() => router.navigate('/')}>
          <AppText variant="headlineSm" color={colors.onSecondaryFixed}>
            Commander une course
          </AppText>
          <Icon name="arrow-forward" size={22} color={colors.onSecondaryFixed} />
        </Touchable>
        <Touchable style={styles.secondary} scale={0.98} onPress={() => router.navigate('/portefeuille')}>
          <Icon name="account-balance-wallet" size={20} color={colors.primary} />
          <AppText variant="labelLg" color={colors.primary}>
            Consulter mon portefeuille
          </AppText>
        </Touchable>

        <View style={[styles.row, { justifyContent: 'center', gap: 6, paddingHorizontal: 16 }]}>
          <Icon name="lock" size={16} color={colors.outline} />
          <AppText variant="labelSm" color={colors.outline} style={{ textAlign: 'center', flexShrink: 1 }}>
            Paiement certifié {op.label} Mobile Money & BCEAO Côte d'Ivoire. Traçabilité garantie.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  roundBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 2px rgba(0,0,0,0.06)' },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surfaceHigh },
  celebrate: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  badgeWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  badge: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.lime },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surfaceContainer },
  hero: { borderRadius: 16, padding: 24, paddingBottom: 0, overflow: 'hidden', boxShadow: '0px 20px 25px -5px rgba(51,16,179,0.2)' },
  heroGlow: { position: 'absolute', right: -32, top: -32, width: 176, height: 176, borderRadius: 88, backgroundColor: 'rgba(198,243,56,0.15)' },
  bonusTag: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 8, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)' },
  bolt: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  evolution: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  receipt: { borderRadius: 16, backgroundColor: colors.surfaceLowest, overflow: 'hidden', boxShadow: '0px 10px 15px -3px rgba(27,24,49,0.05)' },
  receiptHead: { padding: 24, backgroundColor: colors.surfaceLow },
  logo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bonusRow: { backgroundColor: colors.surfaceLow, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 24 },
  cut: { flexDirection: 'row', alignItems: 'center', height: 28, marginVertical: 8 },
  notch: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface },
  dashes: { flex: 1, marginHorizontal: 4, borderBottomWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant },
  barcode: { width: '100%', height: 48, borderRadius: 24, backgroundColor: colors.surfaceLow, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  halfBtn: { flex: 1, height: 48, borderRadius: 999, backgroundColor: colors.surfaceHigh, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mail: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, backgroundColor: colors.surfaceLow },
  primary: {
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: shadows.lime,
  },
  secondary: { height: 48, borderRadius: 999, backgroundColor: colors.surfaceContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
