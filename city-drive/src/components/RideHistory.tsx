import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { formatAmount, vehicles } from '@/data/mock';
import { useRide } from '@/data/ride';
import { shortName } from '@/logic/fleet';
import { isActive, type Ride, type RideStatus } from '@/logic/ride';
import { formatWhen } from '@/logic/time';
import { AppText, Icon, Pill, Touchable, type IconName } from './ui';

const STATUS: Record<RideStatus, { label: string; bg: string; fg: string; icon: IconName }> = {
  completed: { label: 'Terminée', bg: colors.greenSoft, fg: '#05603A', icon: 'check-circle' },
  cancelled: { label: 'Annulée', bg: colors.surfaceHigh, fg: colors.onSurfaceVariant, icon: 'cancel' },
  no_driver: { label: 'Sans chauffeur', bg: '#FEF3C7', fg: '#92400E', icon: 'block' },
  searching: { label: 'Recherche', bg: colors.blueSoft, fg: colors.blue, icon: 'search' },
  accepted: { label: 'En approche', bg: colors.blueSoft, fg: colors.blue, icon: 'local-taxi' },
  arrived: { label: 'Arrivé', bg: colors.blueSoft, fg: colors.blue, icon: 'local-taxi' },
  ongoing: { label: 'En course', bg: colors.blueSoft, fg: colors.blue, icon: 'local-taxi' },
};

/** Historique des courses : statistiques, réservations à venir et trajets passés. */
export function RideHistory({ gutter }: { gutter: number }) {
  const { history, scheduled, current, loyalty, cancelScheduled } = useRide();
  const done = history.filter((r) => r.status === 'completed');
  const km = done.reduce((s, r) => s + r.route.km, 0);
  const spent = done.reduce((s, r) => s + (r.fare ?? 0) + r.tip, 0) + history.reduce((s, r) => s + r.cancelFee, 0);

  return (
    <View style={{ paddingHorizontal: gutter, gap: 16 }}>
      <View style={styles.stats}>
        <Stat value={String(done.length)} label="Courses" />
        <Stat value={`${Math.round(km)} km`} label="Parcourus" />
        <Stat value={`${formatAmount(spent)} F`} label="Dépensés" />
        <Stat value={formatAmount(loyalty)} label="Points" />
      </View>

      {isActive(current) && (
        <Touchable style={styles.active} onPress={() => router.push('/course')}>
          <Icon name="local-taxi" size={20} color={colors.onPrimary} />
          <AppText variant="labelLg" color={colors.onPrimary} style={{ flex: 1 }} numberOfLines={1}>
            Course en cours vers {current.destination.name}
          </AppText>
          <Icon name="chevron-right" size={20} color={colors.onPrimary} />
        </Touchable>
      )}

      {scheduled.length > 0 && (
        <View style={{ gap: 8 }}>
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            À VENIR
          </AppText>
          {scheduled.map((s) => (
            <View key={s.id} style={styles.card}>
              <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
                <Icon name="event" size={18} color={colors.onSecondaryFixed} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="labelLg" numberOfLines={1}>
                  {s.pickup.name} → {s.destination.name}
                </AppText>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  {formatWhen(s.at)} · {vehicles.find((v) => v.id === s.category)?.name} · {formatAmount(s.quote.total)} F
                </AppText>
              </View>
              <Touchable onPress={() => cancelScheduled(s.id)} style={styles.cancel} accessibilityLabel="Annuler la réservation">
                <Icon name="close" size={16} color="#B42318" />
              </Touchable>
            </View>
          ))}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <AppText variant="labelSm" color={colors.onSurfaceVariant}>
          HISTORIQUE
        </AppText>
        {history.length === 0 && (
          <View style={styles.empty}>
            <Icon name="route" size={28} color={colors.outline} />
            <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
              Vos courses apparaîtront ici.
            </AppText>
            <Touchable style={styles.order} onPress={() => router.push('/destination')}>
              <AppText variant="labelLg" color={colors.onPrimary}>
                Commander une course
              </AppText>
            </Touchable>
          </View>
        )}
        {history.map((r) => (
          <HistoryRow key={r.id} r={r} />
        ))}
      </View>
    </View>
  );
}

function HistoryRow({ r }: { r: Ride }) {
  const st = STATUS[r.status];
  const amount = r.status === 'completed' ? (r.fare ?? 0) + r.tip : r.cancelFee;
  const toRate = r.status === 'completed' && r.rating === null && !!r.driver;
  return (
    <Touchable style={styles.card} disabled={!toRate} onPress={() => router.push('/evaluation')} scale={0.99}>
      <View style={[styles.icon, { backgroundColor: st.bg }]}>
        <Icon name={st.icon} size={18} color={st.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="labelLg" numberOfLines={1}>
          {r.pickup.name} → {r.destination.name}
        </AppText>
        <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
          {formatWhen(r.createdAt)}
          {r.driver ? ` · ${shortName(r.driver)}` : ''}
          {r.status === 'completed' ? ` · ${r.paidWith === 'wallet' ? 'Portefeuille' : r.paidWith === 'mobile_money' ? 'Mobile Money' : 'Espèces'}` : ''}
        </AppText>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          <Pill background={st.bg} style={{ paddingHorizontal: 6, paddingVertical: 1 }}>
            <AppText variant="labelSm" color={st.fg} style={{ fontSize: 10 }}>
              {st.label}
            </AppText>
          </Pill>
          {r.rating !== null && (
            <View style={styles.row}>
              <Icon name="star" size={12} color={colors.star} />
              <AppText variant="labelSm">{r.rating}</AppText>
            </View>
          )}
          {toRate && (
            <AppText variant="labelSm" color={colors.primary}>
              Noter la course
            </AppText>
          )}
        </View>
      </View>
      <AppText variant="labelLg" style={{ fontFamily: fonts.dm700 }}>
        {amount ? `${formatAmount(amount)} F` : '—'}
      </AppText>
    </Touchable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="labelLg" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText variant="labelSm" color={colors.onSurfaceVariant} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceLowest,
    alignItems: 'center',
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  active: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, backgroundColor: colors.primary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cancel: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF3F2', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 10, padding: 24, borderRadius: 12, backgroundColor: colors.surfaceLowest },
  order: { paddingHorizontal: 20, height: 44, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center' },
});
