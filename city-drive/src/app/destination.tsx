import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, CircleButton, Icon, Touchable, useLayout, type IconName } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { quickPlaces } from '@/data/mock';
import { useRide } from '@/data/ride';
import { haversineKm } from '@/logic/geo';
import { PLACES, placeById, searchPlaces, type Place } from '@/logic/places';

type Mode = 'destination' | 'pickup' | 'stop';

const TITLES: Record<Mode, string> = { destination: 'Où allez-vous ?', pickup: 'Point de départ', stop: 'Ajouter un arrêt' };

export default function DestinationScreen() {
  const insets = useSafeAreaInsets();
  const { gutter } = useLayout();
  const { mode = 'destination' } = useLocalSearchParams<{ mode?: Mode }>();
  const { pickup, destination, stops, history, setDestination, setPickup, addStop } = useRide();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const exclude = mode === 'pickup' ? [destination.id] : [pickup.id, ...(mode === 'stop' ? [destination.id, ...stops.map((s) => s.id)] : [])];
  const results = useMemo(() => searchPlaces(query, exclude), [query, exclude.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  // Destinations récentes tirées de l'historique, sans doublon.
  const recents = useMemo(() => {
    const seen = new Set<string>();
    return history
      .map((r) => r.destination)
      .filter((p) => !exclude.includes(p.id) && !seen.has(p.id) && seen.add(p.id))
      .slice(0, 3);
  }, [history, exclude.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (p: Place) => {
    if (mode === 'pickup') {
      setPickup(p.id);
      router.back();
    } else if (mode === 'stop') {
      const err = addStop(p.id);
      if (err) return setError(err);
      router.back();
    } else {
      setDestination(p.id);
      router.replace('/vehicules');
    }
  };

  const favorites = quickPlaces
    .map((q) => ({ ...q, place: placeById(q.placeId) }))
    .filter((q): q is typeof q & { place: Place } => !!q.place && !exclude.includes(q.place.id));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <CircleButton icon="arrow-back" label="Retour" background={colors.surfaceLow} size={44} onPress={() => router.back()} />
        <AppText variant="headlineSm" numberOfLines={1} style={{ flex: 1 }}>
          {TITLES[mode]}
        </AppText>
      </View>

      <View style={[styles.fields, { marginHorizontal: gutter }]}>
        {mode !== 'pickup' && (
          <Touchable style={styles.fixed} onPress={() => router.setParams({ mode: 'pickup' })} accessibilityLabel="Changer le départ">
            <View style={[styles.dot, { backgroundColor: colors.blue }]} />
            <AppText variant="bodyMd" color={colors.onSurfaceVariant} numberOfLines={1} style={{ flex: 1 }}>
              {pickup.name}, {pickup.area}
            </AppText>
            <AppText variant="labelSm" color={colors.primary}>
              Modifier
            </AppText>
          </Touchable>
        )}
        <View style={styles.input}>
          <View style={[styles.dot, { backgroundColor: mode === 'pickup' ? colors.blue : colors.primary, borderRadius: mode === 'pickup' ? 5 : 2 }]} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setError(null);
            }}
            placeholder={mode === 'pickup' ? 'Adresse de départ' : 'Quartier, lieu, commune…'}
            placeholderTextColor={colors.outline}
            style={styles.textInput}
            returnKeyType="search"
            onSubmitEditing={() => results[0] && choose(results[0])}
          />
          {!!query && (
            <Touchable accessibilityLabel="Effacer" onPress={() => setQuery('')} style={styles.clear}>
              <Icon name="close" size={14} color={colors.onSurfaceVariant} />
            </Touchable>
          )}
        </View>
      </View>

      {error && (
        <AppText variant="labelMd" color="#B42318" style={{ marginHorizontal: gutter, marginTop: 8 }}>
          {error}
        </AppText>
      )}

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: insets.bottom + 24 }}>
        {!query && favorites.length > 0 && (
          <Section title="Favoris">
            {favorites.map((f) => (
              <Row key={f.label} icon={f.icon} title={f.label} subtitle={f.address} from={pickup} place={f.place} onPress={() => choose(f.place)} />
            ))}
          </Section>
        )}
        {!query && recents.length > 0 && (
          <Section title="Récents">
            {recents.map((p) => (
              <Row key={p.id} icon="history" title={p.name} subtitle={p.area} from={pickup} place={p} onPress={() => choose(p)} />
            ))}
          </Section>
        )}
        <Section title={query ? `${results.length} résultat${results.length > 1 ? 's' : ''}` : 'Tous les lieux'}>
          {results.map((p) => (
            <Row key={p.id} icon="location-on" title={p.name} subtitle={p.area} from={pickup} place={p} onPress={() => choose(p)} />
          ))}
          {results.length === 0 && (
            <View style={styles.empty}>
              <Icon name="search-off" size={28} color={colors.outline} />
              <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={{ textAlign: 'center' }}>
                Aucun lieu trouvé pour « {query} ».{'\n'}Essayez une commune : Cocody, Plateau, Marcory…
              </AppText>
            </View>
          )}
        </Section>
        <AppText variant="bodySm" color={colors.outline} style={{ textAlign: 'center', marginTop: 12 }}>
          {PLACES.length} lieux couverts à Abidjan
        </AppText>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 20 }}>
      <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ marginBottom: 4 }}>
        {title.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
}

function Row({
  icon,
  title,
  subtitle,
  from,
  place,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  from: Place;
  place: Place;
  onPress: () => void;
}) {
  const km = haversineKm(from, place) * 1.3;
  return (
    <Touchable style={styles.row} onPress={onPress} scale={0.99}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={18} color={colors.onSurface} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="labelLg" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`}
      </AppText>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceLowest },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  fields: { gap: 8, marginTop: 4 },
  fixed: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.surfaceLow },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  textInput: { flex: 1, fontFamily: fonts.dm600, fontSize: 16, color: colors.onSurface, paddingVertical: 0, minWidth: 0, outlineWidth: 0 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  clear: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.surfaceHigh },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 32 },
});
