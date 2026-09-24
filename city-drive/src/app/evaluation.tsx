import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Avatar, Icon, Pill, Touchable, type IconName } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';
import { formatAmount } from '@/data/mock';
import { useRide } from '@/data/ride';
import { useWallet } from '@/data/wallet';

const RATING_LABELS = ['', 'Décevant', 'Passable', 'Bien', 'Très bon trajet', 'Exceptionnel !'];

const COMPLIMENTS: { id: string; icon: IconName; label: string }[] = [
  { id: 'drive', icon: 'directions-car', label: 'Conduite souple' },
  { id: 'ac', icon: 'ac-unit', label: 'Climatisation parfaite' },
  { id: 'talk', icon: 'chat', label: 'Excellente conversation' },
  { id: 'time', icon: 'bolt', label: 'Ponctualité au top' },
  { id: 'music', icon: 'music-note', label: 'Bonne musique' },
  { id: 'clean', icon: 'sanitizer', label: 'Véhicule très propre' },
];

const TIPS = [0, 200, 500, 1000];
const RECOMMENDED_TIP = 500;

type Status = 'idle' | 'sending' | 'done';

export default function RatingScreen() {
  const insets = useSafeAreaInsets();
  const ride = useRide();
  // Course à noter : celle qui vient de se terminer, sinon la dernière non notée.
  const r = ride.current?.status === 'completed' && ride.current.rating === null ? ride.current : ride.history.find((h) => h.status === 'completed' && h.rating === null);
  const driver = r?.driver ?? ride.favoriteDriver;
  const firstName = driver.fullName.split(' ')[0];
  const price = r?.fare ?? 0;

  const { balance } = useWallet();
  const [rating, setRating] = useState(5);
  const [compliments, setCompliments] = useState<string[]>(['drive', 'ac', 'time']);
  const [tip, setTip] = useState<number | 'custom'>(RECOMMENDED_TIP);
  const [customTip, setCustomTip] = useState('');
  const [favorite, setFavorite] = useState(ride.favoriteDriver.id === driver.id);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const tipAmount = tip === 'custom' ? Math.max(0, Math.round(Number(customTip.replace(/\s/g, '')) || 0)) : tip;

  const toggleCompliment = (id: string) =>
    setCompliments((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const submit = () => {
    setError(null);
    if (!r) {
      setError('Aucune course terminée à noter.');
      return;
    }
    if (tipAmount > balance) {
      setError('Solde insuffisant pour ce pourboire : choisissez un montant plus petit ou rechargez.');
      return;
    }
    const err = ride.rate(rating, tipAmount, favorite);
    if (err) {
      setError(err);
      return;
    }
    setStatus('sending');
  };

  // Note et pourboire enregistrés par ride.rate ; court délai d'envoi puis retour à l'accueil.
  useEffect(() => {
    if (status === 'sending') {
      const id = setTimeout(() => setStatus('done'), 600);
      return () => clearTimeout(id);
    }
    if (status === 'done') {
      const id = setTimeout(() => {
        ride.dismiss();
        router.navigate('/');
      }, 900);
      return () => clearTimeout(id);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!r && status === 'idle') {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top }]}>
        <Icon name="star" size={40} color={colors.outline} />
        <AppText variant="headlineSm">Aucune course à noter</AppText>
        <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
          Vous pourrez noter votre chauffeur à la fin de votre prochaine course.
        </AppText>
        <Touchable style={styles.emptyCta} onPress={() => router.navigate('/')}>
          <AppText variant="labelLg" color={colors.onPrimary}>
            Retour à l&apos;accueil
          </AppText>
        </Touchable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Touchable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.headerBtn}>
            <Icon name="arrow-back" size={24} />
          </Touchable>
          <AppText variant="headlineSm" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
            Évaluation & pourboire
          </AppText>
          <Touchable accessibilityLabel="Fermer" onPress={() => router.navigate('/')} style={styles.headerBtn}>
            <Icon name="close" size={24} color={colors.onSurfaceVariant} />
          </Touchable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Trajet terminé */}
        <View style={styles.success}>
          <View style={[styles.row, { gap: 8 }]}>
            <View style={styles.verified}>
              <Icon name="verified" size={18} color={colors.onSecondaryContainer} />
            </View>
            <AppText variant="headlineSm" color={colors.primary} style={{ letterSpacing: -0.3 }}>
              Trajet terminé avec succès !
            </AppText>
          </View>
          <View style={{ paddingLeft: 36, gap: 4, marginTop: 4 }}>
            <View style={styles.row}>
              <AppText variant="labelLg" numberOfLines={1} style={{ flexShrink: 1 }}>
                {r?.pickup.name ?? '—'}
              </AppText>
              <Icon name="arrow-forward" size={16} color={colors.primary} />
              <AppText variant="labelLg" numberOfLines={1} style={{ flexShrink: 1 }}>
                {r?.destination.name ?? '—'}
              </AppText>
            </View>
            <View style={[styles.row, { gap: 8, flexWrap: 'wrap' }]}>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                {r?.route.minutes ?? 0} min
              </AppText>
              <View style={styles.sep} />
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                {(r?.route.km ?? 0).toString().replace('.', ',')} km
              </AppText>
              <View style={styles.sep} />
              <AppText variant="labelSm" color={colors.primary}>
                {r?.paidWith === 'wallet' ? `${formatAmount(price)} ${brand.walletUnit} prélevés` : r?.paidWith === 'mobile_money' ? `${formatAmount(price)} F par Mobile Money` : `${formatAmount(price)} F en espèces`}
              </AppText>
            </View>
          </View>
        </View>

        {/* Chauffeur + note */}
        <View style={[styles.card, { alignItems: 'center' }]}>
          <View style={styles.avatarRing}>
            <Avatar name={driver.fullName} size={72} radius={36} />
            <View style={styles.ratingBadge}>
              <Icon name="star" size={12} color={colors.secondaryContainer} />
              <AppText variant="labelSm" color={colors.onPrimary}>
                {driver.rating.toFixed(1).replace('.', ',')}
              </AppText>
            </View>
          </View>
          <AppText variant="headlineSm">{driver.fullName}</AppText>
          <View style={[styles.row, { gap: 8 }]}>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              {driver.car}
            </AppText>
            <View style={styles.sep} />
            <Pill background={colors.surfaceContainer} style={{ paddingHorizontal: 8 }}>
              <AppText variant="labelSm" style={{ letterSpacing: 1 }}>
                {driver.plate}
              </AppText>
            </Pill>
          </View>
          <AppText variant="bodySm" color={colors.outline}>
            {driver.trips} courses complétées
          </AppText>

          <View style={styles.divider} />
          <AppText variant="labelLg" style={{ fontFamily: fonts.sora600, textAlign: 'center', marginBottom: 8 }}>
            Comment s'est passée votre course avec {firstName} ?
          </AppText>
          <View style={styles.row}>
            {[1, 2, 3, 4, 5].map((v) => (
              <Touchable key={v} accessibilityLabel={`${v} étoile${v > 1 ? 's' : ''}`} onPress={() => setRating(v)} style={{ padding: 4 }} scale={0.85}>
                <Icon name={v <= rating ? 'star' : 'star-border'} size={36} color={v <= rating ? colors.secondary : colors.outlineVariant} />
              </Touchable>
            ))}
          </View>
          <AppText variant="labelLg" color={colors.primary} style={{ marginTop: 4 }}>
            {RATING_LABELS[rating]}
          </AppText>
        </View>

        {/* Compliments */}
        <View style={styles.card}>
          <View style={[styles.between, { marginBottom: 8 }]}>
            <AppText variant="headlineSm">Ce que vous avez apprécié</AppText>
            <AppText variant="labelSm" color={colors.outline}>
              Optionnel
            </AppText>
          </View>
          <View style={styles.wrap}>
            {COMPLIMENTS.map((c) => {
              const on = compliments.includes(c.id);
              return (
                <Touchable key={c.id} onPress={() => toggleCompliment(c.id)} style={[styles.chip, on && { backgroundColor: colors.primaryContainer }]}>
                  <Icon name={c.icon} size={18} color={on ? colors.onPrimary : colors.onSurface} />
                  <AppText variant="labelMd" color={on ? colors.onPrimary : colors.onSurface}>
                    {c.label}
                  </AppText>
                </Touchable>
              );
            })}
          </View>
        </View>

        {/* Pourboire */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Icon name="payments" size={20} color={colors.primary} />
            <AppText variant="headlineSm">Ajouter un pourboire pour {firstName}</AppText>
          </View>
          <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ marginBottom: 16 }}>
            100% du pourboire est directement reversé au chauffeur sur son compte {brand.appName}.
          </AppText>
          <View style={styles.tips}>
            {TIPS.map((t) => {
              const on = tip === t;
              return (
                <Touchable key={t} onPress={() => setTip(t)} style={[styles.tip, on && styles.tipOn]}>
                  {t === RECOMMENDED_TIP && (
                    <View style={styles.advice}>
                      <AppText variant="labelSm" color={colors.onPrimary}>
                        Conseillé
                      </AppText>
                    </View>
                  )}
                  <AppText variant={t === 0 ? 'labelMd' : 'labelLg'} color={on ? colors.onSecondaryContainer : colors.onSurface}>
                    {t === 0 ? 'Aucun' : `${formatAmount(t)} ${brand.walletUnit}`}
                  </AppText>
                  <AppText variant="labelSm" color={on ? colors.onSecondaryContainer : colors.outline} style={{ fontFamily: fonts.dm400 }}>
                    {t === 0 ? `0 ${brand.walletUnit}` : `≈ ${formatAmount(t)} FCFA`}
                  </AppText>
                </Touchable>
              );
            })}
            <Touchable onPress={() => setTip('custom')} style={[styles.tip, styles.tipWide, tip === 'custom' && styles.tipOn]}>
              <View style={styles.row}>
                <Icon name="edit" size={20} color={tip === 'custom' ? colors.onSecondaryContainer : colors.onSurface} />
                <AppText variant="labelMd" color={tip === 'custom' ? colors.onSecondaryContainer : colors.onSurface} style={{ fontFamily: fonts.dm700 }}>
                  Autre montant
                </AppText>
              </View>
            </Touchable>
          </View>
          {tip === 'custom' && (
            <View style={styles.customTip}>
              <TextInput
                value={customTip}
                onChangeText={(v) => setCustomTip(v.replace(/[^0-9]/g, ''))}
                placeholder="Montant personnalisé"
                placeholderTextColor={colors.outline}
                keyboardType="number-pad"
                autoFocus
                style={styles.customInput}
              />
              <AppText variant="labelMd" color={colors.primary} style={{ fontFamily: fonts.sora600 }}>
                {brand.walletUnit}
              </AppText>
            </View>
          )}
          <View style={[styles.row, { gap: 8, marginTop: 16 }]}>
            <Icon name="account-balance-wallet" size={18} color={colors.primary} />
            <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ flex: 1 }}>
              Débité de votre Portefeuille (Solde :{' '}
              <AppText variant="bodySm" style={{ fontFamily: fonts.dm700 }}>
                {formatAmount(balance)} {brand.walletUnit}
              </AppText>
              )
            </AppText>
          </View>
        </View>

        {/* Favori + message */}
        <View style={[styles.card, { gap: 16 }]}>
          <View style={styles.between}>
            <View style={[styles.row, { gap: 12, flex: 1 }]}>
              <View style={styles.heart}>
                <Icon name={favorite ? 'favorite' : 'favorite-border'} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="labelLg" style={{ fontFamily: fonts.sora600 }}>
                  Chauffeur favori
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  Proposer {firstName} en priorité pour vos trajets
                </AppText>
              </View>
            </View>
            <Touchable
              accessibilityRole="switch"
              accessibilityState={{ checked: favorite }}
              onPress={() => setFavorite((f) => !f)}
              style={[styles.toggle, { backgroundColor: favorite ? colors.primary : colors.surfaceContainer }]}
            >
              <View style={[styles.knob, { alignSelf: favorite ? 'flex-end' : 'flex-start' }]} />
            </Touchable>
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="labelMd">Message personnel</AppText>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={`Laisser un mot gentil ou une remarque pour ${firstName}...`}
              placeholderTextColor={colors.outline}
              multiline
              numberOfLines={2}
              style={styles.note}
            />
          </View>
        </View>

        {error && (
          <AppText variant="labelMd" color="#ba1a1a" style={{ textAlign: 'center' }}>
            {error}
          </AppText>
        )}

        <Touchable
          disabled={status !== 'idle'}
          scale={0.98}
          onPress={submit}
          style={[styles.submit, status === 'done' && { backgroundColor: colors.primary }]}
        >
          {status === 'idle' && (
            <>
              <AppText variant="labelLg" color={colors.onSecondaryContainer} style={{ fontFamily: fonts.sora600 }}>
                {tipAmount > 0 ? `Valider & envoyer (+${formatAmount(tipAmount)} ${brand.walletUnit})` : "Valider & envoyer l'avis"}
              </AppText>
              <Icon name="arrow-forward" size={20} color={colors.onSecondaryContainer} />
            </>
          )}
          {status === 'sending' && (
            <>
              <ActivityIndicator color={colors.onSecondaryContainer} />
              <AppText variant="labelLg" color={colors.onSecondaryContainer}>
                Transmission...
              </AppText>
            </>
          )}
          {status === 'done' && (
            <>
              <Icon name="check-circle" size={20} color={colors.onPrimary} />
              <AppText variant="labelLg" color={colors.onPrimary}>
                Merci pour votre retour !
              </AppText>
            </>
          )}
        </Touchable>
        {status === 'idle' && (
          <Touchable style={styles.skip} onPress={() => router.navigate('/')}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant}>
              Passer cette étape
            </AppText>
          </Touchable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyCta: { marginTop: 8, paddingHorizontal: 24, height: 48, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  header: { backgroundColor: 'rgba(250,250,251,0.92)', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)', zIndex: 10 },
  headerInner: { height: 64, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' },
  headerBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  success: { borderRadius: 16, backgroundColor: colors.surfaceContainer, padding: 16, overflow: 'hidden' },
  verified: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  sep: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant },
  card: { borderRadius: 16, backgroundColor: colors.surfaceLowest, padding: 16, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  avatarRing: { width: 80, height: 80, borderRadius: 40, padding: 4, backgroundColor: colors.surfaceContainer, marginBottom: 8, marginTop: -4 },
  ratingBadge: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  divider: { alignSelf: 'stretch', height: 1, backgroundColor: colors.surfaceContainer, marginVertical: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.surfaceContainer },
  tips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tip: { width: '31.5%', flexGrow: 1, height: 56, borderRadius: 16, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  tipWide: { width: '64%' },
  tipOn: { backgroundColor: colors.secondaryContainer },
  advice: { position: 'absolute', top: -10, backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 1, borderRadius: 12 },
  customTip: { flexDirection: 'row', alignItems: 'center', marginTop: 12, height: 48, borderRadius: 12, paddingHorizontal: 16, backgroundColor: colors.surfaceContainer },
  customInput: { flex: 1, fontFamily: fonts.sora600, fontSize: 15, color: colors.onSurface, paddingVertical: 0, outlineWidth: 0 },
  heart: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  note: {
    minHeight: 72,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surfaceContainer,
    fontFamily: fonts.dm400,
    fontSize: 15,
    color: colors.onSurface,
    textAlignVertical: 'top',
    outlineWidth: 0,
  },
  submit: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
    marginTop: 8,
  },
  skip: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
