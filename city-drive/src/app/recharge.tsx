import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Dot, Icon, Pill, Touchable } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts, shadows } from '@/constants/theme';
import { formatAmount, user } from '@/data/mock';
import { OPERATORS, bonusOf, useWallet } from '@/data/wallet';

const EXPIRY_SECONDS = 299;


type Step = 'idle' | 'redirect' | 'authorizing' | 'done';

const STEPS = [
  (op: string) => (
    <>
      Appuyez sur <AppText variant="bodySm" style={{ fontFamily: fonts.dm700 }}>« Payer »</AppText> ci-dessous pour déclencher la passerelle {op}.
    </>
  ),
  (op: string) => <>Validez le paiement sans frais dans votre application {op} ou via la notification de validation.</>,
  () => <>Votre solde {brand.appName} et votre statut de course sont immédiatement actualisés.</>,
];

export default function RechargeConfirmScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ amount?: string; operator?: string }>();
  const amount = Number(params.amount) || 10000;
  const op = OPERATORS.find((o) => o.id === params.operator) ?? OPERATORS[0];
  const bonus = bonusOf(amount);

  const { balance, recharge } = useWallet();
  const [startBalance] = useState(balance);
  const [remaining, setRemaining] = useState(EXPIRY_SECONDS);
  const [remember, setRemember] = useState(true);
  const [step, setStep] = useState<Step>('idle');
  const reference = useMemo(() => `${op.label.slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`, [op.label]);

  const expired = remaining <= 0 && step === 'idle';

  // Compte à rebours de validité de la demande.
  useEffect(() => {
    if (step !== 'idle') return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [step]);

  // Simule la redirection vers l'opérateur puis l'autorisation.
  useEffect(() => {
    if (step === 'redirect') {
      const id = setTimeout(() => setStep('authorizing'), 1200);
      return () => clearTimeout(id);
    }
    if (step === 'authorizing') {
      const id = setTimeout(() => {
        recharge(amount, bonus, op.name);
        setStep('done');
        router.replace({
          pathname: '/recu',
          params: { amount: String(amount), operator: op.id, ref: reference, old: String(startBalance) },
        });
      }, 1500);
      return () => clearTimeout(id);
    }
  }, [step, amount, bonus, op.name, op.id, recharge, reference, startBalance]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Touchable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
            <Icon name="arrow-back" size={24} />
          </Touchable>
          <AppText variant="headlineSm" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
            Confirmation de recharge
          </AppText>
          <View style={styles.avatar}>
            <Icon name="person" size={18} color={colors.onPrimary} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {/* Statut + minuteur */}
        <View style={[styles.between, { flexWrap: 'wrap', rowGap: 6 }]}>
          <View style={styles.stepChip}>
            <Dot color={step === 'done' ? colors.secondary : colors.secondaryContainer} />
            <AppText variant="labelSm" color={colors.primary}>
              {step === 'done' ? 'RECHARGE RÉUSSIE' : 'ÉTAPE DE CONFIRMATION'}
            </AppText>
          </View>
          {step !== 'done' && (
            <View style={styles.row}>
              <Icon name="timer" size={16} color={expired ? '#ba1a1a' : colors.onSurfaceVariant} />
              <AppText variant="labelSm" color={expired ? '#ba1a1a' : colors.onSurfaceVariant}>
                {expired ? 'Demande expirée' : 'Expire dans '}
                {!expired && (
                  <AppText variant="labelSm" color={colors.onSurface}>
                    {mm}:{ss}
                  </AppText>
                )}
              </AppText>
            </View>
          )}
        </View>

        {/* Montant */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Pill background={colors.secondaryContainer} style={styles.offered}>
            <Icon name="stars" size={14} color={colors.onSecondaryFixed} />
            <AppText variant="labelSm" color={colors.onSecondaryFixed}>
              +{formatAmount(bonus)} {brand.walletUnit} Offerts
            </AppText>
          </Pill>
          <AppText variant="labelMd" color={colors.onSurfaceVariant}>
            Montant à créditer
          </AppText>
          <View style={[styles.row, { alignItems: 'baseline', gap: 8 }]}>
            <AppText variant="displayLg">{formatAmount(amount)}</AppText>
            <AppText variant="headlineSm" color={colors.primary}>
              FCFA
            </AppText>
          </View>
          <View style={styles.reward}>
            <View style={[styles.row, { gap: 8, flex: 1 }]}>
              <View style={styles.rewardIcon}>
                <Icon name="toll" size={16} color={colors.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="labelSm" style={{ fontFamily: fonts.dm600 }}>
                  {brand.appName} Pass Gold Club
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  Recharge boostée à {formatAmount(amount + bonus)} {brand.walletUnit}
                </AppText>
              </View>
            </View>
            <AppText variant="headlineSm" color={colors.primary} style={{ fontFamily: fonts.sora700 }}>
              +5%
            </AppText>
          </View>
        </View>

        {/* Opérateur */}
        <View style={styles.card}>
          <View style={styles.between}>
            <View style={[styles.row, { gap: 10, flex: 1 }]}>
              <View style={styles.opIcon}>
                <Icon name={op.icon} size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { gap: 6 }]}>
                  <AppText variant="headlineSm">{op.label} CI</AppText>
                  <Pill background={colors.surfaceContainer} style={{ paddingHorizontal: 8, paddingVertical: 1 }}>
                    <AppText variant="labelSm" color={colors.secondary}>
                      0% Frais
                    </AppText>
                  </Pill>
                </View>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  Paiement mobile instantané
                </AppText>
              </View>
            </View>
            {step === 'idle' && (
              <Touchable style={styles.modify} onPress={() => router.back()}>
                <AppText variant="labelMd" color={colors.primary}>
                  Modifier
                </AppText>
              </Touchable>
            )}
          </View>
          <View style={[styles.between, styles.phone]}>
            <View style={[styles.row, { gap: 8 }]}>
              <Icon name="phone-iphone" size={18} color={colors.onSurfaceVariant} />
              <AppText variant="headlineSm" style={{ letterSpacing: 1, fontFamily: fonts.dm700 }}>
                {user.maskedPhone}
              </AppText>
            </View>
            <Icon name="check-circle" size={18} color={colors.secondary} />
          </View>
        </View>

        {/* Récapitulatif */}
        <View style={[styles.card, { gap: 10 }]}>
          <AppText variant="labelMd" color={colors.onSurfaceVariant}>
            RÉCAPITULATIF DE TRANSACTION
          </AppText>
          <View style={styles.between}>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              Montant à débiter
            </AppText>
            <AppText variant="headlineSm">{formatAmount(amount)} FCFA</AppText>
          </View>
          <View style={styles.between}>
            <View style={styles.row}>
              <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                Frais {op.label}
              </AppText>
              <Icon name="info-outline" size={14} color={colors.onSurfaceVariant} />
            </View>
            <AppText variant="labelMd" color={colors.secondary}>
              0 FCFA (offert par {brand.appName})
            </AppText>
          </View>
          <View style={styles.between}>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              Crédit standard
            </AppText>
            <AppText variant="bodyMd" style={{ fontFamily: fonts.dm600 }}>
              {formatAmount(amount)} {brand.walletUnit}
            </AppText>
          </View>
          <View style={styles.between}>
            <AppText variant="bodyMd" color={colors.secondary} style={{ fontFamily: fonts.dm600 }}>
              Bonus Gold Club (+5%)
            </AppText>
            <AppText variant="headlineSm" color={colors.secondary} style={{ fontFamily: fonts.sora700 }}>
              +{formatAmount(bonus)} {brand.walletUnit}
            </AppText>
          </View>
          <View style={styles.projection}>
            <View>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {step === 'done' ? 'Solde portefeuille' : 'Nouveau solde portefeuille'}
              </AppText>
              <AppText variant="currency" color={colors.primary}>
                {formatAmount(step === 'done' ? balance : startBalance + amount + bonus)}{' '}
                <AppText variant="labelLg" color={colors.primary}>
                  {brand.walletUnit}
                </AppText>
              </AppText>
            </View>
            <View style={styles.projIcon}>
              <Icon name="account-balance-wallet" size={20} color={colors.onSecondaryFixed} />
            </View>
          </View>
          <View style={styles.between}>
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              Réf. transaction
            </AppText>
            <AppText variant="labelSm">{reference}</AppText>
          </View>
        </View>

        {/* Processus */}
        <View style={styles.process}>
          <View style={styles.row}>
            <Icon name="verified-user" size={20} color={colors.primary} />
            <AppText variant="headlineSm" color={colors.primary}>
              Processus de validation
            </AppText>
          </View>
          {STEPS.map((text, i) => (
            <View key={i} style={[styles.row, { alignItems: 'flex-start', gap: 8 }]}>
              <View style={styles.stepNum}>
                <AppText variant="labelSm" color={colors.onPrimary}>
                  {i + 1}
                </AppText>
              </View>
              <AppText variant="bodySm" style={{ flex: 1 }}>
                {text(op.label)}
              </AppText>
            </View>
          ))}
          <View style={[styles.between, { paddingTop: 8 }]}>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" style={{ fontFamily: fonts.dm600 }}>
                Mémoriser pour mes prochaines recharges
              </AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Recharge en un clic pour vos courses à {brand.city}
              </AppText>
            </View>
            <Touchable
              accessibilityRole="switch"
              accessibilityState={{ checked: remember }}
              onPress={() => setRemember((v) => !v)}
              style={[styles.toggle, { backgroundColor: remember ? colors.primary : colors.outlineVariant }]}
            >
              <View style={[styles.knob, { alignSelf: remember ? 'flex-end' : 'flex-start' }]} />
            </Touchable>
          </View>
        </View>

        {/* Actions */}
        {step === 'done' ? (
          <Touchable style={[styles.pay, styles.payDone]} scale={0.98} onPress={() => router.back()}>
            <View style={[styles.row, { gap: 8 }]}>
              <Icon name="check-circle" size={20} color={colors.onPrimary} />
              <AppText variant="headlineSm" color={colors.onPrimary} style={{ fontFamily: fonts.sora700 }}>
                +{formatAmount(amount + bonus)} {brand.walletUnit} crédités
              </AppText>
            </View>
            <View style={[styles.payArrow, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Icon name="arrow-forward" size={20} color={colors.onPrimary} />
            </View>
          </Touchable>
        ) : (
          <Touchable
            disabled={step !== 'idle' || expired}
            scale={0.98}
            onPress={() => setStep('redirect')}
            style={[styles.pay, expired && { opacity: 0.5 }]}
          >
            {step === 'idle' ? (
              <>
                <View style={[styles.row, { gap: 8 }]}>
                  <Icon name="lock" size={20} color={colors.onSecondaryFixed} />
                  <AppText variant="headlineSm" color={colors.onSecondaryFixed} style={{ fontFamily: fonts.sora700 }}>
                    Payer {formatAmount(amount)} FCFA
                  </AppText>
                </View>
                <View style={styles.payArrow}>
                  <Icon name="arrow-forward" size={20} color={colors.onSecondaryFixed} />
                </View>
              </>
            ) : (
              <View style={[styles.row, { flex: 1, justifyContent: 'center', gap: 8 }]}>
                <ActivityIndicator color={step === 'redirect' ? colors.onSecondaryFixed : colors.primary} />
                <AppText
                  variant="headlineSm"
                  color={step === 'redirect' ? colors.onSecondaryFixed : colors.primary}
                  style={{ fontFamily: fonts.sora700 }}
                >
                  {step === 'redirect' ? `Redirection vers ${op.label}…` : 'Autorisation en cours…'}
                </AppText>
              </View>
            )}
          </Touchable>
        )}

        {step === 'idle' && (
          <Touchable style={styles.cancel} onPress={() => router.back()}>
            <AppText variant="labelLg">Annuler la transaction</AppText>
          </Touchable>
        )}

        <View style={[styles.row, { justifyContent: 'center', gap: 6 }]}>
          <Icon name="verified" size={16} color={colors.secondary} />
          <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ textAlign: 'center', flexShrink: 1 }}>
            Paiement chiffré 256-bit certifié BCEAO & {op.label} Côte d'Ivoire
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
  header: { backgroundColor: 'rgba(252,248,255,0.92)', boxShadow: '0px 1px 8px rgba(75,54,201,0.06)', zIndex: 10 },
  headerInner: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 },
  back: { width: 48, height: 48, marginLeft: -8, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surfaceHigh },
  hero: { borderRadius: 32, backgroundColor: colors.surfaceLowest, padding: 24, gap: 4, overflow: 'hidden', boxShadow: '0px 20px 25px -5px rgba(75,54,201,0.06)' },
  heroGlow: { position: 'absolute', right: -40, bottom: -40, width: 144, height: 144, borderRadius: 72, backgroundColor: 'rgba(228,223,255,0.4)' },
  offered: { position: 'absolute', right: 16, top: 16, paddingHorizontal: 12, paddingVertical: 4 },
  reward: { marginTop: 12, padding: 8, borderRadius: 16, backgroundColor: colors.surfaceLow, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rewardIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 32, backgroundColor: colors.surfaceLowest, padding: 16, gap: 8, boxShadow: shadows.card },
  opIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  modify: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surfaceHigh },
  phone: { paddingHorizontal: 8, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.surfaceLow },
  projection: { marginTop: 4, padding: 8, borderRadius: 24, backgroundColor: colors.surfaceHigh, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  projIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  process: { borderRadius: 32, backgroundColor: colors.surfaceLow, padding: 16, gap: 8 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' },
  pay: {
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 12,
    boxShadow: '0px 10px 20px -4px rgba(198,243,56,0.4)',
  },
  payDone: { backgroundColor: colors.primary, boxShadow: shadows.primary },
  payArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  cancel: { height: 48, borderRadius: 999, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
});
