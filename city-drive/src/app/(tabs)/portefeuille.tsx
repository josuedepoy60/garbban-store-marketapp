import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Dot, Icon, Pill, Touchable, type IconName } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts, shadows } from '@/constants/theme';
import { formatAmount } from '@/data/mock';
import { OPERATORS, bonusOf, useWallet, type TxKind } from '@/data/wallet';

const AMOUNTS = [2000, 5000, 10000, 25000];

type Filter = 'all' | 'course' | 'recharge';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'course', label: 'Courses' },
  { id: 'recharge', label: 'Recharges' },
];

const TX_STYLE: Record<TxKind, { icon: IconName; bg: string; fg: string; tag: string }> = {
  course: { icon: 'local-taxi', bg: colors.surfaceContainer, fg: colors.primary, tag: 'Course' },
  recharge: { icon: 'add-card', bg: 'rgba(198,243,56,0.3)', fg: colors.secondary, tag: 'Recharge' },
  peage: { icon: 'toll', bg: colors.surfaceHigh, fg: colors.onSurfaceVariant, tag: 'Péage' },
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Touchable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.toggle, { backgroundColor: value ? colors.primary : colors.surfaceHighest }]}
    >
      <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </Touchable>
  );
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { balance, transactions } = useWallet();
  const [operator, setOperator] = useState(OPERATORS[0].id);
  const [amount, setAmount] = useState(25000);
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);
  const [autoPay, setAutoPay] = useState(true);

  const op = OPERATORS.find((o) => o.id === operator) ?? OPERATORS[0];
  const filtered = transactions.filter((t) => filter === 'all' || t.kind === filter);
  const visible = showAll ? filtered : filtered.slice(0, 4);

  const doRecharge = () => router.push({ pathname: '/recharge', params: { amount: String(amount), operator: op.id } });

  return (
    <View style={styles.screen}>
      {/* En-tête */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <View style={[styles.row, { gap: 8 }]}>
            <View style={styles.headerIcon}>
              <Icon name="account-balance-wallet" size={22} color={colors.primary} />
            </View>
            <AppText variant="headlineMd" style={{ letterSpacing: -0.3 }}>
              Portefeuille
            </AppText>
          </View>
          <View style={styles.row}>
            <Touchable accessibilityLabel="Notifications" style={styles.bell}>
              <Icon name="notifications-none" size={24} color={colors.onSurfaceVariant} />
              <View style={styles.bellDot} />
            </Touchable>
            <Touchable style={styles.avatar} onPress={() => router.navigate('/compte')} accessibilityLabel="Profil">
              <Icon name="person" size={18} color={colors.onPrimary} />
            </Touchable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        {/* Carte virtuelle */}
        <View style={styles.card}>
          <View style={styles.glowLime} />
          <View style={styles.glowViolet} />

          <View style={styles.between}>
            <View style={styles.row}>
              <Dot color={colors.secondaryContainer} size={12} />
              <AppText variant="headlineSm" color={colors.onPrimary} style={{ letterSpacing: -0.3 }}>
                {brand.appName.toUpperCase()} PASS
              </AppText>
              <Pill background="rgba(255,255,255,0.15)" style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
                <AppText variant="labelSm" color={colors.secondaryContainer}>
                  GOLD CLUB
                </AppText>
              </Pill>
            </View>
            <View style={[styles.row, { opacity: 0.8 }]}>
              <Icon name="contactless" size={20} color={colors.onPrimary} />
              <Icon name="shield" size={20} color={colors.onPrimary} />
            </View>
          </View>

          <View style={{ marginVertical: 12 }}>
            <View style={[styles.row, { alignItems: 'baseline' }]}>
              <AppText variant="displayLg" color={colors.onPrimary}>
                {formatAmount(balance)}
              </AppText>
              <AppText variant="headlineMd" color={colors.secondaryContainer} style={{ fontFamily: fonts.sora700 }}>
                {brand.walletUnit}
              </AppText>
            </View>
            <View style={[styles.row, { flexWrap: 'wrap' }]}>
              <AppText variant="bodySm" color={colors.onPrimaryContainer}>
                ≈ {formatAmount(balance)} FCFA •
              </AppText>
              <Icon name="percent" size={15} color={colors.secondaryContainer} />
              <AppText variant="labelSm" color={colors.secondaryContainer}>
                +5% de cashback sur les trajets
              </AppText>
            </View>
          </View>

          <View style={[styles.row, { gap: 6 }]}>
            <Touchable style={[styles.cardBtn, { backgroundColor: colors.secondaryContainer }]} onPress={doRecharge}>
              <Icon name="bolt" size={20} color={colors.onSecondaryFixed} />
              <AppText variant="labelMd" color={colors.onSecondaryFixed} style={{ fontFamily: fonts.dm700 }}>
                Recharger
              </AppText>
            </Touchable>
            <Touchable style={styles.cardBtn}>
              <Icon name="send" size={18} color={colors.onPrimary} />
              <AppText variant="labelMd" color={colors.onPrimary} style={{ fontFamily: fonts.dm700 }}>
                Envoyer
              </AppText>
            </Touchable>
            <Touchable style={styles.cardBtn}>
              <Icon name="receipt-long" size={18} color={colors.onPrimary} />
              <AppText variant="labelMd" color={colors.onPrimary} style={{ fontFamily: fonts.dm700 }}>
                Relevé
              </AppText>
            </Touchable>
          </View>
        </View>

        {/* Recharge rapide */}
        <View style={{ gap: 16 }}>
          <View style={styles.between}>
            <View style={styles.row}>
              <Icon name="payments" size={22} color={colors.primary} />
              <AppText variant="headlineSm">Recharge Rapide</AppText>
            </View>
            <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
              <AppText variant="labelSm" color={colors.secondary}>
                Frais 0 FCFA
              </AppText>
            </Pill>
          </View>

          <View style={[styles.row, { gap: 6 }]}>
            {OPERATORS.map((o) => {
              const active = o.id === operator;
              return (
                <Touchable key={o.id} onPress={() => setOperator(o.id)} style={[styles.operator, active && styles.operatorActive]}>
                  <View style={[styles.operatorIcon, active && { backgroundColor: colors.primary }]}>
                    <Icon name={o.icon} size={24} color={active ? colors.onPrimary : colors.primary} />
                  </View>
                  <AppText variant="labelSm" numberOfLines={1}>
                    {o.label}
                  </AppText>
                  {active && <Dot color={colors.secondary} style={{ position: 'absolute', top: 6, right: 6 }} />}
                </Touchable>
              );
            })}
          </View>

          <View style={styles.amounts}>
            {AMOUNTS.map((a) => {
              const active = a === amount;
              return (
                <Touchable key={a} onPress={() => setAmount(a)} style={[styles.amount, active && { backgroundColor: colors.primaryContainer }]}>
                  <AppText variant="labelLg" color={active ? colors.onPrimary : colors.onSurface}>
                    {formatAmount(a)} F
                  </AppText>
                  {active ? (
                    <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
                      <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                        +{formatAmount(bonusOf(a))} {brand.walletUnit}
                      </AppText>
                    </Pill>
                  ) : (
                    <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                      +{formatAmount(bonusOf(a))} {brand.walletUnit}
                    </AppText>
                  )}
                </Touchable>
              );
            })}
          </View>

          <Touchable style={styles.rechargeCta} scale={0.98} onPress={doRecharge}>
            <Icon name="bolt" size={20} color={colors.onPrimary} />
            <AppText variant="headlineSm" color={colors.onPrimary} style={{ fontSize: 16 }}>
              Recharger {formatAmount(amount)} F via {op.label}
            </AppText>
          </Touchable>
        </View>

        {/* Pass Domicile - Travail */}
        <View style={styles.pass}>
          <View style={[styles.between, { alignItems: 'flex-start' }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.row}>
                <Icon name="verified-user" size={18} color={colors.tertiary} />
                <AppText variant="labelSm" color={colors.tertiary}>
                  PASS DOMICILE - TRAVAIL
                </AppText>
              </View>
              <AppText variant="headlineSm">Riviera Bonoumin ↔ Plateau CCIA</AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Économisez 20% sur vos 10 prochaines courses aux heures de pointe.
              </AppText>
            </View>
            <View style={styles.passIcon}>
              <Icon name="route" size={26} color={colors.onSecondaryFixed} />
            </View>
          </View>
          <View style={styles.gauge}>
            <View style={[styles.between, { marginBottom: 6 }]}>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                Pass actif (Février)
              </AppText>
              <AppText variant="labelSm" color={colors.primary}>
                7/10 trajets restants
              </AppText>
            </View>
            <View style={styles.gaugeTrack}>
              <View style={styles.gaugeFill} />
            </View>
          </View>
          <Touchable style={styles.softBtn}>
            <AppText variant="labelLg" color={colors.primary}>
              Gérer ou renouveler mes pass
            </AppText>
            <Icon name="arrow-forward" size={18} color={colors.primary} />
          </Touchable>
        </View>

        {/* Historique */}
        <View style={{ gap: 12 }}>
          <View style={styles.between}>
            <AppText variant="headlineSm">Historique</AppText>
            <View style={styles.segment}>
              {FILTERS.map((f) => {
                const active = f.id === filter;
                return (
                  <Touchable key={f.id} onPress={() => setFilter(f.id)} style={[styles.segmentItem, active && styles.segmentActive]}>
                    <AppText variant="labelSm" color={active ? colors.onSurface : colors.onSurfaceVariant}>
                      {f.label}
                    </AppText>
                  </Touchable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 6 }}>
            {visible.map((t) => {
              const s = TX_STYLE[t.kind];
              const color = t.kind === 'recharge' ? colors.secondary : t.kind === 'course' ? '#ba1a1a' : colors.onSurface;
              return (
                <View key={t.id} style={styles.tx}>
                  <View style={[styles.row, { gap: 10, flex: 1 }]}>
                    <View style={[styles.txIcon, { backgroundColor: s.bg }]}>
                      <Icon name={s.icon} size={22} color={s.fg} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyLg" numberOfLines={1} style={{ fontFamily: fonts.sora600, fontSize: 15, lineHeight: 22 }}>
                        {t.title}
                      </AppText>
                      <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                        {t.detail} • {t.when}
                      </AppText>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <AppText variant="headlineSm" color={color} style={{ fontSize: 15 }}>
                      {t.amount > 0 ? '+' : '-'}
                      {formatAmount(Math.abs(t.amount))} {brand.walletUnit}
                    </AppText>
                    <Pill
                      background={t.bonus ? colors.secondaryContainer : colors.surfaceContainer}
                      style={{ paddingHorizontal: 8, paddingVertical: 1 }}
                    >
                      <AppText variant="labelSm" color={t.bonus ? colors.secondary : colors.onSurfaceVariant}>
                        {t.bonus ? `+${formatAmount(t.bonus)} ${brand.walletUnit} bonus` : s.tag}
                      </AppText>
                    </Pill>
                  </View>
                </View>
              );
            })}
            {visible.length === 0 && (
              <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ textAlign: 'center', padding: 16 }}>
                Aucune transaction pour ce filtre.
              </AppText>
            )}
          </View>

          {filtered.length > 4 && (
            <Touchable style={styles.softBtn} onPress={() => setShowAll((v) => !v)}>
              <AppText variant="labelLg" color={colors.primary}>
                {showAll ? 'Réduire' : `Voir les ${filtered.length} transactions`}
              </AppText>
              <Icon name={showAll ? 'expand-less' : 'expand-more'} size={20} color={colors.primary} />
            </Touchable>
          )}
        </View>

        {/* Sécurité */}
        <View style={styles.security}>
          <View style={styles.between}>
            <View style={[styles.row, { gap: 10, flex: 1 }]}>
              <View style={styles.secIcon}>
                <Icon name="fingerprint" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="headlineSm" style={{ fontSize: 15 }}>
                  Sécurité Biométrique & PIN
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  Exigé pour les paiements {'>'} 5 000 {brand.walletUnit}
                </AppText>
              </View>
            </View>
            <Icon name="verified" size={24} color={colors.secondary} />
          </View>
          <View style={styles.between}>
            <View style={[styles.row, { gap: 10, flex: 1 }]}>
              <View style={styles.secIcon}>
                <Icon name="sync" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="headlineSm" style={{ fontSize: 15 }}>
                  Paiement automatique des courses
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  Débit transparent sans sortir de l'app
                </AppText>
              </View>
            </View>
            <Toggle value={autoPay} onChange={setAutoPay} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  header: { backgroundColor: 'rgba(252,248,255,0.92)', boxShadow: '0px 1px 8px rgba(0,0,0,0.04)', zIndex: 10 },
  headerInner: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  bell: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  card: { minHeight: 220, borderRadius: 32, backgroundColor: colors.primary, padding: 24, overflow: 'hidden', boxShadow: '0px 20px 25px -5px rgba(51,16,179,0.3)' },
  glowLime: { position: 'absolute', right: -48, top: -48, width: 192, height: 192, borderRadius: 96, backgroundColor: 'rgba(198,243,56,0.2)' },
  glowViolet: { position: 'absolute', left: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(75,54,201,0.8)' },
  cardBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  operator: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 32,
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  operatorActive: { borderColor: colors.primary },
  operatorIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amount: {
    width: '48.8%',
    flexGrow: 1,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
  },
  rechargeCta: { height: 52, borderRadius: 999, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: shadows.primary },
  pass: { borderRadius: 32, backgroundColor: colors.surfaceLowest, padding: 16, gap: 16, boxShadow: shadows.card },
  passIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  gauge: { borderRadius: 16, backgroundColor: colors.surfaceLow, padding: 8 },
  gaugeTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceContainer, overflow: 'hidden' },
  gaugeFill: { width: '70%', height: '100%', borderRadius: 4, backgroundColor: colors.primary },
  softBtn: { height: 46, borderRadius: 999, backgroundColor: colors.surfaceContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceContainer, padding: 4, borderRadius: 999 },
  segmentItem: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  segmentActive: { backgroundColor: colors.surfaceLowest, boxShadow: '0px 1px 2px rgba(0,0,0,0.06)' },
  tx: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 16,
    borderRadius: 32,
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
  },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  security: { borderRadius: 32, backgroundColor: colors.surfaceLowest, padding: 16, gap: 14, boxShadow: '0px 1px 3px rgba(0,0,0,0.08)' },
  secIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' },
});
