import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityMap } from '@/components/CityMap';
import { pointAlong, RouteLayer } from '@/components/RouteLayer';
import { AppText, Avatar, CircleButton, Icon, SheetHandle, Touchable, useLayout, type IconName } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';
import { formatAmount, vehicles } from '@/data/mock';
import { useRide } from '@/data/ride';
import { OPERATORS, useWallet } from '@/data/wallet';
import { OFFER_TIMEOUT_S, shortName } from '@/logic/fleet';
import { lerp } from '@/logic/geo';
import { FREE_WAIT_MIN, waitingFee } from '@/logic/pricing';
import { canCancel, cancelFeeNow, freeWaitLeft, isActive, type Ride, type RideStatus } from '@/logic/ride';
import { arrivalTime } from '@/logic/time';

const F = (n: number) => `${formatAmount(n)} F`;

const STATUS_PILL: Record<RideStatus, string> = {
  searching: 'Recherche',
  accepted: 'En approche',
  arrived: 'Arrivé',
  ongoing: 'En course',
  completed: 'Terminée',
  cancelled: 'Annulée',
  no_driver: 'Indisponible',
};

const STEPS: { label: string; of: RideStatus[] }[] = [
  { label: 'Recherche', of: ['searching'] },
  { label: 'Approche', of: ['accepted'] },
  { label: 'Prise en charge', of: ['arrived'] },
  { label: 'Trajet', of: ['ongoing'] },
  { label: 'Arrivée', of: ['completed'] },
];

/** Position de la voiture sur la carte selon l'étape de la course. */
function carPosition(r: Ride) {
  if (!r.driver) return null;
  const path = [r.pickup, ...r.stops, r.destination];
  if (r.status === 'accepted') return lerp(r.driver.position, r.pickup, r.approachTotal ? 1 - r.eta / r.approachTotal : 1);
  if (r.status === 'arrived') return r.pickup;
  if (r.status === 'ongoing' || r.status === 'completed') return pointAlong(path, r.progress);
  return null;
}

export default function ActiveRideScreen() {
  const insets = useSafeAreaInsets();
  const { gutter, mapHeight, compact } = useLayout();
  const ride = useRide();
  const { balance } = useWallet();
  const r = ride.current;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [sos, setSos] = useState(false);

  const home = () => {
    ride.dismiss();
    router.navigate('/');
  };

  if (!r) {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top }]}>
        <Icon name="local-taxi" size={40} color={colors.outline} />
        <AppText variant="headlineSm">Aucune course en cours</AppText>
        <Touchable style={[styles.cta, { backgroundColor: colors.primary, paddingHorizontal: 24 }]} onPress={() => router.replace('/destination')}>
          <AppText variant="labelLg" color="#fff">
            Commander une course
          </AppText>
        </Touchable>
      </View>
    );
  }

  const d = r.driver;
  const vehicle = vehicles.find((v) => v.id === r.category);
  const fee = cancelFeeNow(r);
  const stepIndex = STEPS.findIndex((s) => s.of.includes(r.status));
  const firstName = d?.fullName.split(' ')[0] ?? '';

  const title =
    r.status === 'searching'
      ? `Recherche d’un chauffeur ${vehicle?.name ?? ''}…`
      : r.status === 'accepted'
        ? `${firstName} arrive dans ${r.eta} min`
        : r.status === 'arrived'
          ? `${firstName} vous attend`
          : r.status === 'ongoing'
            ? `Arrivée dans ${r.eta} min`
            : r.status === 'completed'
              ? 'Vous êtes arrivé'
              : r.status === 'cancelled'
                ? 'Course annulée'
                : 'Aucun chauffeur disponible';

  const subtitle =
    r.status === 'searching'
      ? r.offer
        ? `Offre envoyée à ${shortName(r.offer.driver)} (à ${r.offer.eta} min) · ${OFFER_TIMEOUT_S} s pour répondre`
        : 'Nous contactons les chauffeurs à moins de 3 km'
      : r.status === 'accepted'
        ? `Rendez-vous à ${r.pickup.name}`
        : r.status === 'arrived'
          ? freeWaitLeft(r) > 0
            ? `Attente offerte encore ${freeWaitLeft(r)} min`
            : `Attente facturée ${F(waitingFee(r.waited))}`
          : r.status === 'ongoing'
            ? `${r.destination.name} vers ${arrivalTime(r.eta)} · ${r.route.via}`
            : r.status === 'completed'
              ? `${r.destination.name} · ${r.route.km.toString().replace('.', ',')} km`
              : r.status === 'cancelled'
                ? r.cancelFee
                  ? `Frais d’annulation : ${F(r.cancelFee)}`
                  : 'Annulation gratuite'
                : 'Réessayez dans quelques minutes ou changez de catégorie';

  const counter = r.status === 'accepted' || r.status === 'ongoing' ? r.eta : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <CircleButton icon="arrow-back" label="Retour" color={colors.ink} onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))} />
        <View style={{ alignItems: 'center', flexShrink: 1 }}>
          <AppText variant="headlineSm" color={colors.ink} numberOfLines={1} style={{ fontSize: compact ? 14 : 16, lineHeight: 22, letterSpacing: -0.3 }}>
            {vehicle?.name ?? 'Course'} · {r.pickup.name} → {r.destination.name}
          </AppText>
          <AppText variant="labelSm" color={colors.inkSoft} style={{ opacity: 0.7, fontSize: 10 }}>
            Course {r.id}
          </AppText>
        </View>
        <View style={styles.status}>
          <AppText variant="labelSm" color={colors.primaryContainer} style={{ fontSize: 11 }}>
            {STATUS_PILL[r.status]}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* Carte de suivi */}
        <View style={{ height: mapHeight(0.32, 200, 300) }}>
          <CityMap style={StyleSheet.absoluteFill}>
            <RouteLayer points={[r.pickup, ...r.stops, r.destination]} car={carPosition(r)} />
          </CityMap>
        </View>

        {/* Feuille principale */}
        <View style={[styles.sheet, { paddingHorizontal: compact ? 14 : 20 }]}>
          <SheetHandle color="rgba(49,46,129,0.3)" />

          <View style={styles.between}>
            <View style={{ flex: 1 }}>
              <AppText variant="headlineMd" color={colors.ink} style={{ letterSpacing: -0.3, fontSize: compact ? 18 : 20 }}>
                {title}
              </AppText>
              <AppText variant="bodySm" color={colors.inkSoft} style={{ opacity: 0.8 }}>
                {subtitle}
              </AppText>
            </View>
            {counter !== null && (
              <View style={styles.countdown}>
                <AppText variant="headlineSm" color={colors.primaryContainer} style={{ fontFamily: fonts.sora700, lineHeight: 18 }}>
                  {counter}
                </AppText>
                <AppText variant="labelSm" color={colors.primaryContainer} style={{ fontSize: 10, lineHeight: 12 }}>
                  min
                </AppText>
              </View>
            )}
          </View>

          {/* Étapes de la course */}
          {stepIndex >= 0 && (
            <View style={styles.steps} accessibilityLabel={`Étape ${stepIndex + 1} sur ${STEPS.length}`}>
              {STEPS.map((s, i) => (
                <View key={s.label} style={{ flex: 1, gap: 4 }}>
                  <View style={[styles.stepBar, { backgroundColor: i <= stepIndex ? colors.primary : colors.surfaceHigh }]}>
                    {i === stepIndex && r.status === 'ongoing' && <View style={[styles.stepFill, { width: `${Math.round(r.progress * 100)}%` }]} />}
                  </View>
                  {!compact && (
                    <AppText variant="labelSm" color={i === stepIndex ? colors.ink : colors.outline} style={{ fontSize: 9 }} numberOfLines={1}>
                      {s.label}
                    </AppText>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Chauffeur */}
          {d && (
            <View style={styles.driverCard}>
              <View style={styles.between}>
                <View style={[styles.row, { gap: 12, flex: 1 }]}>
                  <Avatar name={d.fullName} size={compact ? 48 : 56} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <AppText variant="headlineSm" color={colors.ink} numberOfLines={1} style={{ fontFamily: fonts.sora700, fontSize: 16, flexShrink: 1 }}>
                        {shortName(d)}
                      </AppText>
                      {d.certified && <Icon name="verified" size={15} color={colors.primaryContainer} />}
                    </View>
                    <View style={[styles.row, { gap: 3, marginTop: 2 }]}>
                      <Icon name="star" size={14} color="#eab308" />
                      <AppText variant="labelMd" color={colors.ink} style={{ fontFamily: fonts.dm700 }}>
                        {d.rating.toFixed(2).replace('.', ',')}
                      </AppText>
                      <AppText variant="bodySm" color={colors.inkSoft} style={{ opacity: 0.7 }} numberOfLines={1}>
                        · {d.trips} courses
                      </AppText>
                    </View>
                  </View>
                </View>
                {isActive(r) && (
                  <View style={styles.row}>
                    <Touchable style={styles.squareBtn} accessibilityLabel="Appeler le chauffeur" onPress={() => router.push('/appel')}>
                      <Icon name="call" size={20} color={colors.primaryContainer} />
                    </Touchable>
                    <Touchable style={styles.squareBtn} accessibilityLabel="Envoyer un message" onPress={() => router.push('/chat')}>
                      <Icon name="chat" size={20} color={colors.primaryContainer} />
                    </Touchable>
                  </View>
                )}
              </View>
              <View style={[styles.between, styles.vehicleRibbon]}>
                <View style={[styles.row, { flex: 1 }]}>
                  <Icon name="directions-car" size={18} color="rgba(49,46,129,0.6)" />
                  <AppText variant="labelMd" color={colors.ink} numberOfLines={1} style={{ flexShrink: 1 }}>
                    {d.car}
                  </AppText>
                </View>
                <View style={styles.plate}>
                  <AppText variant="labelMd" color={colors.ink} style={{ fontFamily: fonts.sora600, letterSpacing: 1.3 }}>
                    {d.plate}
                  </AppText>
                </View>
              </View>
            </View>
          )}

          {r.status === 'arrived' && (
            <Touchable style={[styles.cta, { backgroundColor: colors.secondaryContainer, marginTop: 0 }]} onPress={() => ride.send({ type: 'board' })}>
              <Icon name="check-circle" size={20} color={colors.onSecondaryFixed} />
              <AppText variant="headlineSm" color={colors.onSecondaryFixed} style={{ fontSize: 16 }}>
                Je suis à bord
              </AppText>
            </Touchable>
          )}

          {r.status === 'ongoing' && (
            <Touchable scale={0.98} onPress={() => router.push('/navigation')} style={[styles.cta, { backgroundColor: colors.secondaryContainer, marginTop: 0 }]}>
              <Icon name="navigation" size={20} color={colors.onSecondaryFixed} />
              <AppText variant="headlineSm" color={colors.onSecondaryFixed} style={{ fontFamily: fonts.sora700, fontSize: 16 }}>
                Suivre le trajet en direct
              </AppText>
            </Touchable>
          )}

          {d && !d.certified && isActive(r) && (
            <Notice icon="info-outline">Chauffeur non certifié : la course se règle en espèces.</Notice>
          )}

          {/* Recherche : offres envoyées chauffeur par chauffeur */}
          {r.status === 'searching' && r.declined.length > 0 && (
            <Notice icon="info-outline">
              {r.declined.length} chauffeur{r.declined.length > 1 ? 's' : ''} n’{r.declined.length > 1 ? 'ont' : 'a'} pas répondu : offre transmise au suivant.
            </Notice>
          )}

          {/* Sécurité : partage du trajet et SOS */}
          {(r.status === 'accepted' || r.status === 'arrived' || r.status === 'ongoing') && (
            <View style={[styles.row, { gap: 8 }]}>
              <Touchable style={[styles.half, { backgroundColor: colors.violetSoft, flexDirection: 'row', gap: 6 }]} onPress={() => shareTrip(r)}>
                <Icon name="share" size={18} color={colors.primaryContainer} />
                <AppText variant="labelMd" color={colors.primaryContainer}>
                  Partager le trajet
                </AppText>
              </Touchable>
              <Touchable
                style={[styles.half, { backgroundColor: sos ? '#B42318' : '#FEF3F2', flexDirection: 'row', gap: 6 }]}
                onPress={() => setSos(true)}
                accessibilityLabel="Alerte SOS"
              >
                <Icon name="emergency" size={18} color={sos ? '#fff' : '#B42318'} />
                <AppText variant="labelMd" color={sos ? '#fff' : '#B42318'}>
                  {sos ? 'Alerte envoyée' : 'SOS'}
                </AppText>
              </Touchable>
            </View>
          )}
          {sos && isActive(r) && (
            <Notice icon="emergency" tone="warn">
              L’équipe City Drive a reçu votre alerte et votre position ({r.status === 'ongoing' ? 'en course' : r.pickup.name}). Elle vous rappelle.
            </Notice>
          )}

          {/* Itinéraire + tarif */}
          <View style={[styles.between, styles.trip]}>
            <View style={{ flex: 1 }}>
              <AppText variant="labelSm" color={colors.inkSoft} style={{ opacity: 0.7, fontSize: 10 }}>
                ITINÉRAIRE · {r.route.via.toUpperCase()}
              </AppText>
              <AppText variant="labelMd" color={colors.ink} style={{ fontFamily: fonts.dm700, marginTop: 2 }} numberOfLines={2}>
                {[r.pickup, ...r.stops, r.destination].map((p) => p.name).join(' → ')}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="headlineMd" color={colors.primaryContainer} style={{ fontFamily: fonts.sora700, lineHeight: 22, fontSize: compact ? 17 : 20 }}>
                {F(r.fare ?? r.quote.total)}
              </AppText>
              <AppText variant="labelSm" color={colors.inkSoft} style={{ fontSize: 10, marginTop: 4 }}>
                {r.fare && r.fare > r.quote.total ? `dont attente ${F(r.fare - r.quote.total)}` : 'Prix garanti'}
              </AppText>
            </View>
          </View>

          {/* Mode de règlement, modifiable jusqu'à l'arrivée */}
          {isActive(r) && (
            <View style={{ gap: 10 }}>
              <AppText variant="labelLg" color={colors.ink} style={{ fontSize: 14, paddingHorizontal: 4 }}>
                Mode de règlement
              </AppText>
              <PayOption
                selected={r.payment === 'wallet'}
                disabled={!!d && !d.certified}
                onPress={() => ride.setPayment('wallet')}
                icon="account-balance-wallet"
                title={brand.walletName}
                subtitle={`Solde : ${formatAmount(balance)} ${brand.walletUnit}${balance < r.quote.total ? ' · insuffisant' : ''}`}
              />
              <PayOption
                selected={r.payment === 'mobile_money'}
                disabled={!!d && !d.certified}
                onPress={() => ride.setPayment('mobile_money')}
                icon="phone-iphone"
                title="Mobile Money"
                subtitle={`${OPERATORS.find((o) => o.id === (r.operator ?? ride.draft.operator))?.name ?? 'Wave Money'} · débité à l’arrivée`}
              />
              <PayOption selected={r.payment === 'cash'} onPress={() => ride.setPayment('cash')} icon="payments" title="Espèces à bord" subtitle={`Prévoir l’appoint : ${F(r.quote.total)}`} />
            </View>
          )}

          {/* Règlement final */}
          {r.status === 'completed' && r.fare !== null && (
            <Notice icon={r.paidWith === 'cash' ? 'payments' : 'check-circle'} tone={r.paidWith === 'cash' ? 'warn' : 'ok'}>
              {r.paidWith === 'wallet'
                ? `${F(r.fare)} débités de votre ${brand.walletName}.`
                : r.paidWith === 'mobile_money'
                  ? `${F(r.fare)} payés par ${OPERATORS.find((o) => o.id === r.operator)?.name ?? 'Mobile Money'}.`
                  : r.payment === 'wallet'
                  ? `Solde insuffisant : réglez ${F(r.fare)} en espèces au chauffeur.`
                  : `Réglez ${F(r.fare)} en espèces au chauffeur.`}
            </Notice>
          )}
          {r.status === 'cancelled' && r.cancelFee > 0 && (
            <Notice icon="info-outline" tone="warn">
              {r.paidWith === 'wallet' ? `${F(r.cancelFee)} débités pour annulation tardive.` : `${F(r.cancelFee)} de frais d’annulation restent dus.`}
            </Notice>
          )}

          {r.status === 'completed' && d && (
            <Touchable scale={0.98} disabled={r.rating !== null} onPress={() => router.push('/evaluation')} style={[styles.cta, { backgroundColor: colors.primary }]}>
              <Icon name="star" size={20} color="#fff" />
              <AppText variant="headlineSm" color="#fff" style={{ fontSize: 16 }}>
                {r.rating ? 'Course notée · merci' : `Noter ${firstName}`}
              </AppText>
            </Touchable>
          )}
          {r.status === 'no_driver' && (
            <Touchable
              scale={0.98}
              onPress={() => {
                ride.dismiss();
                router.replace('/vehicules');
              }}
              style={[styles.cta, { backgroundColor: colors.primary }]}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <AppText variant="headlineSm" color="#fff" style={{ fontSize: 16 }}>
                Changer de véhicule
              </AppText>
            </Touchable>
          )}
          {!isActive(r) && (
            <Touchable scale={0.98} onPress={home} style={styles.secondary}>
              <AppText variant="labelLg" color={colors.primaryContainer}>
                Retour à l&apos;accueil
              </AppText>
            </Touchable>
          )}

          {canCancel(r) &&
            (confirmCancel ? (
              <View style={styles.confirm}>
                <AppText variant="labelMd" color={colors.ink} style={{ textAlign: 'center' }}>
                  {fee ? `Annuler maintenant coûte ${F(fee)}.` : 'L’annulation est gratuite.'} Confirmer ?
                </AppText>
                <View style={[styles.row, { gap: 8 }]}>
                  <Touchable style={[styles.half, { backgroundColor: colors.surfaceHigh }]} onPress={() => setConfirmCancel(false)}>
                    <AppText variant="labelLg">Garder</AppText>
                  </Touchable>
                  <Touchable
                    style={[styles.half, { backgroundColor: '#B42318' }]}
                    onPress={() => {
                      setConfirmCancel(false);
                      ride.cancel();
                    }}
                  >
                    <AppText variant="labelLg" color="#fff">
                      Annuler
                    </AppText>
                  </Touchable>
                </View>
              </View>
            ) : (
              <Touchable style={styles.secondary} onPress={() => setConfirmCancel(true)}>
                <AppText variant="labelLg" color="#B42318">
                  Annuler la course{fee ? ` (${F(fee)})` : ''}
                </AppText>
              </Touchable>
            ))}

          {isActive(r) && (
            <AppText variant="labelSm" color={colors.outline} style={{ textAlign: 'center' }}>
              Démo : 1 seconde = 1 minute · attente offerte {FREE_WAIT_MIN} min
            </AppText>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/** Partage du trajet avec un proche : chauffeur, plaque, itinéraire et arrivée prévue. */
function shareTrip(r: Ride) {
  const d = r.driver;
  const message = [
    `Je suis en course City Drive : ${r.pickup.name} → ${r.destination.name}.`,
    d ? `Chauffeur ${d.fullName}, ${d.car}, plaque ${d.plate}.` : '',
    r.status === 'ongoing' ? `Arrivée prévue vers ${arrivalTime(r.eta)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
  Share.share({ message }).catch(() => {});
}

function Notice({ icon, children, tone = 'info' }: { icon: IconName; children: ReactNode; tone?: 'info' | 'ok' | 'warn' }) {
  const bg = tone === 'ok' ? colors.greenSoft : tone === 'warn' ? '#FEF3C7' : colors.violetSoft;
  const fg = tone === 'ok' ? '#05603A' : tone === 'warn' ? '#92400E' : colors.inkSoft;
  return (
    <View style={[styles.notice, { backgroundColor: bg }]}>
      <Icon name={icon} size={18} color={fg} />
      <AppText variant="bodySm" color={fg} style={{ flex: 1 }}>
        {children}
      </AppText>
    </View>
  );
}

function PayOption({ selected, disabled, onPress, icon, title, subtitle }: {
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <Touchable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      scale={0.99}
      onPress={onPress}
      style={[styles.option, selected ? styles.optionOn : styles.optionOff, disabled && { opacity: 0.45 }]}
    >
      <View style={[styles.row, { gap: 12, flex: 1 }]}>
        <View style={[styles.optionIcon, { backgroundColor: selected ? colors.primaryContainer : colors.violetCard }]}>
          <Icon name={icon} size={20} color={selected ? '#fff' : colors.inkSoft} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="labelLg" color={colors.ink} style={{ fontSize: 14 }}>
            {title}
          </AppText>
          <AppText variant="bodySm" color={colors.inkSoft} numberOfLines={1}>
            {subtitle}
          </AppText>
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
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(247,247,248,0.95)',
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
    zIndex: 10,
  },
  status: { backgroundColor: colors.violetSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
    boxShadow: '0px -2px 10px rgba(16,24,40,0.08)',
  },
  countdown: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.violetMist, alignItems: 'center', justifyContent: 'center' },
  steps: { flexDirection: 'row', gap: 4 },
  stepBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  stepFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.secondaryContainer },
  driverCard: { backgroundColor: colors.violetCard, borderRadius: 16, padding: 16, gap: 14 },
  squareBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  vehicleRibbon: { paddingTop: 10, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: 'rgba(227,230,235,0.7)' },
  plate: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  trip: { padding: 16, borderRadius: 16, backgroundColor: colors.violetCard },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 14, borderRadius: 16 },
  optionOn: { backgroundColor: '#F5F3FF', borderWidth: 2, borderColor: colors.primaryContainer },
  optionOff: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, margin: 1 },
  optionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  cta: { height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  secondary: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.violetSoft },
  confirm: { gap: 10, padding: 12, borderRadius: 12, backgroundColor: '#FEF3F2' },
  half: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
