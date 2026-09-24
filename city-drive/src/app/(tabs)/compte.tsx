import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Fragment, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Avatar, Icon, Pill, Touchable, type IconName } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';
import { formatAmount, photos, user } from '@/data/mock';
import { useWallet } from '@/data/wallet';

type Place = { id: string; icon: IconName; label: string; address: string };

const INITIAL_PLACES: Place[] = [
  { id: 'home', icon: 'home', label: 'Domicile', address: 'Riviera Bonoumin, Résidence Les Palmiers' },
  { id: 'work', icon: 'work', label: 'Travail', address: 'Plateau CCIA, Tour Postel 2001' },
  { id: 'gym', icon: 'fitness-center', label: 'Entraînement', address: "Sol Béni, Cocody M'Pouto" },
];

const cardShadow = '0px 8px 24px -4px rgba(17,24,39,0.06)';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <Touchable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onChange}
      style={[styles.toggle, { backgroundColor: value ? colors.primary : colors.surfaceHighest }]}
    >
      <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </Touchable>
  );
}

function Row({
  icon,
  iconBg = colors.surfaceContainer,
  iconFg = colors.primary,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon: IconName;
  iconBg?: string;
  iconFg?: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={[styles.row, { gap: 12, flex: 1 }]}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Icon name={icon} size={22} color={iconFg} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="labelLg">{title}</AppText>
          <AppText variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
      </View>
      {right ?? <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />}
    </>
  );
  return onPress ? (
    <Touchable style={styles.listRow} scale={0.99} onPress={onPress}>
      {content}
    </Touchable>
  ) : (
    <View style={styles.listRow}>{content}</View>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={[styles.between, { paddingHorizontal: 4 }]}>
        <AppText variant="headlineSm">{title}</AppText>
        {aside && (
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {aside}
          </AppText>
        )}
      </View>
      {children}
    </View>
  );
}

function List({ children }: { children: ReactNode[] }) {
  return (
    <View style={styles.list}>
      {children.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={styles.divider} />}
          {c}
        </Fragment>
      ))}
    </View>
  );
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { balance } = useWallet();
  const [places, setPlaces] = useState(INITIAL_PLACES);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [prefs, setPrefs] = useState({ ac: true, favorites: true, silence: false, biometric: true });
  const [loggedOut, setLoggedOut] = useState(false);

  const flip = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const addPlace = () => {
    if (!newLabel.trim() || !newAddress.trim()) return;
    setPlaces((p) => [...p, { id: `p${Date.now()}`, icon: 'place', label: newLabel.trim(), address: newAddress.trim() }]);
    setNewLabel('');
    setNewAddress('');
    setAdding(false);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <View style={[styles.row, { gap: 8 }]}>
            <View style={styles.logo}>
              <Icon name="local-taxi" size={20} color={colors.secondaryContainer} />
            </View>
            <AppText variant="headlineSm" style={{ letterSpacing: -0.3 }}>
              Réglages / Compte
            </AppText>
          </View>
          <View style={[styles.row, { gap: 8 }]}>
            <Touchable accessibilityLabel="Notifications" style={styles.bell}>
              <Icon name="notifications-none" size={24} color={colors.onSurfaceVariant} />
            </Touchable>
            <View style={styles.avatarSmall}>
              <Icon name="person" size={18} color={colors.onPrimary} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Profil */}
        <View style={[styles.card, { gap: 16 }]}>
          <View style={[styles.row, { gap: 16 }]}>
            <View>
              <Avatar uri={photos.profile} size={80} radius={40} />
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={16} color={colors.onSecondaryFixed} />
              </View>
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <AppText variant="headlineMd" numberOfLines={2} style={{ fontSize: 18, lineHeight: 24 }}>
                {user.name}
              </AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                {user.phone}
              </AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                {user.emailFull}
              </AppText>
              <View style={styles.verifiedPill}>
                <View style={styles.dot} />
                <AppText variant="labelSm" color={colors.primary}>
                  Compte Vérifié
                </AppText>
              </View>
            </View>
          </View>
          <Touchable style={styles.softBtn}>
            <Icon name="edit" size={18} color={colors.primary} />
            <AppText variant="labelLg" color={colors.primary}>
              Modifier le profil
            </AppText>
          </Touchable>
        </View>

        {/* Gold Club */}
        <LinearGradient colors={['#1E3A8A', colors.blue, '#6E9BFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gold}>
          <View style={styles.goldGlow} />
          <View style={[styles.between, { flexWrap: 'wrap', rowGap: 8 }]}>
            <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
              <Icon name="workspace-premium" size={16} color={colors.onSecondaryFixed} />
              <AppText variant="labelSm" color={colors.onSecondaryFixed}>
                {brand.appName.toUpperCase()} PASS GOLD CLUB
              </AppText>
            </Pill>
            <Pill background="rgba(255,255,255,0.15)" style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
              <AppText variant="labelSm" color={colors.onPrimary}>
                Membre Élite
              </AppText>
            </Pill>
          </View>
          <View style={{ gap: 2 }}>
            <AppText variant="bodySm" color={colors.onPrimaryContainer}>
              Solde fidélité accumulé
            </AppText>
            <View style={[styles.row, { alignItems: 'baseline', gap: 6 }]}>
              <AppText variant="displayLg" color={colors.onPrimary}>
                {formatAmount(user.loyaltyPoints)}
              </AppText>
              <AppText variant="labelLg" color={colors.secondaryContainer}>
                Points {brand.appName}
              </AppText>
            </View>
            <View style={styles.row}>
              <Icon name="percent" size={16} color={colors.secondaryContainer} />
              <AppText variant="bodySm" color={colors.secondaryContainer} style={{ fontFamily: fonts.dm600 }}>
                Cashback 5% actif sur toutes vos courses
              </AppText>
            </View>
          </View>
          <View style={styles.perks}>
            <Icon name="electric-bolt" size={22} color={colors.secondaryContainer} />
            <AppText variant="bodySm" color="rgba(255,255,255,0.9)" style={{ flex: 1 }}>
              Courses prioritaires aux heures de pointe • Chauffeurs favoris débloqués
            </AppText>
          </View>
          <Touchable style={styles.goldBtn}>
            <AppText variant="labelLg" color={colors.onPrimary}>
              Voir mes avantages Gold
            </AppText>
            <Icon name="arrow-forward" size={18} color={colors.onPrimary} />
          </Touchable>
        </LinearGradient>

        {/* Portefeuille */}
        <View style={[styles.card, { gap: 16 }]}>
          <View style={styles.between}>
            <View style={[styles.row, { gap: 8 }]}>
              <View style={styles.rowIcon}>
                <Icon name="account-balance-wallet" size={22} color={colors.primary} />
              </View>
              <View>
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  PORTEFEUILLE {brand.appName.toUpperCase()}
                </AppText>
                <AppText variant="headlineSm">
                  {formatAmount(balance)} {brand.walletUnit}
                </AppText>
              </View>
            </View>
            <Pill background={colors.surfaceLow} style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
              <AppText variant="labelMd" color={colors.onSurfaceVariant}>
                ≈ {formatAmount(balance)} FCFA
              </AppText>
            </Pill>
          </View>
          <Touchable style={styles.recharge} scale={0.98} onPress={() => router.navigate('/portefeuille')}>
            <Icon name="add-circle" size={22} color={colors.onSecondaryFixed} />
            <AppText variant="headlineSm" color={colors.onSecondaryFixed}>
              Recharger via Wave / MoMo
            </AppText>
          </Touchable>
        </View>

        {/* Lieux favoris */}
        <Section title={`Lieux favoris à ${brand.city}`} aside={`${places.length} enregistré${places.length > 1 ? 's' : ''}`}>
          <List>
            {places.map((p) => (
              <View key={p.id}>
                <Row
                  icon={p.icon}
                  iconBg="rgba(232,89,12,0.1)"
                  title={p.label}
                  subtitle={p.address}
                  right={
                    <Touchable accessibilityLabel={`Options ${p.label}`} style={styles.more} onPress={() => setOpenMenu(openMenu === p.id ? null : p.id)}>
                      <Icon name="more-vert" size={20} color={colors.onSurfaceVariant} />
                    </Touchable>
                  }
                />
                {openMenu === p.id && (
                  <View style={styles.menu}>
                    <Touchable style={styles.menuBtn} onPress={() => { setOpenMenu(null); router.push('/vehicules'); }}>
                      <Icon name="local-taxi" size={16} color={colors.primary} />
                      <AppText variant="labelSm" color={colors.primary}>
                        Y aller
                      </AppText>
                    </Touchable>
                    <Touchable
                      style={[styles.menuBtn, { backgroundColor: '#ffdad6' }]}
                      onPress={() => {
                        setPlaces((ps) => ps.filter((x) => x.id !== p.id));
                        setOpenMenu(null);
                      }}
                    >
                      <Icon name="delete-outline" size={16} color="#93000a" />
                      <AppText variant="labelSm" color="#93000a">
                        Supprimer
                      </AppText>
                    </Touchable>
                  </View>
                )}
              </View>
            ))}
          </List>
          {adding ? (
            <View style={[styles.card, { gap: 8, padding: 12 }]}>
              <TextInput value={newLabel} onChangeText={setNewLabel} placeholder="Nom (ex. Chez maman)" placeholderTextColor={colors.outline} style={styles.input} autoFocus />
              <TextInput value={newAddress} onChangeText={setNewAddress} placeholder="Adresse (ex. Yopougon Siporex)" placeholderTextColor={colors.outline} style={styles.input} onSubmitEditing={addPlace} />
              <View style={[styles.row, { gap: 8 }]}>
                <Touchable style={[styles.softBtn, { flex: 1 }]} onPress={() => setAdding(false)}>
                  <AppText variant="labelMd" color={colors.onSurfaceVariant}>
                    Annuler
                  </AppText>
                </Touchable>
                <Touchable style={[styles.softBtn, { flex: 1, backgroundColor: colors.primary }]} onPress={addPlace}>
                  <AppText variant="labelMd" color={colors.onPrimary}>
                    Enregistrer
                  </AppText>
                </Touchable>
              </View>
            </View>
          ) : (
            <Touchable style={[styles.softBtn, { backgroundColor: 'rgba(232,235,239,0.5)' }]} onPress={() => setAdding(true)}>
              <Icon name="add-location-alt" size={20} color={colors.primary} />
              <AppText variant="labelLg" color={colors.primary}>
                Ajouter un lieu fréquent
              </AppText>
            </Touchable>
          )}
        </Section>

        {/* Préférences */}
        <Section title="Préférences de course">
          <List>
            <Row icon="ac-unit" title="Climatisation systématique" subtitle="Toujours fraîche à l'embarquement" right={<Toggle value={prefs.ac} onChange={() => flip('ac')} />} />
            <Row icon="star" title="Chauffeurs favoris en priorité" subtitle="Attribuer d'abord à mon carnet" right={<Toggle value={prefs.favorites} onChange={() => flip('favorites')} />} />
            <Row
              icon={prefs.silence ? 'volume-off' : 'volume-up'}
              iconFg={prefs.silence ? colors.primary : colors.onSurfaceVariant}
              title="Mode silence"
              subtitle="Voyage tranquille sans musique"
              right={<Toggle value={prefs.silence} onChange={() => flip('silence')} />}
            />
          </List>
        </Section>

        {/* Sécurité */}
        <Section title="Sécurité & Données">
          <List>
            <Row icon="sos" iconBg="#ffdad6" iconFg="#93000a" title="Contacts d'urgence & SOS" subtitle="2 contacts configurés (Aya Kouassi, Marc D.)" onPress={() => {}} />
            <Row icon="fingerprint" title="Authentification biométrique" subtitle="Face ID / Empreinte digitale" right={<Toggle value={prefs.biometric} onChange={() => flip('biometric')} />} />
            <Row icon="receipt-long" title="Historique & Factures PDF" subtitle="Télécharger vos reçus fiscaux" onPress={() => router.navigate('/portefeuille')} />
          </List>
        </Section>

        {/* Assistance */}
        <Section title={`Assistance ${brand.city} 24/7`}>
          <List>
            <Row
              icon="support-agent"
              iconBg={colors.secondaryContainer}
              iconFg={colors.onSecondaryFixed}
              title={`Support direct ${brand.appName}`}
              subtitle={`WhatsApp & Ligne prioritaire ${brand.city}`}
              onPress={() => {}}
              right={
                <View style={styles.row}>
                  <Pill background={colors.secondaryContainer} style={{ paddingHorizontal: 8 }}>
                    <AppText variant="labelSm" color={colors.onSecondaryContainer}>
                      En ligne
                    </AppText>
                  </Pill>
                  <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </View>
              }
            />
            <Row icon="help-outline" title="Centre d'aide & FAQ" subtitle="Questions fréquentes sur la circulation et tarifs" onPress={() => {}} />
            <Row icon="policy" title="Conditions & Confidentialité" subtitle="Protection des données et conformité ARTCI" onPress={() => {}} />
          </List>
        </Section>

        {/* Déconnexion */}
        <View style={{ alignItems: 'center', gap: 16, paddingTop: 8 }}>
          {loggedOut ? (
            <View style={[styles.logout, { backgroundColor: colors.surfaceHigh }]}>
              <AppText variant="labelMd" color={colors.onSurface} style={{ flex: 1, textAlign: 'center' }}>
                Vous êtes déconnecté (démo).
              </AppText>
              <Touchable onPress={() => setLoggedOut(false)}>
                <AppText variant="labelMd" color={colors.primary}>
                  Se reconnecter
                </AppText>
              </Touchable>
            </View>
          ) : (
            <Touchable style={styles.logout} onPress={() => setLoggedOut(true)}>
              <Icon name="logout" size={22} color="#ba1a1a" />
              <AppText variant="headlineSm" color="#ba1a1a">
                Se déconnecter
              </AppText>
            </Touchable>
          )}
          <View style={{ alignItems: 'center' }}>
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {brand.appName} v{version} ({brand.city} Build)
            </AppText>
            <AppText variant="labelSm" color={colors.outline}>
              Fait avec passion pour le Grand {brand.city}
            </AppText>
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
  header: { backgroundColor: 'rgba(255,255,255,0.85)', boxShadow: '0px 1px 8px rgba(17,24,39,0.06)', zIndex: 10 },
  headerInner: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  bell: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  card: { borderRadius: 48, backgroundColor: colors.surfaceLowest, padding: 24, boxShadow: '0px 12px 32px -8px rgba(17,24,39,0.08)' },
  verifiedBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.15)',
  },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 4, backgroundColor: colors.surfaceContainer, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondaryContainer },
  softBtn: { height: 44, borderRadius: 999, backgroundColor: colors.surfaceContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  gold: { borderRadius: 48, padding: 24, gap: 16, overflow: 'hidden', boxShadow: '0px 16px 36px -6px rgba(17,24,39,0.28)' },
  goldGlow: { position: 'absolute', right: -48, top: -48, width: 176, height: 176, borderRadius: 88, backgroundColor: 'rgba(255,196,0,0.15)' },
  perks: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
  goldBtn: { height: 48, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  recharge: { height: 56, borderRadius: 999, backgroundColor: colors.secondaryContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1)' },
  list: { borderRadius: 48, backgroundColor: colors.surfaceLowest, overflow: 'hidden', boxShadow: cardShadow },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16 },
  divider: { height: 1, marginHorizontal: 16, backgroundColor: 'rgba(232,235,239,0.6)' },
  more: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menu: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 16, paddingBottom: 12, marginTop: -4 },
  menuBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surfaceContainer },
  input: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainer,
    fontFamily: fonts.dm400,
    fontSize: 15,
    color: colors.onSurface,
    outlineWidth: 0,
  },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', boxShadow: '0px 1px 2px rgba(0,0,0,0.15)' },
  logout: { alignSelf: 'stretch', height: 56, borderRadius: 999, backgroundColor: colors.surfaceContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
});
