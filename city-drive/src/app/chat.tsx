import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Avatar, Icon, Touchable, type IconName } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';
import { favoriteDriver } from '@/data/mock';

type Message =
  | { id: string; from: 'driver' | 'me'; text: string; time: string }
  | { id: string; from: 'driver'; voice: { duration: string; transcript: string }; time: string };

const INITIAL: Message[] = [
  { id: 'm1', from: 'driver', text: "Bonjour M. Kouassi, je suis engagé sur le boulevard, j'arrive dans environ 3 minutes.", time: '12:35' },
  { id: 'm2', from: 'me', text: 'Parfait, je vous attends devant la pharmacie Saint-Jean côté station.', time: '12:36' },
  { id: 'm3', from: 'driver', voice: { duration: '0:08', transcript: '« Bien reçu ! Je mets les feux de détresse en arrivant. »' }, time: '12:37' },
  { id: 'm4', from: 'me', text: "Je vois votre Yaris blanche, j'arrive !", time: '12:38' },
];

const QUICK_REPLIES: { icon: IconName; label: string; text: string }[] = [
  { icon: 'location-on', label: 'Je suis au portail', text: 'Je suis au portail' },
  { icon: 'schedule', label: "J'arrive dans 2 min", text: "J'arrive dans 2 min" },
  { icon: 'warning', label: 'Feux de détresse ?', text: 'Feux de détresse allumés ?' },
  { icon: 'checkroom', label: 'Chemise blanche', text: 'Je porte une chemise blanche' },
];

// Barres de la forme d'onde du message vocal ; les 5 premières sont « lues ».
const WAVE = [12, 20, 8, 24, 16, 20, 12, 24, 16, 8, 20, 12, 16];

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [draft, setDraft] = useState('');
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, from: 'me', text, time: nowTime() }]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Touchable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
            <Icon name="arrow-back" size={24} />
          </Touchable>
          <View style={{ flex: 1 }}>
            <AppText variant="headlineSm" style={{ lineHeight: 20 }}>
              Messagerie
            </AppText>
            <View style={styles.row}>
              <View style={styles.dot} />
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                En course • {favoriteDriver.fullName}
              </AppText>
            </View>
          </View>
          <View style={styles.avatar}>
            <Icon name="person" size={18} color={colors.onPrimary} />
          </View>
        </View>
      </View>

      {/* Carte chauffeur */}
      <View style={styles.driver}>
        <View style={[styles.row, { gap: 8, flex: 1 }]}>
          <View>
            <Avatar name={favoriteDriver.fullName} size={48} radius={24} />
            <View style={styles.online} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <AppText variant="headlineSm" numberOfLines={1}>
                {favoriteDriver.fullName}
              </AppText>
              <View style={styles.rating}>
                <Icon name="star" size={14} color="#00A676" />
                <AppText variant="labelSm">4.9</AppText>
              </View>
            </View>
            <View style={styles.row}>
              <Icon name="record-voice-over" size={15} color={colors.secondary} />
              <AppText variant="labelSm" color={colors.onSurfaceVariant} numberOfLines={1} style={{ flexShrink: 1 }}>
                Au volant • Lecture vocale active
              </AppText>
            </View>
          </View>
        </View>
        <Touchable accessibilityLabel="Appeler Koffi" style={[styles.round, { backgroundColor: colors.secondaryContainer }]} onPress={() => router.replace('/appel')}>
          <Icon name="phone-in-talk" size={22} color={colors.onSecondaryContainer} />
        </Touchable>
        <Touchable accessibilityLabel="Détails de la course" style={[styles.round, { backgroundColor: colors.surfaceHighest }]} onPress={() => router.back()}>
          <Icon name="info-outline" size={22} />
        </Touchable>
      </View>

      {/* Bandeau véhicule */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <View style={styles.banner}>
          <View style={[styles.row, { gap: 8, flex: 1 }]}>
            <View style={styles.bannerIcon}>
              <Icon name="directions-car" size={24} color={colors.secondaryContainer} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" color={colors.secondaryContainer} numberOfLines={1}>
                À 350m • 2 min{' '}
                <AppText variant="bodySm" color="rgba(255,255,255,0.9)">
                  · Plateau CCIA
                </AppText>
              </AppText>
              <AppText variant="labelSm" color="rgba(255,255,255,0.8)" numberOfLines={1}>
                {favoriteDriver.shortCar} • {favoriteDriver.plate}
              </AppText>
            </View>
          </View>
          <Touchable style={styles.see} onPress={() => router.back()}>
            <Icon name="near-me" size={16} color={colors.onPrimary} />
            <AppText variant="labelSm" color={colors.onPrimary}>
              Voir
            </AppText>
          </Touchable>
        </View>
      </View>

      {/* Fil de discussion */}
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.system}>
          <Icon name="lock" size={16} color={colors.primary} />
          <AppText variant="labelSm" color={colors.onSurfaceVariant} style={{ flexShrink: 1, textAlign: 'center' }}>
            Pour votre sécurité, vos échanges sont chiffrés et surveillés par {brand.appName}.
          </AppText>
        </View>
        <View style={styles.day}>
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            Aujourd'hui
          </AppText>
        </View>

        {messages.map((m) =>
          m.from === 'me' ? (
            <View key={m.id} style={[styles.bubble, styles.mine]}>
              <AppText variant="bodyMd" color={colors.onPrimary}>
                {'text' in m ? m.text : ''}
              </AppText>
              <View style={[styles.row, { alignSelf: 'flex-end' }]}>
                <AppText variant="labelSm" color={colors.primaryFixed}>
                  {m.time}
                </AppText>
                <Icon name="done-all" size={16} color={colors.secondaryContainer} />
              </View>
            </View>
          ) : (
            <View key={m.id} style={[styles.row, { alignItems: 'flex-end', gap: 6, maxWidth: '86%' }]}>
              <Avatar name={favoriteDriver.fullName} size={24} radius={12} style={{ marginBottom: 4 }} />
              <View style={[styles.bubble, styles.theirs]}>
                {'voice' in m ? (
                  <>
                    <View style={styles.player}>
                      <Touchable
                        accessibilityLabel={playing ? 'Pause' : 'Écouter'}
                        onPress={() => setPlaying((p) => !p)}
                        style={[styles.play, playing && { backgroundColor: colors.secondaryContainer }]}
                      >
                        <Icon name={playing ? 'pause' : 'play-arrow'} size={20} color={playing ? colors.onSecondaryFixed : colors.onPrimary} />
                      </Touchable>
                      <View style={[styles.row, { gap: 3, flex: 1 }]}>
                        {WAVE.map((h, i) => (
                          <View key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: i < (playing ? 9 : 5) ? colors.primary : colors.outlineVariant }} />
                        ))}
                      </View>
                      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                        {m.voice.duration}
                      </AppText>
                    </View>
                    <View style={styles.row}>
                      <Icon name="closed-caption" size={14} color={colors.primary} />
                      <AppText variant="labelSm" color={colors.primary}>
                        TRANSCRIPTION VOCALE
                      </AppText>
                    </View>
                    <AppText variant="bodyMd">{m.voice.transcript}</AppText>
                  </>
                ) : (
                  <AppText variant="bodyMd">{m.text}</AppText>
                )}
                <AppText variant="labelSm" color={colors.outline} style={{ alignSelf: 'flex-end' }}>
                  {m.time}
                </AppText>
              </View>
            </View>
          ),
        )}
      </ScrollView>

      {/* Réponses rapides */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.quick}>
        {QUICK_REPLIES.map((q) => (
          <Touchable key={q.label} style={styles.chip} onPress={() => setDraft(q.text)}>
            <Icon name={q.icon} size={18} color={colors.primary} />
            <AppText variant="labelSm">{q.label}</AppText>
          </Touchable>
        ))}
      </ScrollView>

      {/* Saisie */}
      <View style={[styles.dock, { paddingBottom: insets.bottom + 12 }]}>
        <Touchable accessibilityLabel="Partager ma position" style={[styles.dockBtn, { backgroundColor: colors.surfaceContainer }]} onPress={() => setDraft('📍 Ma position : Pharmacie Saint-Jean, Riviera 2')}>
          <Icon name="add-location-alt" size={22} />
        </Touchable>
        <View style={styles.input}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Écrire à ${favoriteDriver.fullName.split(' ')[0]}...`}
            placeholderTextColor={colors.outline}
            style={styles.inputText}
            returnKeyType="send"
            onSubmitEditing={send}
          />
        </View>
        <Touchable
          accessibilityLabel="Enregistrer un message vocal"
          onPressIn={() => setRecording(true)}
          onPressOut={() => setRecording(false)}
          style={[styles.dockBtn, { backgroundColor: colors.secondaryContainer }, recording && { transform: [{ scale: 1.1 }], borderWidth: 4, borderColor: '#00A676' }]}
        >
          <Icon name="mic" size={24} color={colors.onSecondaryFixed} />
        </Touchable>
        <Touchable accessibilityLabel="Envoyer" style={[styles.dockBtn, { backgroundColor: colors.primary }]} onPress={send}>
          <Icon name="send" size={22} color={colors.onPrimary} />
        </Touchable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  header: { backgroundColor: 'rgba(250,250,251,0.92)', zIndex: 10 },
  headerInner: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00A676' },
  driver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: colors.surfaceLow,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.secondaryContainer,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.surfaceHighest, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 12 },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 24,
    backgroundColor: colors.ink,
    boxShadow: '0px 1px 3px rgba(16,24,40,0.08)',
  },
  bannerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  see: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  thread: { paddingHorizontal: 16, paddingVertical: 8, gap: 16 },
  system: {
    alignSelf: 'center',
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
  },
  day: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 2, borderRadius: 12, backgroundColor: colors.surfaceContainer },
  bubble: { padding: 16, borderRadius: 16, gap: 6 },
  mine: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: colors.primary, borderBottomRightRadius: 4, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  theirs: { flexShrink: 1, backgroundColor: colors.surfaceLowest, borderBottomLeftRadius: 4, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceLow, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 24 },
  play: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  quick: { gap: 6, paddingHorizontal: 16, paddingVertical: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.surfaceHigh },
  dock: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingTop: 4, backgroundColor: 'rgba(250,250,251,0.95)' },
  dockBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minWidth: 0, backgroundColor: colors.surfaceLowest, borderRadius: 12, paddingHorizontal: 16, boxShadow: '0px 1px 3px rgba(16,24,40,0.08)' },
  inputText: { fontFamily: fonts.dm400, fontSize: 15, color: colors.onSurface, paddingVertical: 12 },
});
