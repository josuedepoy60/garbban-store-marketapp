import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, Touchable, type IconName } from '@/components/ui';
import { colors, shadows } from '@/constants/theme';

const TABS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'local-taxi', label: 'Course' },
  trajets: { icon: 'schedule', label: 'Trajets' },
  portefeuille: { icon: 'account-balance-wallet', label: 'Portefeuille' },
  compte: { icon: 'tune', label: 'Compte' },
};

/** Barre d'onglets flottante en forme de pilule, comme dans les maquettes. */
function PillTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 8 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const active = state.index === i;
          return (
            <Touchable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Icon name={tab.icon} size={22} color={active ? colors.onPrimary : colors.onSurfaceVariant} />
              {active && (
                <AppText variant="labelMd" color={colors.onPrimary}>
                  {tab.label}
                </AppText>
              )}
            </Touchable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.surface } }}
      tabBar={(props) => <PillTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trajets" />
      <Tabs.Screen name="portefeuille" />
      <Tabs.Screen name="compte" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  bar: {
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
    boxShadow: shadows.float,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  item: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  itemActive: { backgroundColor: colors.primary, boxShadow: '0px 8px 24px -4px rgba(75,54,201,0.24)' },
});
