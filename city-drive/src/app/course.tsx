import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { AppText, Avatar, CircleButton, Icon, PingDot, Pill, Pulse, SheetHandle, Touchable } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';
import { favoriteDriver, formatAmount, photos } from '@/data/mock';
import { useWallet } from '@/data/wallet';

type Method = 'wallet' | 'cash';

export default function ActiveRideScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ price?: string }>();
  const price = Number(params.price) || 3200;
  const [method, setMethod] = useState<Method>('wallet');
  const [confirmed, setConfirmed] = useState(false);
  const [refused, setRefused] = useState(false);
  const { balance, pay } = useWallet();

  const confirm = () => {
    if (method === 'wallet' && !pay(price, 'Plateau ➔ Marcory Zone 4', 'Chauffeur Koffi T.')) {
      setRefused(true);
      return;
    }
    setConfirmed(true);
  };

  const amount = `${formatAmount(price)} FCFA`;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <CircleButton icon="arrow-back" label="Retour" color={colors.ink} onPress={() => router.back()} />
        <View style={{ alignItems: 'center' }}>
          <AppText variant="headlineSm" color={colors.ink} style={{ fontSize: 16, lineHeight: 22, letterSpacing: -0.3 }}>
            {brand.appName} Mobilité
          </AppText>
          <AppText variant="labelSm" color={colors.inkSoft} style={{ opacity: 0.7, fontSize: 10 }}>
            Course active #VM-9402
          </AppText>
        </View>
        <View style={styles.status}>
          <PingDot color={colors.primaryContainer} />
          <AppText variant="labelSm" color={colors.primaryContainer} style={{ fontSize: 12 }}>
            En approche
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* Carte de suivi */}
        <View style={{ height: 288 }}>
          <CityMap style={StyleSheet.absoluteFill} />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(246,244,255,0.4)', 'rgba(246,244,255,0)', 'rgba(246,244,255,0.8)', '#FFFFFF']}
            locations={[0, 0.4, 0.9, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.locator}>
            <View style={[styles.row, { gap: 10, flex: 1 }]}>
              <View style={styles.locatorIcon}>
                <Icon name="near-me" size={18} color={colors.primaryContainer} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="labelMd" color={colors.ink} numberOfLines={1}>
                  Boulevard de la République
                </AppText>
                <AppText variant="bodySm" color={colors.inkSoft} style={{ opacity: 0.75 }}>
                  À 1.2 km de votre position
                </AppText>
              </View>
            </View>
            <View style={styles.minutes}>
              <AppText variant="headlineSm" color="#fff" style={{ fontSize: 16 }}>
                4 min
              </AppText>
            </View>
          </View>

          <View style={styles.carMarker}>
            <View style={styles.carTag}>
              <AppText variant="labelSm" color="#fff" style={{ fontSize: 10 }}>
                Toyota Yaris
              </AppText>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondaryContainer }} />
            </View>
            <View>
              <Pulse style={[StyleSheet.absoluteFill, { borderRadius: 22, backgroundColor: 'rgba(75,54,201,0.35)' }]} />
              <View style={styles.car}>
                <Icon name="directions-car" size={20} color="#fff" />
              </View>
            </View>
          </View>
        </View>

        {/* Feuille principale */}
        <View style={styles.sheet}>
          <SheetHandle color="rgba(49,46,129,0.3)" />

          <View style={styles.between}>
            <View style={{ flex: 1 }}>
              <AppText variant="headlineMd" color={colors.ink} style={{ letterSpacing: -0.3 }}>
                Votre chauffeur arrive dans 4 min
              </AppText>
              <AppText variant="bodySm" color={colors.inkSoft} style={{ opacity: 0.8 }}>
                Préparez-vous au point de prise en charge
              </AppText>
            </View>
            <View style={styles.countdown}>
              <AppText variant="headlineSm" color={colors.primaryContainer} style={{ fontFamily: fonts.sora700, lineHeight: 18 }}>
                4
              </AppText>
              <AppText variant="labelSm" color={colors.primaryContainer} style={{ fontSize: 10, lineHeight: 12 }}>
                min
              </AppText>
            </View>
          </View>

          {/* Chauffeur */}
          <View style={styles.driverCard}>
            <View style={styles.between}>
              <View style={[styles.row, { gap: 12, flex: 1 }]}>
                <View>
                  <Avatar uri={photos.koffiDriving} size={56} />
                  <View style={styles.online} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <AppText variant="headlineSm" color={colors.ink} style={{ fontFamily: fonts.sora700, fontSize: 16 }}>
                      Koffi T.
                    </AppText>
                    <Icon name="verified" size={15} color={colors.primaryContainer} />
                  </View>
                  <View style={[styles.row, { gap: 3, marginTop: 2 }]}>
                    <Icon name="star" size={14} color="#eab308" />
                    <AppText variant="labelMd" color={colors.ink} style={{ fontFamily: fonts.dm700 }}>
                      4.92
                    </AppText>
                    <AppText variant="bodySm" color={colors.inkSoft} style={{ opacity: 0.7 }}>
                      · (850+ courses)
                    </AppText>
                  </View>
                </View>
              </View>
              <View style={styles.row}>
                <Touchable style={styles.squareBtn} accessibilityLabel="Appeler le chauffeur" onPress={() => router.push('/appel')}>
                  <Icon name="call" size={20} color={colors.primaryContainer} />
                </Touchable>
                <Touchable style={styles.squareBtn} accessibilityLabel="Envoyer un message" onPress={() => router.push('/chat')}>
                  <Icon name="chat" size={20} color={colors.primaryContainer} />
                </Touchable>
              </View>
            </View>
            <View style={[styles.between, styles.vehicleRibbon]}>
              <View style={[styles.row, { flex: 1 }]}>
                <Icon name="directions-car" size={18} color="rgba(49,46,129,0.6)" />
                <AppText variant="labelMd" color={colors.ink} numberOfLines={1} style={{ flexShrink: 1 }}>
                  {favoriteDriver.car}
                </AppText>
              </View>
              <View style={styles.plate}>
                <AppText variant="labelMd" color={colors.ink} style={{ fontFamily: fonts.sora600, letterSpacing: 1.3 }}>
                  {favoriteDriver.plate}
                </AppText>
              </View>
            </View>
          </View>

          {/* Badge partenaire */}
          <View style={styles.partner}>
            <View style={styles.partnerIcon}>
              <Icon name="verified-user" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" color={colors.primaryContainer} style={{ fontFamily: fonts.dm700 }}>
                Chauffeur Partenaire Vérifié
              </AppText>
              <AppText variant="bodySm" color={colors.inkSoft}>
                Ce chauffeur accepte directement les paiements en {brand.walletName} ({brand.walletUnit}).
              </AppText>
            </View>
          </View>

          {/* Itinéraire + tarif */}
          <View style={[styles.between, styles.trip]}>
            <View style={{ flex: 1 }}>
              <AppText variant="labelSm" color={colors.inkSoft} style={{ opacity: 0.7, fontSize: 10 }}>
                ITINÉRAIRE PRÉVU
              </AppText>
              <View style={[styles.row, { marginTop: 2 }]}>
                <AppText variant="labelMd" color={colors.ink} style={{ fontFamily: fonts.dm700 }}>
                  Plateau
                </AppText>
                <Icon name="trending-flat" size={14} color="rgba(49,46,129,0.6)" />
                <AppText variant="labelMd" color={colors.ink} style={{ fontFamily: fonts.dm700 }}>
                  Marcory Zone 4
                </AppText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="headlineMd" color={colors.primaryContainer} style={{ fontFamily: fonts.sora700, lineHeight: 22 }}>
                {amount}
              </AppText>
              <Pill background={colors.violetSoft} style={{ borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, marginTop: 4 }}>
                <AppText variant="labelSm" color={colors.inkSoft} style={{ fontSize: 10 }}>
                  = {formatAmount(price)} {brand.walletUnit}
                </AppText>
              </Pill>
            </View>
          </View>

          {/* Mode de règlement */}
          <View style={{ gap: 10 }}>
            <View style={[styles.between, { paddingHorizontal: 4 }]}>
              <AppText variant="labelLg" color={colors.ink} style={{ fontSize: 14 }}>
                Mode de règlement
              </AppText>
              <AppText variant="labelSm" color={colors.inkSoft} style={{ opacity: 0.6, fontSize: 10 }}>
                Sélectionnez avant l'arrivée
              </AppText>
            </View>

            <PayOption
              selected={method === 'wallet'}
              onPress={() => { setMethod('wallet'); setRefused(false); }}
              icon="account-balance-wallet"
              title={brand.walletName}
              badge="RECOMMANDÉ"
              subtitle={
                <View style={styles.row}>
                  <AppText variant="bodySm" color={colors.inkSoft}>
                    Solde disponible :{' '}
                    <AppText variant="bodySm" color={colors.ink} style={{ fontFamily: fonts.dm700 }}>
                      {formatAmount(balance)} {brand.walletUnit}
                    </AppText>
                  </AppText>
                  <Icon name="check-circle" size={12} color="#16a34a" />
                </View>
              }
            />
            <PayOption
              selected={method === 'cash'}
              onPress={() => { setMethod('cash'); setRefused(false); }}
              icon="payments"
              title="Espèces à bord"
              subtitle={
                <AppText variant="bodySm" color={colors.inkSoft} style={{ opacity: 0.8 }}>
                  Prévoir l'appoint pour le chauffeur ({amount})
                </AppText>
              }
            />

            <View style={[styles.row, { alignItems: 'flex-start', paddingHorizontal: 8, marginTop: 4 }]}>
              <Icon name="info-outline" size={14} color="rgba(49,46,129,0.6)" style={{ marginTop: 2 }} />
              <AppText variant="bodySm" color={colors.inkSoft} style={{ opacity: 0.75, flex: 1 }}>
                Note : Si le chauffeur n'a pas de compte certifié, seule l'option Espèces est affichée.
              </AppText>
            </View>
          </View>

          <Touchable
            disabled={confirmed}
            scale={0.98}
            onPress={confirm}
            style={[styles.cta, { backgroundColor: confirmed ? '#16a34a' : method === 'wallet' ? colors.primaryContainer : colors.inkSoft }]}
          >
            <Icon name={confirmed ? 'check-circle' : method === 'wallet' ? 'verified-user' : 'handshake'} size={20} color="#fff" />
            <AppText variant="headlineSm" color="#fff" style={{ fontFamily: fonts.sora700, fontSize: 16, letterSpacing: -0.3 }}>
              {confirmed
                ? 'Règlement confirmé'
                : method === 'wallet'
                  ? `Confirmer et payer en ${brand.walletName}`
                  : 'Confirmer le règlement en espèces'}
            </AppText>
          </Touchable>
          {refused && !confirmed && (
            <AppText variant="labelMd" color="#ba1a1a" style={{ textAlign: 'center' }}>
              Solde insuffisant : rechargez votre portefeuille ou payez en espèces.
            </AppText>
          )}
          {confirmed && (
            <Touchable scale={0.98} onPress={() => router.push('/navigation')} style={styles.follow}>
              <Icon name="navigation" size={20} color={colors.onSecondaryFixed} />
              <AppText variant="headlineSm" color={colors.onSecondaryFixed} style={{ fontFamily: fonts.sora700, fontSize: 16 }}>
                Suivre le trajet en direct
              </AppText>
            </Touchable>
          )}
          {confirmed && (
            <Touchable
              scale={0.98}
              onPress={() => router.push({ pathname: '/evaluation', params: { price: String(price) } })}
              style={styles.rate}
            >
              <Icon name="star" size={20} color={colors.primaryContainer} />
              <AppText variant="labelLg" color={colors.primaryContainer}>
                Course terminée ? Noter Koffi
              </AppText>
            </Touchable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PayOption({ selected, onPress, icon, title, subtitle, badge }: {
  selected: boolean;
  onPress: () => void;
  icon: 'account-balance-wallet' | 'payments';
  title: string;
  subtitle: ReactNode;
  badge?: string;
}) {
  return (
    <Touchable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      scale={0.99}
      onPress={onPress}
      style={[styles.option, selected ? styles.optionOn : styles.optionOff]}
    >
      <View style={[styles.row, { gap: 12, flex: 1 }]}>
        <View style={[styles.optionIcon, { backgroundColor: selected ? colors.primaryContainer : colors.violetCard }]}>
          <Icon name={icon} size={20} color={selected ? '#fff' : colors.inkSoft} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <AppText variant="labelLg" color={colors.ink} style={{ fontSize: 14 }}>
              {title}
            </AppText>
            {badge && (
              <Pill background={colors.violetSoft} style={{ paddingHorizontal: 8, paddingVertical: 1 }}>
                <AppText variant="labelSm" color={colors.primaryContainer} style={{ fontSize: 9 }}>
                  {badge}
                </AppText>
              </Pill>
            )}
          </View>
          {subtitle}
        </View>
      </View>
      <View style={[styles.radio, { backgroundColor: selected ? colors.primaryContainer : colors.border }]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.violetMist },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(246,244,255,0.95)',
    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.violetSoft, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  locator: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    boxShadow: '0px 10px 20px rgba(30,27,75,0.12)',
  },
  locatorIcon: { width: 32, height: 32, borderRadius: 12, backgroundColor: colors.violetSoft, alignItems: 'center', justifyContent: 'center' },
  minutes: { backgroundColor: colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  carMarker: { position: 'absolute', top: '46%', left: 0, right: 0, alignItems: 'center' },
  carTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.ink, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 4 },
  car: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    boxShadow: '0px 12px 24px rgba(30,27,75,0.3)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
    boxShadow: '0px -12px 40px rgba(30,27,75,0.08)',
  },
  countdown: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.violetMist, alignItems: 'center', justifyContent: 'center' },
  driverCard: { backgroundColor: colors.violetCard, borderRadius: 20, padding: 16, gap: 14 },
  online: { position: 'absolute', right: 4, bottom: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, borderWidth: 2, borderColor: '#fff' },
  squareBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 2px rgba(0,0,0,0.06)' },
  vehicleRibbon: { paddingTop: 10, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: 'rgba(228,224,255,0.7)' },
  plate: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  partner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: colors.violetSoft },
  partnerIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  trip: { padding: 16, borderRadius: 16, backgroundColor: colors.violetCard },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 14, borderRadius: 16 },
  optionOn: { backgroundColor: '#F5F3FF', borderWidth: 2, borderColor: colors.primaryContainer },
  optionOff: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, margin: 1 },
  optionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  rate: { height: 48, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.violetSoft },
  follow: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondaryContainer,
    boxShadow: '0px 12px 26px -4px rgba(198,243,56,0.45)',
  },
  cta: { height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, boxShadow: '0px 10px 24px rgba(75,54,201,0.3)' },
});
