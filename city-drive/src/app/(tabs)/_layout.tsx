import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, Touchable, type IconName } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

const TABS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'local-taxi', label: 'Course' },
  trajets: { icon: 'schedule', label: 'Trajets' },
  portefeuille: { icon: 'account-balance-wallet', label: 'Portefeuille' },
  compte: { icon: 'person-outline', label: 'Compte' },
};

/** Barre d'onglets classique : pleine largeur, icône + libellé, onglet actif en orange. */
function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        const color = active ? colors.primary : colors.onSurfaceVariant;
        return (
          <Touchable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => navigation.navigate(route.name)}
            style={styles.item}
            scale={0.94}
          >
            <Icon name={tab.icon} size={24} color={color} />
            <AppText variant="labelSm" color={color} style={{ fontFamily: active ? fonts.dm700 : fonts.dm600, letterSpacing: 0 }}>
              {tab.label}
            </AppText>
          </Touchable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.surface } }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trajets" />
      <Tabs.Screen name="portefeuille" />
      <Tabs.Screen name="compte" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLowest,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 48 },
});
