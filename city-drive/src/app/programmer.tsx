import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Avatar, CircleButton, Icon, PingDot, Touchable } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts, shadows } from '@/constants/theme';
import { favoriteDriver, photos } from '@/data/mock';

const WEEKDAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const TIMES = ['06:30', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '09:00', '09:15', '09:30', '09:45'];

function nextDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const label = i === 0 ? 'Auj.' : i === 1 ? 'Demain' : WEEKDAYS[d.getDay()];
    return { key: d.toDateString(), date: d, label };
  });
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const days = useMemo(() => nextDays(6), []);
  const [day, setDay] = useState(days[2].key);
  const [time, setTime] = useState('07:30');
  const [preferDriver, setPreferDriver] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const selected = days.find((d) => d.key === day) ?? days[0];
  const dayText = `${WEEKDAYS[selected.date.getDay()].toLowerCase()} ${selected.date.getDate()}`;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, gap: 24 }} showsVerticalScrollIndicator={false}>
        {/* Barre du modal */}
        <View style={[styles.px]}>
          <View style={styles.modalBar}>
            <CircleButton icon="arrow-back" label="Retour" background={colors.surfaceLow} onPress={() => router.back()} />
            <View style={styles.row}>
              <Icon name="event" size={18} color={colors.primary} />
              <AppText variant="headlineSm">Programmer une course</AppText>
            </View>
            <CircleButton icon="close" label="Fermer" background={colors.surfaceLow} onPress={() => router.back()} />
          </View>
        </View>

        {/* Résumé du trajet */}
        <View style={styles.px}>
          <View style={styles.routeCard}>
            <View style={styles.blob} />
            <View style={[styles.row, { gap: 16, alignItems: 'flex-start' }]}>
              <View style={{ alignItems: 'center', paddingTop: 6 }}>
                <View style={styles.fromDot}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
                </View>
                <LinearGradient colors={[colors.primary, colors.outlineVariant, colors.secondaryContainer]} style={styles.timeline} />
                <View style={styles.toDot}>
                  <View style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: colors.onSecondaryContainer }} />
                </View>
              </View>
              <View style={{ flex: 1, gap: 12 }}>
                <View>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    DÉPART
                  </AppText>
                  <AppText variant="headlineSm" numberOfLines={1}>
                    Riviera 2, Cocody
                  </AppText>
                </View>
                <View>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    DESTINATION
                  </AppText>
                  <AppText variant="headlineSm" numberOfLines={1}>
                    Aéroport Félix-Houphouët-Boigny
                  </AppText>
                </View>
              </View>
            </View>
            <View style={styles.specs}>
              <View style={styles.row}>
                <Icon name="route" size={18} color={colors.primary} />
                <AppText variant="labelMd">32 min · 21.4 km</AppText>
              </View>
              <View style={styles.specCar}>
                <Icon name="directions-car" size={16} color={colors.primary} />
                <AppText variant="labelMd" color={colors.primary} style={{ fontFamily: fonts.dm700 }}>
                  Confort (SUV)
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Jour */}
        <View style={{ gap: 8 }}>
          <View style={[styles.between, styles.px]}>
            <View style={styles.row}>
              <Icon name="calendar-today" size={18} color={colors.primary} />
              <AppText variant="headlineSm">Sélectionnez le jour</AppText>
            </View>
            <View style={styles.month}>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {MONTHS[selected.date.getMonth()]} {selected.date.getFullYear()}
              </AppText>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 6 }}>
            {days.map((d) => {
              const active = d.key === day;
              return (
                <Touchable key={d.key} onPress={() => setDay(d.key)} style={[styles.day, active && styles.dayActive]}>
                  <AppText variant="labelSm" color={active ? colors.primaryFixed : colors.onSurfaceVariant}>
                    {d.label}
                  </AppText>
                  <AppText variant="headlineMd" color={active ? colors.onPrimary : colors.onSurface}>
                    {d.date.getDate()}
                  </AppText>
                  <View style={[styles.dayDot, { backgroundColor: active ? colors.secondaryContainer : colors.outlineVariant }]} />
                </Touchable>
              );
            })}
          </ScrollView>
        </View>

        {/* Heure */}
        <View style={[styles.px, { gap: 8 }]}>
          <View style={styles.between}>
            <View style={styles.row}>
              <Icon name="schedule" size={18} color={colors.primary} />
              <AppText variant="headlineSm">Heure de prise en charge</AppText>
            </View>
            <AppText variant="labelSm" color={colors.primary} style={{ fontFamily: fonts.dm600 }}>
              Créneau optimal
            </AppText>
          </View>
          <View style={styles.grid}>
            {TIMES.map((t) => {
              const active = t === time;
              return (
                <Touchable key={t} onPress={() => setTime(t)} style={[styles.time, active && styles.timeActive]}>
                  {active && <PingDot color={colors.secondaryContainer} />}
                  <AppText variant="headlineSm" color={active ? colors.onPrimary : colors.onSurface}>
                    {t}
                  </AppText>
                </Touchable>
              );
            })}
          </View>
        </View>

        {/* Chauffeur préféré */}
        <View style={styles.px}>
          <View style={styles.driverCard}>
            <View style={[styles.between, { alignItems: 'flex-start' }]}>
              <View style={[styles.row, { gap: 8, flex: 1 }]}>
                <View>
                  <Avatar uri={photos.koffi} size={52} radius={26} style={{ borderWidth: 2, borderColor: colors.primaryFixed }} />
                  <View style={styles.rating}>
                    <Icon name="star" size={11} color={colors.onSecondaryContainer} />
                    <AppText variant="labelSm" color={colors.onSecondaryContainer} style={{ fontSize: 10 }}>
                      4.9
                    </AppText>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <AppText variant="headlineSm">{favoriteDriver.name}</AppText>
                    <Icon name="verified" size={16} color={colors.primary} />
                  </View>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                    Chauffeur Préféré · SUV Hybride
                  </AppText>
                </View>
              </View>
              <Touchable
                accessibilityRole="switch"
                accessibilityState={{ checked: preferDriver }}
                onPress={() => setPreferDriver((v) => !v)}
                style={[styles.toggle, { backgroundColor: preferDriver ? colors.primary : colors.surfaceHighest }]}
              >
                <View style={[styles.knob, { alignSelf: preferDriver ? 'flex-end' : 'flex-start' }]} />
              </Touchable>
            </View>

            <View style={styles.trust}>
              <View style={styles.row}>
                <Icon name="favorite" size={16} color={colors.primary} />
                <AppText variant="labelMd">{favoriteDriver.ridesTogether} courses effectuées ensemble</AppText>
              </View>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Connaît parfaitement vos préférences de climatisation et itinéraire express.
              </AppText>
            </View>

            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <Icon name="info-outline" size={16} color={colors.onSurfaceVariant} style={{ marginTop: 1 }} />
              <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ flex: 1, fontSize: 12, lineHeight: 16 }}>
                <AppText variant="bodySm" style={{ fontFamily: fonts.dm600, fontSize: 12 }}>
                  Garantie {brand.appName} :{' '}
                </AppText>
                Si {favoriteDriver.name} n'est pas disponible 15 min avant le départ, un chauffeur Confort équivalent vous sera
                automatiquement assigné sans aucun surcoût.
              </AppText>
            </View>
          </View>
        </View>

        {/* Dock prix + confirmation */}
        <View style={[styles.dock, { paddingBottom: insets.bottom + 12 }]}>
          <View style={[styles.between, { alignItems: 'flex-start' }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  TARIF GARANTI FIXÉ
                </AppText>
                <Icon name="lock" size={14} color={colors.secondary} />
              </View>
              <View style={[styles.row, { alignItems: 'baseline' }]}>
                <AppText variant="currency" color={colors.primary}>
                  9 500
                </AppText>
                <AppText variant="headlineSm">FCFA</AppText>
              </View>
              <AppText variant="labelSm" color={colors.secondary} style={{ fontFamily: fonts.dm600 }}>
                Bloqué et garanti sans majoration météo ou pointe
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                Mode de paiement
              </AppText>
              <View style={styles.payBadge}>
                <Icon name="toll" size={16} color={colors.onSecondaryContainer} />
                <AppText variant="labelMd" color={colors.onSecondaryContainer} style={{ fontFamily: fonts.dm700 }}>
                  {brand.walletName} ({brand.walletUnit})
                </AppText>
              </View>
              <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ fontSize: 11 }}>
                Débit à la prise en charge
              </AppText>
            </View>
          </View>

          <Touchable
            disabled={confirmed}
            scale={0.98}
            onPress={() => setConfirmed(true)}
            style={[styles.cta, confirmed && { backgroundColor: colors.secondary }]}
          >
            <Icon name={confirmed ? 'check-circle' : 'calendar-today'} size={22} color={colors.onPrimary} />
            <AppText variant="headlineSm" color={colors.onPrimary}>
              {confirmed ? `Course programmée ${dayText} à ${time}` : `Programmer ${dayText} à ${time}`}
            </AppText>
          </Touchable>
          <AppText variant="bodySm" color={colors.onSurfaceVariant} style={{ textAlign: 'center', fontSize: 12 }}>
            Annulation gratuite jusqu'à 30 min avant le départ
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  px: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  modalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 999,
    padding: 4,
    boxShadow: shadows.soft,
  },
  routeCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 32, padding: 16, gap: 16, overflow: 'hidden', boxShadow: '0px 12px 32px -6px rgba(17,24,39,0.09)' },
  blob: { position: 'absolute', right: -32, top: -32, width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(255,232,214,0.5)' },
  fromDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: `0px 0px 0px 4px ${colors.primaryFixed}` },
  timeline: { width: 2, height: 40, borderRadius: 1, marginVertical: 2 },
  toDot: { width: 14, height: 14, borderRadius: 6, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(244,245,247,0.7)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  specCar: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceLowest, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  month: { backgroundColor: colors.surfaceContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  day: {
    minWidth: 72,
    height: 82,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
  },
  dayActive: { minWidth: 76, backgroundColor: colors.primary, transform: [{ scale: 1.03 }], boxShadow: '0px 8px 20px -2px rgba(255,122,26,0.45)' },
  dayDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  time: {
    width: '31.5%',
    flexGrow: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
  },
  timeActive: { backgroundColor: colors.primaryContainer, borderWidth: 2, borderColor: colors.secondaryContainer, boxShadow: '0px 8px 20px rgba(255,122,26,0.35)' },
  driverCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 32, padding: 16, gap: 8, boxShadow: '0px 8px 24px -4px rgba(17,24,39,0.07)' },
  rating: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surfaceLowest,
  },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center', marginTop: 4 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' },
  trust: { backgroundColor: 'rgba(244,245,247,0.7)', borderRadius: 16, padding: 8, gap: 4 },
  dock: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 16,
    gap: 16,
    boxShadow: '0px -12px 40px rgba(22,19,43,0.08)',
  },
  payBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.secondaryContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  cta: {
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0px 14px 30px -6px rgba(255,122,26,0.45)',
  },
});
